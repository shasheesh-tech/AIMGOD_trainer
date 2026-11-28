export type ParticleObjectVariant =
  | 'scope'
  | 'weapon'
  | 'projectile'
  | 'precision_target';

export interface ParticlePoint3D {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number; // 0..1 monochrome intensity
  phase: number;
  /** Optional grouping for subtle focus/breathing animations */
  group?: number;
}

export interface WireEdge3D {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  alpha: number;
}

export interface ParticleGeometryData {
  points: ParticlePoint3D[];
  edges: WireEdge3D[];
  defaultRotation: [number, number, number];
  /** Framing hint: radial shapes fit min(w,h), elongated shapes fit width & height */
  aspectMode: 'radial' | 'wide';
}

/** Deterministic PRNG so shapes never jitter across re-mounts */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function addRingPoints(
  points: ParticlePoint3D[],
  edges: WireEdge3D[],
  rng: () => number,
  radius: number,
  z: number,
  count: number,
  size: number,
  brightness: number,
  edgeAlpha = 0,
  group = 0,
  thicknessZ = 0
) {
  const step = (Math.PI * 2) / count;
  let prevX = Math.cos(0) * radius;
  let prevY = Math.sin(0) * radius;

  for (let i = 0; i < count; i++) {
    const a = i * step;
    const jitter = (rng() - 0.5) * 0.015;
    const r = radius + jitter;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const pz = z + (rng() - 0.5) * thicknessZ;

    points.push({
      x,
      y,
      z: pz,
      size: size * (0.85 + rng() * 0.35),
      brightness: brightness * (0.85 + rng() * 0.15),
      phase: rng() * Math.PI * 2,
      group,
    });

    if (edgeAlpha > 0 && i > 0 && i % 2 === 0) {
      edges.push({
        x1: prevX,
        y1: prevY,
        z1: z,
        x2: x,
        y2: y,
        z2: z,
        alpha: edgeAlpha,
      });
      prevX = x;
      prevY = y;
    }
  }
  if (edgeAlpha > 0) {
    edges.push({
      x1: prevX,
      y1: prevY,
      z1: z,
      x2: Math.cos(0) * radius,
      y2: Math.sin(0) * radius,
      z2: z,
      alpha: edgeAlpha,
    });
  }
}

function addLinePoints(
  points: ParticlePoint3D[],
  edges: WireEdge3D[],
  rng: () => number,
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  count: number,
  size: number,
  brightness: number,
  edgeAlpha = 0.15,
  jitter = 0.008,
  group = 0
) {
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    points.push({
      x: x1 + (x2 - x1) * t + (rng() - 0.5) * jitter,
      y: y1 + (y2 - y1) * t + (rng() - 0.5) * jitter,
      z: z1 + (z2 - z1) * t + (rng() - 0.5) * jitter,
      size,
      brightness,
      phase: rng() * Math.PI * 2,
      group,
    });
  }
  if (edgeAlpha > 0) {
    edges.push({ x1, y1, z1, x2, y2, z2, alpha: edgeAlpha });
  }
}

function addBoxShellPoints(
  points: ParticlePoint3D[],
  edges: WireEdge3D[],
  rng: () => number,
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number,
  density: number,
  brightness: number,
  edgeAlpha = 0.14
) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const hd = d * 0.5;

  // 12 structural edges
  const corners: [number, number, number][] = [
    [cx - hw, cy - hh, cz - hd],
    [cx + hw, cy - hh, cz - hd],
    [cx + hw, cy + hh, cz - hd],
    [cx - hw, cy + hh, cz - hd],
    [cx - hw, cy - hh, cz + hd],
    [cx + hw, cy - hh, cz + hd],
    [cx + hw, cy + hh, cz + hd],
    [cx - hw, cy + hh, cz + hd],
  ];
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, b] of pairs) {
    const [x1, y1, z1] = corners[a];
    const [x2, y2, z2] = corners[b];
    addLinePoints(points, edges, rng, x1, y1, z1, x2, y2, z2, Math.max(4, Math.floor(density * 0.35)), 1.05, brightness * 0.9, edgeAlpha, 0.005);
  }

  // Surface points across the 6 faces
  for (let i = 0; i < density; i++) {
    const face = Math.floor(rng() * 6);
    let x = cx + (rng() - 0.5) * w;
    let y = cy + (rng() - 0.5) * h;
    let z = cz + (rng() - 0.5) * d;
    if (face === 0) z = cz + hd;
    else if (face === 1) z = cz - hd;
    else if (face === 2) y = cy + hh;
    else if (face === 3) y = cy - hh;
    else if (face === 4) x = cx + hw;
    else x = cx - hw;

    points.push({
      x,
      y,
      z,
      size: 0.95 + rng() * 0.75,
      brightness: brightness * (0.65 + rng() * 0.35),
      phase: rng() * Math.PI * 2,
    });
  }
}

