import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GroundPlatformProps {
  showGrid?: boolean;
}

export const GroundPlatform: React.FC<GroundPlatformProps> = ({ showGrid = true }) => {
  // Custom procedural grid & radial fade shader matching --bg-canvas and --ink
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: new THREE.Color('#DBD2B3') }, // --bg-canvas
        uGridColor: { value: new THREE.Color('#3A332A') }, // --ink
        uGridScale: { value: 0.5 },
        uLineWidth: { value: 0.02 },
        uShowGrid: { value: showGrid ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uGridColor;
        uniform float uGridScale;
        uniform float uLineWidth;
        uniform float uShowGrid;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          // Distance from center of platform
          float dist = length(vWorldPosition.xz);
          float radius = 7.0;
          if (dist > radius) {
            discard;
          }

          // Edge falloff
          float edgeAlpha = smoothstep(radius, radius - 0.4, dist);

          // Grid coordinates
          vec2 coord = vWorldPosition.xz / uGridScale;
          vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
          float line = min(grid.x, grid.y);
          float gridAlpha = 1.0 - min(line, 1.0);

          // Primary and secondary grid intensity
          vec3 finalColor = uBaseColor;
          if (uShowGrid > 0.5) {
            finalColor = mix(finalColor, uGridColor, gridAlpha * 0.12);
          }

          // Subtle concentric stage rings
          float ringDist = mod(dist, 1.0);
          float ringAlpha = smoothstep(0.04, 0.0, abs(ringDist - 0.5));
          finalColor = mix(finalColor, uGridColor, ringAlpha * 0.04);

          gl_FragColor = vec4(finalColor, edgeAlpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, [showGrid]);

  return (
    <group position={[0, -0.01, 0]}>
      {/* Tiled platform disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={material}>
        <circleGeometry args={[7.0, 64]} />
      </mesh>

      {/* Decorative Outer Pedestal Ring in --bg-panel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[6.95, 7.08, 64]} />
        <meshBasicMaterial color="#E4E1C7" side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
        <ringGeometry args={[7.08, 7.15, 64]} />
        <meshBasicMaterial color="#8A8270" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
