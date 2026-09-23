import React, { useState } from 'react';
import './App.css';
import { LeftPanel } from './components/LeftPanel';
import { CanvasArea } from './components/CanvasArea';
import { RightPanel } from './components/RightPanel';
import { useQuantumState } from './physics/useQuantumState';

export const App: React.FC = () => {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [zoomPct, setZoomPct] = useState(100);

  // Unified quantum physics state hook
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
  } = useQuantumState();

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

  return (
    <div className="app-container">
      {/* Left panel: 280px, fixed height, wired to physics engine */}
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

      {/* Center canvas: full-bleed 3D Observation Chamber with TopBar and FloatingToolbar */}
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
      />

      {/* Right panel: 320px, slides in with 200ms ease-out transform */}
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
    </div>
  );
};

export default App;
