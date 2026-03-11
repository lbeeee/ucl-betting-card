# ⚽ UCL R16 Live Betting Card

Real-time Champions League Round of 16 betting dashboard with live odds, scores, lineup confirmations, bet tracking, and shareable cards.

## Features

- **Live Odds** — Real-time FanDuel odds via The Odds API, with movement arrows and multi-book comparison
- **Live Scores** — Minute-by-minute scores and match events via API-Football
- **Lineup Confirmations** — Auto-detects confirmed XIs ~1hr before kickoff; alerts if your prop player is benched
- **SGP Live Tracker** — Each Same Game Parlay leg shows ✓ hit / ✗ dead / ○ pending in real-time
- **Bet Tracker** — Mark bets as placed, track results, see P&L and ROI
- **Share as Image** — Export any match card as a PNG for social media
- **Odds Comparison** — Compare lines across FanDuel, DraftKings, BetMGM, and PointsBet
- **Status Bar** — See API health, data freshness, and quota remaining

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Keys Required

| Service | Purpose | Get it at | Cost |
|---------|---------|-----------|------|
| **The Odds API** | Live odds from FanDuel + other books | [the-odds-api.com](https://the-odds-api.com) | Free: 500 req/mo, Paid: ~$20/mo |
| **API-Football** | Live scores, lineups, match events | [rapidapi.com/api-sports/api/api-football](https://rapidapi.com/api-sports/api/api-football) | Free: 100 req/day, Paid: ~$20/mo |

Add your keys to `.env.local`:

```
THE_ODDS_API_KEY=your_key_here
RAPIDAPI_KEY=your_key_here
```

**Without API keys**, the app still works with static odds and prematch data — no crashes.

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo
3. Add environment variables (`THE_ODDS_API_KEY`, `RAPIDAPI_KEY`) in Vercel's settings
4. Deploy

## Architecture

```
app/
  page.js              # Main page — orchestrates all components
  layout.js            # Root layout with fonts
  globals.css          # Full design system
  api/
    odds/route.js      # The Odds API proxy (ISR, 55s cache)
    scores/route.js    # API-Football proxy (ISR, 25s cache)
    lineups/route.js   # Lineup confirmation endpoint (ISR, 120s cache)

components/
  LiveOdds.js          # Real-time odds with movement arrows + book comparison
  LiveScore.js         # Live score ticker with events feed
  SGPTracker.js        # SGP leg status tracker
  BetTracker.js        # Bankroll panel with P&L
  ShareCard.js         # Export to PNG
  LineupDisplay.js     # Predicted/confirmed lineups with prop alerts
  StatusBar.js         # Data health indicator

lib/
  matchData.js         # Static match data, analysis, bets
  oddsApi.js           # The Odds API client
  scoresApi.js         # API-Football client
  betTracker.js        # Bet tracking utilities
  hooks.js             # SWR hooks for live polling
```

## Polling Intervals

Configurable via environment variables:

- **Odds**: Every 60s (`NEXT_PUBLIC_ODDS_POLL_INTERVAL`)
- **Scores**: Every 30s (`NEXT_PUBLIC_SCORES_POLL_INTERVAL`)
- **Lineups**: Every 120s (hardcoded — lineups only change once)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- SWR for data fetching and polling
- html-to-image for shareable cards
- date-fns for time formatting
- Pure CSS design system (no Tailwind)
- Google Fonts: Anybody, DM Sans, IBM Plex Mono

## Disclaimer

This is entertainment and analysis only — not financial advice. Bet responsibly. Must be 21+ and located in a legal state.
