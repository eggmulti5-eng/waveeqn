import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AxiomPortrait } from './AxiomPortrait';
import { ChevronLeft, ChevronRight, X, Sparkles, HelpCircle } from 'lucide-react';

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  badge: string;
  axiomText: string;
  practicalTip?: string;
  panelToOpen?: 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'state-list',
    selector: '[data-tour="state-list"]',
    title: 'Eigenstate Roster (n = 1..8)',
    badge: 'LEFT PANEL',
    axiomText:
      "Every trapped particle exists in discrete quantum eigenstates! Here you see levels n=1 to 8. E_n is the exact energy. The status dot shows if the particle is strictly BOUND (green dot, E < V) or LEAKING into the barrier (amber dot, E ≥ V).",
    practicalTip: 'Click any row to instantly focus that quantum state.',
  },
  {
    id: 'well-toggle',
    selector: '[data-tour="well-toggle"]',
    title: 'Potential Well Model',
    badge: 'LEFT PANEL',
    axiomText:
      "Choose between INFINITE and FINITE well models. Infinite wells have impenetrable walls with exact analytical solutions. Finite wells allow the wavefunction to tunnel into the barrier—solved numerically in real time!",
    practicalTip: 'Switch to FINITE to observe quantum leakage and tunnelling.',
  },
  {
    id: 'slider-L',
    selector: '[data-tour="slider-L"]',
    title: 'Well Width Slider (L)',
    badge: 'PARAMETERS',
    axiomText:
      "Tuning well width (L) adjusts spatial confinement. Energy scales inversely with width squared (E ∝ 1/L²). Doubling the width drops ground-state energy to a quarter of its value!",
    practicalTip: 'Drag L to expand or contract the chamber.',
  },
  {
    id: 'slider-m',
    selector: '[data-tour="slider-m"]',
    title: 'Particle Mass Slider (m)',
    badge: 'PARAMETERS',
    axiomText:
      "Heavier particles have shorter quantum wavelengths. Increasing mass packs the wavefunction tighter and compresses the entire energy level ladder.",
    practicalTip: 'Adjust m to see how particle inertia shapes quantum states.',
  },
  {
    id: 'slider-V',
    selector: '[data-tour="slider-V"]',
    title: 'Barrier Height Slider (V)',
    badge: 'PARAMETERS',
    axiomText:
      "Only active in FINITE mode! Sets the energy height of the potential walls. Lowering V lets wavefunction tails seep deeper into the forbidden zone.",
    practicalTip: 'Drop V low to watch states leak over the barrier.',
  },
  {
    id: 'slots',
    selector: '[data-tour="slots"]',
    title: 'Comparison Slots (A & B)',
    badge: 'COMPARE LAB',
    axiomText:
      "Save your current quantum state into Slot A or Slot B. This allows side-by-side comparison of different widths, masses, or energy states via the ghost ribbon and DIFF inspector!",
    practicalTip: 'Save a state to Slot A, tweak a slider, then turn on COMPARE.',
  },
  {
    id: 'toolbar-psi',
    selector: '[data-tour="toolbar-psi"]',
    title: 'ψ Amplitude vs |ψ|² Probability',
    badge: 'BOTTOM TOOLBAR',
    axiomText:
      "ψ(x) is the complex amplitude—it can swing negative. |ψ(x)|² is the Born rule probability density: the actual measurable chance of finding the particle at position x.",
    practicalTip: 'Toggle between them to see negative lobes flip positive.',
  },
  {
    id: 'toolbar-compare',
    selector: '[data-tour="toolbar-compare"]',
    title: 'Compare Ghost Ribbon',
    badge: 'BOTTOM TOOLBAR',
    axiomText:
      "Toggles a semi-transparent, dashed reference ribbon in the 3D chamber. It displays your saved Slot configuration directly underneath your active wavefunction!",
    practicalTip: 'Essential for seeing subtle wavefunction distortions.',
  },
  {
    id: 'toolbar-cross-section',
    selector: '[data-tour="toolbar-cross-section"]',
    title: 'Chamber Cross-Section',
    badge: 'BOTTOM TOOLBAR',
    axiomText:
      "Switches the 3D chamber between solid cutaway and wireframe view, letting you inspect the internal wave geometry without visual obstruction.",
    practicalTip: 'Use wireframe when viewing complex high-n states.',
  },
  {
    id: 'toolbar-camera',
    selector: '[data-tour="toolbar-camera"]',
    title: '3D Camera Controls & Reset',
    badge: 'BOTTOM TOOLBAR',
    axiomText:
      "Left-drag to orbit the chamber in 3D. Right-drag to pan. Scroll wheel zooms. The RESET button restores camera position and chamber parameters back to clean baseline.",
    practicalTip: 'Try orbiting from top-down to see nodes clearly.',
  },
  {
    id: 'inspector',
    selector: '[data-tour="inspector"]',
    title: 'Quantum Inspector & Dipole Selection',
    badge: 'RIGHT PANEL',
    axiomText:
      "Examines exact physical observables: energy E_n, node count, and spatial parity. It also computes dipole optical transitions: selection rules forbid even-parity transitions (Δn must be odd)!",
    practicalTip: 'Click any transition to jump directly to that state.',
    panelToOpen: 'right',
  },
];

interface StorySpotlightProps {
  activeTourStepIndex: number | null;
  onSelectStepIndex: (index: number | null) => void;
  onOpenRightPanel?: () => void;
  // Dynamic spotlight triggered by story dialogue beat
  highlightSelector?: string | null;
}

