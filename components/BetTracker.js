'use client';

import { useState } from 'react';
import { BET_STATUS, calculatePnL } from '@/lib/betTracker';

/**
 * Bankroll and bet tracking panel.
 * Users can mark bets placed, adjust stakes, and track results.
 */
export default function BetTrackerPanel({ bankroll, trackedBets, onUpdateBet }) {
  const [showTracker, setShowTracker] = useState(false);
  const pnl = calculatePnL(trackedBets);

  return (
    <div className="bankroll-section animate-in stagger-5">
      <div className="bankroll-header">
        <div className="bankroll-title">💰 Bankroll Allocation · $50 Total</div>
        <button
          className="tracker-toggle"
          onClick={() => setShowTracker(!showTracker)}
        >
          {showTracker ? 'Simple View' : 'Track My Bets'}
        </button>
      </div>

      {/* P&L Summary (only when tracking) */}
      {showTracker && trackedBets.length > 0 && (
        <PnLSummary pnl={pnl} />
      )}

      <div className="bet-list">
        {bankroll.map((bet, i) => (
          <BetRow
            key={i}
            bet={bet}
            tracked={trackedBets.find((t) => t.matchId === bet.matchId && t.type === bet.type)}
            showTracker={showTracker}
            onUpdate={onUpdateBet}
          />
        ))}
      </div>

      <div className="bankroll-total">
        <span className="bankroll-total-label">Total Staked</span>
        <span className="bankroll-total-amount">$50.00</span>
      </div>
    </div>
  );
}

function BetRow({ bet, tracked, showTracker, onUpdate }) {
  const isLottery = bet.type === 'lottery';

  return (
    <div className={`bet-row ${isLottery ? 'bet-row--lottery' : ''} ${tracked?.status === BET_STATUS.WON ? 'bet-row--won' : ''} ${tracked?.status === BET_STATUS.LOST ? 'bet-row--lost' : ''}`}>
      <div className="bet-row__info">
        <div className="bet-match">{bet.label}</div>
        <div className="bet-desc">{bet.bet}</div>
      </div>

      {showTracker && (
        <div className="bet-row__tracker">
          <select
            className="bet-status-select"
            value={tracked?.status || BET_STATUS.PENDING}
            onChange={(e) => onUpdate(bet, { status: e.target.value })}
          >
            <option value={BET_STATUS.PENDING}>Not Placed</option>
            <option value={BET_STATUS.PLACED}>Placed ✓</option>
            <option value={BET_STATUS.WON}>Won 🎉</option>
            <option value={BET_STATUS.LOST}>Lost ✗</option>
            <option value={BET_STATUS.VOID}>Void</option>
            <option value={BET_STATUS.CASHED_OUT}>Cashed Out</option>
          </select>
        </div>
      )}

      <span className="bet-stake">${bet.stake}</span>
      <span className="bet-odds">{bet.odds}</span>
      <span className="bet-payout">
        {typeof bet.toWin === 'number' ? `+$${bet.toWin.toFixed(2)}` : bet.toWin}
      </span>
    </div>
  );
}

function PnLSummary({ pnl }) {
  const pnlColor = pnl.netPnL > 0 ? 'var(--accent-green)' : pnl.netPnL < 0 ? 'var(--accent-red)' : 'var(--text-secondary)';

  return (
    <div className="pnl-summary">
      <div className="pnl-item">
        <span className="pnl-label">Placed</span>
        <span className="pnl-value">{pnl.placed}/{pnl.totalBets}</span>
      </div>
      <div className="pnl-item">
        <span className="pnl-label">Record</span>
        <span className="pnl-value">{pnl.wins}W–{pnl.losses}L</span>
      </div>
      <div className="pnl-item">
        <span className="pnl-label">Staked</span>
        <span className="pnl-value">${pnl.totalStaked.toFixed(2)}</span>
      </div>
      <div className="pnl-item">
        <span className="pnl-label">P&L</span>
        <span className="pnl-value" style={{ color: pnlColor }}>
          {pnl.netPnL >= 0 ? '+' : ''}${pnl.netPnL.toFixed(2)}
        </span>
      </div>
      <div className="pnl-item">
        <span className="pnl-label">ROI</span>
        <span className="pnl-value" style={{ color: pnlColor }}>
          {pnl.roi >= 0 ? '+' : ''}{pnl.roi.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
