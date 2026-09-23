import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { StateItem, TransitionItem } from '../../physics/useQuantumState';

interface TransitionLinesProps {
  L: number;
  activeN: number;
  states: StateItem[];
  allowedTransitions: TransitionItem[];
  coupledTargetNs: Set<number>;
}

export const TransitionLines: React.FC<TransitionLinesProps> = ({
  L,
  activeN,
  states,
  allowedTransitions,
  coupledTargetNs,
}) => {
  const halfL = L / 2;
  const backZ = -0.68;
  const maxH = 2.1;

  // Max energy for normalization of level shelves
  const maxE = useMemo(() => {
    return Math.max(...states.map((s) => s.E), 1.0);
  }, [states]);

  // Compute 3D position for each state's energy rail along the back wall
  const statePositions = useMemo(() => {
    const map = new Map<number, THREE.Vector3>();
    for (const st of states) {
      const normalizedE = Math.min(1.0, Math.max(0.04, st.E / maxE));
      const y = normalizedE * maxH;
      map.set(st.n, new THREE.Vector3(0, y, backZ));
    }
    return map;
  }, [states, maxE, maxH, backZ]);

  // Generate thin connecting curve lines from active state to each allowed transition target
  const transitionCurves = useMemo(() => {
    const lines: { geometry: THREE.BufferGeometry; targetN: number; strength: number }[] = [];
    const sourcePos = statePositions.get(activeN);
    if (!sourcePos) return lines;

    for (const tr of allowedTransitions) {
      const targetPos = statePositions.get(tr.targetN);
      if (!targetPos) continue;

      // Create an elegant arc curving slightly forward toward the well interior
      const midY = (sourcePos.y + targetPos.y) / 2;
      const arcForwardZ = backZ + 0.35 + tr.relativeStrength * 0.2;
      const arcSideX = (tr.targetN % 2 === 0 ? 0.25 : -0.25) * (tr.deltaN * 0.15);

      const curve = new THREE.QuadraticBezierCurve3(
        sourcePos,
        new THREE.Vector3(arcSideX, midY, arcForwardZ),
        targetPos
      );

      const points = curve.getPoints(36);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push({
        geometry,
        targetN: tr.targetN,
        strength: tr.relativeStrength,
      });
    }

    return lines;
  }, [activeN, allowedTransitions, statePositions, backZ]);

  return (
    <group>
      {/* Energy Level Rails & Markers along the back wall */}
      {states.map((st) => {
        const isSelected = st.n === activeN;
        const isCoupled = coupledTargetNs.has(st.n);

        // Desaturate non-selected, non-coupled states to muted grey
        const railColor = isSelected
          ? '#8B4A3B'
          : isCoupled
          ? '#C2673B'
          : '#8A8270'; // muted grey

        const railOpacity = isSelected ? 0.95 : isCoupled ? 0.75 : 0.22;
        const lineWidth = isSelected ? 2.5 : isCoupled ? 1.5 : 1.0;

        const pos = statePositions.get(st.n);
        if (!pos) return null;

        const shelfPoints = [
          new THREE.Vector3(-halfL * 0.85, pos.y, backZ),
          new THREE.Vector3(halfL * 0.85, pos.y, backZ),
        ];
        const shelfGeo = new THREE.BufferGeometry().setFromPoints(shelfPoints);

        return (
          <group key={st.n}>
            {/* Horizontal level line */}
            <primitive
              object={
                new THREE.Line(
                  shelfGeo,
                  new THREE.LineBasicMaterial({
                    color: railColor,
                    transparent: true,
                    opacity: railOpacity,
                    linewidth: lineWidth,
                  })
                )
              }
            />

            {/* Central node energy marker pin */}
            <mesh position={pos}>
              <sphereGeometry args={[isSelected ? 0.045 : isCoupled ? 0.035 : 0.022, 16, 16]} />
              <meshBasicMaterial
                color={railColor}
                transparent
                opacity={isSelected ? 1.0 : isCoupled ? 0.9 : 0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Thin connecting lines from selected state to allowed transition targets */}
      {transitionCurves.map((tc) => (
        <primitive
          key={tc.targetN}
          object={
            new THREE.Line(
              tc.geometry,
              new THREE.LineBasicMaterial({
                color: '#8B4A3B',
                transparent: true,
                opacity: 0.65 + tc.strength * 0.3,
                linewidth: 1.5,
              })
            )
          }
        />
      ))}
    </group>
  );
};