export const StorySpotlight: React.FC<StorySpotlightProps> = ({
  activeTourStepIndex,
  onSelectStepIndex,
  onOpenRightPanel,
  highlightSelector,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [activeStep, setActiveStep] = useState<TourStep | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const isTourActive = activeTourStepIndex !== null;

  // Determine effective selector: tour step has priority, followed by dialogue highlight
  const currentSelector = isTourActive
    ? TOUR_STEPS[activeTourStepIndex]?.selector
    : highlightSelector;

  // Update target rect when selector changes
  const updateRect = useCallback(() => {
    if (!currentSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentSelector]);

  // Synchronize active step
  useEffect(() => {
    if (activeTourStepIndex !== null) {
      const step = TOUR_STEPS[activeTourStepIndex];
      setActiveStep(step);
      if (step.panelToOpen === 'right' && onOpenRightPanel) {
        onOpenRightPanel();
      }
    } else {
      setActiveStep(null);
    }
  }, [activeTourStepIndex, onOpenRightPanel]);

  // Track position and resize/scroll
  useEffect(() => {
    updateRect();

    // Re-check after brief delay in case panels are animating open
    const timer = setTimeout(updateRect, 180);

    const onScrollOrResize = () => updateRect();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [updateRect, activeTourStepIndex, highlightSelector]);

  // Step navigation
  const handleNext = () => {
    if (activeTourStepIndex !== null) {
      const next = (activeTourStepIndex + 1) % TOUR_STEPS.length;
      onSelectStepIndex(next);
    }
  };

  const handlePrev = () => {
    if (activeTourStepIndex !== null) {
      const prev =
        (activeTourStepIndex - 1 + TOUR_STEPS.length) % TOUR_STEPS.length;
      onSelectStepIndex(prev);
    }
  };

  const handleClose = () => {
    onSelectStepIndex(null);
  };

  // Keyboard navigation for tour
  useEffect(() => {
    if (!isTourActive) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTourActive, activeTourStepIndex]);

  if (!targetRect && !isTourActive) return null;

  // Compute position for spotlight cutout
  const padding = 6;
  const top = targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const left = targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const width = targetRect ? targetRect.width + padding * 2 : 0;
  const height = targetRect ? targetRect.height + padding * 2 : 0;

  // Determine optimal card position (above or below or alongside target)
  const isBottomHalf = top > window.innerHeight * 0.55;
  const cardTop = isBottomHalf
    ? Math.max(20, top - 210)
    : Math.min(window.innerHeight - 240, top + height + 16);
  const cardLeft = Math.min(
    Math.max(20, left + width / 2 - 180),
    window.innerWidth - 380,
  );

  return (
    <div
      className={`story-spotlight-layer ${isTourActive ? 'tour-mode' : 'highlight-mode'}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: isTourActive ? 920 : 80,
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {/* 1. Backdrop Dimming with Cutout */}
      {targetRect && (
        <div
          className="story-spotlight-hole"
          style={{
            position: 'absolute',
            top,
            left,
            width,
            height,
            borderRadius: 8,
            boxShadow: isTourActive
              ? '0 0 0 9999px rgba(18, 16, 14, 0.72), 0 0 24px rgba(139, 74, 59, 0.6)'
              : '0 0 0 9999px rgba(18, 16, 14, 0.35), 0 0 16px rgba(139, 74, 59, 0.45)',
            border: '2px solid var(--accent)',
            transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
          }}
        >
          {/* Animated beacon pulse on highlighted element */}
          <div className="story-spotlight-beacon" />
        </div>
      )}

      {/* 2. Interactive Tour Callout Card (shown when user is browsing UI tour) */}
      {isTourActive && activeStep && (
        <div
          className="story-tour-card"
          style={{
            position: 'absolute',
            top: cardTop,
            left: cardLeft,
            width: 360,
            pointerEvents: 'auto',
          }}
          role="dialog"
          aria-label="UI Feature Guide"
        >
          {/* Top Header */}
          <div className="story-tour-header">
            <div className="story-tour-badge-row">
              <span className="story-tour-tag">{activeStep.badge}</span>
              <span className="story-tour-counter">
                {(activeTourStepIndex ?? 0) + 1} / {TOUR_STEPS.length}
              </span>
            </div>
            <button
              type="button"
              className="story-tour-close-btn"
              onClick={handleClose}
              title="Close feature tour (Esc)"
              aria-label="Close feature tour"
            >
              <X size={14} />
            </button>
          </div>

          {/* Title */}
          <div className="story-tour-title-row">
            <Sparkles size={14} className="story-tour-title-sparkle" />
            <h4 className="story-tour-title">{activeStep.title}</h4>
          </div>

          {/* Body with AXIOM Speech */}
          <div className="story-tour-body">
            <div className="story-tour-avatar">
              <AxiomPortrait mood="happy" size={38} />
            </div>
            <div className="story-tour-text-col">
              <p className="story-tour-text">{activeStep.axiomText}</p>
              {activeStep.practicalTip && (
                <div className="story-tour-tip">
                  <span className="story-tour-tip-label">TIP:</span>{' '}
                  {activeStep.practicalTip}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="story-tour-footer">
            <div className="story-tour-dots">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  className={`story-tour-dot ${idx === activeTourStepIndex ? 'active' : ''}`}
                  onClick={() => onSelectStepIndex(idx)}
                  title={step.title}
                  aria-label={`Jump to ${step.title}`}
                />
              ))}
            </div>

            <div className="story-tour-nav-btns">
              <button
                type="button"
                className="story-tour-nav-btn"
                onClick={handlePrev}
                title="Previous UI element"
              >
                <ChevronLeft size={13} />
                <span>BACK</span>
              </button>
              <button
                type="button"
                className="story-tour-nav-btn primary"
                onClick={handleNext}
                title="Next UI element"
              >
                <span>NEXT</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
