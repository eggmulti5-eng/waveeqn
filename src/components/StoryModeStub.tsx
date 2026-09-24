import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StoryModeStubProps {
  onBackToLanding: () => void;
}

export const StoryModeStub: React.FC<StoryModeStubProps> = ({
  onBackToLanding,
}) => {
  return (
    <div className="story-mode-stub">
      <div className="story-mode-grid-bg" />

      <div className="story-mode-content">
        {/* Back navigation */}
        <button
          type="button"
          className="story-back-btn"
          onClick={onBackToLanding}
        >
          <ArrowLeft size={14} />
          <span>BACK TO HOME</span>
        </button>

        <div className="story-mode-center">
          <div className="story-mode-icon">▸</div>
          <h2 className="story-mode-title">Story Mode</h2>
          <p className="story-mode-subtitle">
            A guided journey through quantum mechanics — from the particle in a
            box to tunneling and beyond.
          </p>
          <div className="story-mode-badge">COMING SOON</div>
          <p className="story-mode-hint">
            In the meantime, explore the Sandbox for free-form experimentation.
          </p>
        </div>
      </div>
    </div>
  );
};
