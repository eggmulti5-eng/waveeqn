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
 * A true flat 2D retro-JRPG pixel-art sprite (32x32 grid).
 * Strictly flat color fields, hard outlines, crisp pixel edges,
 * with NO gradients, NO soft shading, and NO 3D rendering.
 *
 * Uses the project's color palette:
 * - Ink outline: #241E17
 * - Accent trim: #8B4A3B
 * - Chassis panel: #E4E1C7 / #DBD2B3
 * - CRT visor: #141A1E
 * - Quantum phosphor glow: #22D3EE & #F59E0B
 */
export const AxiomPortrait: React.FC<AxiomPortraitProps> = ({
  mood = 'idle',
  size = 44,
  isTyping = false,
}) => {
  const [blinkState, setBlinkState] = useState(false);
  const [pulseFrame, setPulseFrame] = useState(0);

  // Natural retro sprite blink (slits for 140ms every 3.5 - 5s)
  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2200;
      blinkTimer = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          scheduleNextBlink();
        }, 140);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  // 2-frame retro antenna emitter glow cycle (swaps every 480ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseFrame((prev) => (prev === 0 ? 1 : 0));
    }, 480);
    return () => clearInterval(interval);
  }, []);

  const isBlinking = blinkState || mood === 'blink';
  const effectiveMood = isBlinking ? 'blink' : mood;

  // Strict flat color palette
  const C_INK = '#241E17';
  const C_ACCENT = '#8B4A3B';
  const C_ACCENT_HI = '#A65A49';
  const C_CHASSIS = '#E4E1C7';
  const C_CHASSIS_DARK = '#DBD2B3';
  const C_SCREEN = '#141A1E';
  const C_CYAN = '#22D3EE';
  const C_CYAN_HOT = '#F0FDFA';
  const C_CYAN_SHADOW = '#0891B2';
  const C_AMBER = '#F59E0B';
  const C_AMBER_HOT = '#FDE68A';

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
        flexShrink: 0,
      }}
      title="AXIOM — Quantum Lab Assistant"
      aria-label="AXIOM pixel art portrait"
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        style={{
          shapeRendering: 'crispEdges',
          imageRendering: 'pixelated',
        }}
      >
        {/* =================================================================
            1. ANTENNA & QUANTUM EMITTER (Y: 1 - 8)
            ================================================================= */}
        {/* Antenna emitter energy node */}
        {pulseFrame === 0 ? (
          <>
            {/* Frame 0: Amber spark with white core */}
            <rect x="15" y="1" width="2" height="1" fill={C_INK} />
            <rect x="14" y="2" width="1" height="2" fill={C_INK} />
            <rect x="17" y="2" width="1" height="2" fill={C_INK} />
            <rect x="15" y="4" width="2" height="1" fill={C_INK} />
            <rect x="15" y="2" width="2" height="2" fill={C_AMBER} />
            <rect x="15" y="2" width="1" height="1" fill={C_AMBER_HOT} />
          </>
        ) : (
          <>
            {/* Frame 1: Quantum cyan pulse flare */}
            <rect x="14" y="1" width="4" height="1" fill={C_INK} />
            <rect x="13" y="2" width="1" height="2" fill={C_INK} />
            <rect x="18" y="2" width="1" height="2" fill={C_INK} />
            <rect x="14" y="4" width="4" height="1" fill={C_INK} />
            <rect x="14" y="2" width="4" height="2" fill={C_CYAN} />
            <rect x="15" y="2" width="2" height="1" fill={C_CYAN_HOT} />
          </>
        )}

        {/* Antenna stalk */}
        <rect x="14" y="5" width="1" height="3" fill={C_INK} />
        <rect x="15" y="5" width="2" height="3" fill={C_ACCENT} />
        <rect x="17" y="5" width="1" height="3" fill={C_INK} />

        {/* Antenna head mount */}
        <rect x="13" y="8" width="6" height="1" fill={C_INK} />

        {/* =================================================================
            2. CHASSIS / HEAD SHELL (Y: 9 - 24)
            ================================================================= */}
        {/* Top outline & fill */}
        <rect x="9" y="9" width="14" height="1" fill={C_INK} />
        <rect x="8" y="10" width="1" height="1" fill={C_INK} />
        <rect x="9" y="10" width="14" height="1" fill={C_ACCENT} />
        <rect x="23" y="10" width="1" height="1" fill={C_INK} />

        {/* Main head body */}
        <rect x="7" y="11" width="1" height="13" fill={C_INK} />
        <rect x="8" y="11" width="16" height="12" fill={C_CHASSIS} />
        <rect x="8" y="11" width="1" height="12" fill={C_CHASSIS_DARK} />
        <rect x="23" y="11" width="1" height="12" fill={C_CHASSIS_DARK} />
        <rect x="24" y="11" width="1" height="13" fill={C_INK} />

        {/* Bottom edge & accent stripe */}
        <rect x="8" y="23" width="1" height="1" fill={C_INK} />
        <rect x="9" y="23" width="14" height="1" fill={C_ACCENT} />
        <rect x="23" y="23" width="1" height="1" fill={C_INK} />
        <rect x="9" y="24" width="14" height="1" fill={C_INK} />

        {/* =================================================================
            3. EARS / SIDE BOLTS (Y: 14 - 19)
            ================================================================= */}
        {/* Left ear */}
        <rect x="5" y="14" width="2" height="1" fill={C_INK} />
        <rect x="4" y="15" width="1" height="4" fill={C_INK} />
        <rect x="5" y="15" width="2" height="4" fill={C_ACCENT} />
        <rect x="5" y="16" width="1" height="2" fill={pulseFrame === 0 ? C_AMBER : C_CYAN} />
        <rect x="5" y="19" width="2" height="1" fill={C_INK} />

        {/* Right ear */}
        <rect x="25" y="14" width="2" height="1" fill={C_INK} />
        <rect x="25" y="15" width="2" height="4" fill={C_ACCENT} />
        <rect x="26" y="16" width="1" height="2" fill={pulseFrame === 0 ? C_AMBER : C_CYAN} />
        <rect x="27" y="15" width="1" height="4" fill={C_INK} />
        <rect x="25" y="19" width="2" height="1" fill={C_INK} />

        {/* =================================================================
            4. CRT VISOR SCREEN (X: 10 - 21, Y: 12 - 21)
            ================================================================= */}
        {/* Screen bezel */}
        <rect x="10" y="12" width="12" height="1" fill={C_INK} />
        <rect x="10" y="13" width="1" height="8" fill={C_INK} />
        <rect x="21" y="13" width="1" height="8" fill={C_INK} />
        <rect x="10" y="21" width="12" height="1" fill={C_INK} />

        {/* Deep dark screen field */}
        <rect x="11" y="13" width="10" height="8" fill={C_SCREEN} />

        {/* =================================================================
            5. RETRO JRPG FACIAL SPRITES
            ================================================================= */}
        {effectiveMood === 'blink' ? (
          /* BLINK: Classic 1-pixel horizontal eye slits */
          <>
            <rect x="12" y="16" width="3" height="1" fill={C_CYAN} />
            <rect x="17" y="16" width="3" height="1" fill={C_CYAN} />
            {/* Digital mouth line */}
            <rect x="15" y="19" width="2" height="1" fill={C_CYAN} />
          </>
        ) : effectiveMood === 'happy' ? (
          /* HAPPY: Retro beaming chevron arch eyes ^ ^ */
          <>
            {/* Left chevron eye */}
            <rect x="13" y="14" width="1" height="1" fill={C_CYAN_HOT} />
            <rect x="12" y="15" width="1" height="1" fill={C_CYAN} />
            <rect x="14" y="15" width="1" height="1" fill={C_CYAN} />

            {/* Right chevron eye */}
            <rect x="18" y="14" width="1" height="1" fill={C_CYAN_HOT} />
            <rect x="17" y="15" width="1" height="1" fill={C_CYAN} />
            <rect x="19" y="15" width="1" height="1" fill={C_CYAN} />

            {/* Cheerful wide smile */}
            <rect x="14" y="18" width="1" height="1" fill={C_AMBER} />
            <rect x="15" y="19" width="2" height="1" fill={C_AMBER} />
            <rect x="17" y="18" width="1" height="1" fill={C_AMBER} />
          </>
        ) : effectiveMood === 'thinking' ? (
          /* THINKING: Eyes shifted up & aside */
          <>
            {/* Shifted left eye */}
            <rect x="13" y="14" width="2" height="2" fill={C_CYAN} />
            <rect x="14" y="14" width="1" height="1" fill={C_CYAN_HOT} />

            {/* Shifted right eye */}
            <rect x="18" y="14" width="2" height="2" fill={C_CYAN} />
            <rect x="19" y="14" width="1" height="1" fill={C_CYAN_HOT} />

            {/* Analytical flat mouth line */}
            <rect x="14" y="19" width="4" height="1" fill={C_CYAN} />
          </>
        ) : effectiveMood === 'quip' ? (
          /* QUIP / WINK: One open, one wink slit + playful smirk */
          <>
            {/* Left Eye: Open & bright */}
            <rect x="12" y="15" width="3" height="2" fill={C_CYAN} />
            <rect x="13" y="15" width="1" height="1" fill={C_CYAN_HOT} />
            <rect x="12" y="16" width="1" height="1" fill={C_CYAN_SHADOW} />

            {/* Right Eye: Wink slit */}
            <rect x="17" y="16" width="3" height="1" fill={C_CYAN} />

            {/* Smirk: upturned corner */}
            <rect x="14" y="19" width="3" height="1" fill={C_AMBER} />
            <rect x="17" y="18" width="1" height="1" fill={C_AMBER} />
          </>
        ) : (
          /* IDLE: Classic steady luminous phosphor eyes */
          <>
            {/* Left Eye: 3x2 block with glint */}
            <rect x="12" y="15" width="3" height="2" fill={C_CYAN} />
            <rect x="13" y="15" width="1" height="1" fill={C_CYAN_HOT} />
            <rect x="12" y="16" width="1" height="1" fill={C_CYAN_SHADOW} />

            {/* Right Eye: 3x2 block with glint */}
            <rect x="17" y="15" width="3" height="2" fill={C_CYAN} />
            <rect x="18" y="15" width="1" height="1" fill={C_CYAN_HOT} />
            <rect x="17" y="16" width="1" height="1" fill={C_CYAN_SHADOW} />

            {/* Digital mouth line */}
            <rect x="15" y="19" width="2" height="1" fill={C_CYAN} />
          </>
        )}

        {/* =================================================================
            6. COLLAR & BASE PEDESTAL (Y: 25 - 30)
            ================================================================= */}
        {/* Neck */}
        <rect x="12" y="25" width="8" height="1" fill={C_INK} />
        <rect x="13" y="26" width="6" height="1" fill={C_ACCENT} />
        <rect x="12" y="26" width="1" height="1" fill={C_INK} />
        <rect x="19" y="26" width="1" height="1" fill={C_INK} />

        {/* Base shoulder trim */}
        <rect x="9" y="27" width="14" height="1" fill={C_INK} />
        <rect x="8" y="28" width="1" height="1" fill={C_INK} />
        <rect x="9" y="28" width="14" height="1" fill={C_CHASSIS_DARK} />
        <rect x="23" y="28" width="1" height="1" fill={C_INK} />

        {/* Bottom pedestal plate */}
        <rect x="7" y="29" width="1" height="1" fill={C_INK} />
        <rect x="8" y="29" width="16" height="1" fill={C_ACCENT_HI} />
        <rect x="24" y="29" width="1" height="1" fill={C_INK} />
        <rect x="7" y="30" width="18" height="1" fill={C_INK} />

        {/* Core status indicator LED on chest */}
        <rect
          x="15"
          y="28"
          width="2"
          height="1"
          fill={isTyping ? C_AMBER_HOT : C_CYAN}
        />
      </svg>
    </div>
  );
};