/** 1. Tactical Optical Scope & Concentric Focusing Reticle */
function buildScopeGeometry(): ParticleGeometryData {
  const rng = createRng(104729);
  const points: ParticlePoint3D[] = [];
  const edges: WireEdge3D[] = [];

  // Outer stepped optic housing barrel
  for (let s = 0; s < 10; s++) {
    const z = -0.55 + (s / 9) * 1.1;
    const r = s > 6 ? 0.92 + (s - 6) * 0.045 : 0.88;
    addRingPoints(points, edges, rng, r, z, 52, 1.15, 0.72, s === 0 || s === 9 ? 0.16 : 0.05, 0, 0.015);
  }

  // Longitudinal housing ribs
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    addLinePoints(
      points,
      edges,
      rng,
      Math.cos(a) * 0.88,
      Math.sin(a) * 0.88,
      -0.55,
      Math.cos(a) * 1.05,
      Math.sin(a) * 1.05,
      0.55,
      10,
      0.9,
      0.55,
      k % 2 === 0 ? 0.11 : 0
    );
  }

  // Stepped inner focus rings (group 1 responds to hover focus contraction)
  addRingPoints(points, edges, rng, 0.64, 0.18, 60, 1.3, 0.88, 0.2, 1);
  addRingPoints(points, edges, rng, 0.42, 0.34, 48, 1.25, 0.94, 0.22, 1);
  addRingPoints(points, edges, rng, 0.18, 0.46, 30, 1.2, 1.0, 0.24, 1);

  // Cardinal reticle crosshairs & mil-dot ticks
  const arms: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dx, dy] of arms) {
    addLinePoints(
      points,
      edges,
      rng,
      dx * 0.1,
      dy * 0.1,
      0.38,
      dx * 0.82,
      dy * 0.82,
      0.38,
      18,
      1.1,
      0.92,
      0.22,
      0.002,
      1
    );
  }

  // Subtle curved lens glass dust shimmer
  for (let i = 0; i < 180; i++) {
    const a = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * 0.82;
    points.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      z: 0.22 + (1 - r * r) * 0.12 + (rng() - 0.5) * 0.04,
      size: 0.8 + rng() * 0.6,
      brightness: 0.35 + rng() * 0.35,
      phase: rng() * Math.PI * 2,
      group: 1,
    });
  }

  // Elevation & windage adjustment turrets (Canvas -Y is up)
  addRingPoints(points, edges, rng, 0.14, 0.05, 16, 1.0, 0.75, 0.12);
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2;
    const h = 0.88 + rng() * 0.24;
    points.push({
      x: Math.cos(a) * 0.14,
      y: -h,
      z: Math.sin(a) * 0.14,
      size: 1.0,
      brightness: 0.78,
      phase: rng() * Math.PI * 2,
    });
  }

  return {
    points,
    edges,
    defaultRotation: [0.22, -0.45, 0.05],
    aspectMode: 'radial',
  };
}

