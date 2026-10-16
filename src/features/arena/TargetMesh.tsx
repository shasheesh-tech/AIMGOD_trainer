import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TargetShape } from '../../types';

interface TargetMeshProps {
  id: string;
  position: [number, number, number];
  shape: TargetShape;
  /** Scene-space radius for this target (already converted from mm) */
  radius: number;
  customUrl?: string;
  onHit: (id: string) => void;
}

export const TargetMesh: React.FC<TargetMeshProps> = ({
  id,
  position,
  shape,
  radius,
  customUrl,
  onHit,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const spawnTimeRef = useRef<number>(performance.now());
  const [popScale, setPopScale] = React.useState(0.05);

  // Texture loader for custom PNG
  const customTexture = useMemo(() => {
    if (shape === 'custom' && customUrl) {
      const loader = new THREE.TextureLoader();
      try {
        const tex = loader.load(customUrl);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      } catch (err) {
        console.warn('Failed to load custom target texture, falling back to sphere', err);
        return null;
      }
    }
    return null;
  }, [shape, customUrl]);

  // Pop-in animation on spawn (15ms → full scale)
  useFrame(() => {
    const elapsed = (performance.now() - spawnTimeRef.current) / 1000;
    const progress = Math.min(1, elapsed / 0.12);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setPopScale(0.05 + eased * 0.95);
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onHit(id);
  };

  // Glow ring colour per shape family
  const ringColor = useMemo(() => {
    switch (shape) {
      case 'box': return '#ff6b35';
      case 'cylinder': return '#ffaa00';
      case 'torus': return '#b5179e';
      case 'diamond': return '#4cc9f0';
      case 'triangle': return '#00f59b';
      case 'custom': return '#ffffff';
      default: return '#00f0ff'; // sphere
    }
  }, [shape]);

  const renderMesh = () => {
    if (shape === 'custom' && customTexture) {
      return (
        <mesh ref={meshRef} onPointerDown={handlePointerDown}>
          <planeGeometry args={[radius * 2, radius * 2]} />
          <meshBasicMaterial
            map={customTexture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      );
    }

    switch (shape) {
      case 'box':
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown} rotation={[0.3, 0.4, 0]}>
            <boxGeometry args={[radius * 1.7, radius * 1.7, radius * 1.7]} />
            <meshStandardMaterial color="#ff6b35" emissive="#cc3b05" emissiveIntensity={0.7} roughness={0.2} metalness={0.8} />
          </mesh>
        );

      case 'cylinder':
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius, radius, radius * 0.35, 32]} />
            <meshStandardMaterial color="#ffaa00" emissive="#cc7700" emissiveIntensity={0.7} roughness={0.2} metalness={0.8} />
          </mesh>
        );

      case 'torus':
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown}>
            <torusGeometry args={[radius * 0.7, radius * 0.28, 16, 48]} />
            <meshStandardMaterial color="#b5179e" emissive="#7b1174" emissiveIntensity={0.8} roughness={0.1} metalness={0.9} />
          </mesh>
        );

      case 'diamond': {
        // An octahedron looks like a diamond
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown} rotation={[0, 0.4, 0]}>
            <octahedronGeometry args={[radius * 1.1, 0]} />
            <meshStandardMaterial color="#4cc9f0" emissive="#1b90c8" emissiveIntensity={0.75} roughness={0.05} metalness={1.0} />
          </mesh>
        );
      }

      case 'triangle': {
        // Cone = triangular silhouette, tip pointing up
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown} rotation={[0, 0, 0]}>
            <coneGeometry args={[radius, radius * 2, 3, 1]} />
            <meshStandardMaterial color="#00f59b" emissive="#007a45" emissiveIntensity={0.7} roughness={0.2} metalness={0.8} />
          </mesh>
        );
      }

      default:
        // Sphere (fallback)
        return (
          <mesh ref={meshRef} onPointerDown={handlePointerDown}>
            <sphereGeometry args={[radius, 36, 36]} />
            <meshStandardMaterial color="#00f0ff" emissive="#008b96" emissiveIntensity={0.65} roughness={0.1} metalness={0.95} />
          </mesh>
        );
    }
  };

  return (
    <group position={position} scale={[popScale, popScale, popScale]}>
      {renderMesh()}

      {/* Ambient glow halo ring behind target */}
      {shape !== 'custom' && (
        <mesh position={[0, 0, -radius * 0.1]}>
          <ringGeometry args={[radius * 1.08, radius * 1.22, 48]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
