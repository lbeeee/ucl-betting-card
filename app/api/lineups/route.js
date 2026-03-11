import { NextResponse } from 'next/server';
import { fetchFixtures, fetchLineups } from '@/lib/scoresApi';
import { MATCHES } from '@/lib/matchData';

export const revalidate = 120; // Check every 2 min

export async function GET() {
  const fixturesData = await fetchFixtures('2026-03-11');
  const matchLineups = {};

  for (const match of MATCHES) {
    const fixture = fixturesData.fixtures.find((f) => {
      const home = f.home.name?.toLowerCase() || '';
      return home.includes(match.home.apiName.toLowerCase().split(' ')[0].toLowerCase());
    });

    if (fixture) {
      const lineups = await fetchLineups(fixture.id);
      if (lineups && lineups.length >= 2) {
        matchLineups[match.id] = {
          confirmed: true,
          home: lineups[0],
          away: lineups[1],
          source: 'live',
        };
      } else {
        matchLineups[match.id] = {
          confirmed: false,
          home: null,
          away: null,
          source: 'predicted',
        };
      }
    } else {
      matchLineups[match.id] = {
        confirmed: false,
        home: null,
        away: null,
        source: 'predicted',
      };
    }
  }

  return NextResponse.json({
    lineups: matchLineups,
    fetchedAt: new Date().toISOString(),
  });
}
