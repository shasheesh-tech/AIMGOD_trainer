import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { TargetShape, ArenaTheme } from '../../types';
import { TargetMesh } from './TargetMesh';

export interface ActiveTarget {
  id: string;
  position: [number, number, number];
  spawnTime: number;
}

export interface DyingTarget {
  id: string;
  position: [number, number, number];
  hitTime: number;
}

interface ArenaSceneProps {
  targets: ActiveTarget[];
  dyingTargets: DyingTarget[];
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
  gridOpacity: number;
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
    gridOpacity: 0.24,
    ambientColor: '#26384d',
    ambientIntensity: 0.85,
    dirLightColor: '#dff8ff',
    dirLightIntensity: 1.35,
    accentLightColor: '#00f0ff',
    fogColor: '#040810',
    fogNear: 8,
    fogFar: 18,
  },
  tactical_gray: {
    wallColor: '#1c2233',
    wallRoughness: 0.65,
    wallMetalness: 0.15,
    floorColor: '#12161f',
    gridColor: '#6b7280',
    gridOpacity: 0.28,
    ambientColor: '#c0c8d8',
    ambientIntensity: 1.0,
    dirLightColor: '#e8eef5',
    dirLightIntensity: 1.15,
    accentLightColor: '#88aacc',
    fogColor: '#10141c',
    fogNear: 10,
    fogFar: 22,
  },
  neon_grid: {
    wallColor: '#0c0620',
    wallRoughness: 0.55,
    wallMetalness: 0.45,
    floorColor: '#070311',
    gridColor: '#b5179e',
    gridOpacity: 0.3,
    ambientColor: '#481a4a',
    ambientIntensity: 0.8,
    dirLightColor: '#ffd6eb',
    dirLightIntensity: 1.4,
    accentLightColor: '#7209b7',
    fogColor: '#050210',
    fogNear: 6,
    fogFar: 16,
  },
  void_space: {
    wallColor: '#020208',
    wallRoughness: 1.0,
    wallMetalness: 0.0,
    floorColor: '#020208',
    gridColor: '#3030a0',
    gridOpacity: 0.22,
    ambientColor: '#1e1e48',
    ambientIntensity: 0.75,
    dirLightColor: '#d0d4ff',
    dirLightIntensity: 1.3,
    accentLightColor: '#4444ff',
    fogColor: '#000005',
    fogNear: 5,
    fogFar: 14,
  },
  arctic_white: {
    wallColor: '#dce5f0',
    wallRoughness: 0.92,
    wallMetalness: 0.02,
    floorColor: '#cbd6e4',
    gridColor: '#8fa6c2',
    gridOpacity: 0.32,
    ambientColor: '#c6d8ec',
    ambientIntensity: 0.95,
    dirLightColor: '#ffffff',
    dirLightIntensity: 1.15,
    accentLightColor: '#7cb8e8',
    fogColor: '#d4dfec',
    fogNear: 9,
    fogFar: 20,
  },
  ember_forge: {
    wallColor: '#190a02',
    wallRoughness: 0.8,
    wallMetalness: 0.3,
    floorColor: '#0e0501',
    gridColor: '#ff4500',
    gridOpacity: 0.25,
    ambientColor: '#4a2512',
    ambientIntensity: 0.8,
    dirLightColor: '#ffe0cc',
    dirLightIntensity: 1.45,
    accentLightColor: '#ff2200',
    fogColor: '#0d0401',
    fogNear: 6,
    fogFar: 15,
  },
  deep_ocean: {
    wallColor: '#010d1a',
    wallRoughness: 0.45,
    wallMetalness: 0.55,
    floorColor: '#000d14',
    gridColor: '#006994',
    gridOpacity: 0.26,
    ambientColor: '#14385c',
    ambientIntensity: 0.85,
    dirLightColor: '#ccf0ff',
    dirLightIntensity: 1.3,
    accentLightColor: '#005580',
    fogColor: '#000a14',
    fogNear: 7,
    fogFar: 16,
  },
};

const ArenaSceneInner: React.FC<ArenaSceneProps> = ({
  targets,
  dyingTargets,
  shape,
  targetRadius,
  customUrl,
  theme,
  onTargetHit,
  onMissClick,
}) => {
  const cfg = THEME_CONFIG[theme];
  const gridRef = useRef<THREE.GridHelper>(null);
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);

  const fogInstance = useMemo(
    () => new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar),
    [cfg.fogColor, cfg.fogNear, cfg.fogFar]
  );

  // Preload custom PNG texture once per URL so respawning targets never flicker or leak textures
  useEffect(() => {
    if (shape !== 'custom' || !customUrl) {
      setCustomTexture(null);
      return;
    }

    let cancelled = false;
    let loadedTex: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();

    loader.load(
      customUrl,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        loadedTex = tex;
        setCustomTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Failed to load custom target texture, falling back to sphere', err);
        if (!cancelled) setCustomTexture(null);
      }
    );

    return () => {
      cancelled = true;
      if (loadedTex) {
        loadedTex.dispose();
      }
    };
  }, [shape, customUrl]);

  // Keep grid overlay subtle so targets stay sharply readable against every backdrop
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
    materials.forEach((mat) => {
      mat.transparent = true;
      mat.opacity = cfg.gridOpacity;
      mat.depthWrite = false;
    });
  }, [cfg.gridOpacity, theme]);

  const handleMiss = (e: ThreeEvent<PointerEvent>) => {
    if (typeof e.button === 'number' && e.button !== 0) return;
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
        position={[1.5, 4.5, 8]}
        intensity={cfg.dirLightIntensity}
        color={cfg.dirLightColor}
        castShadow={false}
      />
      <pointLight position={[-4, 2, 5]} intensity={0.55} color={cfg.accentLightColor} />
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
        ref={gridRef}
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
          customTexture={customTexture}
          onHit={onTargetHit}
        />
      ))}

      {/* Brief non-interactive hit disappear transitions */}
      {dyingTargets.map((target) => (
        <TargetMesh
          key={target.id}
          id={target.id}
          position={target.position}
          shape={shape}
          radius={targetRadius}
          customTexture={customTexture}
          isDying
          hitTime={target.hitTime}
        />
      ))}
    </>
  );
};

export const ArenaScene = React.memo(ArenaSceneInner);
