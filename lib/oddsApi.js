// The Odds API client
// Docs: https://the-odds-api.com/liveapi/guides/v4/
const BASE = 'https://api.the-odds-api.com/v4';

/**
 * Fetch live match odds for Champions League from multiple bookmakers.
 * Returns moneyline (h2h), spreads, and totals.
 */
export async function fetchLiveOdds() {
  const key = process.env.THE_ODDS_API_KEY;
  if (!key) return { events: [], source: 'static', error: 'No API key configured' };

  try {
    const url = new URL(`${BASE}/sports/soccer_uefa_champs_league/odds`);
    url.searchParams.set('apiKey', key);
    url.searchParams.set('regions', 'us');
    url.searchParams.set('markets', 'h2h,totals,spreads');
    url.searchParams.set('oddsFormat', 'american');
    url.searchParams.set('bookmakers', 'fanduel,draftkings,betmgm,pointsbet');

    const res = await fetch(url.toString(), { next: { revalidate: 55 } });
    if (!res.ok) {
      const text = await res.text();
      console.error('Odds API error:', res.status, text);
      return { events: [], source: 'static', error: `API returned ${res.status}` };
    }

    const data = await res.json();

    // Remaining requests header (useful for monitoring quota)
    const remaining = res.headers.get('x-requests-remaining');
    const used = res.headers.get('x-requests-used');

    return {
      events: data.map(normalizeOddsEvent),
      source: 'live',
      remaining: remaining ? parseInt(remaining) : null,
      used: used ? parseInt(used) : null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Odds fetch failed:', err);
    return { events: [], source: 'static', error: err.message };
  }
}

/**
 * Normalize a raw Odds API event into a clean shape.
 */
function normalizeOddsEvent(event) {
  const bookmakers = {};

  for (const bm of event.bookmakers || []) {
    const markets = {};
    for (const market of bm.markets || []) {
      markets[market.key] = market.outcomes.map((o) => ({
        name: o.name,
        price: o.price,
        point: o.point ?? null,
      }));
    }
    bookmakers[bm.key] = {
      title: bm.title,
      lastUpdate: bm.last_update,
      markets,
    };
  }

  return {
    id: event.id,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    bookmakers,
  };
}

/**
 * Extract FanDuel h2h odds for a specific match, with fallback to other books.
 * Returns { home, draw, away } in American format strings, plus source book name.
 */
export function extractMatchOdds(oddsEvent) {
  if (!oddsEvent) return null;

  // Priority order of books
  const bookPriority = ['fanduel', 'draftkings', 'betmgm', 'pointsbetus'];

  for (const bookKey of bookPriority) {
    const book = oddsEvent.bookmakers[bookKey];
    if (!book?.markets?.h2h) continue;

    const h2h = book.markets.h2h;
    const homeOutcome = h2h.find((o) => o.name === oddsEvent.homeTeam);
    const awayOutcome = h2h.find((o) => o.name === oddsEvent.awayTeam);
    const drawOutcome = h2h.find((o) => o.name === 'Draw');

    if (homeOutcome && awayOutcome && drawOutcome) {
      return {
        home: formatAmerican(homeOutcome.price),
        draw: formatAmerican(drawOutcome.price),
        away: formatAmerican(awayOutcome.price),
        bookmaker: book.title,
        lastUpdate: book.lastUpdate,
      };
    }
  }
  return null;
}

/**
 * Extract totals (over/under) for a match.
 */
export function extractTotals(oddsEvent) {
  if (!oddsEvent) return null;

  const book = oddsEvent.bookmakers.fanduel || Object.values(oddsEvent.bookmakers)[0];
  if (!book?.markets?.totals) return null;

  return book.markets.totals.map((o) => ({
    name: o.name, // "Over" or "Under"
    price: formatAmerican(o.price),
    point: o.point, // e.g. 2.5
  }));
}

/**
 * Build a full odds comparison across all available bookmakers for a match.
 */
export function buildOddsComparison(oddsEvent) {
  if (!oddsEvent) return [];

  return Object.entries(oddsEvent.bookmakers).map(([key, book]) => {
    const h2h = book.markets?.h2h || [];
    const home = h2h.find((o) => o.name === oddsEvent.homeTeam);
    const away = h2h.find((o) => o.name === oddsEvent.awayTeam);
    const draw = h2h.find((o) => o.name === 'Draw');

    return {
      key,
      title: book.title,
      home: home ? formatAmerican(home.price) : '—',
      draw: draw ? formatAmerican(draw.price) : '—',
      away: away ? formatAmerican(away.price) : '—',
      homeRaw: home?.price ?? 0,
      drawRaw: draw?.price ?? 0,
      awayRaw: away?.price ?? 0,
    };
  });
}

function formatAmerican(price) {
  if (price >= 2.0) {
    return `+${Math.round((price - 1) * 100)}`;
  } else {
    return `${Math.round(-100 / (price - 1))}`;
  }
}
