/**
 * StoryModeOverlay
 * ----------------
 * Renders on top of the existing sandbox (LeftPanel + CanvasArea + RightPanel).
 * It reads live sim state via props and injects a dialogue box + optional HUD +
 * spotlight guide over the canvas.
 *
 * The sandbox beneath remains fully interactive at all times.
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

  // ── UI Feature Tour state ────────────────────────────────────────────────
  const [activeTourStepIndex, setActiveTourStepIndex] = useState<number | null>(null);

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

  // Auto-advance when a non-challenge beat's action is completed
  const prevBeatActionDoneRef = useRef(false);
  useEffect(() => {
    if (isChallengeBeat || currentBeat?.noAction) {
      prevBeatActionDoneRef.current = false;
      return;
    }
    if (isBeatActionDone && !prevBeatActionDoneRef.current && isLastLine) {
      prevBeatActionDoneRef.current = true;
      const t = setTimeout(() => advance(), 600);
      return () => clearTimeout(t);
    }
    if (!isBeatActionDone) {
      prevBeatActionDoneRef.current = false;
    }
  }, [isBeatActionDone, isLastLine, isChallengeBeat, currentBeat?.noAction, advance]);

  // Challenge done auto-advance
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
          />
        </div>
      </div>
    );
  }

  return (
    <div className="story-overlay" style={{ pointerEvents: 'none' }}>
      {/* ── Feature Tour Spotlight Layer ── */}
      <StorySpotlight
        activeTourStepIndex={activeTourStepIndex}
        onSelectStepIndex={setActiveTourStepIndex}
        onOpenRightPanel={onOpenRightPanel}
        highlightSelector={activeTourStepIndex === null ? currentBeat?.highlightSelector : null}
      />

      {/* ── Optional UI Hotspots (beacon pins over major sections) ── */}
      <StoryHotspots
        isVisible={activeTourStepIndex === null && !isReportBeat}
        onSelectStepIndex={setActiveTourStepIndex}
      />

      {/* ── Challenge HUD (top-right, above canvas) ── */}
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

      {/* ── Dialogue box (bottom of canvas) ── */}
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
          currentL={currentL}
          currentV={currentV}
          wellType={wellType}
          isTourActive={activeTourStepIndex !== null}
          onToggleTour={() =>
            setActiveTourStepIndex((prev) => (prev === null ? 0 : null))
          }
        />
      </div>
    </div>
  );
};
