import React, { useCallback } from 'react';
import type { WellType } from '../../physics/useQuantumState';
import type { WavefunctionData } from '../../physics/useQuantumState';

interface ReportScreenProps {
  visitedNs: Set<number>;
  visitedWellTypes: Set<WellType>;
  displayMode: 'psi' | 'prob';
  wavefunctionData: WavefunctionData;
  activeN: number;
  onFreeExplore: () => void;
  onExitToLanding?: () => void;
}

// Export wavefunction curve as PNG via an off-screen canvas
function exportWavefunctionPNG(
  x3D: number[],
  psi: number[],
  mode: 'psi' | 'prob',
  n: number,
): void {
  const W = 800;
  const H = 320;
  const PAD = 48;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#DBD2B3';
  ctx.fillRect(0, 0, W, H);

  const vals = mode === 'prob' ? psi.map((v) => v * v) : psi;
  const xMin = x3D[0];
  const xMax = x3D[x3D.length - 1];
  const vMin = Math.min(...vals);
  const vMax = Math.max(...vals);
  const vRange = vMax - vMin || 1;

  const toCanvasX = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - PAD * 2);
  const toCanvasY = (v: number) => H - PAD - ((v - vMin) / vRange) * (H - PAD * 2);

  // Zero line
  ctx.strokeStyle = 'rgba(58,51,42,0.25)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  const y0 = toCanvasY(0);
  ctx.moveTo(PAD, y0);
  ctx.lineTo(W - PAD, y0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Curve
  ctx.strokeStyle = '#8B4A3B';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  x3D.forEach((x, i) => {
    const cx = toCanvasX(x);
    const cy = toCanvasY(vals[i]);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  // Label
  ctx.fillStyle = '#3A332A';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText(
    `${mode === 'prob' ? '|ψ(x)|²' : 'ψ(x)'} — n=${n} — QUANTUM.WELL STORY MODE`,
    PAD,
    22,
  );

  // Axis labels
  ctx.fillStyle = '#8A8270';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(`x = ${xMin.toFixed(2)}`, PAD, H - 10);
  ctx.fillText(`x = ${xMax.toFixed(2)}`, W - PAD - 60, H - 10);

  const link = document.createElement('a');
  link.download = `wavefunction_n${n}_${mode}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  visitedNs,
  visitedWellTypes,
  displayMode,
  wavefunctionData,
  activeN,
  onFreeExplore,
  onExitToLanding,
}) => {
  const sortedNs = Array.from(visitedNs).sort((a, b) => a - b);
  const wellTypesArr = Array.from(visitedWellTypes);

  const handleDownload = useCallback(() => {
    exportWavefunctionPNG(
      wavefunctionData.x3D,
      wavefunctionData.psi,
      displayMode,
      activeN,
    );
  }, [wavefunctionData, displayMode, activeN]);

  return (
    <div className="story-report">
      <div className="story-report-header">
        <div className="story-report-icon">✦</div>
        <div className="story-report-title">SESSION REPORT</div>
        <div className="story-report-subtitle">Lab Notebook // Quantum.Well Story Mode</div>
      </div>

      <div className="story-report-body">
        {/* Explored states */}
        <div className="story-report-section">
          <div className="story-report-section-label">STATES VISITED</div>
          <div className="story-report-pills">
            {sortedNs.map((n) => (
              <span key={n} className="story-report-pill">
                n = {n}
              </span>
            ))}
          </div>
        </div>

        {/* Well types */}
        <div className="story-report-section">
          <div className="story-report-section-label">WELL TYPES EXPLORED</div>
          <div className="story-report-pills">
            {wellTypesArr.map((wt) => (
              <span key={wt} className="story-report-pill story-report-pill-accent">
                {wt.toUpperCase()} WELL
              </span>
            ))}
          </div>
        </div>

        {/* Current wavefunction */}
        <div className="story-report-section">
          <div className="story-report-section-label">CURRENT WAVEFUNCTION</div>
          <div className="story-report-wf-info">
            <span>n = {activeN}</span>
            <span>·</span>
            <span>Mode: {displayMode === 'prob' ? '|ψ|²' : 'ψ'}</span>
            <span>·</span>
            <span>E = {wavefunctionData.E.toFixed(3)} a.u.</span>
          </div>
        </div>

        {/* Download */}
        <button
          type="button"
          className="story-download-btn"
          onClick={handleDownload}
          title={`Export current ${displayMode === 'prob' ? '|ψ|²' : 'ψ'} curve as PNG`}
        >
          <span>↓</span>
          <span>
            EXPORT {displayMode === 'prob' ? '|ψ|²' : 'ψ'} CURVE AS PNG
          </span>
          <span className="story-download-note">for your lab report</span>
        </button>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {onExitToLanding && (
            <button
              type="button"
              className="story-free-explore-btn"
              onClick={onExitToLanding}
              title="Return to main landing page"
              style={{ flex: 1 }}
            >
              ⌂ MENU
            </button>
          )}
          <button
            type="button"
            className="story-free-explore-btn"
            onClick={onFreeExplore}
            title="Continue into Sandbox mode"
            style={{ flex: 2 }}
          >
            ⟨ ⟩ FREE EXPLORE
          </button>
        </div>

        <p className="story-report-preserve-note">
          Current simulation state is preserved — no parameters were reset.
        </p>
      </div>
    </div>
  );
};
