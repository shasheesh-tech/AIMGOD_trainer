import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { TargetShape } from '../../types';

interface TargetMeshProps {
  id: string;
  position: [number, number, number];
  shape: TargetShape;
  /** Scene-space radius for this target (already converted from mm) */
  radius: number;
  customTexture?: THREE.Texture | null;
  onHit?: (id: string) => void;
  /** When true, plays a brief non-interactive disappear transition */
  isDying?: boolean;
  hitTime?: number;
}

const SPAWN_DURATION_S = 0.085;
const SPAWN_START_SCALE = 0.4;
const HIT_DURATION_S = 0.095;
const NO_RAYCAST = () => {};

const TargetMeshInner: React.FC<TargetMeshProps> = ({
  id,
  position,
  shape,
  radius,
  customTexture,
  onHit,
  isDying = false,
  hitTime,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const stdMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const basicMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const spawnTimeRef = useRef<number>(performance.now());
  const animCompleteRef = useRef<boolean>(false);

  // Set deterministic initial scale before paint to prevent spawn flicker
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    if (isDying) {
      groupRef.current.scale.setScalar(1);
    } else {
      groupRef.current.scale.setScalar(SPAWN_START_SCALE);
      spawnTimeRef.current = performance.now();
      animCompleteRef.current = false;
    }
  }, [isDying]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (isDying) {
      const start = hitTime ?? spawnTimeRef.current;
      const elapsed = Math.max(0, (performance.now() - start) / 1000);
      const t = Math.min(1, elapsed / HIT_DURATION_S);

      // Subtle crisp micro-pop followed by rapid clean shrink
      const scale =
        t < 0.22
          ? 1 + (t / 0.22) * 0.08
          : Math.max(0.001, 1.08 * (1 - Math.pow((t - 0.22) / 0.78, 2)));
      group.scale.setScalar(scale);

      const opacity = Math.max(0, 1 - Math.pow(t, 1.4));
      if (stdMatRef.current) {
        if (!stdMatRef.current.transparent) {
          stdMatRef.current.transparent = true;
          stdMatRef.current.needsUpdate = true;
        }
        stdMatRef.current.opacity = opacity;
        stdMatRef.current.emissiveIntensity = 0.95 * (1 - t);
      }
      if (basicMatRef.current) {
        basicMatRef.current.opacity = opacity;
      }
      return;
    }

    if (animCompleteRef.current) return;

    const elapsed = Math.max(0, (performance.now() - spawnTimeRef.current) / 1000);
    const progress = Math.min(1, elapsed / SPAWN_DURATION_S);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    group.scale.setScalar(SPAWN_START_SCALE + eased * (1 - SPAWN_START_SCALE));

    if (progress >= 1) {
      animCompleteRef.current = true;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isDying || !onHit) return;
    if (typeof e.button === 'number' && e.button !== 0) return;
    e.stopPropagation();
    onHit(id);
  };

  const raycastOverride = isDying ? NO_RAYCAST : undefined;
  const pointerHandler = isDying ? undefined : handlePointerDown;

  const renderMesh = () => {
    if (shape === 'custom' && customTexture) {
      return (
        <mesh
          ref={meshRef}
          onPointerDown={pointerHandler}
          raycast={raycastOverride}
        >
          <planeGeometry args={[radius * 2, radius * 2]} />
          <meshBasicMaterial
            ref={basicMatRef}
            map={customTexture}
            transparent
            alphaTest={0.01}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      );
    }

    switch (shape) {
      case 'box':
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
            rotation={[0.28, 0.38, 0]}
          >
            <boxGeometry args={[radius * 1.7, radius * 1.7, radius * 1.7]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#ff6b35"
              emissive="#9e2a00"
              emissiveIntensity={0.35}
              roughness={0.28}
              metalness={0.35}
            />
          </mesh>
        );

      case 'cylinder':
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[radius, radius, radius * 0.32, 64]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#ffaa00"
              emissive="#996300"
              emissiveIntensity={0.35}
              roughness={0.28}
              metalness={0.35}
            />
          </mesh>
        );

      case 'torus':
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
          >
            <torusGeometry args={[radius * 0.7, radius * 0.26, 28, 64]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#b5179e"
              emissive="#6d0c5f"
              emissiveIntensity={0.4}
              roughness={0.25}
              metalness={0.4}
            />
          </mesh>
        );

      case 'diamond':
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
            rotation={[0, 0.4, 0]}
          >
            <octahedronGeometry args={[radius * 1.1, 0]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#4cc9f0"
              emissive="#127399"
              emissiveIntensity={0.35}
              roughness={0.2}
              metalness={0.45}
            />
          </mesh>
        );

      case 'triangle':
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
            rotation={[0, 0, 0]}
          >
            <coneGeometry args={[radius, radius * 2, 3, 1]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#00f59b"
              emissive="#006b42"
              emissiveIntensity={0.35}
              roughness={0.28}
              metalness={0.35}
            />
          </mesh>
        );

      default:
        return (
          <mesh
            ref={meshRef}
            onPointerDown={pointerHandler}
            raycast={raycastOverride}
          >
            <sphereGeometry args={[radius, 48, 48]} />
            <meshStandardMaterial
              ref={stdMatRef}
              color="#00f0ff"
              emissive="#006b75"
              emissiveIntensity={0.35}
              roughness={0.25}
              metalness={0.35}
            />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {renderMesh()}
    </group>
  );
};

export const TargetMesh = React.memo(TargetMeshInner);
