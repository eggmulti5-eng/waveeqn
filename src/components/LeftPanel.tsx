import React from 'react';
import { Search, BookmarkPlus } from 'lucide-react';
import type { WellType, StateItem, SavedSlot } from '../physics/useQuantumState';

interface LeftPanelProps {
  wellType: WellType;
  setWellType: (type: WellType) => void;
  L: number;
  setL: (val: number) => void;
  m: number;
  setM: (val: number) => void;
  V: number;
  setV: (val: number) => void;
  activeN: number;
  setActiveN: (n: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  states: StateItem[];
  filteredStates: StateItem[];
  activeState: StateItem;
  slotA: SavedSlot | null;
  slotB: SavedSlot | null;
  onSaveSlotA: () => void;
  onSaveSlotB: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  wellType,
  setWellType,
  L,
  setL,
  m,
  setM,
  V,
  setV,
  activeN,
  setActiveN,
  searchQuery,
  setSearchQuery,
  filteredStates,
  activeState,
  slotA,
  slotB,
  onSaveSlotA,
  onSaveSlotB,
}) => {
  return (
    <aside className="left-panel">
      {/* Title block */}
      <div className="title-block">
        <div className="brand-row">
          <div className="brand-title">
            <span className="brand-glyph">Ψ</span>
            <span>QUANTUM.WELL</span>
          </div>
          {/* Fix 4: badge + ? info affordance, consistent between ANALYTIC and NUMERICALLY SOLVED */}
          <div className="badge-row">
            <span className="status-badge">
              {wellType === 'infinite' ? 'ANALYTIC' : 'NUMERICALLY SOLVED'}
            </span>
            {wellType === 'finite' && (
              <button
                type="button"
                className="status-badge-info"
                title="Solved via finite-difference method (FDM): no closed-form solution exists for finite wells, so the wavefunction is computed numerically on a discretized spatial grid."
                aria-label="About the numerical solver"
              >
                ?
              </button>
            )}
          </div>
        </div>
        <div className="sub-header">1D Schrödinger Bound & Barrier Solver</div>
      </div>

      {/* Live 3-stat row */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-label">STATE</span>
          <span className="stat-value">n = {activeN}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">ENERGY</span>
          <span className="stat-value">
            {activeState?.E != null ? activeState.E.toFixed(2) : '--'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">STATUS</span>
          <span
            className="stat-value"
            style={{
              color: activeState?.isBound ? 'var(--ink)' : 'var(--accent)',
            }}
          >
            {activeState?.isBound ? 'BOUND' : 'LEAKING'}
          </span>
        </div>
      </div>

      {/* Well Type Toggle: Infinite / Finite */}
      <div className="well-type-container" data-tour="well-toggle">
        <span className="well-type-label">POTENTIAL WELL MODEL</span>
        <div className="toggle-button-group">
          <button
            type="button"
            className={`toggle-button ${wellType === 'infinite' ? 'active' : ''}`}
            onClick={() => setWellType('infinite')}
          >
            INFINITE
          </button>
          <button
            type="button"
            className={`toggle-button ${wellType === 'finite' ? 'active' : ''}`}
            onClick={() => setWellType('finite')}
          >
            FINITE
          </button>
        </div>
      </div>

      {/* Comparative Slots Control Deck (Layer 6) */}
      <div className="slots-container" data-tour="slots">
        <span className="slots-label">COMPARISON SLOTS</span>
        <div className="slots-button-group">
          <button
            type="button"
            className="slot-btn"
            onClick={onSaveSlotA}
            title="Capture current state into Slot A"
          >
            <div className="slot-btn-top">
              <BookmarkPlus size={11} />
              <span>SAVE TO SLOT A</span>
            </div>
            <span className="slot-badge">
              {slotA ? `n=${slotA.n}, L=${slotA.L.toFixed(1)}` : 'EMPTY'}
            </span>
          </button>

          <button
            type="button"
            className="slot-btn slot-btn-b"
            onClick={onSaveSlotB}
            title="Capture current state into Slot B"
          >
            <div className="slot-btn-top">
              <BookmarkPlus size={11} />
              <span>SAVE TO SLOT B</span>
            </div>
            <span className="slot-badge slot-badge-b">
              {slotB ? `n=${slotB.n}, L=${slotB.L.toFixed(1)}` : 'EMPTY'}
            </span>
          </button>
        </div>
      </div>

      {/* Parameter Sliders: L, m, and V */}
      <div className="sliders-container" data-tour="sliders">
        {/* Slider L (width) */}
        <div className="slider-row" data-tour="slider-L">
          <div className="slider-header">
            <span className="slider-name">Well Width (L)</span>
            <span className="slider-val-badge">{L.toFixed(1)} a.u.</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={L}
            onChange={(e) => setL(parseFloat(e.target.value))}
            onInput={(e) => setL(parseFloat((e.target as HTMLInputElement).value))}
            className="quantum-range-input"
            aria-label="Well Width L"
          />
        </div>

        {/* Slider m (mass) */}
        <div className="slider-row" data-tour="slider-m">
          <div className="slider-header">
            <span className="slider-name">Particle Mass (m)</span>
            <span className="slider-val-badge">{m.toFixed(1)} m₀</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={m}
            onChange={(e) => setM(parseFloat(e.target.value))}
            onInput={(e) => setM(parseFloat((e.target as HTMLInputElement).value))}
            className="quantum-range-input"
            aria-label="Particle Mass m"
          />
        </div>

        {/* Slider V (barrier height, finite-well only) */}
        <div
          className={`slider-row ${wellType === 'infinite' ? 'disabled' : ''}`}
          data-tour="slider-V"
        >
          <div className="slider-header">
            <span className="slider-name">Barrier Height (V)</span>
            <span className="slider-val-badge">
              {wellType === 'infinite' ? '∞' : `${V.toFixed(0)} a.u.`}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={V}
            disabled={wellType === 'infinite'}
            onChange={(e) => setV(parseFloat(e.target.value))}
            onInput={(e) => setV(parseFloat((e.target as HTMLInputElement).value))}
            className="quantum-range-input"
            aria-label="Barrier Height V"
          />
        </div>
      </div>

      {/* Search input: filters/jumps to a state */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search state (e.g. 1, ground, bound)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredStates.length > 0) {
                setActiveN(filteredStates[0].n);
              }
            }}
            aria-label="Search states"
          />
        </div>
      </div>

      {/* Scrollable State List n=1..8 */}
      <div className="list-container" data-tour="state-list">
        <div className="list-section-header">
          <span>EIGENSTATES (n = 1..8)</span>
          <span>ENERGY (Eₙ)</span>
        </div>

        {filteredStates.map((st) => {
          const isActive = st.n === activeN;
          return (
            <div
              key={st.n}
              className={`state-row ${isActive ? 'active' : ''}`}
              onClick={() => setActiveN(st.n)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveN(st.n);
                }
              }}
            >
              <div className="state-left-cell">
                <span
                  className={`status-dot ${st.isBound ? 'bound' : 'leaking'}`}
                  title={st.isBound ? 'Bound state (E < V)' : 'Leaking state (E ≥ V)'}
                />
                <div className="state-info">
                  <span className="state-n-label">n = {st.n}</span>
                  <span className="state-sub-desc">{st.title}</span>
                </div>
              </div>

              {/* Live-updated, right-aligned energy column */}
              <div className="state-energy-col">
                <span className="state-energy-val">{st.E.toFixed(3)}</span>
                <span className="state-energy-unit">
                  {st.isBound ? 'BOUND' : 'LEAK'}
                </span>
              </div>
            </div>
          );
        })}

        {filteredStates.length === 0 && (
          <div
            style={{
              padding: '16px 8px',
              textAlign: 'center',
              color: 'var(--ink-muted)',
              fontSize: '11px',
            }}
          >
            No matching eigenstates found
          </div>
        )}
      </div>
    </aside>
  );
};
