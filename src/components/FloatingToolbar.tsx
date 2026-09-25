import React from 'react';
import { RotateCcw, Compass, Plus, Minus, GitCompare, Box } from 'lucide-react';

interface FloatingToolbarProps {
  displayMode: 'psi' | 'prob';
  setDisplayMode: (mode: 'psi' | 'prob') => void;
  isCompareActive: boolean;
  setIsCompareActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  isCrossSection: boolean;
  setIsCrossSection: (cs: boolean | ((prev: boolean) => boolean)) => void;
  zoomPct: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  displayMode,
  setDisplayMode,
  isCompareActive,
  setIsCompareActive,
  isCrossSection,
  setIsCrossSection,
  zoomPct,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <nav className="floating-toolbar" aria-label="Quantum Chamber Controls">
      {/* "ψ" / "|ψ|²" toggle (mutually exclusive pill pair) */}
      <div
        className="toolbar-pill-pair"
        role="group"
        aria-label="Wavefunction Display Quantity"
        data-tour="toolbar-psi"
      >
        <button
          type="button"
          className={`toolbar-pair-btn ${displayMode === 'psi' ? 'active' : ''}`}
          onClick={() => setDisplayMode('psi')}
          title="Wavefunction Amplitude ψ(x)"
        >
          ψ
        </button>
        <button
          type="button"
          className={`toolbar-pair-btn ${displayMode === 'prob' ? 'active' : ''}`}
          onClick={() => setDisplayMode('prob')}
          title="Probability Density |ψ(x)|²"
        >
          |ψ|²
        </button>
      </div>

      {/* "Compare" toggle (off by default) */}
      <button
        type="button"
        className={`toolbar-pill-btn ${isCompareActive ? 'active' : ''}`}
        onClick={() => setIsCompareActive((prev) => !prev)}
        title="Toggle Comparative Overlay"
        data-tour="toolbar-compare"
      >
        <GitCompare size={13} />
        <span>COMPARE</span>
      </button>

      {/* "Cross-section" toggle */}
      <button
        type="button"
        className={`toolbar-pill-btn ${isCrossSection ? 'active' : ''}`}
        onClick={() => setIsCrossSection((prev) => !prev)}
        title="Toggle Chamber Solid / Wireframe Cross-section"
        data-tour="toolbar-cross-section"
      >
        <Box size={13} />
        <span>CROSS-SECTION</span>
      </button>

      <div className="toolbar-divider" />

      {/* Camera & Reset Group */}
      <div
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'inherit' }}
        data-tour="toolbar-camera"
      >
        {/* Orbit label (non-clickable status indicator) */}
        <div
          className="toolbar-orbit-label"
          title="OrbitControls Active (Left-drag: Rotate, Right-drag: Pan, Wheel: Zoom)"
        >
          <Compass size={12} />
          <span>ORBIT</span>
        </div>

        {/* Zoom -/+ percentage readout */}
        <div className="toolbar-zoom-group">
          <button
            type="button"
            className="toolbar-zoom-btn"
            onClick={onZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Minus size={11} />
          </button>
          <span className="toolbar-zoom-val">{zoomPct}%</span>
          <button
            type="button"
            className="toolbar-zoom-btn"
            onClick={onZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Plus size={11} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Reset button (resets camera position AND all sliders/state to default) */}
        <button
          type="button"
          className="toolbar-pill-btn"
          onClick={onReset}
          title="Reset camera position and all simulation parameters to default"
        >
          <RotateCcw size={13} />
          <span>RESET</span>
        </button>
      </div>
    </nav>
  );
};
