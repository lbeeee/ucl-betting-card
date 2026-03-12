'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import OddsComparison from './OddsComparison';
import SGPBuilder from './SGPBuilder';
import { detectValueBets } from '@/lib/oddsUtils';

export default function FixtureCard({ fixture }) {
  const [expanded, setExpanded] = useState(false);
  const { status, home, away, odds, kickoff, venue, events } = fixture;
  const isLive = status.phase === 'live' || status.phase === 'halftime';
  const isFinished = status.phase === 'finished';
  const isPrematch = status.phase === 'prematch';
  const kickoffTime = kickoff ? format(new Date(kickoff), 'h:mm a') : '—';
  const valueBets = odds?.comparison ? detectValueBets(odds.comparison) : [];

  return (
    <div className={`fcard ${isLive?'fcard--live':''} ${isFinished?'fcard--finished':''} ${expanded?'fcard--expanded':''}`}>
      <div className="fcard__row" onClick={() => setExpanded(!expanded)}>
        <div className="fcard__time">
          {isLive && <div className="fixture-live-badge"><span className="fixture-live-dot" /><span>{status.elapsed}&apos;</span></div>}
          {isFinished && <span className="fixture-ft-badge">{status.label}</span>}
          {isPrematch && <span className="fixture-kickoff">{kickoffTime}</span>}
        </div>
        <div className="fcard__teams">
          <div className="fixture-team-row">
            {home.logo && <img src={home.logo} alt="" className="fixture-team-logo" />}
            <span className={`fixture-team-name ${isFinished && home.goals > away.goals ? 'fixture-team-name--winner' : ''}`}>{home.name}</span>
            {(isLive||isFinished) && <span className={`fixture-score ${isLive?'fixture-score--live':''}`}>{home.goals??0}</span>}
          </div>
          <div className="fixture-team-row">
            {away.logo && <img src={away.logo} alt="" className="fixture-team-logo" />}
            <span className={`fixture-team-name ${isFinished && away.goals > home.goals ? 'fixture-team-name--winner' : ''}`}>{away.name}</span>
            {(isLive||isFinished) && <span className={`fixture-score ${isLive?'fixture-score--live':''}`}>{away.goals??0}</span>}
          </div>
        </div>
        {odds?.primary && isPrematch && (
          <div className="fcard__odds">
            <span className="fixture-odds-chip">{odds.primary.home||'—'}</span>
            <span className="fixture-odds-chip fixture-odds-chip--draw">{odds.primary.draw||'—'}</span>
            <span className="fixture-odds-chip">{odds.primary.away||'—'}</span>
          </div>
        )}
        {valueBets.length > 0 && isPrematch && <div className="fcard__value-flag"><span className="fcard__value-gem">💎</span></div>}
        <div className="fcard__meta">
          {odds?.totals && isPrematch && <span className="fixture-totals-line">O/U {odds.totals.line}</span>}
          {odds?.comparison?.length > 1 && isPrematch && <span className="fixture-books-badge">{odds.comparison.length} books</span>}
          <span className={`chevron-sm ${expanded?'chevron-sm--open':''}`}>▾</span>
        </div>
      </div>
      {expanded && (
        <div className="fcard__detail">
          {venue && <div className="fcard__venue">📍 {venue}{fixture.city ? `, ${fixture.city}` : ''}</div>}
          {events?.length > 0 && (
            <div className="fcard__events">
              {events.map((e,i) => (
                <div className="fcard__event" key={i}>
                  <span className="fcard__event-min">{e.minute}&apos;{e.extra?`+${e.extra}`:''}</span>
                  <span className="fcard__event-icon">{e.type==='Goal'?'⚽':e.detail==='Red Card'?'🟥':e.detail==='Yellow Card'?'🟨':e.type==='subst'?'🔄':'📋'}</span>
                  <span className="fcard__event-text">{e.player}{e.assist&&e.type==='Goal'&&<span className="fcard__event-assist"> (assist: {e.assist})</span>}</span>
                </div>
              ))}
            </div>
          )}
          {isPrematch && <OddsComparison fixture={fixture} />}
          {isPrematch && <SGPBuilder fixture={fixture} />}
        </div>
      )}
    </div>
  );
}
