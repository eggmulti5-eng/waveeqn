import React from 'react';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import type { WellType } from '../physics/useQuantumState';

interface TopBarProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  wellType?: WellType;
  activeN?: number;
  isBound?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  isRightPanelOpen,
  onToggleRightPanel,
  wellType = 'infinite',
  activeN = 1,
  isBound = true,
}) => {
  return (
    <header className="top-bar">
      <div className="breadcrumb-container">
        <nav aria-label="Breadcrumb" className="breadcrumb-text">
          <span>QUANTUM</span>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span>{wellType === 'infinite' ? 'INFINITE_WELL' : 'FINITE_WELL'}</span>
          <ChevronRight size={12} className="breadcrumb-separator" />
          <span className="breadcrumb-current">
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
