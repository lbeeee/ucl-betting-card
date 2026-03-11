// =============================================
// League Configuration Registry
// Central source of truth for all supported
// leagues, their API keys, colors, and display.
// =============================================

export const LEAGUES = {
  ucl: {
    id: 'ucl',
    name: 'Champions League',
    shortName: 'UCL',
    logo: '🏆',
    country: 'Europe',
    oddsApiKey: 'soccer_uefa_champs_league',
    apiFootballId: 2,
    apiFootballSeason: 2025,
    color: '#1a3c8f',
    colorLight: '#3b68d9',
    colorBg: 'rgba(59, 104, 217, 0.08)',
    colorBorder: 'rgba(59, 104, 217, 0.2)',
    priority: 1,
  },
  uel: {
    id: 'uel',
    name: 'Europa League',
    shortName: 'UEL',
    logo: '🟠',
    country: 'Europe',
    oddsApiKey: 'soccer_uefa_europa_league',
    apiFootballId: 3,
    apiFootballSeason: 2025,
    color: '#e85d04',
    colorLight: '#f4845f',
    colorBg: 'rgba(232, 93, 4, 0.08)',
    colorBorder: 'rgba(232, 93, 4, 0.2)',
    priority: 2,
  },
  epl: {
    id: 'epl',
    name: 'Premier League',
    shortName: 'EPL',
    logo: '🦁',
    country: 'England',
    oddsApiKey: 'soccer_epl',
    apiFootballId: 39,
    apiFootballSeason: 2025,
    color: '#3d195b',
    colorLight: '#7b3fa0',
    colorBg: 'rgba(61, 25, 91, 0.08)',
    colorBorder: 'rgba(61, 25, 91, 0.2)',
    priority: 3,
  },
  laliga: {
    id: 'laliga',
    name: 'La Liga',
    shortName: 'LaLiga',
    logo: '🇪🇸',
    country: 'Spain',
    oddsApiKey: 'soccer_spain_la_liga',
    apiFootballId: 140,
    apiFootballSeason: 2025,
    color: '#ee8707',
    colorLight: '#f5a623',
    colorBg: 'rgba(245, 166, 35, 0.08)',
    colorBorder: 'rgba(245, 166, 35, 0.2)',
    priority: 4,
  },
  seriea: {
    id: 'seriea',
    name: 'Serie A',
    shortName: 'Serie A',
    logo: '🇮🇹',
    country: 'Italy',
    oddsApiKey: 'soccer_italy_serie_a',
    apiFootballId: 135,
    apiFootballSeason: 2025,
    color: '#024494',
    colorLight: '#0b6bcb',
    colorBg: 'rgba(2, 68, 148, 0.08)',
    colorBorder: 'rgba(2, 68, 148, 0.2)',
    priority: 5,
  },
  mls: {
    id: 'mls',
    name: 'MLS',
    shortName: 'MLS',
    logo: '⚽',
    country: 'USA',
    oddsApiKey: 'soccer_usa_mls',
    apiFootballId: 253,
    apiFootballSeason: 2026,
    color: '#cf2e2e',
    colorLight: '#e05555',
    colorBg: 'rgba(207, 46, 46, 0.08)',
    colorBorder: 'rgba(207, 46, 46, 0.2)',
    priority: 6,
  },
  nwsl: {
    id: 'nwsl',
    name: 'NWSL',
    shortName: 'NWSL',
    logo: '🌟',
    country: 'USA',
    oddsApiKey: 'soccer_usa_nwsl',
    apiFootballId: 254,
    apiFootballSeason: 2026,
    color: '#1a7742',
    colorLight: '#2ca560',
    colorBg: 'rgba(44, 165, 96, 0.08)',
    colorBorder: 'rgba(44, 165, 96, 0.2)',
    priority: 7,
  },
};

export const LEAGUE_LIST = Object.values(LEAGUES).sort((a, b) => a.priority - b.priority);
export const LEAGUE_IDS = Object.keys(LEAGUES);

/**
 * Get all Odds API sport keys for fetching across leagues
 */
export function getAllOddsApiKeys() {
  return LEAGUE_LIST.map((l) => l.oddsApiKey);
}

/**
 * Find which league a team/match belongs to based on API-Football league ID
 */
export function getLeagueByApiId(apiFootballId) {
  return LEAGUE_LIST.find((l) => l.apiFootballId === apiFootballId) || null;
}

/**
 * Find league by odds API key
 */
export function getLeagueByOddsKey(oddsApiKey) {
  return LEAGUE_LIST.find((l) => l.oddsApiKey === oddsApiKey) || null;
}
