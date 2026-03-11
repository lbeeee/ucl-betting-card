'use client';

import { useState, useRef, useCallback } from 'react';
import { MATCHES, BANKROLL, MATCH_DATE_DISPLAY } from '@/lib/matchData';
import { createTrackedBet } from '@/lib/betTracker';
import { useLiveOdds, useLiveScores, useLineups } from '@/lib/hooks';
import LiveOdds from '@/components/LiveOdds';
import LiveScore from '@/components/LiveScore';
import SGPTracker from '@/components/SGPTracker';
import BetTrackerPanel from '@/components/BetTracker';
import ShareCard from '@/components/ShareCard';
import LineupDisplay from '@/components/LineupDisplay';
import StatusBar from '@/components/StatusBar';

function statusColor(s) {
  if (s === 'out') return 'var(--accent-red)';
  if (s === 'doubt') return 'var(--accent-amber)';
  return 'var(--accent-green)';
}

function MatchCard({ match, isOpen, toggle, index, oddsData, scoreData, lineupData }) {
  const cardRef = useRef(null);
  const isLive = scoreData?.phase === 'live' || scoreData?.phase === 'halftime';

  return (
    <div
      ref={cardRef}
      className={`match-card animate-in stagger-${index + 1} ${isOpen ? 'match-card--open' : ''} ${isLive ? 'match-card--live' : ''}`}
    >
      {/* Header */}
      <div className="match-header" onClick={toggle}>
        <div className="match-header-left">
          <span className="match-time">{match.time}</span>
          <div className="match-teams">
            <span>{match.home.flag}</span>
            <span>{match.home.name}</span>
            <span className="match-vs">vs</span>
            <span>{match.away.name}</span>
            <span>{match.away.flag}</span>
          </div>
        </div>
        <div className="match-header-right">
          {/* Show live score in header when collapsed */}
          {!isOpen && scoreData?.phase !== 'prematch' && scoreData?.goals && (
            <>
              <span className="odds-chip" style={{ color: 'var(--accent-green)', borderColor: 'rgba(34,197,94,0.3)' }}>
                {scoreData.goals.home ?? 0}–{scoreData.goals.away ?? 0}
                {isLive && ` (${scoreData.status?.elapsed}')`}
                {scoreData.phase === 'finished' && ' FT'}
              </span>
            </>
          )}
          {(!scoreData || scoreData.phase === 'prematch') && (
            <>
              <span className="odds-chip">{oddsData?.moneyline?.home || match.staticOdds.home}</span>
              <span className="odds-chip">{oddsData?.moneyline?.draw || match.staticOdds.draw}</span>
              <span className="odds-chip">{oddsData?.moneyline?.away || match.staticOdds.away}</span>
            </>
          )}
          <span className={`chevron ${isOpen ? 'chevron--open' : ''}`}>▾</span>
        </div>
      </div>

      {isOpen && (
        <div className="match-body">
          {/* Live Score */}
          <LiveScore match={match} scoreData={scoreData} />

          {/* Live Odds */}
          <LiveOdds
            matchId={match.id}
            staticOdds={match.staticOdds}
            liveOddsData={oddsData}
          />

          {/* Analysis */}
          <div className="section-box analysis-box">
            <div className="section-label">◆ Match Analysis</div>
            <p className="analysis-text">{match.analysis}</p>
          </div>

          {/* Lineups */}
          <LineupDisplay match={match} lineupData={lineupData} />

          {/* Injuries */}
          <div className="injuries-grid">
            <div>
              <div className="injury-col-label">{match.home.name} — Availability</div>
              {match.homeInjuries.map((inj, i) => (
                <div className="injury-item" key={i}>
                  <span className="injury-dot" style={{ background: statusColor(inj.status) }} />
                  <span className="injury-name">{inj.name}</span>
                  <span className="injury-issue">{inj.issue}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="injury-col-label">{match.away.name} — Availability</div>
              {match.awayInjuries.map((inj, i) => (
                <div className="injury-item" key={i}>
                  <span className="injury-dot" style={{ background: statusColor(inj.status) }} />
                  <span className="injury-name">{inj.name}</span>
                  <span className="injury-issue">{inj.issue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Player Prop */}
          <div className="section-box prop-box">
            <div className="section-label">▲ Player Prop</div>
            <div className="prop-header">
              <div>
                <div className="prop-player">{match.playerProp.player}</div>
                <div className="prop-market">{match.playerProp.market}</div>
              </div>
              <span className="odds-badge odds-badge--green">{match.playerProp.staticOdds}</span>
            </div>
            <div className="prop-reasoning">
              <div className="prop-reasoning-item">
                <span className="prop-tag prop-tag--tactical">TACTICAL — </span>
                {match.playerProp.tactical}
              </div>
              <div className="prop-reasoning-item">
                <span className="prop-tag prop-tag--injury">INJURY EDGE — </span>
                {match.playerProp.injuryEdge}
              </div>
              <div className="prop-reasoning-item">
                <span className="prop-tag prop-tag--mispricing">MISPRICING — </span>
                {match.playerProp.mispricing}
              </div>
            </div>
          </div>

          {/* SGP with live tracker */}
          <SGPTracker
            legs={match.sgp.legs}
            odds={match.sgp.staticOdds}
            reasoning={match.sgp.reasoning}
            scoreData={scoreData}
          />

          {/* Correct Score */}
          <div className="cs-box">
            <div>
              <div className="cs-label">Predicted Correct Score</div>
              <div className="cs-score">{match.correctScore.home}–{match.correctScore.away}</div>
            </div>
            <span className="odds-badge odds-badge--red">{match.correctScore.staticOdds}</span>
          </div>

          {/* Share */}
          <ShareCard targetRef={cardRef} filename={`ucl-${match.slug}`} />
        </div>
      )}
    </div>
  );
}

const LOTTERY_SCORES = [
  { code: 'LEV–ARS', score: '1–3' },
  { code: 'BOD–SPO', score: '2–1' },
  { code: 'PSG–CHE', score: '2–2' },
  { code: 'RMA–MCI', score: '1–2' },
];

export default function Page() {
  const [openMatch, setOpenMatch] = useState(0);
  const [trackedBets, setTrackedBets] = useState([]);

  // Live data hooks
  const { odds, source: oddsSource, remaining: oddsRemaining, fetchedAt: oddsFetchedAt } = useLiveOdds();
  const { scores, source: scoresSource, fetchedAt: scoresFetchedAt } = useLiveScores();
  const { lineups } = useLineups();

  const handleUpdateBet = useCallback((bankrollEntry, updates) => {
    setTrackedBets((prev) => {
      const existing = prev.find((b) => b.matchId === bankrollEntry.matchId && b.type === bankrollEntry.type);
      if (existing) {
        return prev.map((b) =>
          b.id === existing.id ? { ...b, ...updates } : b
        );
      }
      return [...prev, createTrackedBet(bankrollEntry, updates)];
    });
  }, []);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="site-header">
        <div className="header-eyebrow">FanDuel Sportsbook · New York</div>
        <h1 className="header-title">Champions League R16 · Leg 1</h1>
        <div className="header-meta">
          <span>{MATCH_DATE_DISPLAY}</span>
          <span className="header-divider" />
          <span>4 Matches</span>
          <span className="header-divider" />
          <span className="bankroll-badge">$50 Bankroll</span>
          {oddsSource === 'live' && (
            <>
              <span className="header-divider" />
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-pulse" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-green)' }}>
                  Live Data
                </span>
              </span>
            </>
          )}
        </div>
        <div className="legend">
          <div className="legend-item"><span className="legend-dot legend-dot--out" /> Out</div>
          <div className="legend-item"><span className="legend-dot legend-dot--doubt" /> Doubtful</div>
          <div className="legend-item"><span className="legend-dot legend-dot--fit" /> Fit / Returned</div>
        </div>
      </header>

      {/* Matches */}
      {MATCHES.map((match, i) => (
        <MatchCard
          key={match.id}
          match={match}
          isOpen={openMatch === i}
          toggle={() => setOpenMatch(openMatch === i ? -1 : i)}
          index={i}
          oddsData={odds[match.id]}
          scoreData={scores[match.id]}
          lineupData={lineups[match.id]}
        />
      ))}

      {/* Bankroll */}
      <BetTrackerPanel
        bankroll={BANKROLL}
        trackedBets={trackedBets}
        onUpdateBet={handleUpdateBet}
      />

      {/* Lottery Ticket */}
      <div className="lottery-section animate-in stagger-5">
        <div className="lottery-icon">🎰</div>
        <div className="lottery-eyebrow">Lottery Ticket · $2 Stake</div>
        <div className="lottery-title">4-Match Correct Score Parlay</div>
        <div className="lottery-scores">
          {LOTTERY_SCORES.map((s, i) => (
            <div className="lottery-score-card" key={i}>
              <span className="lottery-match-code">{s.code}</span>
              <span className="lottery-score-value">{s.score}</span>
            </div>
          ))}
        </div>
        <div className="lottery-desc">
          Combined odds approximately <span className="lottery-odds-highlight">+750,000</span>. A $2 ticket
          that pays ~$15,000 if all four correct scores hit. Each scoreline is grounded in the tactical
          analysis above, but together this is a moonshot.
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        All odds approximate and subject to change. Lines sourced from FanDuel / Oddschecker as of
        March 10, 2026. This is analysis only — not financial advice. Bet responsibly. Must be 21+
        and located in a legal state. If you or someone you know has a gambling problem, call
        1-800-GAMBLER.
      </div>

      {/* Status bar */}
      <StatusBar
        oddsSource={oddsSource}
        scoresSource={scoresSource}
        oddsFetchedAt={oddsFetchedAt}
        scoresFetchedAt={scoresFetchedAt}
        oddsRemaining={oddsRemaining}
      />
    </div>
  );
}
