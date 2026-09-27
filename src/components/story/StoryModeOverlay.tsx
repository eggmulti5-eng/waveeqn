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
import React, { useEffect, useRef } from 'react';
import './story.css';
import { useStoryMode } from './useStoryMode';
import { StoryDialogue } from './StoryDialogue';
import { ReportScreen } from './ReportScreen';
import { StorySpotlight } from './StorySpotlight';

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
  onEnterChallengeMode?: () => void;
  isTourActive?: boolean;
  activeFormula?: string | null;
  onClearFormula?: () => void;
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
  onEnterChallengeMode,
  isTourActive = false,
  activeFormula = null,
  onClearFormula,
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
  const totalBeats = state.beats.length;

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
            onEnterChallengeMode={onEnterChallengeMode}
          />
        </div>
      </div>
    );
  }


  let activeBeat = currentBeat;
  let activeLine = currentLine;
  let activeLineIndex = storyControls.state.lineIndex;
  let overrideAdvance = advance;
  let isOverrideActionDone = isBeatActionDone;
  let isOverrideLastLine = isLastLine;
  let isOverrideLastBeat = isLastBeat;
  let isOverrideTotalLines = state.beats[state.beatIndex]?.lines.length ?? 0;

  if (activeFormula) {
    let formulaText = "";
    if (activeFormula === 'schrodinger') {
      formulaText = "This is the time-independent Schrödinger equation. It's the master equation governing the simulation, balancing kinetic and potential energy to find the total energy.";
    } else if (activeFormula === 'energy') {
      formulaText = "This formula defines the allowed energy levels. Notice how energy scales with the square of the quantum number n—higher states require exponentially more energy.";
    } else if (activeFormula === 'wavefunction') {
      formulaText = "This defines the shape of the wave. The well width L and quantum number n determine how many peaks fit inside the potential well.";
    }

    activeBeat = {
      id: 'intro' as any,
      lines: [{ text: formulaText, shortText: '' }],
      noAction: true,
      isComplete: () => true,
    } as any;
    activeLine = activeBeat.lines[0];
    activeLineIndex = 0;
    overrideAdvance = onClearFormula || (() => {});
    isOverrideActionDone = true;
    isOverrideLastLine = false; // Prevents "Finish story mode" text, we just want "CONTINUE"
    isOverrideLastBeat = false;
    isOverrideTotalLines = 1;
  }

  return (
    <div className="story-overlay" style={{ pointerEvents: 'none' }}>
      {/* ── Story Beat Highlight ── */}
      {!isTourActive && (
        <StorySpotlight
          activeTourStepIndex={null}
          onSelectStepIndex={() => {}}
          highlightSelector={currentBeat?.highlightSelector}
        />
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
          beat={activeBeat as any}
          line={activeLine}
          lineIndex={activeLineIndex}
          totalLines={isOverrideTotalLines}
          beatIndex={state.beatIndex}
          totalBeats={totalBeats}
          isLastLine={isOverrideLastLine}
          isLastBeat={isOverrideLastBeat}
          isBeatActionDone={isOverrideActionDone}
          skipTheory={state.skipTheory}
          onSetSkipTheory={setSkipTheory}
          onAdvance={overrideAdvance}
          onSkipAll={onExitToSandbox}
          currentL={currentL}
          currentV={currentV}
          wellType={wellType}
          isTourActive={isTourActive}
        />
      </div>
    </div>
  );
};
