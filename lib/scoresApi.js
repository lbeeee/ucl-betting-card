// API-Football client (via RapidAPI)
// Docs: https://www.api-football.com/documentation-v3
const BASE = 'https://v3.football.api-sports.io';

function headers() {
  return {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
    'x-rapidapi-host': 'v3.football.api-sports.io',
  };
}

/**
 * Fetch all UCL fixtures for a given date.
 * league=2 is Champions League in API-Football.
 */
export async function fetchFixtures(date = '2026-03-11') {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return { fixtures: [], source: 'static', error: 'No RapidAPI key' };

  try {
    const url = `${BASE}/fixtures?date=${date}&league=2&season=2025`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 25 } });
    if (!res.ok) return { fixtures: [], source: 'static', error: `API returned ${res.status}` };

    const data = await res.json();
    return {
      fixtures: (data.response || []).map(normalizeFixture),
      source: 'live',
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Fixtures fetch failed:', err);
    return { fixtures: [], source: 'static', error: err.message };
  }
}

/**
 * Fetch live events (goals, cards, subs) for a specific fixture.
 */
export async function fetchMatchEvents(fixtureId) {
  if (!fixtureId || !process.env.RAPIDAPI_KEY) return [];

  try {
    const url = `${BASE}/fixtures/events?fixture=${fixtureId}`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 15 } });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.response || []).map((e) => ({
      time: e.time.elapsed + (e.time.extra ? `+${e.time.extra}` : ''),
      team: e.team.name,
      teamId: e.team.id,
      player: e.player.name,
      assist: e.assist?.name || null,
      type: e.type,        // "Goal", "Card", "subst", "Var"
      detail: e.detail,    // "Normal Goal", "Yellow Card", "Red Card", "Penalty", etc.
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch confirmed lineups for a fixture.
 * Available ~1 hour before kickoff.
 */
export async function fetchLineups(fixtureId) {
  if (!fixtureId || !process.env.RAPIDAPI_KEY) return null;

  try {
    const url = `${BASE}/fixtures/lineups?fixture=${fixtureId}`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 120 } });
    if (!res.ok) return null;

    const data = await res.json();
    const teams = data.response || [];
    if (teams.length < 2) return null;

    return teams.map((t) => ({
      teamName: t.team.name,
      teamId: t.team.id,
      formation: t.formation,
      startXI: t.startXI.map((p) => ({
        id: p.player.id,
        name: p.player.name,
        number: p.player.number,
        pos: p.player.pos,
        grid: p.player.grid,
      })),
      substitutes: t.substitutes.map((p) => ({
        id: p.player.id,
        name: p.player.name,
        number: p.player.number,
        pos: p.player.pos,
      })),
      coach: t.coach?.name || null,
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch fixture statistics (possession, shots, etc.)
 */
export async function fetchMatchStats(fixtureId) {
  if (!fixtureId || !process.env.RAPIDAPI_KEY) return null;

  try {
    const url = `${BASE}/fixtures/statistics?fixture=${fixtureId}`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 25 } });
    if (!res.ok) return null;

    const data = await res.json();
    return (data.response || []).map((team) => ({
      teamName: team.team.name,
      teamId: team.team.id,
      stats: Object.fromEntries(
        (team.statistics || []).map((s) => [s.type, s.value])
      ),
    }));
  } catch {
    return null;
  }
}

function normalizeFixture(f) {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    venue: f.fixture.venue?.name,
    status: {
      long: f.fixture.status.long,   // "Match Finished", "First Half", "Not Started", etc.
      short: f.fixture.status.short,  // "FT", "1H", "HT", "2H", "NS", "LIVE"
      elapsed: f.fixture.status.elapsed,
    },
    home: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
      winner: f.teams.home.winner,
    },
    away: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
      winner: f.teams.away.winner,
    },
    goals: {
      home: f.goals.home,
      away: f.goals.away,
    },
    score: {
      halftime: f.score.halftime,
      fulltime: f.score.fulltime,
      extratime: f.score.extratime,
      penalty: f.score.penalty,
    },
  };
}

/**
 * Determine match phase for UI rendering.
 */
export function getMatchPhase(statusShort) {
  const liveStatuses = ['1H', '2H', 'ET', 'P', 'BT', 'LIVE'];
  const breakStatuses = ['HT'];
  const finishedStatuses = ['FT', 'AET', 'PEN'];

  if (liveStatuses.includes(statusShort)) return 'live';
  if (breakStatuses.includes(statusShort)) return 'halftime';
  if (finishedStatuses.includes(statusShort)) return 'finished';
  return 'prematch';
}
