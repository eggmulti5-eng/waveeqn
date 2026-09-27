import React, { useState, useEffect, useCallback } from 'react';
import './story.css';
import { ChallengeHUD } from './ChallengeHUD';
import { AxiomPortrait } from './AxiomPortrait';

interface ChallengeModeOverlayProps {
  currentL: number;
  currentM: number;
  currentE: number;
  onExitToLanding: () => void;
}

const TOLERANCE = 0.12;

function generateChallengeTarget(): { target: number; hint: string } {
  const n = 2; // For infinite well, E_n = n^2 * pi^2 * hbar^2 / (2 * m * L^2)
  const Ls = [1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8];
  const L = Ls[Math.floor(Math.random() * Ls.length)];
  const ms = [1.0, 1.2, 1.5, 2.0, 2.5];
  const m = ms[Math.floor(Math.random() * ms.length)];
  const E = (n * n * Math.PI * Math.PI) / (2 * m * L * L);
  return {
    target: parseFloat(E.toFixed(3)),
    hint: `hint: try n=2, m ≈ ${m.toFixed(1)}, L ≈ ${L.toFixed(1)}`,
  };
}

export const ChallengeModeOverlay: React.FC<ChallengeModeOverlayProps> = ({
  currentL,
  currentM,
  currentE,
  onExitToLanding,
}) => {
  const [targetE, setTargetE] = useState<number>(0);
  const [hint, setHint] = useState<string>('');
  const [completedCount, setCompletedCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const initChallenge = useCallback(() => {
    const { target, hint } = generateChallengeTarget();
    setTargetE(target);
    setHint(hint);
    setIsSuccess(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initChallenge();
  }, [initChallenge]);

  // Check success condition
  useEffect(() => {
    if (!isSuccess && targetE > 0) {
      if (Math.abs(currentE - targetE) <= TOLERANCE) {
        setIsSuccess(true);
        setCompletedCount((prev) => prev + 1);
      }
    }
  }, [currentE, targetE, isSuccess]);

  return (
    <div className="story-overlay" style={{ pointerEvents: 'none' }}>
      
      {/* ── Challenge HUD (top-right, above canvas) ── */}
      <div className="story-challenge-hud-anchor" style={{ pointerEvents: 'auto', zIndex: 85 }}>
        <ChallengeHUD
          target={targetE}
          currentE={currentE}
          tolerance={TOLERANCE}
          wellType="infinite"
          activeN={2} // Assumed n=2 for the challenge math
        />
        <div style={{ background: 'var(--bg-panel)', padding: '8px 12px', marginTop: '8px', border: '1px solid var(--border-panel)', borderRadius: '4px', textAlign: 'center', fontSize: '13px', color: 'var(--ink)' }}>
          Challenges Completed: <strong style={{ color: 'var(--accent)' }}>{completedCount}</strong>
        </div>
      </div>

      {/* ── Dialogue Box ── */}
      <div className="story-dialogue-anchor" style={{ pointerEvents: 'auto', zIndex: 90 }}>
        <div className="story-dialogue">
          <AxiomPortrait isTalking={!isSuccess} mood={isSuccess ? 'excited' : 'neutral'} />
          <div className="story-dialogue-content">
            <h3 className="story-dialogue-speaker">AXIOM</h3>
            {!isSuccess ? (
              <p className="story-dialogue-text">
                Match the target energy by tuning L and/or m. Ready?
                <br /><br />
                Target E = {targetE.toFixed(3)} a.u. ({hint})
              </p>
            ) : (
              <p className="story-dialogue-text">
                Spot on! You matched the wavefunction perfectly.
                <br /><br />
                Ready for another round?
              </p>
            )}
          </div>
          <div className="story-dialogue-controls">
            {isSuccess && (
              <button className="story-button story-button-primary" onClick={initChallenge}>
                NEXT CHALLENGE 
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Persistent Global Exit Control ── */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '56px', 
          right: '16px', 
          zIndex: 2147483647, // Max possible z-index
          pointerEvents: 'auto' 
        }}
      >
        <button 
          onClick={onExitToLanding} 
          className="story-button story-button-secondary"
          style={{
            backgroundColor: '#1E232B',
            border: '1px solid #C2543B',
            color: '#F5EFDD',
            padding: '8px 12px',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Exit to Landing
        </button>
      </div>
    </div>
  );
};
