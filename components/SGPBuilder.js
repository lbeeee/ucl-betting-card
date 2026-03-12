'use client';
import { useState, useMemo } from 'react';
import { checkCorrelation } from '@/lib/oddsUtils';

const LEGS = [
  { category: 'Result', legs: [
    { label: 'Home Win', key: 'home-win' },{ label: 'Draw', key: 'draw' },{ label: 'Away Win', key: 'away-win' },
    { label: 'Home or Draw (DC)', key: 'home-dc' },{ label: 'Away or Draw (DC)', key: 'away-dc' },
  ]},
  { category: 'Goals', legs: [
    { label: 'Over 1.5 Goals', key: 'o15' },{ label: 'Over 2.5 Goals', key: 'o25' },{ label: 'Over 3.5 Goals', key: 'o35' },
    { label: 'Under 2.5 Goals', key: 'u25' },{ label: 'Under 3.5 Goals', key: 'u35' },
    { label: 'BTTS Yes', key: 'btts-y' },{ label: 'BTTS No', key: 'btts-n' },
  ]},
  { category: 'Clean Sheet', legs: [
    { label: 'Home Clean Sheet', key: 'hcs' },{ label: 'Away Clean Sheet', key: 'acs' },
  ]},
];

export default function SGPBuilder({ fixture }) {
  const [sel, setSel] = useState([]);
  const toggle = (leg) => setSel(p => p.find(l => l.key === leg.key) ? p.filter(l => l.key !== leg.key) : [...p, leg]);
  const isSel = (key) => sel.some(l => l.key === key);

  const corrs = useMemo(() => {
    const c = [];
    for (let i = 0; i < sel.length; i++)
      for (let j = i+1; j < sel.length; j++) {
        const t = checkCorrelation(sel[i].label, sel[j].label);
        if (t !== 'neutral') c.push({ leg1: sel[i].label, leg2: sel[j].label, type: t });
      }
    return c;
  }, [sel]);

  const hasConflict = corrs.some(c => c.type === 'negative');
  const hasBoost = corrs.some(c => c.type === 'positive');

  return (
    <div className="sgp-builder">
      <div className="sgp-builder__header">
        <span className="sgp-builder__title">■ Build SGP</span>
        {sel.length > 0 && <button className="sgp-builder__clear" onClick={() => setSel([])}>Clear all</button>}
      </div>
      <div className="sgp-builder__categories">
        {LEGS.map(cat => (
          <div className="sgp-builder__category" key={cat.category}>
            <div className="sgp-builder__cat-label">{cat.category}</div>
            <div className="sgp-builder__cat-legs">
              {cat.legs.map(leg => (
                <button key={leg.key} className={`sgp-builder__leg ${isSel(leg.key) ? 'sgp-builder__leg--selected' : ''}`} onClick={() => toggle(leg)}>
                  {isSel(leg.key) && <span className="sgp-builder__check">✓</span>}{leg.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {sel.length >= 2 && (
        <div className="sgp-builder__analysis">
          <div className="sgp-builder__legs-list">
            {sel.map((leg, i) => (
              <div className="sgp-builder__selected-leg" key={leg.key}>
                <span className="sgp-builder__leg-num">{i+1}</span><span>{leg.label}</span>
                <button className="sgp-builder__remove" onClick={() => toggle(leg)}>×</button>
              </div>
            ))}
          </div>
          {corrs.length > 0 && (
            <div className="sgp-builder__correlations">
              {corrs.map((c, i) => (
                <div className={`sgp-corr sgp-corr--${c.type}`} key={i}>
                  <span className={`corr-dot corr-dot--${c.type === 'positive' ? 'pos' : 'neg'}`}>{c.type === 'positive' ? '↗' : '⚠'}</span>
                  <span className="sgp-corr__text">
                    {c.type === 'positive'
                      ? `"${c.leg1}" + "${c.leg2}" — Strong combo, positively correlated`
                      : `"${c.leg1}" + "${c.leg2}" — Conflicting legs, unlikely to both hit`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className={`sgp-builder__summary ${hasConflict ? 'sgp-builder__summary--warn' : hasBoost ? 'sgp-builder__summary--boost' : ''}`}>
            <span className="sgp-builder__count">{sel.length} legs</span>
            {hasConflict && <span className="sgp-builder__warn-text">⚠ Contains conflicting legs</span>}
            {hasBoost && !hasConflict && <span className="sgp-builder__boost-text">↗ Positively correlated combo</span>}
          </div>
        </div>
      )}
      {sel.length < 2 && <div className="sgp-builder__hint">Select 2+ legs to build a Same Game Parlay with correlation indicators.</div>}
    </div>
  );
}
