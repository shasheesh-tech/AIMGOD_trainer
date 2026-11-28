export type Screen = 'dashboard' | 'arena_ready' | 'arena' | 'results' | 'history' | 'auth';

export type ShootingMode = 'static_practice';

export type SessionDuration = 15 | 30 | 60 | 90 | 120 | 150 | 180;

export type TargetShape =
  | 'sphere'
  | 'box'
  | 'cylinder'
  | 'torus'
  | 'diamond'
  | 'triangle'
  | 'custom';

export type TargetSize = 'small' | 'medium' | 'large' | 'custom';

export type ArenaTheme =
  | 'cyber_dark'
  | 'tactical_gray'
  | 'neon_grid'
  | 'void_space'
  | 'arctic_white'
  | 'ember_forge'
  | 'deep_ocean';

export type CrosshairStyle =
  | 'dot'
  | 'plus'
  | 'diamond'
  | 'open_plus'
  | 'plus_no_center';

export const DEFAULT_CROSSHAIR: CrosshairStyle = 'plus';

/**
 * Scale conversion: 1 virtual mm = 0.003 Three.js units.
 * Preset radii in scene units:
 *   small  = 60mm  → radius 0.09  (diameter 0.18)
 *   medium = 120mm → radius 0.18  (diameter 0.36)
 *   large  = 200mm → radius 0.30  (diameter 0.60)
 * Custom range: 30mm – 400mm → radius 0.045 – 0.60
 */
export const MM_TO_SCENE = 0.003 as const;

/** Virtual diameter in millimetres for each size preset */
export const SIZE_PRESETS: Record<Exclude<TargetSize, 'custom'>, number> = {
  small: 60,
  medium: 120,
  large: 200,
};

export const CUSTOM_SIZE_MIN_MM = 30;
export const CUSTOM_SIZE_MAX_MM = 400;
export const CUSTOM_SIZE_DEFAULT_MM = 120;

export interface SessionConfig {
  mode: ShootingMode;
  duration: SessionDuration;
  targetShape: TargetShape;
  customTargetUrl?: string;
  targetSize: TargetSize;
  /** Only used when targetSize === 'custom'. Virtual diameter in mm. */
  customSizeMm: number;
  arenaTheme: ArenaTheme;
  crosshair: CrosshairStyle;
}

export interface SessionResult {
  id: string;
  createdAt: string;
  config: SessionConfig;
  score: number;
  accuracy: number; // percentage, e.g. 84.5
  hits: number;
  misses: number;
  totalShots: number;
  avgReactionTimeMs: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  isLoggedIn: boolean;
}
