'use client';
import { findBestPrices, detectValueBets, calculateVig } from '@/lib/oddsUtils';

export default function OddsComparison({ fixture }) {
  const { odds, home, away } = fixture;
  if (!odds?.comparison?.length) return null;
  const best = findBestPrices(odds.comparison);
  const valueBets = detectValueBets(odds.comparison);
  const vig = odds.primary ? calculateVig(odds.primary.home, odds.primary.draw, odds.primary.away) : null;

  return (
    <div className="odds-comp">
      <div className="odds-comp__header">
        <span className="odds-comp__title">Odds Comparison</span>
        {vig != null && <span className="odds-comp__vig" title="Bookmaker overround">Vig: {vig.toFixed(1)}%</span>}
      </div>
      <div className="odds-comp__table">
        <div className="odds-comp__row odds-comp__row--header">
          <span className="odds-comp__cell odds-comp__cell--book">Book</span>
          <span className="odds-comp__cell">{home.name}</span>
          <span className="odds-comp__cell">Draw</span>
          <span className="odds-comp__cell">{away.name}</span>
        </div>
        {odds.comparison.map(book => (
          <div className="odds-comp__row" key={book.bookKey}>
            <span className="odds-comp__cell odds-comp__cell--book">{book.bookmaker}</span>
            <span className={`odds-comp__cell ${best?.home?.bookKey === book.bookKey ? 'odds-comp__cell--best' : ''}`}>
              {book.home || '—'}{best?.home?.bookKey === book.bookKey && <span className="odds-comp__best-tag">BEST</span>}
            </span>
            <span className={`odds-comp__cell ${best?.draw?.bookKey === book.bookKey ? 'odds-comp__cell--best' : ''}`}>
              {book.draw || '—'}{best?.draw?.bookKey === book.bookKey && <span className="odds-comp__best-tag">BEST</span>}
            </span>
            <span className={`odds-comp__cell ${best?.away?.bookKey === book.bookKey ? 'odds-comp__cell--best' : ''}`}>
              {book.away || '—'}{best?.away?.bookKey === book.bookKey && <span className="odds-comp__best-tag">BEST</span>}
            </span>
          </div>
        ))}
      </div>
      {odds.totals && (
        <div className="odds-comp__totals">
          <span className="odds-comp__totals-label">Total Goals</span>
          <span className="odds-comp__totals-line">O/U {odds.totals.line}</span>
          <span className="odds-comp__totals-over">Over {odds.totals.over}</span>
          <span className="odds-comp__totals-under">Under {odds.totals.under}</span>
          <span className="odds-comp__totals-book">{odds.totals.bookmaker}</span>
        </div>
      )}
      {valueBets.length > 0 && (
        <div className="value-bets">
          <div className="value-bets__title">💎 Value Detected</div>
          {valueBets.map((vb, i) => (
            <div className={`value-bet value-bet--${vb.rating}`} key={i}>
              <div className="value-bet__header">
                <span className="value-bet__label">{vb.label}</span>
                <span className="value-bet__price">{vb.price}</span>
                <span className={`value-bet__badge value-bet__badge--${vb.rating}`}>
                  {vb.rating === 'strong' ? '🔥 Strong' : vb.rating === 'moderate' ? '⚡ Moderate' : '📊 Mild'} Value
                </span>
              </div>
              <div className="value-bet__detail">
                <span>Edge: <strong>+{vb.edge}%</strong></span>
                <span className="value-bet__sep">·</span>
                <span>Model: {vb.modelProb}%</span>
                <span className="value-bet__sep">·</span>
                <span>Book: {vb.bookProb}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
