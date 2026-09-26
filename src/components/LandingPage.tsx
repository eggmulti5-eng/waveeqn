import React from 'react';

interface LandingPageProps {
  onEnterSandbox: () => void;
  onEnterStoryMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterSandbox,
  onEnterStoryMode,
}) => {
  return (
    <div className="landing-page">
      {/* Ambient floating background elements */}
      <div className="landing-ambient-bg" aria-hidden="true">
        {/* Floating equations */}
        <div className="ambient-element eq-1">λ = h/p</div>
        <div className="ambient-element eq-2">ΔxΔp ≥ ℏ/2</div>
        <div className="ambient-element eq-3">∫|ψ|²dx = 1</div>
        <div className="ambient-element eq-4">E_n = n²π²ℏ²/2mL²</div>
        
        {/* Schrödinger's Cat silhouette */}
        <div className="ambient-element ambient-cat">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
            <path d="M 35 90 C 35 60, 40 50, 40 40 C 25 40, 20 30, 30 20 L 35 10 L 45 20 L 60 10 C 60 25, 55 35, 60 45 C 70 60, 75 75, 75 90 C 85 90, 95 90, 95 95 C 95 100, 80 100, 75 100 L 35 100 Z"/>
          </svg>
          <span className="cat-qm">?</span>
        </div>

        {/* Drifting particles */}
        <div className="ambient-particle p1" />
        <div className="ambient-particle p2" />
        <div className="ambient-particle p3" />
        <div className="ambient-particle p4" />
        <div className="ambient-particle p5" />
        <div className="ambient-particle p6" />
      </div>

      {/* Subtle background grid matching canvas */}
      <div className="landing-grid-bg" />

      <div className="landing-content">
        {/* Top decorative label */}
        <div className="landing-label">
          <span className="landing-label-glyph">ψ</span>
          <span>QUANTUM MECHANICS SIMULATION</span>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          Schrödinger's Wave
          <br />
          Equation Simulator
        </h1>

        {/* Animated equation visual */}
        <div className="landing-equation-container">
          <div className="landing-equation" aria-label="Time-independent Schrödinger equation">
            <span className="eq-term eq-term-1">
              <span className="eq-frac">
                <span className="eq-frac-num">−ℏ²</span>
                <span className="eq-frac-bar" />
                <span className="eq-frac-den">2m</span>
              </span>
            </span>
            <span className="eq-term eq-term-2">
              <span className="eq-deriv">
                <span className="eq-frac">
                  <span className="eq-frac-num">d²ψ</span>
                  <span className="eq-frac-bar" />
                  <span className="eq-frac-den">dx²</span>
                </span>
              </span>
            </span>
            <span className="eq-term eq-term-3">
              <span className="eq-operator">+</span>
              <span>Vψ</span>
            </span>
            <span className="eq-term eq-term-4">
              <span className="eq-operator">=</span>
              <span className="eq-highlight">Eψ</span>
            </span>
          </div>

          {/* Animated psi curve sketch */}
          <svg
            className="landing-psi-curve"
            viewBox="0 0 280 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Well boundaries */}
            <line x1="40" y1="10" x2="40" y2="55" stroke="var(--ink-muted)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
            <line x1="240" y1="10" x2="240" y2="55" stroke="var(--ink-muted)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
            {/* Well floor */}
            <line x1="40" y1="55" x2="240" y2="55" stroke="var(--ink-muted)" strokeWidth="1" opacity="0.3" />

            {/* Animated wavefunction: n=2 sine wave */}
            <path
              className="psi-curve-path"
              d="M 40 30 C 70 -5, 105 -5, 140 30 C 175 65, 210 65, 240 30"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Node point at center */}
            <circle
              className="psi-node-marker"
              cx="140"
              cy="30"
              r="3"
              fill="var(--accent)"
            />
          </svg>
        </div>

        {/* Subtitle */}
        <p className="landing-subtitle">
          Explore quantum bound states, wavefunctions, and energy spectra
          <br />
          in infinite and finite potential wells.
        </p>

        {/* Entry choices — clear fork, not a toggle */}
        <div className="landing-choices">
          <button
            type="button"
            className="landing-choice-btn landing-choice-primary"
            onClick={onEnterSandbox}
          >
            <span className="choice-icon">⟨ ⟩</span>
            <span className="choice-label">SANDBOX</span>
            <span className="choice-desc">Free-explore the quantum chamber</span>
          </button>

          <button
            type="button"
            className="landing-choice-btn landing-choice-secondary"
            onClick={onEnterStoryMode}
          >
            <span className="choice-icon">▸</span>
            <span className="choice-label">STORY MODE</span>
            <span className="choice-desc">Guided interactive quantum lab tour</span>
          </button>
        </div>

        {/* Bottom decorative note */}
        <div className="landing-footer-note">
          <span>ℏ = 1 · m = 1 · NATURAL UNITS</span>
        </div>
      </div>
    </div>
  );
};
