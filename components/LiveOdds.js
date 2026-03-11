'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Displays live odds for a match with movement indicators.
 * Falls back to static odds when API is unavailable.
 */
export default function LiveOdds({ matchId, staticOdds, liveOddsData }) {
  const prevOdds = useRef(null);
  const [movements, setMovements] = useState({ home: null, draw: null, away: null });

  const odds = liveOddsData?.moneyline || {
    home: staticOdds.home,
    draw: staticOdds.draw,
    away: staticOdds.away,
    bookmaker: null,
  };

  const isLive = liveOddsData?.source === 'live';

  // Track odds movement
  useEffect(() => {
    if (prevOdds.current) {
      const m = {};
      for (const key of ['home', 'draw', 'away']) {
        const prev = parseOdds(prevOdds.current[key]);
        const curr = parseOdds(odds[key]);
        if (prev && curr) {
          if (curr > prev) m[key] = 'up';
          else if (curr < prev) m[key] = 'down';
          else m[key] = null;
        }
      }
      setMovements(m);
      // Clear arrows after 5 seconds
      const timer = setTimeout(() => setMovements({ home: null, draw: null, away: null }), 5000);
      return () => clearTimeout(timer);
    }
    prevOdds.current = odds;
  }, [odds.home, odds.draw, odds.away]);

  return (
    <div className="live-odds">
      <div className="live-odds__header">
        <span className="live-odds__label">
          {isLive ? (
            <>
              <span className="live-pulse" />
              Live Odds
            </>
          ) : (
            'Odds'
          )}
        </span>
        {odds.bookmaker && (
          <span className="live-odds__source">{odds.bookmaker}</span>
        )}
      </div>

      <div className="live-odds__grid">
        <OddsCell label="Home" value={odds.home} movement={movements.home} />
        <OddsCell label="Draw" value={odds.draw} movement={movements.draw} />
        <OddsCell label="Away" value={odds.away} movement={movements.away} />
      </div>

      {/* Totals */}
      {liveOddsData?.totals && (
        <div className="live-odds__totals">
          {liveOddsData.totals.map((t, i) => (
            <span key={i} className="live-odds__total-chip">
              {t.name} {t.point}: <strong>{t.price}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Book comparison */}
      {liveOddsData?.comparison && liveOddsData.comparison.length > 1 && (
        <OddsComparison data={liveOddsData.comparison} />
      )}
    </div>
  );
}

function OddsCell({ label, value, movement }) {
  return (
    <div className={`odds-cell ${movement ? `odds-cell--${movement}` : ''}`}>
      <span className="odds-cell__label">{label}</span>
      <span className="odds-cell__value">
        {value}
        {movement && (
          <span className={`odds-cell__arrow odds-cell__arrow--${movement}`}>
            {movement === 'up' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </div>
  );
}

function OddsComparison({ data }) {
  const [open, setOpen] = useState(false);

  if (!data || data.length <= 1) return null;

  // Find best odds for each outcome
  const bestHome = Math.max(...data.map((d) => d.homeRaw));
  const bestDraw = Math.max(...data.map((d) => d.drawRaw));
  const bestAway = Math.max(...data.map((d) => d.awayRaw));

  return (
    <div className="odds-comparison">
      <button className="odds-comparison__toggle" onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Compare'} {data.length} books {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="odds-comparison__table">
          <div className="odds-comparison__row odds-comparison__row--header">
            <span>Book</span>
            <span>Home</span>
            <span>Draw</span>
            <span>Away</span>
          </div>
          {data.map((book) => (
            <div key={book.key} className="odds-comparison__row">
              <span className="odds-comparison__book">{book.title}</span>
              <span className={book.homeRaw === bestHome ? 'odds-comparison__best' : ''}>
                {book.home}
              </span>
              <span className={book.drawRaw === bestDraw ? 'odds-comparison__best' : ''}>
                {book.draw}
              </span>
              <span className={book.awayRaw === bestAway ? 'odds-comparison__best' : ''}>
                {book.away}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseOdds(str) {
  if (!str) return null;
  const n = parseInt(str.replace('+', ''));
  return isNaN(n) ? null : n;
}
