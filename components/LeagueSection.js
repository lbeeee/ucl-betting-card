'use client';

import { useState } from 'react';
import { LEAGUES } from '@/lib/leagues';
import FixtureRow from './FixtureRow';

export default function LeagueSection({ leagueId, fixtures }) {
  const [collapsed, setCollapsed] = useState(false);
  const league = LEAGUES[leagueId];
  if (!league || !fixtures?.length) return null;

  const liveCount = fixtures.filter(
    (f) => f.status.phase === 'live' || f.status.phase === 'halftime'
  ).length;

  // Sort: live first, then by kickoff
  const sorted = [...fixtures].sort((a, b) => {
    const phaseOrder = { live: 0, halftime: 0, prematch: 1, finished: 2 };
    const pa = phaseOrder[a.status.phase] ?? 1;
    const pb = phaseOrder[b.status.phase] ?? 1;
    if (pa !== pb) return pa - pb;
    return new Date(a.kickoff) - new Date(b.kickoff);
  });

  return (
    <div
      className="league-section"
      style={{
        '--league-color': league.color,
        '--league-color-light': league.colorLight,
        '--league-bg': league.colorBg,
        '--league-border': league.colorBorder,
      }}
    >
      <div className="league-section-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="league-section-left">
          <span className="league-section-logo">{league.logo}</span>
          <div>
            <span className="league-section-name">{league.name}</span>
            <span className="league-section-country">{league.country}</span>
          </div>
        </div>
        <div className="league-section-right">
          {liveCount > 0 && (
            <span className="league-section-live">
              <span className="league-section-live-dot" /> {liveCount} live
            </span>
          )}
          <span className="league-section-count">{fixtures.length} matches</span>
          <span className={`chevron ${collapsed ? '' : 'chevron--open'}`}>▾</span>
        </div>
      </div>

      {!collapsed && (
        <div className="league-section-body">
          {sorted.map((fixture) => (
            <FixtureRow
              key={fixture.id}
              fixture={fixture}
              leagueColor={league.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
