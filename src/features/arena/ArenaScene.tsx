import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TargetShape, ArenaTheme } from '../../types';
import { TargetMesh } from './TargetMesh';

export interface ActiveTarget {
  id: string;
  position: [number, number, number];
  spawnTime: number;
}

interface ArenaSceneProps {
  targets: ActiveTarget[];
  shape: TargetShape;
  /** Scene-space target radius */
  targetRadius: number;
  customUrl?: string;
  theme: ArenaTheme;
  onTargetHit: (id: string) => void;
  onMissClick: () => void;
}

/** Per-theme visual configuration */
const THEME_CONFIG: Record<ArenaTheme, {
  wallColor: string;
  wallRoughness: number;
  wallMetalness: number;
  floorColor: string;
  gridColor: string;
  ambientColor: string;
  ambientIntensity: number;
  dirLightColor: string;
  dirLightIntensity: number;
  accentLightColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}> = {
  cyber_dark: {
    wallColor: '#0b0f17',
    wallRoughness: 0.7,
    wallMetalness: 0.3,
    floorColor: '#060a10',
    gridColor: '#00f0ff',
    ambientColor: '#1a2a3a',
    ambientIntensity: 0.7,
    dirLightColor: '#00f0ff',
    dirLightIntensity: 1.4,
    accentLightColor: '#00f0ff',
    fogColor: '#040810',
    fogNear: 8,
    fogFar: 18,
  },
  tactical_gray: {
    wallColor: '#1c2233',
    wallRoughness: 0.6,
    wallMetalness: 0.15,
    floorColor: '#12161f',
    gridColor: '#6b7280',
    ambientColor: '#c0c8d8',
    ambientIntensity: 1.0,
    dirLightColor: '#e0e8f0',
    dirLightIntensity: 1.1,
    accentLightColor: '#88aacc',
    fogColor: '#10141c',
    fogNear: 10,
    fogFar: 22,
  },
  neon_grid: {
    wallColor: '#0c0620',
    wallRoughness: 0.5,
    wallMetalness: 0.5,
    floorColor: '#070311',
    gridColor: '#b5179e',
    ambientColor: '#3d0a3d',
    ambientIntensity: 0.6,
    dirLightColor: '#f72585',
    dirLightIntensity: 1.6,
    accentLightColor: '#7209b7',
    fogColor: '#050210',
    fogNear: 6,
    fogFar: 16,
  },
  void_space: {
    wallColor: '#000005',
    wallRoughness: 1.0,
    wallMetalness: 0.0,
    floorColor: '#000005',
    gridColor: '#3030a0',
    ambientColor: '#08082a',
    ambientIntensity: 0.4,
    dirLightColor: '#8888ff',
    dirLightIntensity: 1.2,
    accentLightColor: '#4444ff',
    fogColor: '#000005',
    fogNear: 5,
    fogFar: 14,
  },
  arctic_white: {
    wallColor: '#e8eef8',
    wallRoughness: 0.9,
    wallMetalness: 0.05,
    floorColor: '#d4dde8',
    gridColor: '#a0b4cc',
    ambientColor: '#cfe0f0',
    ambientIntensity: 1.2,
    dirLightColor: '#f0f8ff',
    dirLightIntensity: 1.3,
    accentLightColor: '#80ccff',
    fogColor: '#dce8f4',
    fogNear: 9,
    fogFar: 20,
  },
  ember_forge: {
    wallColor: '#190a02',
    wallRoughness: 0.8,
    wallMetalness: 0.3,
    floorColor: '#0e0501',
    gridColor: '#ff4500',
    ambientColor: '#3a1a00',
    ambientIntensity: 0.6,
    dirLightColor: '#ff6b1a',
    dirLightIntensity: 1.8,
    accentLightColor: '#ff2200',
    fogColor: '#0d0401',
    fogNear: 6,
    fogFar: 15,
  },
  deep_ocean: {
    wallColor: '#010d1a',
    wallRoughness: 0.4,
    wallMetalness: 0.6,
    floorColor: '#000d14',
    gridColor: '#006994',
    ambientColor: '#002040',
    ambientIntensity: 0.7,
    dirLightColor: '#00aadd',
    dirLightIntensity: 1.3,
    accentLightColor: '#005580',
    fogColor: '#000a14',
    fogNear: 7,
    fogFar: 16,
  },
};

export const ArenaScene: React.FC<ArenaSceneProps> = ({
  targets,
  shape,
  targetRadius,
  customUrl,
  theme,
  onTargetHit,
  onMissClick,
}) => {
  const cfg = THEME_CONFIG[theme];

  const fogInstance = useMemo(
    () => new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  const handleMiss = (e: any) => {
    e.stopPropagation();
    onMissClick();
  };

  return (
    <>
      {/* Scene-level fog */}
      <primitive object={fogInstance} attach="fog" />

      {/* Lighting */}
      <ambientLight color={cfg.ambientColor} intensity={cfg.ambientIntensity} />
      <directionalLight
        position={[0, 5, 8]}
        intensity={cfg.dirLightIntensity}
        color={cfg.dirLightColor}
        castShadow={false}
      />
      <pointLight position={[-4, 2, 5]} intensity={0.6} color={cfg.accentLightColor} />
      <pointLight position={[4, -2, 5]} intensity={0.4} color={cfg.dirLightColor} />

      {/* Target Wall – absorbs miss clicks */}
      <mesh position={[0, 0, -0.12]} onPointerDown={handleMiss}>
        <planeGeometry args={[30, 22]} />
        <meshStandardMaterial
          color={cfg.wallColor}
          roughness={cfg.wallRoughness}
          metalness={cfg.wallMetalness}
        />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -5.5, 2]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={handleMiss}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color={cfg.floorColor} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5.5, 2]} rotation={[Math.PI / 2, 0, 0]} onPointerDown={handleMiss}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color={cfg.floorColor} roughness={0.9} />
      </mesh>

      {/* Tactical grid overlay on wall */}
      <gridHelper
        args={[24, 24, cfg.gridColor, cfg.gridColor]}
        position={[0, 0, -0.09]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Active targets */}
      {targets.map((target) => (
        <TargetMesh
          key={target.id}
          id={target.id}
          position={target.position}
          shape={shape}
          radius={targetRadius}
          customUrl={customUrl}
          onHit={onTargetHit}
        />
      ))}
    </>
  );
};
