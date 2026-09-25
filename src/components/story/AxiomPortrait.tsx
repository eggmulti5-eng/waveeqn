import React, { useState, useEffect } from 'react';

export type AxiomMood = 'idle' | 'happy' | 'thinking' | 'quip' | 'blink';

interface AxiomPortraitProps {
  mood?: AxiomMood;
  size?: number;
  isTyping?: boolean;
}

/**
 * AxiomPortrait
 * -------------
 * A charming 24x24 pixel-art avatar for AXIOM, the quantum lab assistant.
 * Rendered via crisp SVG pixels with 3-frame idle animation, natural eye blinking,
 * antenna spark pulse, and reactive facial expressions.
 */
export const AxiomPortrait: React.FC<AxiomPortraitProps> = ({
  mood = 'idle',
  size = 46,
  isTyping = false,
}) => {
  const [blinkState, setBlinkState] = useState(false);
  const [pulseFrame, setPulseFrame] = useState(0);

  // Natural blink loop (every 3.2 - 4.5s)
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const scheduleNextBlink = () => {
      const delay = 2800 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Subtle antenna glow oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseFrame((p) => (p + 1) % 3);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const isBlinking = blinkState || mood === 'blink';
  const effectiveMood = isBlinking ? 'blink' : mood;

  // Pixel color palette matching the app's aesthetic
  const C_CHASSIS_DARK = '#26221d';
  const C_CHASSIS_MID = '#3d362e';
  const C_CHASSIS_LIGHT = '#5c5245';
  const C_BRASS_ACCENT = '#8b4a3b';
  const C_BRASS_LIGHT = '#b86653';
  const C_SCREEN_BG = '#151c19';
  const C_SCREEN_BORDER = '#23302b';
  const C_PHOSPHOR_CYAN = '#38bdf8';
  const C_PHOSPHOR_BRIGHT = '#7dd3fc';
  const C_AMBER_SPARK = '#f59e0b';
  const C_AMBER_LIGHT = '#fbbf24';

  return (
    <div
      className={`axiom-pixel-portrait ${isTyping ? 'typing' : ''}`}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="AXIOM — Quantum Lab Assistant"
      aria-label="AXIOM portrait"
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* ---- 1. ANTENNA & QUANTUM SPARK (Rows 0 - 4) ---- */}
        {/* Spark particle (animated 3 frames) */}
        {pulseFrame === 0 && (
          <rect x="11" y="0" width="2" height="2" fill={C_AMBER_LIGHT} />
        )}
        {pulseFrame === 1 && (
          <>
            <rect x="11" y="1" width="2" height="2" fill={C_AMBER_SPARK} />
            <rect x="10" y="2" width="4" height="1" fill={C_AMBER_LIGHT} opacity="0.8" />
          </>
        )}
        {pulseFrame === 2 && (
          <>
            <rect x="11" y="0" width="2" height="2" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="10" y="1" width="4" height="1" fill={C_AMBER_SPARK} />
          </>
        )}

        {/* Antenna rod */}
        <rect x="11" y="2" width="2" height="3" fill={C_BRASS_LIGHT} />
        <rect x="10" y="5" width="4" height="1" fill={C_BRASS_ACCENT} />

        {/* ---- 2. HEAD CHASSIS (Rows 6 - 19) ---- */}
        {/* Outer chassis shell */}
        <rect x="5" y="6" width="14" height="13" fill={C_CHASSIS_DARK} rx="1" />
        <rect x="4" y="7" width="16" height="11" fill={C_CHASSIS_DARK} />
        {/* Top/Side brass highlight bezel */}
        <rect x="5" y="6" width="14" height="1" fill={C_BRASS_LIGHT} />
        <rect x="4" y="7" width="1" height="11" fill={C_CHASSIS_LIGHT} />
        <rect x="19" y="7" width="1" height="11" fill={C_CHASSIS_MID} />
        {/* Bottom bezel */}
        <rect x="5" y="18" width="14" height="1" fill={C_CHASSIS_MID} />

        {/* Ear bolts / quantum sensors */}
        <rect x="3" y="10" width="1" height="4" fill={C_BRASS_ACCENT} />
        <rect x="2" y="11" width="1" height="2" fill={C_AMBER_SPARK} />
        <rect x="20" y="10" width="1" height="4" fill={C_BRASS_ACCENT} />
        <rect x="21" y="11" width="1" height="2" fill={C_AMBER_SPARK} />

        {/* ---- 3. CRT VISOR SCREEN (Rows 8 - 16) ---- */}
        <rect x="6" y="8" width="12" height="9" fill={C_SCREEN_BORDER} />
        <rect x="7" y="9" width="10" height="7" fill={C_SCREEN_BG} />

        {/* Scanline hint */}
        <rect x="7" y="11" width="10" height="1" fill={C_SCREEN_BORDER} opacity="0.4" />
        <rect x="7" y="14" width="10" height="1" fill={C_SCREEN_BORDER} opacity="0.4" />

        {/* ---- 4. EXPRESSIVE PHOSPHOR EYES & MOUTH ---- */}
        {effectiveMood === 'blink' ? (
          // Blinking: narrow horizontal slits
          <>
            <rect x="8" y="12" width="3" height="1" fill={C_PHOSPHOR_CYAN} />
            <rect x="13" y="12" width="3" height="1" fill={C_PHOSPHOR_CYAN} />
          </>
        ) : effectiveMood === 'happy' ? (
          // Happy: curved arch eyes ^^ + smile tick
          <>
            <rect x="8" y="11" width="3" height="1" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="8" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />
            <rect x="10" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />

            <rect x="13" y="11" width="3" height="1" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="13" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />
            <rect x="15" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />

            {/* Little smile */}
            <rect x="11" y="14" width="2" height="1" fill={C_AMBER_LIGHT} />
          </>
        ) : effectiveMood === 'thinking' ? (
          // Thinking: eyes looking upward/aside
          <>
            <rect x="9" y="10" width="2" height="2" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="14" y="10" width="2" height="2" fill={C_PHOSPHOR_BRIGHT} />
            {/* Flat mouth line */}
            <rect x="10" y="14" width="4" height="1" fill={C_PHOSPHOR_CYAN} opacity="0.8" />
          </>
        ) : effectiveMood === 'quip' ? (
          // Quip / Wink: one open eye, one wink slit + smirk
          <>
            <rect x="8" y="11" width="3" height="2" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="8" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />
            {/* Wink slit */}
            <rect x="13" y="12" width="3" height="1" fill={C_PHOSPHOR_BRIGHT} />
            {/* Playful smirk */}
            <rect x="10" y="14" width="3" height="1" fill={C_AMBER_LIGHT} />
            <rect x="13" y="13" width="1" height="1" fill={C_AMBER_LIGHT} />
          </>
        ) : (
          // Idle / Standard: steady luminous quantum eyes
          <>
            {/* Left Eye */}
            <rect x="8" y="11" width="3" height="2" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="8" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="9" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />

            {/* Right Eye */}
            <rect x="13" y="11" width="3" height="2" fill={C_PHOSPHOR_BRIGHT} />
            <rect x="13" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="14" y="12" width="1" height="1" fill={C_PHOSPHOR_CYAN} />

            {/* Subtle waveform mouth row */}
            <rect x="10" y="14" width="1" height="1" fill={C_PHOSPHOR_CYAN} opacity="0.8" />
            <rect x="11" y="14" width="2" height="1" fill={C_AMBER_LIGHT} />
            <rect x="13" y="14" width="1" height="1" fill={C_PHOSPHOR_CYAN} opacity="0.8" />
          </>
        )}

        {/* ---- 5. COLLAR & BASE (Rows 19 - 23) ---- */}
        <rect x="9" y="19" width="6" height="2" fill={C_CHASSIS_DARK} />
        <rect x="7" y="21" width="10" height="2" fill={C_BRASS_ACCENT} />
        <rect x="6" y="22" width="12" height="1" fill={C_CHASSIS_MID} />
        {/* Core status LED */}
        <rect x="11" y="21" width="2" height="1" fill={isTyping ? C_AMBER_LIGHT : C_PHOSPHOR_CYAN} />
      </svg>
    </div>
  );
};
