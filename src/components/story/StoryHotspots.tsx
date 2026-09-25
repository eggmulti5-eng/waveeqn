import React from 'react';
import { HelpCircle } from 'lucide-react';
import { TOUR_STEPS } from './StorySpotlight';

interface StoryHotspotsProps {
  isVisible: boolean;
  onSelectStepIndex: (index: number) => void;
}

/**
 * StoryHotspots
 * -------------
 * Optional interactive glowing beacon pins anchored next to major UI elements
 * (state list, well toggle, sliders, slots, toolbar, inspector).
 * When enabled or hovered, clicking a beacon launches AXIOM's spotlight tour on that element.
 */
export const StoryHotspots: React.FC<StoryHotspotsProps> = ({
  isVisible,
  onSelectStepIndex,
}) => {
  if (!isVisible) return null;

  return (
    <div className="story-hotspots-layer" style={{ pointerEvents: 'none' }}>
      {TOUR_STEPS.map((step, index) => {
        return (
          <HotspotBeacon
            key={step.id}
            stepIndex={index}
            selector={step.selector}
            label={step.title}
            onClick={() => onSelectStepIndex(index)}
          />
        );
      })}
    </div>
  );
};

interface HotspotBeaconProps {
  stepIndex: number;
  selector: string;
  label: string;
  onClick: () => void;
}

const HotspotBeacon: React.FC<HotspotBeaconProps> = ({
  stepIndex,
  selector,
  label,
  onClick,
}) => {
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    const update = () => {
      const el = document.querySelector(selector);
      if (!el) {
        setCoords(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      // Position at top-right corner of the target element
      setCoords({
        top: Math.max(8, rect.top + 4),
        left: Math.min(window.innerWidth - 30, rect.right - 24),
      });
    };

    update();
    const timer = setTimeout(update, 200);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [selector]);

  if (!coords) return null;

  return (
    <button
      type="button"
      className="story-hotspot-pin"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        pointerEvents: 'auto',
        zIndex: 85,
      }}
      onClick={onClick}
      title={`Learn about: ${label}`}
      aria-label={`Learn about ${label}`}
    >
      <span className="story-hotspot-pulse" />
      <span className="story-hotspot-icon">?</span>
    </button>
  );
};
