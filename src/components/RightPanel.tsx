import React from 'react';
import { X, Sliders, ArrowUpRight, ArrowDownRight, Zap, GitCompare } from 'lucide-react';
import type {
  StateItem,
  TransitionItem,
  SavedSlot,
  DiffStats,
} from '../physics/useQuantumState';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeN: number;
  activeState: StateItem;
  autoDescription: string;
  energySharePercent: number;
  allowedTransitions: TransitionItem[];
  onSelectState: (n: number) => void;
  isCompareActive?: boolean;
  slotA?: SavedSlot | null;
  slotB?: SavedSlot | null;
  diffStats?: DiffStats | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  isOpen,
  onClose,
  activeN,
  activeState,
  autoDescription,
  energySharePercent,
  allowedTransitions,
  onSelectState,
  isCompareActive = false,
  slotA = null,
  slotB = null,
  diffStats = null,
}) => {
  return (
    <aside
      className={`right-panel ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      data-tour="inspector"
    >
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-header-title">
          <Sliders size={13} color="var(--accent)" />
          <span>INSPECTOR // STATE n = {activeN}</span>
        </div>
        <button
          type="button"
          className="panel-close-btn"
          onClick={onClose}
          aria-label="Close inspector panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="panel-body">
        {/* Title & Auto-Description Block */}
        <div className="inspector-title-block">
          <div className="inspector-state-heading">
            <span className="inspector-state-n">n = {activeN}</span>
            <span
              className={`status-badge ${activeState.isBound ? 'bound-badge' : 'leaking-badge'}`}
            >
              {activeState.isBound ? 'BOUND' : 'LEAKING'}
            </span>
          </div>
          <p className="inspector-auto-desc">{autoDescription}</p>
        </div>

        {/* Section: Stat Rows */}
        <div className="panel-section" data-tour="inspector-stats">
          <div className="section-label">QUANTUM STATS</div>

          <div className="param-row">
            <span className="param-name">Energy (Eₙ)</span>
            <span className="param-val">{activeState.E.toFixed(3)} a.u.</span>
          </div>

          <div className="param-row">
            <span className="param-name">Node Count</span>
            <span className="param-val">{activeState.nodes}</span>
          </div>

          <div className="param-row">
            <span className="param-name">Spatial Parity</span>
            <span className="param-val" style={{ textTransform: 'uppercase' }}>
              {activeState.parity}
            </span>
          </div>

          <div className="param-row-stacked">
            <div className="param-row-header">
              <span className="param-name">Share of Total Range</span>
              <span className="param-val">{energySharePercent.toFixed(1)}%</span>
            </div>
            <div className="energy-share-bar-bg">
              <div
                className="energy-share-bar-fill"
                style={{ width: `${Math.min(100, Math.max(2, energySharePercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section: Comparative DIFF Block (Rendered when Compare is active and both slots filled) */}
        {isCompareActive && slotA && slotB && diffStats && (
          <div className="panel-section diff-section" data-tour="inspector-diff">
            <div className="section-label-row">
              <span className="section-label diff-label">DIFF (SLOT B − SLOT A)</span>
              <span className="diff-active-tag">
                <GitCompare size={9} style={{ marginRight: 3 }} />
                <span>COMPARE ACTIVE</span>
              </span>
            </div>

            {/* Signed Delta E */}
            <div className="param-row diff-row">
              <span className="param-name">ΔEnergy (ΔE)</span>
              <span
                className={`param-val ${diffStats.deltaE >= 0 ? 'diff-val-pos' : 'diff-val-neg'}`}
              >
                {diffStats.deltaE >= 0
                  ? `+${diffStats.deltaE.toFixed(3)}`
                  : diffStats.deltaE.toFixed(3)}{' '}
                a.u.
              </span>
            </div>

            {/* Transition Wavelength */}
            <div className="param-row diff-row">
              <span className="param-name">Transition λ (2π/|ΔE|)</span>
              <span className="param-val">
                {diffStats.deltaLambda != null
                  ? `${diffStats.deltaLambda.toFixed(2)} a.u.`
                  : '∞ (degenerate)'}
              </span>
            </div>

            {/* Delta Node Count */}
            <div className="param-row diff-row">
              <span className="param-name">ΔNode Count</span>
              <span className="param-val">
                {diffStats.deltaNodes >= 0
                  ? `+${diffStats.deltaNodes}`
                  : diffStats.deltaNodes}
              </span>
            </div>

            {/* Slot Summaries */}
            <div className="diff-slot-comparison">
              <div className="diff-slot-card diff-slot-card-a">
                <span className="diff-slot-badge">SLOT A</span>
                <span className="diff-slot-detail">
                  n={slotA.n} | L={slotA.L.toFixed(1)}
                </span>
                <span className="diff-slot-detail">E={slotA.E.toFixed(2)}</span>
              </div>
              <div className="diff-slot-card diff-slot-card-b">
                <span className="diff-slot-badge diff-slot-badge-b">SLOT B</span>
                <span className="diff-slot-detail">
                  n={slotB.n} | L={slotB.L.toFixed(1)}
                </span>
                <span className="diff-slot-detail">E={slotB.E.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section: Allowed Dipole Transitions */}
        <div className="panel-section" data-tour="inspector-transitions">
          <div className="section-label-row">
            <span className="section-label">ALLOWED TRANSITIONS (Δn ODD)</span>
            <span className="dipole-rule-tag" title="Dipole parity selection rule: Δn must be odd">
              <Zap size={10} />
              <span>DIPOLE RULE</span>
            </span>
          </div>

          <div className="transitions-list">
            {allowedTransitions.map((tr) => {
              const isAbsorption = tr.type === 'absorption';
              return (
                <div
                  key={tr.targetN}
                  className="transition-card"
                  onClick={() => onSelectState(tr.targetN)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectState(tr.targetN);
                    }
                  }}
                  title={`Click to jump to state n = ${tr.targetN}`}
                >
                  <div className="transition-card-left">
                    <div className="transition-target-pill">
                      <span>n = {tr.targetN}</span>
                    </div>
                    <div className="transition-meta">
                      <span className="transition-title">{tr.targetTitle}</span>
                      <span className="transition-delta-n">|Δn| = {tr.deltaN}</span>
                    </div>
                  </div>

                  <div className="transition-card-right">
                    <div className="transition-type-tag">
                      {isAbsorption ? (
                        <span className="badge-absorption">
                          <ArrowUpRight size={11} />
                          <span>ABSORB</span>
                        </span>
                      ) : (
                        <span className="badge-emission">
                          <ArrowDownRight size={11} />
                          <span>EMIT</span>
                        </span>
                      )}
                    </div>
                    <div className="transition-energy-val">
                      ΔE: {tr.deltaE.toFixed(2)}
                    </div>
                    {/* Relative coupling strength indicator */}
                    <div className="coupling-bar-bg">
                      <div
                        className="coupling-bar-fill"
                        style={{ width: `${tr.relativeStrength * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {allowedTransitions.length === 0 && (
              <div className="no-transitions-msg">
                No dipole-allowed transitions in current energy window
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
