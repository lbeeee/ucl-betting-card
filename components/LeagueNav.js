'use client';

import { LEAGUE_LIST } from '@/lib/leagues';

export default function LeagueNav({ activeLeague, onSelect, leagueStats, liveCount }) {
  return (
    <nav className="league-nav">
      {/* All leagues pill */}
      <button
        className={`league-pill ${!activeLeague ? 'league-pill--active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="league-pill-logo">📋</span>
        <span className="league-pill-name">All</span>
        {liveCount > 0 && <span className="league-pill-live">{liveCount} live</span>}
      </button>

      {/* Live filter */}
      {liveCount > 0 && (
        <button
          className={`league-pill league-pill--live-filter ${activeLeague === '_live' ? 'league-pill--active' : ''}`}
          onClick={() => onSelect('_live')}
        >
          <span className="league-pill-pulse" />
          <span className="league-pill-name">Live</span>
          <span className="league-pill-count">{liveCount}</span>
        </button>
      )}

      {/* Individual leagues */}
      {LEAGUE_LIST.map((league) => {
        const stats = leagueStats?.find((s) => s.id === league.id);
        const count = stats?.fixtureCount || 0;
        if (count === 0) return null; // hide leagues with no matches today

        return (
          <button
            key={league.id}
            className={`league-pill ${activeLeague === league.id ? 'league-pill--active' : ''}`}
            onClick={() => onSelect(league.id)}
            style={{
              '--pill-color': league.color,
              '--pill-color-light': league.colorLight,
            }}
          >
            <span className="league-pill-logo">{league.logo}</span>
            <span className="league-pill-name">{league.shortName}</span>
            <span className="league-pill-count">{count}</span>
          </button>
        );
      })}
    </nav>
  );
}
