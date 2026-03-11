'use client';

/**
 * Lineup display with confirmed/predicted toggle.
 * Alerts if a player prop target is NOT in the confirmed XI.
 */
export default function LineupDisplay({ match, lineupData }) {
  const isConfirmed = lineupData?.confirmed;

  return (
    <div className="lineups-grid">
      <LineupCard
        teamName={match.home.name}
        predicted={match.predictedXI.home}
        confirmed={lineupData?.home}
        isConfirmed={isConfirmed}
        propPlayer={null}
      />
      <LineupCard
        teamName={match.away.name}
        predicted={match.predictedXI.away}
        confirmed={lineupData?.away}
        isConfirmed={isConfirmed}
        propPlayer={match.playerProp.player}
      />
    </div>
  );
}

function LineupCard({ teamName, predicted, confirmed, isConfirmed, propPlayer }) {
  // Check if prop player is in the confirmed XI
  let propAlert = null;
  if (isConfirmed && propPlayer && confirmed?.startXI) {
    const inXI = confirmed.startXI.some((p) =>
      p.name.toLowerCase().includes(propPlayer.toLowerCase().split(' ').pop())
    );
    const onBench = confirmed.substitutes?.some((p) =>
      p.name.toLowerCase().includes(propPlayer.toLowerCase().split(' ').pop())
    );

    if (!inXI && onBench) {
      propAlert = { type: 'warning', message: `⚠️ ${propPlayer} ON BENCH — prop at risk` };
    } else if (!inXI && !onBench) {
      propAlert = { type: 'danger', message: `🚨 ${propPlayer} NOT IN SQUAD` };
    }
  }

  return (
    <div className="lineup-box">
      <div className="lineup-team">
        {teamName}
        {isConfirmed ? (
          <span className="lineup-badge lineup-badge--confirmed">Confirmed</span>
        ) : (
          <span className="lineup-badge lineup-badge--predicted">Predicted</span>
        )}
      </div>

      {propAlert && (
        <div className={`lineup-alert lineup-alert--${propAlert.type}`}>
          {propAlert.message}
        </div>
      )}

      {isConfirmed && confirmed ? (
        <div className="lineup-confirmed">
          <div className="lineup-formation">{confirmed.formation}</div>
          <div className="lineup-players">
            {confirmed.startXI.map((p, i) => (
              <span
                key={i}
                className={`lineup-player ${
                  propPlayer && p.name.toLowerCase().includes(propPlayer.toLowerCase().split(' ').pop())
                    ? 'lineup-player--prop'
                    : ''
                }`}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="lineup-players">{predicted}</div>
      )}
    </div>
  );
}
