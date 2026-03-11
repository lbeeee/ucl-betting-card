'use client';

/**
 * Live score display with match events.
 * Shows different states: prematch countdown, live score, halftime, full time.
 */
export default function LiveScore({ match, scoreData }) {
  if (!scoreData || scoreData.phase === 'prematch') {
    return <PrematchCountdown kickoffUTC={match.kickoffUTC} />;
  }

  const { phase, status, goals, events } = scoreData;

  return (
    <div className={`live-score live-score--${phase}`}>
      {/* Score bar */}
      <div className="live-score__bar">
        {phase === 'live' && <span className="live-score__pulse" />}
        <div className="live-score__teams">
          <span className="live-score__team">
            {match.home.flag} {match.home.short}
          </span>
          <span className="live-score__scoreline">
            <span className={goals.home > 0 ? 'live-score__goal-flash' : ''}>
              {goals.home ?? 0}
            </span>
            <span className="live-score__separator">–</span>
            <span className={goals.away > 0 ? 'live-score__goal-flash' : ''}>
              {goals.away ?? 0}
            </span>
          </span>
          <span className="live-score__team">
            {match.away.short} {match.away.flag}
          </span>
        </div>
        <span className={`live-score__status live-score__status--${phase}`}>
          {phase === 'live' && `${status.elapsed}'`}
          {phase === 'halftime' && 'HT'}
          {phase === 'finished' && 'FT'}
        </span>
      </div>

      {/* Events feed */}
      {events && events.length > 0 && (
        <div className="live-score__events">
          {events
            .filter((e) => e.type === 'Goal' || e.type === 'Card')
            .slice(-6)
            .map((event, i) => (
              <div key={i} className={`live-score__event live-score__event--${event.type.toLowerCase()}`}>
                <span className="live-score__event-time">{event.time}'</span>
                <span className="live-score__event-icon">
                  {event.type === 'Goal' && (event.detail === 'Penalty' ? '⚽ (P)' : '⚽')}
                  {event.type === 'Card' && event.detail === 'Yellow Card' && '🟨'}
                  {event.type === 'Card' && event.detail === 'Red Card' && '🟥'}
                </span>
                <span className="live-score__event-player">{event.player}</span>
                {event.assist && (
                  <span className="live-score__event-assist">({event.assist})</span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function PrematchCountdown({ kickoffUTC }) {
  const ko = new Date(kickoffUTC);
  const now = new Date();
  const diff = ko - now;

  if (diff <= 0) {
    return (
      <div className="live-score live-score--imminent">
        <span className="live-score__pulse" />
        <span className="live-score__countdown-text">About to kick off...</span>
      </div>
    );
  }

  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return (
    <div className="live-score live-score--prematch">
      <span className="live-score__countdown-text">
        Kickoff in {hours > 0 ? `${hours}h ` : ''}{mins}m
      </span>
    </div>
  );
}