/** 2. Futuristic Precision Rail-Carbine Weapon Silhouette */
function buildWeaponGeometry(): ParticleGeometryData {
  const rng = createRng(229417);
  const points: ParticlePoint3D[] = [];
  const edges: WireEdge3D[] = [];

  // Main upper receiver & chassis
  addBoxShellPoints(points, edges, rng, -0.05, 0.06, 0, 1.15, 0.24, 0.18, 260, 0.86, 0.18);
  // Lower receiver
  addBoxShellPoints(points, edges, rng, -0.15, -0.1, 0, 0.68, 0.14, 0.16, 140, 0.75, 0.14);
  // Handguard / rail shroud
  addBoxShellPoints(points, edges, rng, 0.78, 0.09, 0, 0.72, 0.18, 0.15, 180, 0.82, 0.16);
  // Precision barrel + fluted muzzle suppressor
  for (let s = 0; s < 14; s++) {
    const x = 1.12 + (s / 13) * 0.65;
    const r = s > 7 ? 0.068 : 0.038;
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      points.push({
        x,
        y: 0.1 + Math.sin(a) * r,
        z: Math.cos(a) * r,
        size: 1.05,
        brightness: s > 7 ? 0.92 : 0.78,
        phase: rng() * Math.PI * 2,
      });
    }
  }
  addLinePoints(points, edges, rng, 1.12, 0.1, 0, 1.78, 0.1, 0, 22, 1.2, 0.95, 0.22);

  // Picatinny top rail & holographic optic
  addLinePoints(points, edges, rng, -0.58, 0.2, 0.04, 1.1, 0.2, 0.04, 34, 1.0, 0.88, 0.16);
  addLinePoints(points, edges, rng, -0.58, 0.2, -0.04, 1.1, 0.2, -0.04, 34, 1.0, 0.88, 0.16);
  addBoxShellPoints(points, edges, rng, 0.08, 0.31, 0, 0.34, 0.16, 0.14, 95, 0.95, 0.22);
  // Optic reticle emitter point
  points.push({ x: 0.08, y: 0.31, z: 0, size: 2.2, brightness: 1, phase: 0, group: 1 });

  // Angled pistol grip
  for (let i = 0; i < 85; i++) {
    const t = rng();
    const gx = -0.34 - t * 0.14 + (rng() - 0.5) * 0.11;
    const gy = -0.16 - t * 0.34;
    const gz = (rng() - 0.5) * 0.11;
    points.push({ x: gx, y: gy, z: gz, size: 1.05, brightness: 0.7, phase: rng() * Math.PI * 2 });
  }
  addLinePoints(points, edges, rng, -0.29, -0.16, 0.05, -0.43, -0.5, 0.05, 10, 1.0, 0.75, 0.14);
  addLinePoints(points, edges, rng, -0.39, -0.16, -0.05, -0.53, -0.5, -0.05, 10, 1.0, 0.75, 0.14);

  // Cantilever magazine
  for (let i = 0; i < 95; i++) {
    const t = rng();
    const mx = 0.16 + t * 0.09 + (rng() - 0.5) * 0.15;
    const my = -0.17 - t * 0.42;
    const mz = (rng() - 0.5) * 0.1;
    points.push({ x: mx, y: my, z: mz, size: 1.05, brightness: 0.76, phase: rng() * Math.PI * 2 });
  }
  addLinePoints(points, edges, rng, 0.09, -0.17, 0, 0.18, -0.59, 0, 12, 1.05, 0.85, 0.16);
  addLinePoints(points, edges, rng, 0.24, -0.17, 0, 0.33, -0.59, 0, 12, 1.05, 0.85, 0.16);

  // Skeletonized stock
  addLinePoints(points, edges, rng, -0.62, 0.14, 0, -1.42, 0.12, 0, 26, 1.15, 0.88, 0.24);
  addLinePoints(points, edges, rng, -0.62, -0.08, 0, -1.38, -0.32, 0, 26, 1.1, 0.84, 0.22);
  addLinePoints(points, edges, rng, -1.42, 0.12, 0, -1.38, -0.32, 0, 18, 1.15, 0.9, 0.25);
  addBoxShellPoints(points, edges, rng, -1.04, 0.03, 0, 0.56, 0.14, 0.12, 95, 0.82, 0.16);

  // Center weapon around (0, 0, 0) and convert from Y-up to Canvas 2D Y-down
  // so optic sits on top, grip/magazine hang downward, stock is left, barrel points right.
  for (const p of points) {
    p.x -= 0.16;
    p.y = -(p.y + 0.08);
  }
  for (const e of edges) {
    e.x1 -= 0.16;
    e.x2 -= 0.16;
    e.y1 = -(e.y1 + 0.08);
    e.y2 = -(e.y2 + 0.08);
  }

  return {
    points,
    edges,
    defaultRotation: [0.12, -0.2, 0],
    aspectMode: 'wide',
  };
}

