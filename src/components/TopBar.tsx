import React from 'react';
import { SlidersHorizontal, Home, HelpCircle, X } from 'lucide-react';

interface TopBarProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onBackToLanding?: () => void;
  isTourModeEnabled?: boolean;
  onToggleTourMode?: () => void;
  showNewHere?: boolean;
  onDismissNewHere?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isRightPanelOpen,
  onToggleRightPanel,
  onBackToLanding,
  isTourModeEnabled,
  onToggleTourMode,
  showNewHere,
  onDismissNewHere,
}) => {
  return (
    <header className="top-bar">
      <div className="breadcrumb-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Home button — returns to landing page */}
        {onBackToLanding && (
          <button
            type="button"
            className="top-bar-home-btn"
            onClick={onBackToLanding}
            title="Back to Home"
            aria-label="Back to Home"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Home size={13} />
          </button>
        )}

        {onToggleTourMode && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className={`top-bar-btn ${isTourModeEnabled ? 'active' : ''}`}
              onClick={onToggleTourMode}
              title="Toggle UI Tour Hotspots"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                letterSpacing: '0.5px',
                color: isTourModeEnabled ? '#C2543B' : '#8CA4B5',
                backgroundColor: isTourModeEnabled ? 'rgba(194, 84, 59, 0.1)' : 'transparent',
                border: `1px solid ${isTourModeEnabled ? 'rgba(194, 84, 59, 0.5)' : 'transparent'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <HelpCircle size={13} />
              <span>{isTourModeEnabled ? 'EXIT TOUR' : 'UI TOUR'}</span>
            </button>
            {showNewHere && !isTourModeEnabled && (
              <div
                style={{
                  position: 'absolute',
                  left: '100%',
                  marginLeft: '12px',
                  whiteSpace: 'nowrap',
                  background: '#C2543B',
                  color: '#1E232B',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'pulse-fade 2s infinite alternate',
                }}
              >
                <span>New here? Check UI TOUR</span>
                <button
                  onClick={onDismissNewHere}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1E232B',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Dismiss"
                >
                  <X size={12} />
                </button>
                <div
                  style={{
                    position: 'absolute',
                    left: '-4px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                    width: '8px',
                    height: '8px',
                    background: '#C2543B',
                    zIndex: -1,
                  }}
                />
              </div>
            )}
          </div>
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
