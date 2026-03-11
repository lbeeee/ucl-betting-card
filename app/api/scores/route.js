import { NextResponse } from 'next/server';
import { fetchFixtures, fetchMatchEvents, fetchMatchStats, getMatchPhase } from '@/lib/scoresApi';
import { MATCHES } from '@/lib/matchData';

export const revalidate = 25;

export async function GET() {
  const fixturesData = await fetchFixtures('2026-03-11');

  const matchScores = {};

  for (const match of MATCHES) {
    // Try to find the fixture in API data
    const fixture = fixturesData.fixtures.find((f) => {
      const home = f.home.name?.toLowerCase() || '';
      const away = f.away.name?.toLowerCase() || '';
      return (
        home.includes(match.home.short.toLowerCase()) ||
        home.includes(match.home.apiName.toLowerCase().split(' ')[0].toLowerCase()) ||
        away.includes(match.away.short.toLowerCase())
      );
    });

    if (fixture) {
      const phase = getMatchPhase(fixture.status.short);

      // Fetch events and stats for live/finished matches
      let events = [];
      let stats = null;
      if (phase === 'live' || phase === 'halftime' || phase === 'finished') {
        [events, stats] = await Promise.all([
          fetchMatchEvents(fixture.id),
          fetchMatchStats(fixture.id),
        ]);
      }

      matchScores[match.id] = {
        fixtureId: fixture.id,
        phase,
        status: fixture.status,
        goals: fixture.goals,
        score: fixture.score,
        events: events.slice(-20), // Last 20 events
        stats,
        source: 'live',
      };
    } else {
      // No fixture data — prematch
      matchScores[match.id] = {
        fixtureId: null,
        phase: 'prematch',
        status: { long: 'Not Started', short: 'NS', elapsed: null },
        goals: { home: null, away: null },
        score: null,
        events: [],
        stats: null,
        source: 'static',
      };
    }
  }

  return NextResponse.json({
    scores: matchScores,
    source: fixturesData.source,
    fetchedAt: new Date().toISOString(),
  });
}
