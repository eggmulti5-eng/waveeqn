import React from 'react';
import { SlidersHorizontal, Home } from 'lucide-react';

interface TopBarProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onBackToLanding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isRightPanelOpen,
  onToggleRightPanel,
  onBackToLanding,
}) => {
  return (
    <header className="top-bar">
      <div className="breadcrumb-container">
        {/* Home button — returns to landing page */}
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
