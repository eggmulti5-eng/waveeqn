import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';

const xrStore = createXRStore({ emulate: false });
import { GroundPlatform } from './GroundPlatform';
import { PotentialWellMesh } from './PotentialWellMesh';
import { WavefunctionRibbon } from './WavefunctionRibbon';
import { GhostWavefunctionRibbon } from './GhostWavefunctionRibbon';
import { TransitionLines } from './TransitionLines';
import type {
  WellType,
  WavefunctionData,
  StateItem,
  TransitionItem,
  SavedSlot,
} from '../../physics/useQuantumState';

interface ObservationChamberProps {
  L: number;
  wellType: WellType;
  V: number;
  activeN: number;
  wavefunctionData: WavefunctionData;
  states: StateItem[];
  allowedTransitions: TransitionItem[];
  coupledTargetNs: Set<number>;
  displayMode?: 'psi' | 'prob';
  isCrossSection?: boolean;
  cameraResetTrigger?: number;
  onZoomChange?: (zoomPct: number) => void;
  isCompareActive?: boolean;
  slotA?: SavedSlot | null;
  slotB?: SavedSlot | null;
  zoomPct?: number;
}

const ChamberControls: React.FC<{
  cameraResetTrigger?: number;
  onZoomChange?: (zoomPct: number) => void;
  zoomPct?: number;
}> = ({ cameraResetTrigger, onZoomChange, zoomPct }) => {
  const controlsRef = useRef<any>(null);
  const defaultDist = 5.81;

  useEffect(() => {
    if (cameraResetTrigger != null && cameraResetTrigger > 0) {
      controlsRef.current?.reset();
      onZoomChange?.(100);
    }
  }, [cameraResetTrigger, onZoomChange]);

  // Synchronize external zoom button clicks to the OrbitControls camera distance
  useEffect(() => {
    if (!controlsRef.current || zoomPct === undefined) return;
    
    const targetDist = (defaultDist * 100) / zoomPct;
    
    const target = controlsRef.current.target;
    const position = controlsRef.current.object.position;
    
    const dx = position.x - target.x;
    const dy = position.y - target.y;
    const dz = position.z - target.z;
    const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Only apply if the difference is significant (prevents fight with user scroll)
    if (Math.abs(targetDist - currentDist) > 0.05) {
      const scale = targetDist / currentDist;
      position.set(
        target.x + dx * scale,
        target.y + dy * scale,
        target.z + dz * scale
      );
      controlsRef.current.update();
    }
  }, [zoomPct]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleChange = () => {
      if (controls && onZoomChange) {
        const dist = controls.getDistance ? controls.getDistance() : defaultDist;
        if (dist > 0) {
          const pct = Math.round((defaultDist / dist) * 100);
          onZoomChange(Math.min(300, Math.max(30, pct)));
        }
      }
    };

    controls.addEventListener('change', handleChange);
    return () => {
      controls.removeEventListener('change', handleChange);
    };
  }, [onZoomChange]);

  return (
    <>
      {/* Perspective Camera with angled observation view */}
      <PerspectiveCamera
        makeDefault
        fov={42}
        position={[0, 2.8, 5.4]}
      />

      {/* OrbitControls: User navigation around the chamber */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.8}
        maxDistance={12.0}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={[0, 0.65, 0]}
      />
    </>
  );
};

export const ObservationChamber: React.FC<ObservationChamberProps> = ({
  L,
  wellType,
  V,
  activeN,
  wavefunctionData,
  states,
  allowedTransitions,
  coupledTargetNs,
  displayMode = 'psi',
  isCrossSection = false,
  cameraResetTrigger = 0,
  onZoomChange,
  isCompareActive = false,
  slotA = null,
  slotB = null,
  zoomPct,
}) => {
  // Determine if dual comparative overlay is active
  const isDualCompare = Boolean(isCompareActive && slotA && slotB);

  // If comparing, Slot A acts as primary reference; otherwise current parameters
  const primaryL = isDualCompare && slotA ? slotA.L : L;
  const primaryWellType = isDualCompare && slotA ? slotA.wellType : wellType;
  const primaryV = isDualCompare && slotA ? slotA.V : V;
  const primaryWf = isDualCompare && slotA ? slotA.wavefunctionData : wavefunctionData;

  const [vrSupported, setVrSupported] = React.useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr) {
      (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setVrSupported(supported);
      });
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {vrSupported && (
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 9999 }}>
          <button 
            onClick={() => {
              xrStore.enterVR().catch(console.error);
            }}
            style={{ 
              padding: '12px 24px', 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-family)', 
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            Enter VR
          </button>
        </div>
      )}
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <XR store={xrStore}>
          <XROrigin position={[0, 1.2, 4]} />
          <ChamberControls
            cameraResetTrigger={cameraResetTrigger}
            onZoomChange={onZoomChange}
            zoomPct={zoomPct}
          />

        {/* Warm Ambient & Directional Architectural Lighting */}
        <ambientLight intensity={0.85} color="#F5EFDD" />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.4}
          color="#FFFDF5"
        />
        <directionalLight
          position={[-5, 4, -4]}
          intensity={0.5}
          color="#DBD2B3"
        />
        <pointLight
          position={[0, 1.8, 2]}
          intensity={0.6}
          color="#8B4A3B"
          distance={6}
        />

        {/* Ground Platform with procedural grid / hatching */}
        <GroundPlatform showGrid={!isCrossSection} />

        {/* Translucent 3D Potential Well Trough (includes Slot B boundaries when comparing) */}
        <PotentialWellMesh
          L={primaryL}
          wellType={primaryWellType}
          V={primaryV}
          depth={1.4}
          isCrossSection={isCrossSection}
          slotBWell={isDualCompare && slotB ? slotB : null}
        />

        {/* Allowed Transition Connecting Lines & Energy Level Shelves */}
        <TransitionLines
          L={primaryL}
          activeN={activeN}
          states={states}
          allowedTransitions={allowedTransitions}
          coupledTargetNs={coupledTargetNs}
        />

        {/* Primary Wavefunction Extruded Ribbon (Slot A or current state) */}
        <WavefunctionRibbon
          wavefunctionData={primaryWf}
          mode={displayMode}
        />

        {/* Secondary Ghost Wavefunction Ribbon (Slot B, rendered when Compare is active) */}
        {isDualCompare && slotB && (
          <GhostWavefunctionRibbon
            wavefunctionData={slotB.wavefunctionData}
            mode={displayMode}
          />
        )}
        </XR>
      </Canvas>
    </div>
  );
};
