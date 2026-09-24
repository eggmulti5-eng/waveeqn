import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Beat, DialogueLine } from './useStoryMode';

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
}) => {
  const displayText = skipTheory ? line.shortText : line.text;
  const [shownText, setShownText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

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

  // Click to finish typing immediately
  const handleRevealOrAdvance = useCallback(() => {
    if (isTyping) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShownText(displayText);
      setIsTyping(false);
    } else {
      // Can advance if: noAction beat, or action is done, or not the last line
      const canAdvance = beat.noAction || isBeatActionDone || !isLastLine;
      if (canAdvance) onAdvance();
    }
  }, [isTyping, displayText, beat.noAction, isBeatActionDone, isLastLine, onAdvance]);

  // Keyboard: Space / Enter to advance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
        {/* Avatar portrait */}
        <div className="story-avatar" aria-hidden="true">
          <div className="story-avatar-inner">
            <div className="story-avatar-glyph">Ψ</div>
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
