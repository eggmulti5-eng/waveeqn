import React, { useState, useCallback } from 'react';
import './App.css';
import { LandingPage } from './components/LandingPage';
import { StoryModeOverlay } from './components/story/StoryModeOverlay';
import { LeftPanel } from './components/LeftPanel';
import { CanvasArea } from './components/CanvasArea';
import { RightPanel } from './components/RightPanel';
import { useQuantumState } from './physics/useQuantumState';
import { StorySpotlight } from './components/story/StorySpotlight';
import { StoryHotspots } from './components/story/StoryHotspots';

type AppRoute = 'landing' | 'sandbox' | 'story-mode';

export const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>('landing');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [zoomPct, setZoomPct] = useState(100);

  // Unified quantum physics state hook
  const quantumState = useQuantumState();
  const {
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
    states,
    filteredStates,
    wavefunctionData,
    activeState,
    allowedTransitions,
    coupledTargetNs,
    energySharePercent,
    autoDescription,
    displayMode,
    setDisplayMode,
    isCompareActive,
    setIsCompareActive,
    isCrossSection,
    setIsCrossSection,
    resetAll,
    slotA,
    slotB,
    saveToSlotA,
    saveToSlotB,
    diffStats,
    saveSandboxSnapshot,
    restoreSandboxSnapshot,
    resetToStoryDefaults,
  } = quantumState;

  // ── UI Tour State ───────────────────────────────────────────────────────
  const [isTourModeEnabled, setIsTourModeEnabled] = useState(false);
  const [activeTourStepIndex, setActiveTourStepIndex] = useState<number | null>(null);
  const [showNewHere, setShowNewHere] = useState(true);

  const handleToggleTourMode = useCallback(() => {
    setIsTourModeEnabled((prev) => {
      const next = !prev;
      if (!next) setActiveTourStepIndex(null);
      return next;
    });
    setShowNewHere(false); // dismiss prompt once interacted
  }, []);

  // On state selection: update active state and slide in the right panel!
  const handleSelectState = (n: number) => {
    setActiveN(n);
    setIsRightPanelOpen(true);
  };

  const toggleRightPanel = () => {
    setIsRightPanelOpen((prev) => !prev);
  };

  const closeRightPanel = () => {
    setIsRightPanelOpen(false);
  };

  // Unified Reset: resets camera position AND all sliders/state to default
  const handleUnifiedReset = () => {
    resetAll();
    setCameraResetTrigger((prev) => prev + 1);
    setZoomPct(100);
  };

  const handleZoomIn = () => {
    setZoomPct((prev) => Math.min(250, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomPct((prev) => Math.max(40, prev - 10));
  };

  const handleBackToLanding = () => {
    setRoute('landing');
  };

  // ── Story Mode state isolation ──────────────────────────────────────────
  const handleEnterStoryMode = useCallback(() => {
    saveSandboxSnapshot();        // save sandbox state before switching
    resetToStoryDefaults();       // clean slate for story mode
    setRoute('story-mode');
  }, [saveSandboxSnapshot, resetToStoryDefaults]);

  const handleExitStoryToSandbox = useCallback(() => {
    restoreSandboxSnapshot();     // restore sandbox's last state
    setRoute('sandbox');
  }, [restoreSandboxSnapshot]);

  const handleExitStoryToLanding = useCallback(() => {
    restoreSandboxSnapshot();     // restore sandbox so it's clean next time
    setRoute('landing');
  }, [restoreSandboxSnapshot]);

  // Route: Landing Page
  if (route === 'landing') {
    return (
      <LandingPage
        onEnterSandbox={() => setRoute('sandbox')}
        onEnterStoryMode={handleEnterStoryMode}
      />
    );
  }



  // Route: Sandbox or Story Mode — render the full chamber in both cases.
  // Story mode mounts a transparent overlay on top; the sim stays live.
  const sandboxJsx = (
    <div className="app-container">
      <LeftPanel
        wellType={wellType}
        setWellType={setWellType}
        L={L}
        setL={setL}
        m={m}
        setM={setM}
        V={V}
        setV={setV}
        activeN={activeN}
        setActiveN={handleSelectState}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        states={states}
        filteredStates={filteredStates}
        activeState={activeState}
        slotA={slotA}
        slotB={slotB}
        onSaveSlotA={saveToSlotA}
        onSaveSlotB={saveToSlotB}
      />

      <CanvasArea
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={toggleRightPanel}
        L={L}
        wellType={wellType}
        V={V}
        activeN={activeN}
        wavefunctionData={wavefunctionData}
        states={states}
        allowedTransitions={allowedTransitions}
        coupledTargetNs={coupledTargetNs}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        isCompareActive={isCompareActive}
        setIsCompareActive={setIsCompareActive}
        isCrossSection={isCrossSection}
        setIsCrossSection={setIsCrossSection}
        zoomPct={zoomPct}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleUnifiedReset}
        cameraResetTrigger={cameraResetTrigger}
        onZoomChange={setZoomPct}
        slotA={slotA}
        slotB={slotB}
        onBackToLanding={handleBackToLanding}
        isTourModeEnabled={isTourModeEnabled}
        onToggleTourMode={handleToggleTourMode}
        showNewHere={showNewHere}
        onDismissNewHere={() => setShowNewHere(false)}
      />

      <RightPanel
        isOpen={isRightPanelOpen}
        onClose={closeRightPanel}
        activeN={activeN}
        activeState={activeState}
        autoDescription={autoDescription}
        energySharePercent={energySharePercent}
        allowedTransitions={allowedTransitions}
        onSelectState={handleSelectState}
        isCompareActive={isCompareActive}
        slotA={slotA}
        slotB={slotB}
        diffStats={diffStats}
      />

      {/* ── Global UI Tour Components ── */}
      <StorySpotlight
        activeTourStepIndex={activeTourStepIndex}
        onSelectStepIndex={setActiveTourStepIndex}
        onOpenRightPanel={() => setIsRightPanelOpen(true)}
        highlightSelector={null}
      />
      <StoryHotspots
        isVisible={isTourModeEnabled && activeTourStepIndex === null}
        onSelectStepIndex={setActiveTourStepIndex}
      />

      {/* Story mode overlay — mounts on top, pointer-events:none container */}
      {route === 'story-mode' && (
        <StoryModeOverlay
          currentL={L}
          currentV={V}
          currentE={activeState?.E ?? 0}
          displayMode={displayMode}
          wellType={wellType}
          activeN={activeN}
          wavefunctionData={wavefunctionData}
          onExitToSandbox={handleExitStoryToSandbox}
          onExitToLanding={handleExitStoryToLanding}
          onOpenRightPanel={() => setIsRightPanelOpen(true)}
          isTourActive={activeTourStepIndex !== null}
        />
      )}
    </div>
  );

  return sandboxJsx;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#F5EFDD', backgroundColor: '#1E232B', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#C2543B' }}>Something went wrong.</h2>
          <p>The application encountered an unexpected error.</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', maxWidth: '80%', overflow: 'auto', textAlign: 'left' }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '8px 16px', background: '#38A89D', color: '#1E232B', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
