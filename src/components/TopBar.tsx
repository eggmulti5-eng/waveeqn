import React from 'react';
import { SlidersHorizontal, ChevronRight, Home } from 'lucide-react';
import type { WellType } from '../physics/useQuantumState';

interface TopBarProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  wellType?: WellType;
  activeN?: number;
  isBound?: boolean;
  onBackToLanding?: () => void;
  onFocusWellToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isRightPanelOpen,
  onToggleRightPanel,
  wellType = 'infinite',
  activeN = 1,
  isBound = true,
  onBackToLanding,
  onFocusWellToggle,
}) => {
  return (
    <header className="top-bar">
      <div className="breadcrumb-container">
        {/* Small home/exit button to return to landing — unobtrusive */}
        {onBackToLanding && (
          <button
            type="button"
            className="top-bar-home-btn"
            onClick={onBackToLanding}
            title="Back to Home"
            aria-label="Back to Home"
          >
            <Home size={13} />
          </button>
        )}
        <nav aria-label="Breadcrumb" className="breadcrumb-text">
          {/* QUANTUM: clickable — goes back to landing */}
          <span
            className="breadcrumb-link"
            onClick={onBackToLanding}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBackToLanding?.(); }}
            role="button"
            tabIndex={onBackToLanding ? 0 : -1}
            title="Back to landing"
          >
            QUANTUM
          </span>
          <ChevronRight size={12} className="breadcrumb-separator" />
          {/* Well-type segment: clickable — highlights the well toggle in the left panel */}
          <span
            className="breadcrumb-link"
            onClick={onFocusWellToggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFocusWellToggle?.(); }}
            role="button"
            tabIndex={onFocusWellToggle ? 0 : -1}
            title="Focus well-type selector"
          >
            {wellType === 'infinite' ? 'INFINITE_WELL' : 'FINITE_WELL'}
          </span>
          <ChevronRight size={12} className="breadcrumb-separator" />
          {/* State segment: static — non-interactive, reflects current state list selection */}
          <span className="breadcrumb-current" aria-current="page">
            STATE_N={activeN} [{isBound ? 'BOUND' : 'LEAKING'}]
          </span>
        </nav>
      </div>

      <div className="top-bar-actions">
        <button
          type="button"
          className={`top-bar-btn ${isRightPanelOpen ? 'active' : ''}`}
          onClick={onToggleRightPanel}
          title="Toggle Parameters Inspector"
          aria-expanded={isRightPanelOpen}
        >
          <SlidersHorizontal size={13} />
          <span>INSPECTOR</span>
        </button>
      </div>
    </header>
  );
};
