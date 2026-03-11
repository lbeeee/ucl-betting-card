// Bet tracker — client-side state management for tracking placed bets
// Uses in-memory state with optional export/import

/**
 * Bet status enum
 */
export const BET_STATUS = {
  PENDING: 'pending',     // Not yet placed
  PLACED: 'placed',       // Placed, awaiting result
  WON: 'won',
  LOST: 'lost',
  VOID: 'void',
  CASHED_OUT: 'cashed_out',
};

/**
 * Create a new tracked bet from a bankroll entry.
 */
export function createTrackedBet(bankrollEntry, overrides = {}) {
  return {
    id: `bet_${bankrollEntry.matchId}_${bankrollEntry.type}_${Date.now()}`,
    matchId: bankrollEntry.matchId,
    label: bankrollEntry.label,
    type: bankrollEntry.type,
    description: bankrollEntry.bet,
    stake: bankrollEntry.stake,
    odds: bankrollEntry.odds,
    potentialWin: bankrollEntry.toWin,
    status: BET_STATUS.PENDING,
    actualStake: null,      // User can override stake
    result: null,           // 'won', 'lost', 'void', etc.
    payout: null,           // Actual payout received
    placedAt: null,
    settledAt: null,
    notes: '',
    ...overrides,
  };
}

/**
 * Calculate P&L summary across all tracked bets.
 */
export function calculatePnL(bets) {
  const placed = bets.filter((b) => b.status !== BET_STATUS.PENDING);
  const settled = bets.filter((b) => [BET_STATUS.WON, BET_STATUS.LOST, BET_STATUS.VOID, BET_STATUS.CASHED_OUT].includes(b.status));

  const totalStaked = placed.reduce((sum, b) => sum + (b.actualStake || b.stake), 0);
  const totalReturned = settled.reduce((sum, b) => {
    if (b.status === BET_STATUS.WON) return sum + (b.payout || (b.actualStake || b.stake) + b.potentialWin);
    if (b.status === BET_STATUS.VOID) return sum + (b.actualStake || b.stake);
    if (b.status === BET_STATUS.CASHED_OUT) return sum + (b.payout || 0);
    return sum;
  }, 0);

  const netPnL = totalReturned - totalStaked;
  const roi = totalStaked > 0 ? (netPnL / totalStaked) * 100 : 0;

  const wins = settled.filter((b) => b.status === BET_STATUS.WON).length;
  const losses = settled.filter((b) => b.status === BET_STATUS.LOST).length;

  return {
    totalBets: bets.length,
    placed: placed.length,
    settled: settled.length,
    wins,
    losses,
    winRate: settled.length > 0 ? (wins / settled.length) * 100 : 0,
    totalStaked,
    totalReturned,
    netPnL,
    roi,
  };
}

/**
 * Parse American odds string to decimal.
 */
export function americanToDecimal(odds) {
  if (typeof odds === 'string') {
    odds = odds.replace('~', '');
    if (odds.startsWith('+')) {
      return parseFloat(odds) / 100 + 1;
    } else {
      return 100 / Math.abs(parseFloat(odds)) + 1;
    }
  }
  return odds;
}

/**
 * Calculate potential payout from stake and American odds.
 */
export function calculatePayout(stake, americanOdds) {
  const decimal = americanToDecimal(americanOdds);
  return +(stake * decimal).toFixed(2);
}

/**
 * Determine SGP leg status based on live match data.
 * Returns 'alive', 'dead', 'hit', or 'pending'.
 */
export function evaluateSGPLeg(leg, matchData) {
  if (!matchData || matchData.phase === 'prematch') return 'pending';

  const { goals, elapsed, phase } = matchData;
  const totalGoals = (goals?.home ?? 0) + (goals?.away ?? 0);
  const isFinished = phase === 'finished';

  // Simple leg evaluation — would need real data for player props
  const legLower = leg.toLowerCase();

  // Team win checks
  if (legLower.includes('to win')) {
    const team = legLower.includes('arsenal') ? 'away' :
                 legLower.includes('man city') ? 'away' :
                 legLower.includes('chelsea') ? 'away' : 'home';
    const leading = team === 'home' ? goals.home > goals.away : goals.away > goals.home;
    const trailing = team === 'home' ? goals.home < goals.away : goals.away < goals.home;

    if (isFinished) return leading ? 'hit' : 'dead';
    return leading ? 'alive' : trailing ? 'alive' : 'pending'; // Can still happen
  }

  // BTTS
  if (legLower.includes('both teams to score')) {
    if (goals.home > 0 && goals.away > 0) return isFinished ? 'hit' : 'hit';
    if (isFinished) return 'dead';
    return 'pending';
  }

  // Over totals
  const overMatch = legLower.match(/over (\d+\.?\d*)/);
  if (overMatch) {
    const line = parseFloat(overMatch[1]);
    if (totalGoals > line) return isFinished ? 'hit' : 'hit';
    if (isFinished) return 'dead';
    return 'pending';
  }

  // Double chance
  if (legLower.includes('double chance')) {
    // "Win or Draw" for away team
    if (isFinished) return goals.away >= goals.home ? 'hit' : 'dead';
    return 'pending';
  }

  // Player props — need real-time player stats data
  if (legLower.includes('goalscorer') || legLower.includes('sot') || legLower.includes('shot')) {
    // Can't evaluate without player-level data — keep pending
    return 'pending';
  }

  return 'pending';
}
