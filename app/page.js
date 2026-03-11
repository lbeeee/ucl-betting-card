'use client';

import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { LEAGUE_LIST } from '@/lib/leagues';
import { useFixtures } from '@/lib/hooks-v2';
import LeagueNav from '@/components/LeagueNav';
import LeagueSection from '@/components/LeagueSection';

function DatePicker({ date, onChange }) {
  const prev = subDays(date, 1);
  const next = addDays(date, 1);
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="date-picker">
      <button className="date-btn" onClick={() => onChange(prev)}>
        ← {format(prev, 'MMM d')}
      </button>
      <div className="date-current">
        <span className="date-day">{isToday ? 'Today' : format(date, 'EEEE')}</span>
        <span className="date-full">{format(date, 'MMMM d, yyyy')}</span>
      </div>
      <button className="date-btn" onClick={() => onChange(next)}>
        {format(next, 'MMM d')} →
      </button>
    </div>
  );
}

function EmptyState({ isLoading }) {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-spinner" />
        <p>Loading fixtures across all leagues…</p>
      </div>
    );
  }
  return (
    <div className="empty-state">
      <span className="empty-icon">📭</span>
      <p>No matches scheduled for this date.</p>
      <p className="empty-hint">Try navigating to another day, or check if your API keys are configured.</p>
    </div>
  );
}

function SourceIndicator({ source }) {
  return (
    <div className="source-bar">
      <span className={`source-badge ${source.scores === 'live' ? 'source-badge--live' : 'source-badge--off'}`}>
        {source.scores === 'live' && <span className="source-pulse" />}
        Scores: {source.scores === 'live' ? 'Live' : 'Off'}
      </span>
      <span className={`source-badge ${source.odds === 'live' ? 'source-badge--live' : 'source-badge--off'}`}>
        {source.odds === 'live' && <span className="source-pulse" />}
        Odds: {source.odds === 'live' ? 'Live' : 'Off'}
      </span>
    </div>
  );
}

export default function HubPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeLeague, setActiveLeague] = useState(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { fixtures, leagues, liveCount, totalFixtures, source, isLoading } = useFixtures(dateStr);

  const filteredFixtures = useMemo(() => {
    if (!activeLeague) return fixtures;
    if (activeLeague === '_live') {
      const result = {};
      for (const [leagueId, leagueFixtures] of Object.entries(fixtures)) {
        const live = leagueFixtures.filter(
          (f) => f.status.phase === 'live' || f.status.phase === 'halftime'
        );
        if (live.length > 0) result[leagueId] = live;
      }
      return result;
    }
    if (fixtures[activeLeague]) {
      return { [activeLeague]: fixtures[activeLeague] };
    }
    return {};
  }, [fixtures, activeLeague]);

  const visibleLeagues = LEAGUE_LIST
    .filter((l) => filteredFixtures[l.id]?.length > 0)
    .sort((a, b) => {
      const aLive = (filteredFixtures[a.id] || []).some(
        (f) => f.status.phase === 'live' || f.status.phase === 'halftime'
      );
      const bLive = (filteredFixtures[b.id] || []).some(
        (f) => f.status.phase === 'live' || f.status.phase === 'halftime'
      );
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return a.priority - b.priority;
    });

  const filteredTotal = Object.values(filteredFixtures).flat().length;

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="header-eyebrow">FanDuel Sportsbook · New York</div>
        <h1 className="header-title">Match Center</h1>
        <div className="header-meta">
          <span className="header-meta-item">{totalFixtures} matches across {leagues.length} leagues</span>
          {liveCount > 0 && (
            <>
              <span className="header-divider" />
              <span className="header-meta-item" style={{ color: 'var(--accent-red)' }}>
                🔴 {liveCount} live now
              </span>
            </>
          )}
        </div>
        <SourceIndicator source={source} />
      </header>

      <DatePicker date={selectedDate} onChange={setSelectedDate} />

      <LeagueNav
        activeLeague={activeLeague}
        onSelect={setActiveLeague}
        leagueStats={leagues}
        liveCount={liveCount}
      />

      {isLoading && filteredTotal === 0 ? (
        <EmptyState isLoading={true} />
      ) : filteredTotal === 0 ? (
        <EmptyState isLoading={false} />
      ) : (
        <div className="fixtures-list">
          {visibleLeagues.map((league) => (
            <LeagueSection
              key={league.id}
              leagueId={league.id}
              fixtures={filteredFixtures[league.id] || []}
            />
          ))}
        </div>
      )}

      <div className="legacy-link">
        <a href="/ucl" className="legacy-link-btn">
          📋 View UCL R16 Betting Card (March 11)
        </a>
      </div>

      <div className="disclaimer">
        Live odds via The Odds API · Live scores via API-Football · 
        Built for FanDuel (NY) · Not financial advice · 21+ · 1-800-GAMBLER
      </div>
    </div>
  );
}
