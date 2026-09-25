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