/** 3. Aerodynamic Ballistic Projectile & Helical Slipstream */
function buildProjectileGeometry(): ParticleGeometryData {
  const rng = createRng(331903);
  const points: ParticlePoint3D[] = [];
  const edges: WireEdge3D[] = [];

  // Lathe-revolved spitzer round aligned along X-axis (tip at +1.25, base at -0.75)
  const slices = 34;
  for (let s = 0; s <= slices; s++) {
    const t = s / slices;
    const x = -0.75 + t * 2.0;

    let r = 0.34;
    if (t < 0.16) {
      // Boat-tail base taper
      r = 0.24 + (t / 0.16) * 0.1;
    } else if (t > 0.45) {
      // Ogive aerodynamic nose
      const nt = (t - 0.45) / 0.55;
      r = Math.max(0.015, 0.34 * Math.pow(1 - nt * nt, 0.68));
    }

    const ringCount = Math.max(8, Math.round(r * 92));
    for (let k = 0; k < ringCount; k++) {
      const a = (k / ringCount) * Math.PI * 2 + s * 0.12;
      points.push({
        x,
        y: Math.sin(a) * r,
        z: Math.cos(a) * r,
        size: t > 0.8 ? 1.2 : 1.05 + rng() * 0.35,
        brightness: t > 0.72 ? 0.96 : 0.68 + rng() * 0.24,
        phase: rng() * Math.PI * 2,
      });
    }

    // Subtle longitudinal wireframe contours
    if (s > 0 && s % 3 === 0) {
      const prevT = (s - 3) / slices;
      const prevX = -0.75 + prevT * 2.0;
      let prevR = 0.34;
      if (prevT < 0.16) prevR = 0.24 + (prevT / 0.16) * 0.1;
      else if (prevT > 0.45) {
        const nt = (prevT - 0.45) / 0.55;
        prevR = Math.max(0.015, 0.34 * Math.pow(1 - nt * nt, 0.68));
      }
      for (let m = 0; m < 6; m++) {
        const a = (m / 6) * Math.PI * 2;
        edges.push({
          x1: prevX,
          y1: Math.sin(a) * prevR,
          z1: Math.cos(a) * prevR,
          x2: x,
          y2: Math.sin(a) * r,
          z2: Math.cos(a) * r,
          alpha: 0.13,
        });
      }
    }
  }

  // Helical ballistic wake / rifling slipstream trails (group 1)
  for (let strand = 0; strand < 3; strand++) {
    const baseAngle = (strand / 3) * Math.PI * 2;
    for (let i = 0; i < 42; i++) {
      const u = i / 41;
      const x = 0.3 - u * 1.95;
      const r = 0.39 + u * 0.28;
      const a = baseAngle + u * Math.PI * 2.5;
      points.push({
        x,
        y: Math.sin(a) * r,
        z: Math.cos(a) * r,
        size: (1 - u * 0.55) * 1.35,
        brightness: (1 - u * 0.65) * 0.85,
        phase: rng() * Math.PI * 2,
        group: 1,
      });
    }
  }

  // Center projectile assembly around (0, 0, 0) for balanced rotation
  for (const p of points) {
    p.x -= 0.15;
  }
  for (const e of edges) {
    e.x1 -= 0.15;
    e.x2 -= 0.15;
  }

  return {
    points,
    edges,
    defaultRotation: [0.24, -0.52, -0.18],
    aspectMode: 'wide',
  };
}

/** 4. Precision Bullseye Target & Impact Calibration Assembly */
function buildPrecisionTargetGeometry(): ParticleGeometryData {
  const rng = createRng(449201);
  const points: ParticlePoint3D[] = [];
  const edges: WireEdge3D[] = [];

  // Stepped concentric target rings in Z-depth
  addRingPoints(points, edges, rng, 1.05, -0.14, 80, 1.15, 0.65, 0.15, 0, 0.02);
  addRingPoints(points, edges, rng, 0.76, -0.05, 64, 1.2, 0.78, 0.18, 1, 0.015);
  addRingPoints(points, edges, rng, 0.48, 0.05, 48, 1.25, 0.9, 0.2, 1, 0.012);
  addRingPoints(points, edges, rng, 0.21, 0.14, 28, 1.3, 0.98, 0.24, 1);

  // Diagonal precision brackets
  const diag = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  for (const [dx, dy] of diag) {
    const s = 0.7071;
    addLinePoints(
      points,
      edges,
      rng,
      dx * s * 0.26,
      dy * s * 0.26,
      0.08,
      dx * s * 1.14,
      dy * s * 1.14,
      -0.1,
      16,
      1.05,
      0.8,
      0.16,
      0.004,
      1
    );
  }

  // Central impact cluster & trajectory pin along Z-axis
  addLinePoints(points, edges, rng, 0, 0, -0.35, 0, 0, 0.58, 22, 1.35, 0.96, 0.24, 0.003);
  for (let i = 0; i < 90; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const r = Math.pow(rng(), 0.7) * 0.14;
    points.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: 0.14 + r * Math.cos(phi),
      size: 1.1 + rng() * 0.65,
      brightness: 0.85 + rng() * 0.15,
      phase: rng() * Math.PI * 2,
    });
  }

  // Subtle calibration particles floating around outer perimeter
  for (let i = 0; i < 110; i++) {
    const a = rng() * Math.PI * 2;
    const r = 0.9 + rng() * 0.35;
    points.push({
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      z: (rng() - 0.5) * 0.36,
      size: 0.85 + rng() * 0.55,
      brightness: 0.38 + rng() * 0.35,
      phase: rng() * Math.PI * 2,
    });
  }

  return {
    points,
    edges,
    defaultRotation: [0.28, -0.42, 0.06],
    aspectMode: 'radial',
  };
}

const GEOMETRY_CACHE: Partial<Record<ParticleObjectVariant, ParticleGeometryData>> = {};

export function getParticleGeometry(variant: ParticleObjectVariant): ParticleGeometryData {
  const cached = GEOMETRY_CACHE[variant];
  if (cached) return cached;

  let data: ParticleGeometryData;
  switch (variant) {
    case 'scope':
      data = buildScopeGeometry();
      break;
    case 'weapon':
      data = buildWeaponGeometry();
      break;
    case 'projectile':
      data = buildProjectileGeometry();
      break;
    case 'precision_target':
      data = buildPrecisionTargetGeometry();
      break;
  }
  GEOMETRY_CACHE[variant] = data;
  return data;
}
