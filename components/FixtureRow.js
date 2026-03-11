'use client';

import { format } from 'date-fns';

export default function FixtureRow({ fixture, leagueColor }) {
  const { status, home, away, odds, kickoff } = fixture;

  const isLive = status.phase === 'live' || status.phase === 'halftime';
  const isFinished = status.phase === 'finished';
  const isPrematch = status.phase === 'prematch';

  const kickoffTime = kickoff
    ? format(new Date(kickoff), 'h:mm a')
    : '—';

  return (
    <div className={`fixture-row ${isLive ? 'fixture-row--live' : ''} ${isFinished ? 'fixture-row--finished' : ''}`}>
      {/* Time / Status */}
      <div className="fixture-time-col">
        {isLive && (
          <div className="fixture-live-badge">
            <span className="fixture-live-dot" />
            <span>{status.elapsed}&apos;</span>
          </div>
        )}
        {isFinished && <span className="fixture-ft-badge">{status.label}</span>}
        {isPrematch && <span className="fixture-kickoff">{kickoffTime}</span>}
      </div>

      {/* Teams + Score */}
      <div className="fixture-teams-col">
        <div className="fixture-team-row">
          {home.logo && <img src={home.logo} alt="" className="fixture-team-logo" />}
          <span className={`fixture-team-name ${isFinished && home.goals > away.goals ? 'fixture-team-name--winner' : ''}`}>
            {home.name}
          </span>
          {(isLive || isFinished) && (
            <span className={`fixture-score ${isLive ? 'fixture-score--live' : ''}`}>
              {home.goals ?? 0}
            </span>
          )}
        </div>
        <div className="fixture-team-row">
          {away.logo && <img src={away.logo} alt="" className="fixture-team-logo" />}
          <span className={`fixture-team-name ${isFinished && away.goals > home.goals ? 'fixture-team-name--winner' : ''}`}>
            {away.name}
          </span>
          {(isLive || isFinished) && (
            <span className={`fixture-score ${isLive ? 'fixture-score--live' : ''}`}>
              {away.goals ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Odds */}
      {odds?.primary && isPrematch && (
        <div className="fixture-odds-col">
          <span className="fixture-odds-chip">{odds.primary.home || '—'}</span>
          <span className="fixture-odds-chip fixture-odds-chip--draw">{odds.primary.draw || '—'}</span>
          <span className="fixture-odds-chip">{odds.primary.away || '—'}</span>
        </div>
      )}

      {/* Odds comparison count */}
      {odds?.comparison?.length > 1 && isPrematch && (
        <div className="fixture-books-col">
          <span className="fixture-books-badge">{odds.comparison.length} books</span>
        </div>
      )}

      {/* Totals */}
      {odds?.totals && isPrematch && (
        <div className="fixture-totals-col">
          <span className="fixture-totals-line">O/U {odds.totals.line}</span>
        </div>
      )}
    </div>
  );
}
