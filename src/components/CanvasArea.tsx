import React from 'react';
import { TopBar } from './TopBar';
import { FloatingToolbar } from './FloatingToolbar';
import { ObservationChamber } from './chamber/ObservationChamber';
import type {
  WellType,
  WavefunctionData,
  StateItem,
  TransitionItem,
  SavedSlot,
} from '../physics/useQuantumState';

interface CanvasAreaProps {
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  L: number;
  wellType: WellType;
  V: number;
  activeN: number;
  wavefunctionData: WavefunctionData;
  states: StateItem[];
  allowedTransitions: TransitionItem[];
  coupledTargetNs: Set<number>;
  displayMode: 'psi' | 'prob';
  setDisplayMode: (mode: 'psi' | 'prob') => void;
  isCompareActive: boolean;
  setIsCompareActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  isCrossSection: boolean;
  setIsCrossSection: (cs: boolean | ((prev: boolean) => boolean)) => void;
  zoomPct: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  cameraResetTrigger: number;
  onZoomChange: (pct: number) => void;
  slotA?: SavedSlot | null;
  slotB?: SavedSlot | null;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  isRightPanelOpen,
  onToggleRightPanel,
  L,
  wellType,
  V,
  activeN,
  wavefunctionData,
  states,
  allowedTransitions,
  coupledTargetNs,
  displayMode,
  setDisplayMode,
  isCompareActive,
  setIsCompareActive,
  isCrossSection,
  setIsCrossSection,
  zoomPct,
  onZoomIn,
  onZoomOut,
  onReset,
  cameraResetTrigger,
  onZoomChange,
  slotA = null,
  slotB = null,
}) => {
  return (
    <main className="canvas-area">
      {/* 3D Quantum Observation Chamber */}
      <ObservationChamber
        L={L}
        wellType={wellType}
        V={V}
        activeN={activeN}
        wavefunctionData={wavefunctionData}
        states={states}
        allowedTransitions={allowedTransitions}
        coupledTargetNs={coupledTargetNs}
        displayMode={displayMode}
        isCrossSection={isCrossSection}
        cameraResetTrigger={cameraResetTrigger}
        onZoomChange={onZoomChange}
        isCompareActive={isCompareActive}
        slotA={slotA}
        slotB={slotB}
      />

      {/* Top Bar Over Canvas with live breadcrumb */}
      <TopBar
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={onToggleRightPanel}
        wellType={wellType}
        activeN={activeN}
        isBound={wavefunctionData.isBound}
      />

      {/* Bottom-Center Floating Toolbar */}
      <FloatingToolbar
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        isCompareActive={isCompareActive}
        setIsCompareActive={setIsCompareActive}
        isCrossSection={isCrossSection}
        setIsCrossSection={setIsCrossSection}
        zoomPct={zoomPct}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
      />
    </main>
  );
};
