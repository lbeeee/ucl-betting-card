import { NextResponse } from 'next/server';
import { fetchLiveOdds, extractMatchOdds, extractTotals, buildOddsComparison } from '@/lib/oddsApi';
import { MATCHES } from '@/lib/matchData';

export const revalidate = 55; // ISR: refresh every ~1 min

export async function GET() {
  const oddsData = await fetchLiveOdds();

  // Match odds events to our matches by team name
  const matchOdds = {};

  for (const match of MATCHES) {
    const event = oddsData.events.find((e) => {
      const home = e.homeTeam?.toLowerCase() || '';
      const away = e.awayTeam?.toLowerCase() || '';
      return (
        home.includes(match.home.apiName.toLowerCase().split(' ')[0]) ||
        away.includes(match.away.apiName.toLowerCase().split(' ')[0])
      );
    });

    const odds = extractMatchOdds(event);
    const totals = extractTotals(event);
    const comparison = buildOddsComparison(event);

    matchOdds[match.id] = {
      moneyline: odds || {
        home: match.staticOdds.home,
        draw: match.staticOdds.draw,
        away: match.staticOdds.away,
        bookmaker: 'Static (API unavailable)',
        lastUpdate: null,
      },
      totals: totals || null,
      comparison: comparison.length > 0 ? comparison : null,
      source: odds ? 'live' : 'static',
    };
  }

  return NextResponse.json({
    odds: matchOdds,
    source: oddsData.source,
    remaining: oddsData.remaining,
    used: oddsData.used,
    fetchedAt: oddsData.fetchedAt || new Date().toISOString(),
    error: oddsData.error || null,
  });
}
