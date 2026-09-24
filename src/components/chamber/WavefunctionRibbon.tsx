import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { WavefunctionData } from '../../physics/useQuantumState';

interface WavefunctionRibbonProps {
  wavefunctionData: WavefunctionData;
  mode?: 'psi' | 'prob';
}

export const WavefunctionRibbon: React.FC<WavefunctionRibbonProps> = ({
  wavefunctionData,
  mode = 'psi',
}) => {
  const ribbonGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const { x3D, psi, isBound, zeroCrossingX3D } = wavefunctionData;

  // Determine state theme color
  const stateColor = isBound ? '#8B4A3B' : '#C2543B';

  // Construct extruded ribbon geometry from live wavefunction points
  const { ribbonGeometry, curtainGeometry, spineGeometry } = useMemo(() => {
    const N = x3D.length;
    const ribbonHalfWidth = 0.22;
    const ampScale = 1.4;

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curtainVertices: number[] = [];
    const curtainIndices: number[] = [];

    const spinePoints: THREE.Vector3[] = [];

    // Find max amplitude for normalization/scaling if necessary
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const x = x3D[i];
      const psiVal = psi[i] ?? 0;
      const val = mode === 'prob' ? psiVal * psiVal : psiVal;
      const y = val * ampScale;

      // Ribbon vertices (along Z axis)
      vertices.push(x, y, -ribbonHalfWidth);
      vertices.push(x, y, ribbonHalfWidth);

      uvs.push(u, 0);
      uvs.push(u, 1);

      // Spine line along center
      spinePoints.push(new THREE.Vector3(x, y, 0));

      // Curtain vertices (from floor y=0 up to y)
      curtainVertices.push(x, 0, 0);
      curtainVertices.push(x, y, 0);

      if (i < N - 1) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;

        indices.push(v0, v1, v2);
        indices.push(v1, v3, v2);

        curtainIndices.push(v0, v1, v2);
        curtainIndices.push(v1, v3, v2);
      }
    }

    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ribbonGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    ribbonGeo.setIndex(indices);
    ribbonGeo.computeVertexNormals();

    const curtainGeo = new THREE.BufferGeometry();
    curtainGeo.setAttribute('position', new THREE.Float32BufferAttribute(curtainVertices, 3));
    curtainGeo.setIndex(curtainIndices);
    curtainGeo.computeVertexNormals();

    const spineGeo = new THREE.BufferGeometry().setFromPoints(spinePoints);

    return {
      ribbonGeometry: ribbonGeo,
      curtainGeometry: curtainGeo,
      spineGeometry: spineGeo,
    };
  }, [x3D, psi, mode]);

  // Subtle idle breathing pulse animation: scale & opacity oscillation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ribbonGroupRef.current) {
      const pulseScaleY = 1.0 + 0.03 * Math.sin(t * 2.4);
      ribbonGroupRef.current.scale.set(1.0, pulseScaleY, 1.0);
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.84 + 0.08 * Math.cos(t * 1.8);
    }
  });

  return (
    <group ref={ribbonGroupRef} renderOrder={1}>
      {/* Extruded ribbon mesh */}
      <mesh geometry={ribbonGeometry}>
        <meshStandardMaterial
          ref={materialRef}
          color={stateColor}
          roughness={0.35}
          metalness={0.15}
          side={THREE.DoubleSide}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Top spine contour line */}
      <primitive
        object={new THREE.Line(
          spineGeometry,
          new THREE.LineBasicMaterial({
            color: '#F5EFDD',
            transparent: true,
            opacity: 0.9,
          })
        )}
      />

      {/* Translucent vertical curtain */}
      <mesh geometry={curtainGeometry}>
        <meshStandardMaterial
          color={stateColor}
          transparent
          opacity={0.16}
          roughness={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Node marker spheres at detected zero-crossings */}
      {zeroCrossingX3D.map((xNode, idx) => (
        <group key={idx} position={[xNode, 0.02, 0]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color={stateColor}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.055, 0.08, 20]} />
            <meshBasicMaterial
              color={stateColor}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
