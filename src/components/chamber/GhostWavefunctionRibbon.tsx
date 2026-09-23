import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { WavefunctionData } from '../../physics/useQuantumState';

interface GhostWavefunctionRibbonProps {
  wavefunctionData: WavefunctionData;
  mode?: 'psi' | 'prob';
}

export const GhostWavefunctionRibbon: React.FC<GhostWavefunctionRibbonProps> = ({
  wavefunctionData,
  mode = 'psi',
}) => {
  const ribbonGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const { x3D, psi, zeroCrossingX3D } = wavefunctionData;
  // Distinct cool cyan/teal ghost color
  const ghostColor = '#38A89D';
  const ghostHighlight = '#7FE5DC';

  const { ribbonGeometry, curtainGeometry, spineGeometry } = useMemo(() => {
    const N = x3D.length;
    const ribbonHalfWidth = 0.20;
    const ampScale = 1.4;

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const curtainVertices: number[] = [];
    const curtainIndices: number[] = [];

    const spinePoints: THREE.Vector3[] = [];

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

      spinePoints.push(new THREE.Vector3(x, y, 0));

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

  // Subtle idle breathing pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ribbonGroupRef.current) {
      const pulseScaleY = 1.0 + 0.025 * Math.sin(t * 2.2 + 1.0);
      ribbonGroupRef.current.scale.set(1.0, pulseScaleY, 1.0);
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.42 + 0.06 * Math.cos(t * 1.6);
    }
  });

  return (
    <group ref={ribbonGroupRef}>
      {/* Ghost translucent ribbon mesh */}
      <mesh geometry={ribbonGeometry}>
        <meshStandardMaterial
          ref={materialRef}
          color={ghostColor}
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
          transparent
          opacity={0.42}
          depthWrite={false}
          wireframe={false}
        />
      </mesh>

      {/* Top dashed/ghost spine contour line */}
      <primitive
        object={
          new THREE.Line(
            spineGeometry,
            new THREE.LineDashedMaterial({
              color: ghostHighlight,
              dashSize: 0.1,
              gapSize: 0.05,
              transparent: true,
              opacity: 0.85,
            })
          )
        }
      />

      {/* Translucent ghost curtain */}
      <mesh geometry={curtainGeometry}>
        <meshStandardMaterial
          color={ghostColor}
          transparent
          opacity={0.10}
          roughness={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ghost zero-crossing marker spheres */}
      {zeroCrossingX3D.map((xNode, idx) => (
        <group key={idx} position={[xNode, 0.015, 0]}>
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color={ghostColor}
              transparent
              opacity={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.05, 0.075, 20]} />
            <meshBasicMaterial
              color={ghostHighlight}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
