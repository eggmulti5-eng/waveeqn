import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Beat, DialogueLine } from './useStoryMode';
import type { WellType } from '../../physics/useQuantumState';
import { AxiomPortrait, type AxiomMood } from './AxiomPortrait';
import { HelpCircle, Sparkles } from 'lucide-react';

interface StoryDialogueProps {
  beat: Beat;
  line: DialogueLine;
  lineIndex: number;
  totalLines: number;
  beatIndex: number;
  totalBeats: number;
  isLastLine: boolean;
  isLastBeat: boolean;
  isBeatActionDone: boolean;
  skipTheory: boolean;
  onSetSkipTheory: (v: boolean) => void;
  onAdvance: () => void;
  onSkipAll: () => void;
  // Live simulation parameters for reactive quips
  currentL?: number;
  currentV?: number;
  wellType?: WellType;
  // UI Tour triggers
  isTourActive?: boolean;
  onToggleTour?: () => void;
}

// Typewriter speed (ms per character)
const TYPEWRITER_SPEED = 18;

export const StoryDialogue: React.FC<StoryDialogueProps> = ({
  beat,
  line,
  lineIndex,
  totalLines,
  beatIndex,
  totalBeats,
  isLastLine,
  isLastBeat,
  isBeatActionDone,
  skipTheory,
  onSetSkipTheory,
  onAdvance,
  onSkipAll,
  currentL = 3.0,
  currentV = 60.0,
  wellType = 'infinite',
  isTourActive = false,
  onToggleTour,
}) => {
  const displayText = skipTheory ? line.shortText : line.text;
  const [shownText, setShownText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reactiveQuip, setReactiveQuip] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  // ── Reactive Quips System ────────────────────────────────────────────────
  // Fires when user explores extreme parameters or lingers on an action
  const prevLRef = useRef(currentL);
  const prevVRef = useRef(currentV);

  useEffect(() => {
    // Extreme width reactions
    if (currentL <= 1.15 && prevLRef.current > 1.15) {
      triggerQuip('“Extreme confinement! At L ≈ 1.0, kinetic pressure maxes out—watch that energy spike!”', 4000);
    } else if (currentL >= 4.85 && prevLRef.current < 4.85) {
      triggerQuip('“Wide well! At L ≈ 5.0, the particle has ample elbow room—energy plunges!”', 4000);
    }
    prevLRef.current = currentL;

    // Extreme barrier reaction
    if (wellType === 'finite' && currentV <= 25 && prevVRef.current > 25) {
      triggerQuip('“Thin barrier! Watch those exponential tails seep deep into the wall—peak tunnelling!”', 4000);
    }
    prevVRef.current = currentV;
  }, [currentL, currentV, wellType]);

  // Idle encouraging quip if waiting for user action > 14s
  useEffect(() => {
    if (!isLastLine || beat.noAction || isBeatActionDone || isTyping) {
      return;
    }
    const idleTimer = setTimeout(() => {
      triggerQuip('“Whenever you\'re ready! Take your time exploring the chamber controls.”', 5000);
    }, 14000);

    return () => clearTimeout(idleTimer);
  }, [isLastLine, beat.noAction, isBeatActionDone, isTyping, beatIndex]);

  const triggerQuip = (text: string, durationMs = 4000) => {
    if (quipTimerRef.current) clearTimeout(quipTimerRef.current);
    setReactiveQuip(text);
    quipTimerRef.current = setTimeout(() => {
      setReactiveQuip(null);
    }, durationMs);
  };

  // Determine AXIOM facial mood based on dialogue and user state
  let axiomMood: AxiomMood = 'idle';
  if (reactiveQuip) {
    axiomMood = 'quip';
  } else if (isBeatActionDone) {
    axiomMood = 'happy';
  } else if (isTyping) {
    axiomMood = 'thinking';
  }

  // Reset and start typewriter when text changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    indexRef.current = 0;
    setShownText('');
    setIsTyping(true);

    const tick = () => {
      indexRef.current += 1;
      const next = displayText.slice(0, indexRef.current);
      setShownText(next);
      if (indexRef.current < displayText.length) {
        timerRef.current = setTimeout(tick, TYPEWRITER_SPEED);
      } else {
        setIsTyping(false);
      }
    };

    if (displayText.length > 0) {
      timerRef.current = setTimeout(tick, TYPEWRITER_SPEED);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayText]);

  // Click to finish typing immediately or advance
  const handleRevealOrAdvance = useCallback(() => {
    if (isTyping) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShownText(displayText);
      setIsTyping(false);
    } else {
      const canAdvance = beat.noAction || isBeatActionDone || !isLastLine;
      if (canAdvance) onAdvance();
    }
  }, [isTyping, displayText, beat.noAction, isBeatActionDone, isLastLine, onAdvance]);

  // Keyboard: Space / Enter to advance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleRevealOrAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleRevealOrAdvance]);

  // Determine if the CONTINUE button is active (clickable)
  const canAdvance = !isTyping && (beat.noAction || isBeatActionDone || !isLastLine);

  // Beat name label
  const beatLabel = beat.id.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="story-dialogue" role="dialog" aria-label="Story guide dialogue">
      {/* Reactive Quip Banner (floats right above dialogue box when active) */}
      {reactiveQuip && (
        <div className="story-quip-bubble" role="status" aria-live="polite">
          <Sparkles size={11} className="story-quip-icon" />
          <span className="story-quip-text">{reactiveQuip}</span>
        </div>
      )}

      {/* Top meta bar */}
      <div className="story-dialogue-meta">
        <div className="story-beat-label">
          <span className="story-beat-dot" />
          <span>{beatLabel}</span>
          <span className="story-beat-progress">
            {beatIndex + 1}/{totalBeats}
          </span>
        </div>
        <div className="story-meta-actions">
          {/* Optional UI Feature Tour button */}
          {onToggleTour && (
            <button
              type="button"
              className={`story-toggle-tour ${isTourActive ? 'active' : ''}`}
              onClick={onToggleTour}
              title="Explore and spotlight every UI element on screen"
            >
              <HelpCircle size={10} style={{ marginRight: 3 }} />
              <span>{isTourActive ? 'EXIT TOUR' : 'UI TOUR'}</span>
            </button>
          )}

          <button
            type="button"
            className={`story-toggle-theory ${skipTheory ? 'active' : ''}`}
            onClick={() => onSetSkipTheory(!skipTheory)}
            title={skipTheory ? 'Show theory explanations' : 'Skip theory — show action prompts only'}
          >
            {skipTheory ? 'THEORY OFF' : 'THEORY ON'}
          </button>
          <button
            type="button"
            className="story-skip-all-btn"
            onClick={onSkipAll}
            title="Exit story mode and go to free explore"
          >
            SKIP TO SANDBOX
          </button>
        </div>
      </div>

      {/* Main dialogue area */}
      <div className="story-dialogue-body">
        {/* Pixel-art Avatar portrait */}
        <div className="story-avatar" aria-hidden="true">
          <div className="story-avatar-inner">
            <AxiomPortrait mood={axiomMood} isTyping={isTyping} size={44} />
            <div className="story-avatar-pulse" />
          </div>
          <div className="story-avatar-name">AXIOM</div>
        </div>

        {/* Text + controls */}
        <div className="story-dialogue-right">
          <div className="story-dialogue-text" aria-live="polite">
            {shownText}
            {isTyping && <span className="story-cursor">▌</span>}
          </div>

          <div className="story-dialogue-controls">
            {/* Line dots */}
            <div className="story-line-dots">
              {Array.from({ length: totalLines }).map((_, i) => (
                <span
                  key={i}
                  className={`story-line-dot ${i === lineIndex ? 'active' : i < lineIndex ? 'done' : ''}`}
                />
              ))}
            </div>

            {/* Action waiting indicator */}
            {isLastLine && !beat.noAction && !isBeatActionDone && !isTyping && (
              <div className="story-waiting-indicator">
                <span className="story-waiting-dot" />
                <span>Waiting for action…</span>
              </div>
            )}

            {/* Continue button */}
            <button
              type="button"
              className={`story-continue-btn ${canAdvance ? 'ready' : ''}`}
              onClick={handleRevealOrAdvance}
              disabled={false}
              title={
                isTyping
                  ? 'Click to reveal text instantly'
                  : canAdvance
                    ? isLastBeat && isLastLine
                      ? 'Finish'
                      : 'Continue'
                    : 'Complete the action above first'
              }
            >
              {isTyping
                ? '▸ REVEAL'
                : isLastBeat && isLastLine
                  ? '✓ FINISH'
                  : '▸ CONTINUE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
