import React from 'react';

interface ChallengeHUDProps {
  target: number;
  currentE: number;
  tolerance: number;
  wellType: 'infinite' | 'finite';
  activeN: number;
}

export const ChallengeHUD: React.FC<ChallengeHUDProps> = ({
  target,
  currentE,
  tolerance,
  wellType,
  activeN,
}) => {
  const delta = currentE - target;
  const absDelta = Math.abs(delta);
  const isWin = absDelta <= tolerance && wellType === 'infinite';
  const pct = Math.min(100, Math.max(0, 100 - (absDelta / (tolerance * 5)) * 100));

  const deltaStr = delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);

  return (
    <div className={`challenge-hud ${isWin ? 'challenge-hud-win' : ''}`}>
      <div className="challenge-hud-header">
        <span className="challenge-hud-label">⊕ MATCH THE WAVE</span>
        {isWin && <span className="challenge-win-badge">✓ MATCHED!</span>}
      </div>
      <div className="challenge-hud-rows">
        <div className="challenge-hud-row">
          <span className="challenge-hud-key">TARGET E</span>
          <span className="challenge-hud-val">{target.toFixed(3)} a.u.</span>
        </div>
        <div className="challenge-hud-row">
          <span className="challenge-hud-key">CURRENT E</span>
          <span className="challenge-hud-val">{currentE.toFixed(3)} a.u.</span>
        </div>
        <div className="challenge-hud-row">
          <span className="challenge-hud-key">DELTA</span>
          <span
            className={`challenge-hud-val ${isWin ? 'delta-win' : absDelta <= tolerance * 2 ? 'delta-close' : 'delta-far'}`}
          >
            {deltaStr}
          </span>
        </div>
        {wellType !== 'infinite' && (
          <div className="challenge-hud-row">
            <span className="challenge-hud-key warning-text">⚠ Switch to INFINITE well</span>
          </div>
        )}
        {wellType === 'infinite' && activeN !== 2 && (
          <div className="challenge-hud-row">
            <span className="challenge-hud-key warning-text">⚠ Set n = 2 in state list</span>
          </div>
        )}
      </div>
      {/* Progress bar */}
      <div className="challenge-progress-bar-bg">
        <div
          className={`challenge-progress-bar-fill ${isWin ? 'fill-win' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="challenge-tolerance-label">Tolerance ±{tolerance.toFixed(2)} a.u.</div>
    </div>
  );
};
