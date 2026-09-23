import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { WellType } from '../../physics/useQuantumState';

interface PotentialWellMeshProps {
  /** Well width L */
  L: number;
  /** Well type: infinite or finite */
  wellType?: WellType;
  /** Barrier height V (for finite well) */
  V?: number;
  /** Well depth along Z-axis */
  depth?: number;
  /** Whether to render in hatched/wireframe cross-section mode */
  isCrossSection?: boolean;
  /** Optional comparative Slot B well parameters for overlay */
  slotBWell?: { L: number; wellType: WellType; V: number } | null;
}

export const PotentialWellMesh: React.FC<PotentialWellMeshProps> = ({
  L,
  wellType = 'infinite',
  V = 60,
  depth = 1.4,
  isCrossSection = false,
  slotBWell = null,
}) => {
  const halfL = L / 2;
  const halfD = depth / 2;

  // Barrier height for 3D visualization
  const wallHeight = wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, V * 0.025));

  // Construct dynamic edge lines for the well structure
  const edgeLines = useMemo(() => {
    const points: THREE.Vector3[] = [];

    // Well floor perimeter
    points.push(new THREE.Vector3(-halfL, 0, -halfD));
    points.push(new THREE.Vector3(halfL, 0, -halfD));
    points.push(new THREE.Vector3(halfL, 0, halfD));
    points.push(new THREE.Vector3(-halfL, 0, halfD));
    points.push(new THREE.Vector3(-halfL, 0, -halfD));

    // Left barrier wall
    points.push(new THREE.Vector3(-halfL, wallHeight, -halfD));
    points.push(new THREE.Vector3(-halfL, wallHeight, halfD));
    points.push(new THREE.Vector3(-halfL, 0, halfD));

    // Right barrier wall
    points.push(new THREE.Vector3(halfL, 0, halfD));
    points.push(new THREE.Vector3(halfL, wallHeight, halfD));
    points.push(new THREE.Vector3(halfL, wallHeight, -halfD));
    points.push(new THREE.Vector3(halfL, 0, -halfD));

    // Back wall top rail
    points.push(new THREE.Vector3(halfL, wallHeight, -halfD));
    points.push(new THREE.Vector3(-halfL, wallHeight, -halfD));

    // If finite well, draw outer barrier step plateaus
    if (wellType === 'finite') {
      const outerL = halfL + L * 0.8;
      // Left plateau
      points.push(new THREE.Vector3(-outerL, wallHeight, -halfD));
      points.push(new THREE.Vector3(-outerL, wallHeight, halfD));
      points.push(new THREE.Vector3(-halfL, wallHeight, halfD));

      // Right plateau
      points.push(new THREE.Vector3(halfL, wallHeight, halfD));
      points.push(new THREE.Vector3(outerL, wallHeight, halfD));
      points.push(new THREE.Vector3(outerL, wallHeight, -halfD));
      points.push(new THREE.Vector3(halfL, wallHeight, -halfD));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [halfL, halfD, wallHeight, wellType, L]);

  return (
    <group>
      {/* Well Floor (translucent acrylic or wireframe cross-section) */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[L, depth, isCrossSection ? 12 : 1, isCrossSection ? 8 : 1]} />
        <meshStandardMaterial
          color="#E4E1C7"
          transparent
          opacity={isCrossSection ? 0.8 : 0.35}
          side={THREE.DoubleSide}
          roughness={0.7}
          wireframe={isCrossSection}
        />
      </mesh>

      {/* Left Barrier Wall (x = -L/2) */}
      <mesh position={[-halfL, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, wallHeight, isCrossSection ? 8 : 1, isCrossSection ? 12 : 1]} />
        <meshStandardMaterial
          color="#8A8270"
          transparent
          opacity={isCrossSection ? 0.8 : 0.22}
          side={THREE.DoubleSide}
          roughness={0.5}
          wireframe={isCrossSection}
        />
      </mesh>

      {/* Right Barrier Wall (x = +L/2) */}
      <mesh position={[halfL, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, wallHeight, isCrossSection ? 8 : 1, isCrossSection ? 12 : 1]} />
        <meshStandardMaterial
          color="#8A8270"
          transparent
          opacity={isCrossSection ? 0.8 : 0.22}
          side={THREE.DoubleSide}
          roughness={0.5}
          wireframe={isCrossSection}
        />
      </mesh>

      {/* Back Enclosure Wall */}
      <mesh position={[0, wallHeight / 2, -halfD]}>
        <planeGeometry args={[L, wallHeight, isCrossSection ? 12 : 1, isCrossSection ? 12 : 1]} />
        <meshStandardMaterial
          color="#DBD2B3"
          transparent
          opacity={isCrossSection ? 0.8 : 0.15}
          side={THREE.DoubleSide}
          roughness={0.6}
          wireframe={isCrossSection}
        />
      </mesh>

      {/* Finite Well Elevated Barrier Plateaus (representing potential step V) */}
      {wellType === 'finite' && (
        <>
          {/* Left Barrier Step */}
          <mesh
            position={[-halfL - (L * 0.8) / 2, wallHeight, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[L * 0.8, depth]} />
            <meshStandardMaterial
              color="#DBD2B3"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Right Barrier Step */}
          <mesh
            position={[halfL + (L * 0.8) / 2, wallHeight, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[L * 0.8, depth]} />
            <meshStandardMaterial
              color="#DBD2B3"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Architectural Wireframe Outlines */}
      <primitive
        object={
          new THREE.Line(
            edgeLines,
            new THREE.LineBasicMaterial({
              color: '#3A332A',
              opacity: 0.5,
              transparent: true,
            })
          )
        }
      />

      {/* Boundary Marker Pillars */}
      <mesh position={[-halfL, wallHeight / 2, -halfD]}>
        <cylinderGeometry args={[0.015, 0.015, wallHeight, 8]} />
        <meshBasicMaterial color="#3A332A" />
      </mesh>
      <mesh position={[-halfL, wallHeight / 2, halfD]}>
        <cylinderGeometry args={[0.015, 0.015, wallHeight, 8]} />
        <meshBasicMaterial color="#3A332A" />
      </mesh>
      <mesh position={[halfL, wallHeight / 2, -halfD]}>
        <cylinderGeometry args={[0.015, 0.015, wallHeight, 8]} />
        <meshBasicMaterial color="#3A332A" />
      </mesh>
      <mesh position={[halfL, wallHeight / 2, halfD]}>
        <cylinderGeometry args={[0.015, 0.015, wallHeight, 8]} />
        <meshBasicMaterial color="#3A332A" />
      </mesh>

      {/* Comparative Slot B Well Outline (if different from Slot A) */}
      {slotBWell && (slotBWell.L !== L || slotBWell.wellType !== wellType) && (
        <group>
          {/* Slot B boundary markers in distinct cyan */}
          <mesh
            position={[
              -slotBWell.L / 2,
              (slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025))) / 2,
              -halfD,
            ]}
          >
            <cylinderGeometry
              args={[
                0.012,
                0.012,
                slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025)),
                8,
              ]}
            />
            <meshBasicMaterial color="#38A89D" />
          </mesh>
          <mesh
            position={[
              -slotBWell.L / 2,
              (slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025))) / 2,
              halfD,
            ]}
          >
            <cylinderGeometry
              args={[
                0.012,
                0.012,
                slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025)),
                8,
              ]}
            />
            <meshBasicMaterial color="#38A89D" />
          </mesh>
          <mesh
            position={[
              slotBWell.L / 2,
              (slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025))) / 2,
              -halfD,
            ]}
          >
            <cylinderGeometry
              args={[
                0.012,
                0.012,
                slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025)),
                8,
              ]}
            />
            <meshBasicMaterial color="#38A89D" />
          </mesh>
          <mesh
            position={[
              slotBWell.L / 2,
              (slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025))) / 2,
              halfD,
            ]}
          >
            <cylinderGeometry
              args={[
                0.012,
                0.012,
                slotBWell.wellType === 'infinite' ? 2.4 : Math.min(2.4, Math.max(0.8, slotBWell.V * 0.025)),
                8,
              ]}
            />
            <meshBasicMaterial color="#38A89D" />
          </mesh>

          {/* Slot B floor perimeter outline */}
          <primitive
            object={
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(-slotBWell.L / 2, 0.003, -halfD),
                  new THREE.Vector3(slotBWell.L / 2, 0.003, -halfD),
                  new THREE.Vector3(slotBWell.L / 2, 0.003, halfD),
                  new THREE.Vector3(-slotBWell.L / 2, 0.003, halfD),
                  new THREE.Vector3(-slotBWell.L / 2, 0.003, -halfD),
                ]),
                new THREE.LineBasicMaterial({
                  color: '#38A89D',
                  transparent: true,
                  opacity: 0.85,
                })
              )
            }
          />
        </group>
      )}
    </group>
  );
};
