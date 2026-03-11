'use client';

import { evaluateSGPLeg } from '@/lib/betTracker';

/**
 * Live SGP tracker — shows each leg's status during a match.
 * Green check = hit, Red X = dead, Yellow clock = pending, Green dot = alive
 */
export default function SGPTracker({ legs, odds, reasoning, scoreData }) {
  const hasLiveData = scoreData && scoreData.phase !== 'prematch';

  return (
    <div className="section-box sgp-box">
      <div className="sgp-header">
        <div className="section-label" style={{ marginBottom: 0 }}>■ Same Game Parlay</div>
        <span className="odds-badge odds-badge--purple">{odds}</span>
      </div>

      <div className="sgp-legs">
        {legs.map((leg, i) => {
          const status = hasLiveData
            ? evaluateSGPLeg(leg, {
                goals: scoreData.goals,
                elapsed: scoreData.status?.elapsed,
                phase: scoreData.phase,
              })
            : 'pending';

          return (
            <div
              key={i}
              className={`sgp-leg sgp-leg--${status}`}
            >
              <span className="sgp-leg__icon">
                {status === 'hit' && '✓'}
                {status === 'dead' && '✗'}
                {status === 'alive' && '●'}
                {status === 'pending' && '○'}
              </span>
              <span className="sgp-leg__text">{leg}</span>
            </div>
          );
        })}
      </div>

      {/* SGP status summary */}
      {hasLiveData && (
        <SGPStatusBar legs={legs} scoreData={scoreData} />
      )}

      <div className="sgp-reasoning">{reasoning}</div>
    </div>
  );
}

function SGPStatusBar({ legs, scoreData }) {
  const statuses = legs.map((leg) =>
    evaluateSGPLeg(leg, {
      goals: scoreData.goals,
      elapsed: scoreData.status?.elapsed,
      phase: scoreData.phase,
    })
  );

  const allHit = statuses.every((s) => s === 'hit');
  const anyDead = statuses.some((s) => s === 'dead');
  const hitCount = statuses.filter((s) => s === 'hit').length;

  let message = '';
  let className = '';

  if (allHit) {
    message = '🎉 ALL LEGS HIT — WINNER!';
    className = 'sgp-status--won';
  } else if (anyDead) {
    message = '💀 SGP DEAD';
    className = 'sgp-status--dead';
  } else {
    message = `${hitCount}/${legs.length} legs hit so far`;
    className = 'sgp-status--alive';
  }

  return (
    <div className={`sgp-status ${className}`}>
      {message}
    </div>
  );
}
