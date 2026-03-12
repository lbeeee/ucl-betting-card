export function parseAmerican(odds) {
  if (typeof odds === 'number') return odds;
  if (!odds || odds === '—') return null;
  return parseInt(odds.replace('+', ''), 10);
}
export function impliedProbability(odds) {
  const n = parseAmerican(odds);
  if (n == null || n === 0) return null;
  if (n > 0) return 100 / (n + 100);
  return Math.abs(n) / (Math.abs(n) + 100);
}
export function toDecimal(odds) {
  const n = parseAmerican(odds);
  if (n == null) return null;
  if (n > 0) return (n / 100) + 1;
  return (100 / Math.abs(n)) + 1;
}
export function calculateVig(home, draw, away) {
  const hP = impliedProbability(home);
  const dP = impliedProbability(draw);
  const aP = impliedProbability(away);
  if (hP == null || dP == null || aP == null) return null;
  return ((hP + dP + aP) - 1) * 100;
}
export function findBestPrices(comparison) {
  if (!comparison?.length) return null;
  const best = { home: null, draw: null, away: null };
  for (const book of comparison) {
    for (const outcome of ['home', 'draw', 'away']) {
      const n = parseAmerican(book[outcome]);
      if (n == null) continue;
      const cur = best[outcome] ? parseAmerican(best[outcome].price) : null;
      if (cur == null || n > cur) {
        best[outcome] = { price: book[outcome], bookmaker: book.bookmaker, bookKey: book.bookKey };
      }
    }
  }
  return best;
}
export function detectValueBets(comparison, threshold = 3.0) {
  if (!comparison?.length || comparison.length < 2) return [];
  const outcomes = ['home', 'draw', 'away'];
  const labels = { home: 'Home Win', draw: 'Draw', away: 'Away Win' };
  const valueBets = [];
  const avgProbs = {};
  for (const outcome of outcomes) {
    const probs = comparison.map(b => impliedProbability(b[outcome])).filter(p => p != null);
    if (probs.length === 0) continue;
    avgProbs[outcome] = probs.reduce((a, b) => a + b, 0) / probs.length;
  }
  const totalAvg = Object.values(avgProbs).reduce((a, b) => a + b, 0);
  const fairProbs = {};
  for (const outcome of outcomes) {
    if (avgProbs[outcome] != null) fairProbs[outcome] = avgProbs[outcome] / totalAvg;
  }
  const fanduel = comparison.find(b => b.bookKey === 'fanduel') || comparison[0];
  if (!fanduel) return [];
  for (const outcome of outcomes) {
    const bookProb = impliedProbability(fanduel[outcome]);
    const fairProb = fairProbs[outcome];
    if (bookProb == null || fairProb == null) continue;
    const edge = (fairProb - bookProb) * 100;
    if (edge >= threshold) {
      const rating = edge >= 8 ? 'strong' : edge >= 5 ? 'moderate' : 'mild';
      valueBets.push({ outcome, label: labels[outcome], price: fanduel[outcome], bookmaker: fanduel.bookmaker, edge: edge.toFixed(1), modelProb: (fairProb * 100).toFixed(1), bookProb: (bookProb * 100).toFixed(1), rating });
    }
  }
  return valueBets.sort((a, b) => parseFloat(b.edge) - parseFloat(a.edge));
}
export function checkCorrelation(leg1, leg2) {
  const l1 = leg1.toLowerCase(), l2 = leg2.toLowerCase();
  const pos = [[/win/,/over/],[/btts.*yes/,/over/],[/anytime goal/,/over/],[/anytime goal/,/btts.*yes/],[/1\+ shot/,/win/],[/win/,/anytime goal/],[/clean sheet/,/under/],[/clean sheet/,/win/]];
  const neg = [[/win/,/under.*1\.5/],[/btts.*yes/,/clean sheet/],[/btts.*yes/,/under.*1\.5/],[/win/,/btts.*no/],[/over.*3/,/draw/],[/clean sheet/,/btts.*yes/],[/under.*1\.5/,/anytime goal/]];
  for (const [p1,p2] of pos) { if ((p1.test(l1)&&p2.test(l2))||(p1.test(l2)&&p2.test(l1))) return 'positive'; }
  for (const [p1,p2] of neg) { if ((p1.test(l1)&&p2.test(l2))||(p1.test(l2)&&p2.test(l1))) return 'negative'; }
  return 'neutral';
}
export function combineSGPOdds(legs) {
  if (!legs?.length) return null;
  let cd = 1;
  for (const leg of legs) { const d = toDecimal(leg.odds); if (d == null) return null; cd *= d; }
  if (cd >= 2) return '+' + Math.round((cd-1)*100);
  return '' + Math.round(-100/(cd-1));
}
