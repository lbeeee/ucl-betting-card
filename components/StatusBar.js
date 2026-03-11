'use client';

import { formatDistanceToNow } from 'date-fns';

/**
 * Bottom status bar showing data source health and freshness.
 */
export default function StatusBar({ oddsSource, scoresSource, oddsFetchedAt, scoresFetchedAt, oddsRemaining }) {
  return (
    <div className="status-bar">
      <div className="status-bar__items">
        <StatusDot label="Odds" source={oddsSource} fetchedAt={oddsFetchedAt} />
        <StatusDot label="Scores" source={scoresSource} fetchedAt={scoresFetchedAt} />
        {oddsRemaining !== null && oddsRemaining !== undefined && (
          <span className="status-bar__quota">
            API: {oddsRemaining} req left
          </span>
        )}
      </div>
    </div>
  );
}

function StatusDot({ label, source, fetchedAt }) {
  const isLive = source === 'live';
  const timeAgo = fetchedAt ? formatDistanceToNow(new Date(fetchedAt), { addSuffix: true }) : null;

  return (
    <span className="status-dot">
      <span className={`status-dot__indicator ${isLive ? 'status-dot__indicator--live' : 'status-dot__indicator--static'}`} />
      <span className="status-dot__label">{label}</span>
      {isLive && timeAgo && (
        <span className="status-dot__time">{timeAgo}</span>
      )}
      {!isLive && (
        <span className="status-dot__time">static</span>
      )}
    </span>
  );
}
