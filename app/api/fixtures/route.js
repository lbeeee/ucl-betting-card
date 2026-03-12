// =============================================
// GET /api/fixtures?date=2026-03-11&leagues=ucl,epl,laliga
//
// Fetches today's matches across all requested
// leagues from API-Football. Merges live odds
// from The Odds API. Returns a unified fixture
// list grouped by league.
// =============================================

import { NextResponse } from 'next/server';
import { LEAGUES, LEAGUE_LIST } from '@/lib/leagues';

export const revalidate = 55;

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

function today() {
  return new Date().toISOString().split('T')[0];
}

async function fetchFootballApi(endpoint) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;

  const res = await fetch(`${API_FOOTBALL_BASE}${endpoint}`, {
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: { revalidate: 55 },
  });

  if (!res.ok) {
    console.error(`API-Football error: ${res.status} on ${endpoint}`);
    return null;
  }
  return res.json();
}

async function fetchOddsForSport(sportKey) {
  const key = process.env.THE_ODDS_API_KEY;
  if (!key) return [];

  try {
    const url = new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`);
    url.searchParams.set('apiKey', key);
    url.searchParams.set('regions', 'us');
    url.searchParams.set('markets', 'h2h,totals');
    url.searchParams.set('oddsFormat', 'american');
    url.searchParams.set('bookmakers', 'fanduel,draftkings,betmgm,pointsbetus');

    const res = await fetch(url.toString(), { next: { revalidate: 55 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function formatAmerican(price) {
  if (typeof price !== 'number') return price;
  if (price > 0) return `+${price}`;
  return `${price}`;
}

function matchOddsToFixture(oddsEvents, homeTeam, awayTeam) {
  if (!oddsEvents?.length) return null;

  const event = oddsEvents.find((e) => {
    const h = e.home_team?.toLowerCase() || '';
    const a = e.away_team?.toLowerCase() || '';
    const hMatch = homeTeam.toLowerCase();
    const aMatch = awayTeam.toLowerCase();

    // Fuzzy match: check if last word of team name appears
    const hLast = hMatch.split(' ').pop();
    const aLast = aMatch.split(' ').pop();
    return (h.includes(hLast) || hLast.length > 3 && h.includes(hLast)) &&
           (a.includes(aLast) || aLast.length > 3 && a.includes(aLast));
  });

  if (!event) return null;

  const result = { comparison: [] };

  for (const bm of event.bookmakers || []) {
    const h2h = bm.markets?.find((m) => m.key === 'h2h');
    const totals = bm.markets?.find((m) => m.key === 'totals');

    if (h2h) {
      const home = h2h.outcomes.find((o) => o.name === event.home_team);
      const away = h2h.outcomes.find((o) => o.name === event.away_team);
      const draw = h2h.outcomes.find((o) => o.name === 'Draw');

      const bookOdds = {
        bookmaker: bm.title,
        bookKey: bm.key,
        home: home ? formatAmerican(home.price) : null,
        draw: draw ? formatAmerican(draw.price) : null,
        away: away ? formatAmerican(away.price) : null,
        lastUpdate: bm.last_update,
      };

      result.comparison.push(bookOdds);

      // Use FanDuel as primary, then first available
      if (bm.key === 'fanduel' || !result.primary) {
        result.primary = bookOdds;
      }
    }

    if (totals && (bm.key === 'fanduel' || !result.totals)) {
      const over = totals.outcomes.find((o) => o.name === 'Over');
      const under = totals.outcomes.find((o) => o.name === 'Under');
      if (over && under) {
        result.totals = {
          line: over.point,
          over: formatAmerican(over.price),
          under: formatAmerican(under.price),
          bookmaker: bm.title,
        };
      }
    }
  }

  return result;
}

function normalizeStatus(status) {
  const short = status?.short || 'NS';
  const elapsed = status?.elapsed;

  const phases = {
    TBD: 'prematch', NS: 'prematch',
    '1H': 'live', '2H': 'live', ET: 'live', BT: 'live', P: 'live',
    HT: 'halftime',
    FT: 'finished', AET: 'finished', PEN: 'finished',
    SUSP: 'suspended', PST: 'postponed', CANC: 'cancelled', ABD: 'abandoned', INT: 'interrupted',
    AWD: 'finished', WO: 'finished',
  };

  const labels = {
    NS: 'Not Started', '1H': '1st Half', '2H': '2nd Half', HT: 'Half Time',
    ET: 'Extra Time', BT: 'Break', P: 'Penalties',
    FT: 'Full Time', AET: 'AET', PEN: 'Pens',
    SUSP: 'Suspended', PST: 'Postponed', CANC: 'Cancelled',
  };

  return {
    short,
    phase: phases[short] || 'prematch',
    label: labels[short] || short,
    elapsed,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || today();
  const leagueFilter = searchParams.get('leagues')?.split(',').filter(Boolean) || null;

  // Determine which leagues to fetch
  const targetLeagues = leagueFilter
    ? LEAGUE_LIST.filter((l) => leagueFilter.includes(l.id))
    : LEAGUE_LIST;

  const hasFootballKey = !!process.env.RAPIDAPI_KEY;
  const hasOddsKey = !!process.env.THE_ODDS_API_KEY;

  // Fetch fixtures from API-Football for each league (in parallel)
  let allFixtures = [];

  if (hasFootballKey) {
    const fixturePromises = targetLeagues.map(async (league) => {
      const data = await fetchFootballApi(
        `/fixtures?date=${date}&league=${league.apiFootballId}&season=${league.apiFootballSeason}`
      );
      if (!data?.response) return [];
      return data.response.map((f) => ({ ...f, _leagueId: league.id }));
    });

    const results = await Promise.all(fixturePromises);
    allFixtures = results.flat();
  }

  // Fetch odds for each league's sport key (in parallel)
  let allOdds = {};

  if (hasOddsKey) {
    const uniqueSportKeys = [...new Set(targetLeagues.map((l) => l.oddsApiKey))];
    const oddsPromises = uniqueSportKeys.map(async (sportKey) => {
      const data = await fetchOddsForSport(sportKey);
      return { sportKey, events: Array.isArray(data) ? data : [] };
    });

    const oddsResults = await Promise.all(oddsPromises);
    for (const { sportKey, events } of oddsResults) {
      allOdds[sportKey] = events;
    }
  }

  // Build normalized fixture list grouped by league
  const fixturesByLeague = {};

  for (const league of targetLeagues) {
    const leagueFixtures = allFixtures.filter((f) => f._leagueId === league.id);
    const leagueOdds = allOdds[league.oddsApiKey] || [];

    fixturesByLeague[league.id] = leagueFixtures.map((f) => {
      const status = normalizeStatus(f.fixture?.status);
      const odds = matchOddsToFixture(leagueOdds, f.teams.home.name, f.teams.away.name);

      return {
        id: `${league.id}-${f.fixture.id}`,
        fixtureId: f.fixture.id,
        leagueId: league.id,
        kickoff: f.fixture.date,
        venue: f.fixture.venue?.name || null,
        city: f.fixture.venue?.city || null,
        status,
        home: {
          name: f.teams.home.name,
          logo: f.teams.home.logo,
          id: f.teams.home.id,
          goals: f.goals?.home,
        },
        away: {
          name: f.teams.away.name,
          logo: f.teams.away.logo,
          id: f.teams.away.id,
          goals: f.goals?.away,
        },
        score: {
          ht: f.score?.halftime,
          ft: f.score?.fulltime,
          et: f.score?.extratime,
          pen: f.score?.penalty,
        },
        odds: odds || null,
        events: (f.events || []).map((e) => ({
          minute: e.time?.elapsed,
          extra: e.time?.extra,
          type: e.type,
          detail: e.detail,
          player: e.player?.name,
          assist: e.assist?.name,
          team: e.team?.name,
          teamId: e.team?.id,
        })),
      };
    });
  }

  // If no API-Football key, try to build fixture list from odds data alone
  if (!hasFootballKey && hasOddsKey) {
    for (const league of targetLeagues) {
      const leagueOdds = allOdds[league.oddsApiKey] || [];
      if (!fixturesByLeague[league.id]?.length && leagueOdds.length > 0) {
        fixturesByLeague[league.id] = leagueOdds
          .filter((e) => {
            // Only include matches for today
            const matchDate = new Date(e.commence_time).toISOString().split('T')[0];
            return matchDate === date;
          })
          .map((e) => {
            const odds = matchOddsToFixture([e], e.home_team, e.away_team);
            return {
              id: `${league.id}-odds-${e.id}`,
              fixtureId: null,
              leagueId: league.id,
              kickoff: e.commence_time,
              venue: null,
              city: null,
              status: { short: 'NS', phase: 'prematch', label: 'Not Started', elapsed: null },
              home: { name: e.home_team, logo: null, id: null, goals: null },
              away: { name: e.away_team, logo: null, id: null, goals: null },
              score: {},
              odds,
              events: [],
            };
          });
      }
    }
  }

  // Count live matches
  const liveCount = Object.values(fixturesByLeague)
    .flat()
    .filter((f) => f.status.phase === 'live' || f.status.phase === 'halftime').length;

  const totalFixtures = Object.values(fixturesByLeague).flat().length;

  return NextResponse.json({
    date,
    fixtures: fixturesByLeague,
    liveCount,
    totalFixtures,
    leagues: targetLeagues.map((l) => ({
      id: l.id,
      name: l.name,
      shortName: l.shortName,
      logo: l.logo,
      color: l.color,
      fixtureCount: fixturesByLeague[l.id]?.length || 0,
    })),
    source: {
      scores: hasFootballKey ? 'live' : 'unavailable',
      odds: hasOddsKey ? 'live' : 'unavailable',
    },
    fetchedAt: new Date().toISOString(),
  });
}
