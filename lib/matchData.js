// All static match data, analysis, and bet construction
// Live odds, scores, and lineups get merged on top of this at runtime

export const MATCH_DATE = '2026-03-11';
export const MATCH_DATE_DISPLAY = 'Wednesday, March 11, 2026';
export const TOTAL_BANKROLL = 50;

// API-Football fixture IDs (you'll replace these with real IDs from the API)
// To find them: GET https://v3.football.api-sports.io/fixtures?date=2026-03-11&league=2&season=2025
export const FIXTURE_IDS = {
  'leverkusen-arsenal': null,       // replace with real fixture ID
  'bodo-sporting': null,
  'psg-chelsea': null,
  'real-madrid-mancity': null,
};

// The Odds API event keys (sport_key = 'soccer_uefa_champs_league')
export const ODDS_SPORT_KEY = 'soccer_uefa_champs_league';
export const ODDS_REGIONS = 'us';
export const ODDS_BOOKMAKER = 'fanduel';

export const MATCHES = [
  {
    id: 'leverkusen-arsenal',
    slug: 'leverkusen-arsenal',
    time: '12:45 PM ET',
    kickoffUTC: '2026-03-11T17:45:00Z',
    home: { name: 'Bayer Leverkusen', short: 'LEV', flag: '🇩🇪', apiName: 'Bayer Leverkusen' },
    away: { name: 'Arsenal', short: 'ARS', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', apiName: 'Arsenal' },
    venue: 'BayArena',
    competition: 'UCL R16 · Leg 1',
    // Static odds (fallback if API unavailable)
    staticOdds: { home: '+460', draw: '+300', away: '-160' },
    homeInjuries: [
      { name: 'Mark Flekken', issue: 'Knee', status: 'out' },
      { name: 'Loïc Badé', issue: 'Hamstring', status: 'out' },
      { name: 'Arthur', issue: 'Ligament', status: 'out' },
      { name: 'Lucas Vázquez', issue: 'Calf', status: 'out' },
      { name: 'Ben Seghir', issue: 'Calf', status: 'out' },
      { name: 'Nathan Tella', issue: 'Foot', status: 'out' },
      { name: 'Patrik Schick', issue: 'Muscle', status: 'doubt' },
    ],
    awayInjuries: [
      { name: 'Mikel Merino', issue: 'Foot fracture', status: 'out' },
      { name: 'Ben White', issue: 'Knock', status: 'out' },
      { name: 'Martin Ødegaard', issue: 'Knee', status: 'out' },
      { name: 'William Saliba', issue: 'Ankle — trained Tues', status: 'fit' },
      { name: 'Trossard', issue: 'Knock — trained Tues', status: 'fit' },
      { name: 'Calafiori', issue: 'Knock — trained Tues', status: 'fit' },
    ],
    predictedXI: {
      home: 'Blaswich; Andrich, Quansah, Tapsoba; Poku, Garcia, Fernandez, Grimaldo; Maza, Terrier; Kofane',
      away: 'Raya; Timber, Saliba, Gabriel, Hincapié; Zubimendi, Rice; Saka, Eze, Martinelli; Gyökeres',
    },
    confirmedXI: { home: null, away: null }, // Populated ~1hr before KO
    playerProp: {
      player: 'Viktor Gyökeres',
      market: 'Anytime Goalscorer',
      staticOdds: '-115',
      tactical: 'Gyökeres has 10 PL goals this season and thrives in transition. Arsenal won all 4 away UCL group games by 2+ goals. Leverkusen\'s backline is depleted — no Badé, no Flekken — and they conceded 7 to PSG at home. Eze\'s line-breaking passing behind the 3-man defense should create 1v1 opportunities.',
      injuryEdge: 'Leverkusen missing first-choice GK Flekken and CB Badé. Blaswich is a clear downgrade in 1v1 situations.',
      mispricing: 'Books pricing him similarly to a standard away striker. His xG/90 in UCL is elite, and Arsenal\'s system funnels chances through him.',
    },
    sgp: {
      legs: ['Arsenal to Win', 'Over 2.5 Total Goals', 'Bukayo Saka 1+ SOT', 'Gyökeres Anytime Goalscorer'],
      staticOdds: '+320',
      reasoning: 'Arsenal are 8-0 in the UCL league phase. Leverkusen\'s injury crisis and open style means goals. Saka has 1+ SOT in 90% of UCL starts. Gyökeres is the focal point with Ødegaard out.',
    },
    correctScore: { home: 1, away: 3, staticOdds: '+1200' },
    analysis: 'Arsenal\'s perfect 8-0-0 UCL record isn\'t a fluke — they outscored opponents 23-4. Leverkusen are 6th in the Bundesliga and were battered 7-2 at home by PSG. With Flekken, Badé, and Arthur all out, their spine is compromised. Eze\'s directness in the No. 10 role may actually suit this game better. First-leg caution is the only brake on Arsenal.',
  },
  {
    id: 'bodo-sporting',
    slug: 'bodo-sporting',
    time: '4:00 PM ET',
    kickoffUTC: '2026-03-11T21:00:00Z',
    home: { name: 'Bodø/Glimt', short: 'BOD', flag: '🇳🇴', apiName: 'Bodo/Glimt' },
    away: { name: 'Sporting CP', short: 'SPO', flag: '🇵🇹', apiName: 'Sporting CP' },
    venue: 'Aspmyra Stadion',
    competition: 'UCL R16 · Leg 1',
    staticOdds: { home: '+155', draw: '+240', away: '+145' },
    homeInjuries: [
      { name: 'Full squad available', issue: 'No injuries', status: 'fit' },
    ],
    awayInjuries: [
      { name: 'Pedro Gonçalves', issue: 'Suspended', status: 'out' },
      { name: 'Maxi Araújo', issue: 'Suspended', status: 'out' },
      { name: 'Geovany Quenda', issue: 'Injury', status: 'out' },
      { name: 'Fotis Ioannidis', issue: 'Injury', status: 'out' },
      { name: 'Ricardo Mangas', issue: 'Injury', status: 'out' },
      { name: 'Giorgi Kochorashvili', issue: 'Injury', status: 'doubt' },
    ],
    predictedXI: {
      home: 'Haikin; Sjøvold, Bjørtuft, Gundersen, Bjørkan; Evjen, Berg, Fet; Blomberg, Høgh, Hauge',
      away: 'Rui Silva; Vagiannidis, Diomandé, Inácio, Fresneda; Hjulmand, Simões; Catamo, Trincão, L. Guilherme; Suárez',
    },
    confirmedXI: { home: null, away: null },
    playerProp: {
      player: 'Jens Petter Hauge',
      market: 'Anytime Goalscorer',
      staticOdds: '+220',
      tactical: 'Hauge has 6 UCL goals this season — strikes vs. Man City, Atlético, and Inter (both legs). Sporting missing 3 key creative players means they\'ll struggle to control tempo. Hauge\'s direct running on the artificial pitch gives him a massive home advantage.',
      injuryEdge: 'Sporting\'s suspensions of Gonçalves and Araújo remove two tempo-controllers. Glimt\'s press will force turnovers in dangerous areas.',
      mispricing: '+220 for a player with 6 UCL goals at home on artificial pitch is generous. Books undervaluing the conditions factor and Glimt\'s home form (beat City 3-1, Inter 3-1).',
    },
    sgp: {
      legs: ['Both Teams to Score — Yes', 'Over 2.5 Total Goals', 'Hauge Anytime Goalscorer'],
      staticOdds: '+400',
      reasoning: 'BTTS in 10 of Glimt\'s last 11 UCL games. 83% of home games go over 2.5. Sporting scored in 13 of 14 away European games. Most reliable over/BTTS spot on the card.',
    },
    correctScore: { home: 2, away: 1, staticOdds: '+700' },
    analysis: 'Bodø/Glimt are the story of this UCL — beating Man City, Atlético, and Inter as debutants. Their Aspmyra fortress, artificial pitch, and Arctic conditions make them lethal. Sporting arrive weakened — two suspensions gut their creativity. Trincão carries a huge burden. The fairytale continues.',
  },
  {
    id: 'psg-chelsea',
    slug: 'psg-chelsea',
    time: '4:00 PM ET',
    kickoffUTC: '2026-03-11T21:00:00Z',
    home: { name: 'PSG', short: 'PSG', flag: '🇫🇷', apiName: 'Paris Saint Germain' },
    away: { name: 'Chelsea', short: 'CHE', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', apiName: 'Chelsea' },
    venue: 'Parc des Princes',
    competition: 'UCL R16 · Leg 1',
    staticOdds: { home: '-130', draw: '+300', away: '+340' },
    homeInjuries: [
      { name: 'Fabián Ruiz', issue: 'Knee', status: 'out' },
      { name: 'Quentin Ndjantou', issue: 'Hamstring surgery', status: 'out' },
      { name: 'João Neves', issue: 'Ankle — trained Tues', status: 'fit' },
      { name: 'Ousmane Dembélé', issue: 'Match fitness — available', status: 'fit' },
      { name: 'Marquinhos', issue: 'Pushing to start', status: 'fit' },
    ],
    awayInjuries: [
      { name: 'Estêvão', issue: 'Hamstring', status: 'out' },
      { name: 'Jamie Gittens', issue: 'Hamstring', status: 'doubt' },
      { name: 'Levi Colwill', issue: 'Knee — long-term', status: 'out' },
      { name: 'Cole Palmer', issue: 'Doubtful', status: 'doubt' },
      { name: 'Wesley Fofana', issue: 'Knock — fit', status: 'fit' },
    ],
    predictedXI: {
      home: 'Safonov; Hakimi, Marquinhos, Pacho, Mendes; Zaire-Emery, Vitinha, Neves; Dembélé, Barcola, Kvaratskhelia',
      away: 'Sanchez; James, Fofana, Chalobah, Cucurella; Caicedo, Lavia; Palmer, Fernández, Neto; João Pedro',
    },
    confirmedXI: { home: null, away: null },
    playerProp: {
      player: 'Ousmane Dembélé',
      market: '1+ Shot on Target',
      staticOdds: '-135',
      tactical: 'Dembélé averages 1.8 SOT/90 in this UCL. Chelsea\'s fullbacks will be tested by his pace. PSG at home in a UCL knockout — he\'ll be given license to shoot.',
      injuryEdge: 'Chelsea without Estêvão and Gittens means Rosenior may play conservatively, giving PSG more ball and Dembélé more shooting chances.',
      mispricing: 'At -135, juice is low for his shot volume. His return off the bench vs Monaco showed sharpness. Should be closer to -160.',
    },
    sgp: {
      legs: ['Both Teams to Score — Yes', 'Over 2.5 Total Goals', 'Dembélé 1+ SOT', 'Enzo Fernández 1+ SOT'],
      staticOdds: '+350',
      reasoning: 'PSG\'s home UCL games are chaotic. Chelsea have 38 goals in 15 under Rosenior. BTTS in Chelsea\'s last 4. Over 2.5 in 9 of Chelsea\'s last 11. Fernández more aggressive shooting under Rosenior.',
    },
    correctScore: { home: 2, away: 2, staticOdds: '+1100' },
    analysis: 'Defending UCL holders PSG vs Club World Cup winners Chelsea. PSG lost 3-1 at home to Monaco and look shaky. Chelsea under Rosenior are chaotic but fun — 38 goals in 15 games. Neves returning is huge for PSG\'s midfield, but Chelsea\'s counter quality makes them dangerous. Expect goals.',
  },
  {
    id: 'real-madrid-mancity',
    slug: 'real-madrid-mancity',
    time: '4:00 PM ET',
    kickoffUTC: '2026-03-11T21:00:00Z',
    home: { name: 'Real Madrid', short: 'RMA', flag: '🇪🇸', apiName: 'Real Madrid' },
    away: { name: 'Man City', short: 'MCI', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', apiName: 'Manchester City' },
    venue: 'Santiago Bernabéu',
    competition: 'UCL R16 · Leg 1',
    staticOdds: { home: '+210', draw: '+270', away: '+125' },
    homeInjuries: [
      { name: 'Kylian Mbappé', issue: 'Knee sprain', status: 'out' },
      { name: 'Jude Bellingham', issue: 'Hamstring', status: 'out' },
      { name: 'Rodrygo', issue: 'ACL — season over', status: 'out' },
      { name: 'Éder Militão', issue: 'Hamstring', status: 'out' },
      { name: 'Dani Ceballos', issue: 'Calf', status: 'out' },
      { name: 'Álvaro Carreras', issue: 'Calf', status: 'out' },
      { name: 'David Alaba', issue: 'Calf', status: 'out' },
    ],
    awayInjuries: [
      { name: 'Joško Gvardiol', issue: 'Tibia fracture — long-term', status: 'out' },
      { name: 'Mateo Kovačić', issue: 'Ankle — long-term', status: 'out' },
      { name: 'Rico Lewis', issue: 'Ankle', status: 'out' },
      { name: 'Erling Haaland', issue: 'Rested — fit', status: 'fit' },
    ],
    predictedXI: {
      home: 'Courtois; Alexander-Arnold, Asencio, Rüdiger, Mendy; Valverde, Tchouaméni, Camavinga; Güler; García, Vinícius Jr',
      away: 'Donnarumma; Nunes, Dias, Guehi, Aït-Nouri; Bernardo, Rodri, O\'Reilly; Semenyo, Haaland, Marmoush',
    },
    confirmedXI: { home: null, away: null },
    playerProp: {
      player: 'Erling Haaland',
      market: '2+ Shots on Target',
      staticOdds: '-115',
      tactical: 'Haaland rested vs Newcastle for this. Had 3 SOT vs Madrid in the league phase (City won 2-1). Asencio alongside Rüdiger is a clear downgrade. Madrid kept 1 clean sheet in last 6.',
      injuryEdge: 'Madrid\'s 7 absentees means they can\'t punish City, so City play with more freedom. Haaland vs Asencio is a brutal mismatch.',
      mispricing: 'At -115, near coin flip. Haaland\'s shot volume vs elite opposition + weakened Madrid defense + fresh legs = closer to 65% probability.',
    },
    sgp: {
      legs: ['Man City Double Chance', 'Over 1.5 Total Goals', 'Haaland Anytime Goalscorer', 'Vinícius Jr 1+ SOT'],
      staticOdds: '+280',
      reasoning: 'City 11 unbeaten, won 2-1 at Bernabéu in league phase. Madrid\'s injury crisis is devastating. Vinícius is still Vinícius. City DC protects against upset. Haaland fresh vs Asencio is the key angle.',
    },
    correctScore: { home: 1, away: 2, staticOdds: '+800' },
    analysis: 'Real Madrid are a shell. Missing Mbappé, Bellingham, Rodrygo, Militão, Ceballos, Carreras, Alaba — 7 first-teamers. City already beat them 2-1 here and arrive on an 11-match unbeaten run. Haaland was rested for this. Gvardiol\'s absence hurts City, but their depth is vastly superior.',
  },
];

export const BANKROLL = [
  { matchId: 'leverkusen-arsenal', label: 'Leverkusen vs Arsenal', type: 'sgp', bet: 'SGP: Arsenal Win + O2.5 + Saka SOT + Gyökeres ATG', stake: 10, odds: '+320', toWin: 32 },
  { matchId: 'leverkusen-arsenal', label: 'Leverkusen vs Arsenal', type: 'prop', bet: 'Gyökeres Anytime Goalscorer', stake: 5, odds: '-115', toWin: 4.35 },
  { matchId: 'bodo-sporting', label: 'Bodø/Glimt vs Sporting', type: 'sgp', bet: 'SGP: BTTS + O2.5 + Hauge ATG', stake: 8, odds: '+400', toWin: 32 },
  { matchId: 'bodo-sporting', label: 'Bodø/Glimt vs Sporting', type: 'prop', bet: 'Hauge Anytime Goalscorer', stake: 5, odds: '+220', toWin: 11 },
  { matchId: 'psg-chelsea', label: 'PSG vs Chelsea', type: 'sgp', bet: 'SGP: BTTS + O2.5 + Dembélé SOT + Fernández SOT', stake: 7, odds: '+350', toWin: 24.5 },
  { matchId: 'psg-chelsea', label: 'PSG vs Chelsea', type: 'prop', bet: 'Dembélé 1+ SOT', stake: 3, odds: '-135', toWin: 2.22 },
  { matchId: 'real-madrid-mancity', label: 'Real Madrid vs Man City', type: 'sgp', bet: 'SGP: City DC + O1.5 + Haaland ATG + Vinícius SOT', stake: 7, odds: '+280', toWin: 19.6 },
  { matchId: 'real-madrid-mancity', label: 'Real Madrid vs Man City', type: 'prop', bet: 'Haaland 2+ SOT', stake: 3, odds: '-115', toWin: 2.61 },
  { matchId: 'lottery', label: 'LONG-ODDS PARLAY', type: 'lottery', bet: 'Correct Scores: 1-3, 2-1, 2-2, 1-2', stake: 2, odds: '~+750000', toWin: 15000 },
];
