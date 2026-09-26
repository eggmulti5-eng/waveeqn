/**
 * StoryModeOverlay
 * ----------------
 * Renders on top of the existing sandbox (LeftPanel + CanvasArea + RightPanel).
 * It reads live sim state via props and injects a dialogue box + optional HUD +
 * spotlight guide over the canvas.
 *
 * Scopes z-index and pointer-events so that ONLY ONE panel system
 * (Story Dialogue OR Feature Tour Card) can ever be visible and receive input at a time.
 */
import React, { useEffect, useRef, useState } from 'react';
import './story.css';
import { useStoryMode } from './useStoryMode';
import { StoryDialogue } from './StoryDialogue';
import { ChallengeHUD } from './ChallengeHUD';
import { ReportScreen } from './ReportScreen';
import { StorySpotlight } from './StorySpotlight';
import { StoryHotspots } from './StoryHotspots';
import type { WellType, WavefunctionData } from '../../physics/useQuantumState';

interface StoryModeOverlayProps {
  // Live sim state (read-only)
  currentL: number;
  currentV: number;
  currentE: number;
  displayMode: 'psi' | 'prob';
  wellType: WellType;
  activeN: number;
  wavefunctionData: WavefunctionData;
  // Callbacks
  onExitToSandbox: () => void;     // Skip to sandbox (no reset)
  onExitToLanding: () => void;     // Back to landing
  onOpenRightPanel?: () => void;   // Open right panel for inspector tour step
  isTourActive?: boolean;
}

export const StoryModeOverlay: React.FC<StoryModeOverlayProps> = ({
  currentL,
  currentV,
  currentE,
  displayMode,
  wellType,
  activeN,
  wavefunctionData,
  onExitToSandbox,
  onExitToLanding,
  onOpenRightPanel,
  isTourActive = false,
}) => {
  const storyControls = useStoryMode({
    currentL,
    currentV,
    currentE,
    displayMode,
    wellType,
  });

  const {
    state,
    currentBeat,
    currentLine,
    isLastLine,
    isLastBeat,
    isBeatActionDone,
    advance,
    setSkipTheory,
    markOrbited,
    recordVisit,
  } = storyControls;

  // isTourActive comes from App.tsx via props

  // ── Orbit detection ──────────────────────────────────────────────────────
  // Intercept pointer-move on the canvas to detect orbit (drag with left button)
  const hasDraggedRef = useRef(false);
  const pointerDownRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (state.hasOrbited) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      // Do not count clicks on interactive overlay panels
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '.story-dialogue, .story-tour-card, .story-hotspot-pin, .story-challenge-hud-anchor, .topbar, .left-panel, .right-panel'
        )
      ) {
        return;
      }
      pointerDownRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerDownRef.current && !hasDraggedRef.current && startPosRef.current) {
        const dx = Math.abs(e.clientX - startPosRef.current.x);
        const dy = Math.abs(e.clientY - startPosRef.current.y);
        // Dragged > 3px on the 3D canvas confirms intentional orbit
        if (dx > 3 || dy > 3) {
          hasDraggedRef.current = true;
          markOrbited();
        }
      }
    };

    const onPointerUp = () => {
      pointerDownRef.current = false;
      startPosRef.current = null;
    };

    // Use capturing phase so we intercept canvas interaction even if OrbitControls captures
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointermove', onPointerMove, true);
    window.addEventListener('pointerup', onPointerUp, true);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerup', onPointerUp, true);
    };
  }, [state.hasOrbited, markOrbited]);

  // ── Visit tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    recordVisit(activeN, wellType);
  }, [activeN, wellType, recordVisit]);

  // ── Derived flags ─────────────────────────────────────────────────────────
  const isReportBeat = currentBeat?.id === 'report';
  const isChallengeBeat = currentBeat?.id === 'challenge';
  const totalBeats = state.beats.length;

  // Challenge done auto-advance (only for Challenge beat)
  const challengeDoneRef = useRef(false);
  useEffect(() => {
    if (!isChallengeBeat) return;
    const done =
      Math.abs(currentE - state.challengeTarget) <= state.challengeTolerance &&
      wellType === 'infinite';
    if (done && !challengeDoneRef.current) {
      challengeDoneRef.current = true;
      const t = setTimeout(() => advance(), 1400);
      return () => clearTimeout(t);
    }
  }, [isChallengeBeat, currentE, state.challengeTarget, state.challengeTolerance, wellType, advance]);

  // ── Report screen — full-overlay card ────────────────────────────────────
  if (isReportBeat && isLastLine) {
    return (
      <div className="story-overlay">
        <div className="story-overlay-dim" />
        <div className="story-overlay-report-wrapper">
          <ReportScreen
            visitedNs={state.visitedNs}
            visitedWellTypes={state.visitedWellTypes}
            displayMode={displayMode}
            wavefunctionData={wavefunctionData}
            activeN={activeN}
            onFreeExplore={onExitToSandbox}
            onExitToLanding={onExitToLanding}
          />
        </div>
      </div>
    );
  }

  // Hotspots are only shown between beats or after the mandatory action for the active beat is done
  const canShowHotspots =
    !isTourActive &&
    !isReportBeat &&
    (currentBeat?.noAction || isBeatActionDone);

  return (
    <div className="story-overlay" style={{ pointerEvents: 'none' }}>
      {/* ── Challenge HUD (top-right, above canvas) ── */}
      {/* ── Story Beat Highlight ── */}
      {!isTourActive && (
        <StorySpotlight
          activeTourStepIndex={null}
          onSelectStepIndex={() => {}}
          highlightSelector={currentBeat?.highlightSelector}
        />
      )}

      {isChallengeBeat && !isTourActive && (
        <div className="story-challenge-hud-anchor" style={{ pointerEvents: 'auto', zIndex: 85 }}>
          <ChallengeHUD
            target={state.challengeTarget}
            currentE={currentE}
            tolerance={state.challengeTolerance}
            wellType={wellType}
            activeN={activeN}
          />
        </div>
      )}

      {/* ── Dialogue box (bottom of canvas) ──
          CRITICAL: Explicitly hidden and disabled whenever a tour hotspot is open!
          Restored seamlessly when the tour hotspot is closed. */}
      <div
        className="story-dialogue-anchor"
        style={{
          display: isTourActive ? 'none' : 'block',
          pointerEvents: isTourActive ? 'none' : 'auto',
          zIndex: 90,
        }}
      >
        <StoryDialogue
          beat={currentBeat}
          line={currentLine}
          lineIndex={state.lineIndex}
          totalLines={currentBeat?.lines.length ?? 1}
          beatIndex={state.beatIndex}
          totalBeats={totalBeats}
          isLastLine={isLastLine}
          isLastBeat={isLastBeat}
          isBeatActionDone={isBeatActionDone}
          skipTheory={state.skipTheory}
          onSetSkipTheory={setSkipTheory}
          onAdvance={advance}
          onSkipAll={onExitToSandbox}
          currentL={currentL}
          currentV={currentV}
          wellType={wellType}
          isTourActive={isTourActive}
        />
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
          onClick={onExitToSandbox} 
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
          {isTourActive ? 'Skip Tour' : 'Exit to Sandbox'}
        </button>
      </div>
    </div>
  );
};
