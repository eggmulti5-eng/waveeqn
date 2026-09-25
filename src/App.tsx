import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import { LandingPage } from './components/LandingPage';
import { StoryModeOverlay } from './components/story/StoryModeOverlay';
import { LeftPanel } from './components/LeftPanel';
import { CanvasArea } from './components/CanvasArea';
import { RightPanel } from './components/RightPanel';
import { useQuantumState } from './physics/useQuantumState';

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
        />
      )}
    </div>
  );

  return sandboxJsx;
};

export default App;
