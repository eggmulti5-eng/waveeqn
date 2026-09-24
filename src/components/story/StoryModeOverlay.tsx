/**
 * StoryModeOverlay
 * ----------------
 * Renders on top of the existing sandbox (LeftPanel + CanvasArea + RightPanel).
 * It does NOT fork or replace the simulation — it reads live sim state via
 * props and injects a dialogue box + optional HUD over the canvas.
 *
 * The sandbox beneath remains fully interactive at all times.
 */
import React, { useEffect, useRef } from 'react';
import './story.css';
import { useStoryMode } from './useStoryMode';
import { StoryDialogue } from './StoryDialogue';
import { ChallengeHUD } from './ChallengeHUD';
import { ReportScreen } from './ReportScreen';
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

  // ── Orbit detection ──────────────────────────────────────────────────────
  // Intercept pointer-move on the canvas to detect orbit (drag with left button)
  const hasDraggedRef = useRef(false);
  const pointerDownRef = useRef(false);

  useEffect(() => {
    if (state.hasOrbited) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) pointerDownRef.current = true;
    };
    const onPointerMove = () => {
      if (pointerDownRef.current && !hasDraggedRef.current) {
        hasDraggedRef.current = true;
        markOrbited();
      }
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
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

  // Challenge done: auto-advance the beat after a short delay so the user
  // sees the success badge, then moves to the report beat.
  const challengeDoneRef = useRef(false);
  useEffect(() => {
    if (!isChallengeBeat) return;
    const done =
      Math.abs(currentE - state.challengeTarget) <= state.challengeTolerance &&
      wellType === 'infinite';
    if (done && !challengeDoneRef.current) {
      challengeDoneRef.current = true;
      // Give the user 1.4 s to see the WIN badge, then auto-advance
      const t = setTimeout(() => advance(), 1400);
      return () => clearTimeout(t);
    }
  }, [isChallengeBeat, currentE, state.challengeTarget, state.challengeTolerance, wellType, advance]);

  // ── Report screen — full-overlay card ────────────────────────────────────
  if (isReportBeat && isLastLine) {
    return (
      <div className="story-overlay">
        {/* Semi-transparent dim so report pops */}
        <div className="story-overlay-dim" />
        <div className="story-overlay-report-wrapper">
          <ReportScreen
            visitedNs={state.visitedNs}
            visitedWellTypes={state.visitedWellTypes}
            displayMode={displayMode}
            wavefunctionData={wavefunctionData}
            activeN={activeN}
            onFreeExplore={onExitToSandbox}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="story-overlay" style={{ pointerEvents: 'none' }}>
      {/* ── Challenge HUD (top-right, above canvas, pointer-events restored) ── */}
      {isChallengeBeat && (
        <div className="story-challenge-hud-anchor" style={{ pointerEvents: 'auto' }}>
          <ChallengeHUD
            target={state.challengeTarget}
            currentE={currentE}
            tolerance={state.challengeTolerance}
            wellType={wellType}
            activeN={activeN}
          />
        </div>
      )}

      {/* ── Dialogue box (bottom of canvas, pointer-events restored) ── */}
      <div className="story-dialogue-anchor" style={{ pointerEvents: 'auto' }}>
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
        />
      </div>
    </div>
  );
};
