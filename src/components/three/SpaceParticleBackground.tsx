import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  depth: number;
  baseAlpha: number;
  color: { r: number; g: number; b: number };
  phase: number;
  driftFreq: number;
  twinkleFreq: number;
  energy: number;
}

interface AmbientMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  depth: number;
  phase: number;
}

const PALETTE = [
  { r: 118, g: 126, b: 138 },
  { r: 152, g: 160, b: 172 },
  { r: 186, g: 193, b: 204 },
  { r: 222, g: 227, b: 235 },
];

/**
 * Reusable Deep-Space Particle & Wavy Space Mat Background.
 * Stays fixed behind all UI with pointer-events disabled, pauses on hidden tab,
 * and respects prefers-reduced-motion.
 */
export const SpaceParticleBackground: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const maxParticles = 110;
    const minParticles = 50;
    const interactionRadius = 215;
    const repelStrength = 0.78;
    const parallaxStrength = 20;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let ambientMotes: AmbientMote[] = [];

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      isTouch: false,
    };
    const parallax = { x: 0, y: 0 };

    let rafId: number | null = null;
    let resizeTimer: number | undefined;
    let lastTime = 0;
    let elapsed = 0;
    let isHidden = document.hidden;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reducedMotionQuery.matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!pointer.active) {
        pointer.x = width * 0.5;
        pointer.y = height * 0.5;
        pointer.targetX = pointer.x;
        pointer.targetY = pointer.y;
      }
    };

    const initParticles = () => {
      const area = width * height;
      const count = Math.max(minParticles, Math.min(maxParticles, Math.floor(area / 13000)));
      particles = [];

      for (let i = 0; i < count; i++) {
        const depthRoll = Math.random();
        const layer = depthRoll < 0.44 ? 0 : depthRoll < 0.82 ? 1 : 2;
        const size =
          layer === 0
            ? 1.15 + Math.random() * 0.85
            : layer === 1
              ? 1.9 + Math.random() * 1.3
              : 3.0 + Math.random() * 1.5;
        const baseAlpha =
          layer === 0
            ? 0.16 + Math.random() * 0.18
            : layer === 1
              ? 0.26 + Math.random() * 0.22
              : 0.36 + Math.random() * 0.26;
        const speedScale = layer === 0 ? 0.08 : layer === 1 ? 0.14 : 0.22;
        const angle = Math.random() * Math.PI * 2;
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speedScale,
          vy: Math.sin(angle) * speedScale,
          baseVx: Math.cos(angle) * speedScale,
          baseVy: Math.sin(angle) * speedScale,
          size,
          depth: layer === 0 ? 0.22 : layer === 1 ? 0.55 : 0.95,
          baseAlpha,
          color,
          phase: Math.random() * Math.PI * 2,
          driftFreq: 0.28 + Math.random() * 0.45,
          twinkleFreq: 0.45 + Math.random() * 0.7,
          energy: 0,
        });
      }

      const moteCount = Math.max(5, Math.min(8, Math.floor(width / 220)));
      ambientMotes = [];
      for (let i = 0; i < moteCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        ambientMotes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * 0.05,
          vy: Math.sin(angle) * 0.05,
          radius: 4.5 + Math.random() * 4.0,
          alpha: 0.05 + Math.random() * 0.055,
          depth: 0.3 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const update = (dt: number) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.1 * dt;
      pointer.y += (pointer.targetY - pointer.y) * 0.1 * dt;

      const targetParallaxX = pointer.active
        ? (pointer.x / width - 0.5) * -parallaxStrength
        : Math.sin(elapsed * 0.16) * 5;
      const targetParallaxY = pointer.active
        ? (pointer.y / height - 0.5) * -parallaxStrength
        : Math.cos(elapsed * 0.13) * 4;

      parallax.x += (targetParallaxX - parallax.x) * 0.04 * dt;
      parallax.y += (targetParallaxY - parallax.y) * 0.04 * dt;

      const radiusSq = interactionRadius * interactionRadius;
      const pad = 28;

      for (let i = 0; i < ambientMotes.length; i++) {
        const m = ambientMotes[i];
        m.x += (m.vx + Math.sin(elapsed * 0.2 + m.phase) * 0.025) * dt;
        m.y += (m.vy + Math.cos(elapsed * 0.18 + m.phase) * 0.025) * dt;

        if (m.x < -pad) m.x = width + pad;
        else if (m.x > width + pad) m.x = -pad;
        if (m.y < -pad) m.y = height + pad;
        else if (m.y > height + pad) m.y = -pad;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const waveX = Math.sin(elapsed * p.driftFreq + p.phase) * 0.045;
        const waveY = Math.cos(elapsed * p.driftFreq * 0.85 + p.phase) * 0.045;

        p.vx += (p.baseVx + waveX - p.vx) * 0.045 * dt;
        p.vy += (p.baseVy + waveY - p.vy) * 0.045 * dt;

        let targetEnergy = 0;
        if (pointer.active && !pointer.isTouch) {
          const px = p.x + parallax.x * p.depth;
          const py = p.y + parallax.y * p.depth;
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / interactionRadius;
            const force =
              falloff * falloff * repelStrength * (0.35 + p.depth * 0.85) * dt;
            const nx = dx / dist;
            const ny = dy / dist;

            p.vx += (nx * 0.86 - ny * 0.22) * force;
            p.vy += (ny * 0.86 + nx * 0.22) * force;
            targetEnergy = falloff;
          }
        }

        p.energy += (targetEnergy - p.energy) * 0.12 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;
      }
    };

    const renderSpaceMat = (time: number) => {
      const cols = width < 640 ? 24 : 38;
      const rows = width < 640 ? 16 : 24;
      const matW = width * 1.18;
      const matH = height * 1.18;
      const cx = width * 0.5 + parallax.x * 0.35;
      const cy = height * 0.5 + parallax.y * 0.35;

      const grid: { x: number; y: number; a: number }[][] = new Array(rows + 1);
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        const vCentered = v - 0.5;
        const rowPts: { x: number; y: number; a: number }[] = new Array(cols + 1);

        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const uCentered = u - 0.5;
          const baseX = cx + uCentered * matW;
          const baseY = cy + vCentered * matH;

          const wave1 = Math.sin(u * Math.PI * 4.0 - time * 1.15 + v * 2.6) * 14;
          const wave2 = Math.cos(v * Math.PI * 3.2 + time * 0.85 - u * 2.2) * 10;
          const ripple =
            Math.sin((uCentered * uCentered + vCentered * vCentered) * 20 - time * 1.4) * 6;

          let dispY = wave1 + wave2 + ripple;
          let dispX = Math.cos(v * Math.PI * 2.6 + time * 0.7 + u * 2.4) * 5;

          if (pointer.active && !pointer.isTouch && !reducedMotion) {
            const dx = baseX - pointer.x;
            const dy = baseY - pointer.y;
            const dSq = dx * dx + dy * dy;
            const matRadius = 190;
            if (dSq < matRadius * matRadius) {
              const d = Math.sqrt(dSq);
              const factor = 1 - d / matRadius;
              dispY += factor * factor * 18;
              dispX += (dx / (d + 1)) * factor * 7;
            }
          }

          const edgeDist = Math.max(Math.abs(uCentered * 2), Math.abs(vCentered * 2));
          const alphaMask = Math.max(
            0.28,
            1 - Math.pow(Math.max(0, (edgeDist - 0.78) / 0.35), 2)
          );

          rowPts[c] = { x: baseX + dispX, y: baseY + dispY, a: alphaMask };
        }
        grid[r] = rowPts;
      }

      ctx.lineWidth = 1.15;
      for (let r = 0; r <= rows; r++) {
        const rowPts = grid[r];
        for (let c = 0; c < cols; c++) {
          const p0 = rowPts[c];
          const p1 = rowPts[c + 1];
          const segAlpha = Math.min(p0.a, p1.a) * 0.19;
          if (segAlpha <= 0.004) continue;

          ctx.strokeStyle = `rgba(172, 181, 196, ${segAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }

      for (let c = 0; c <= cols; c += 2) {
        for (let r = 0; r < rows; r++) {
          const p0 = grid[r][c];
          const p1 = grid[r + 1][c];
          const segAlpha = Math.min(p0.a, p1.a) * 0.115;
          if (segAlpha <= 0.004) continue;

          ctx.strokeStyle = `rgba(154, 163, 178, ${segAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }

      for (let r = 1; r < rows; r += 2) {
        for (let c = 1; c < cols; c += 2) {
          const pt = grid[r][c];
          const nodeAlpha = pt.a * 0.26;
          if (nodeAlpha <= 0.01) continue;

          ctx.fillStyle = `rgba(202, 210, 222, ${nodeAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      renderSpaceMat(time);

      if (pointer.active && !pointer.isTouch && !reducedMotion) {
        const glow = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          220
        );
        glow.addColorStop(0, 'rgba(185, 194, 208, 0.045)');
        glow.addColorStop(0.55, 'rgba(125, 134, 146, 0.016)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
      }

      for (let i = 0; i < ambientMotes.length; i++) {
        const m = ambientMotes[i];
        const mx = m.x + parallax.x * m.depth;
        const my = m.y + parallax.y * m.depth;
        const alpha = m.alpha * (0.85 + 0.15 * Math.sin(time * 0.35 + m.phase));

        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, m.radius * 2.5);
        grad.addColorStop(0, `rgba(170, 178, 190, ${alpha.toFixed(4)})`);
        grad.addColorStop(1, 'rgba(170, 178, 190, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, m.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = p.x + parallax.x * p.depth;
        const py = p.y + parallax.y * p.depth;
        const twinkle = reducedMotion
          ? 1
          : 0.82 + 0.18 * Math.sin(time * p.twinkleFreq + p.phase);
        const alpha = Math.min(0.88, p.baseAlpha * twinkle + p.energy * 0.34);
        const drawSize = p.size * (1 + p.energy * 0.35);

        if (p.energy > 0.08 && pointer.active && !pointer.isTouch) {
          ctx.strokeStyle = `rgba(190, 199, 215, ${(p.energy * 0.15).toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, drawSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const stop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const start = () => {
      if (rafId !== null) return;
      lastTime = performance.now();
      const tick = (now: number) => {
        if (isHidden || reducedMotion) {
          rafId = null;
          return;
        }
        const dt = Math.min((now - lastTime) / 16.6667, 2.5);
        lastTime = now;
        elapsed += dt * 0.01667;
        update(dt);
        renderFrame(elapsed);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        initParticles();
        if (reducedMotion) renderFrame(0);
      }, 120);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        pointer.isTouch = true;
        return;
      }
      pointer.isTouch = false;
      pointer.active = true;
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibilityChange = () => {
      isHidden = document.hidden;
      if (isHidden) stop();
      else if (!reducedMotion) start();
    };

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        stop();
        renderFrame(0);
      } else {
        start();
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);

    resize();
    initParticles();
    if (reducedMotion) renderFrame(0);
    else start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030406]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 68% 54% at 50% 34%, rgba(30, 34, 41, 0.24) 0%, rgba(14, 16, 20, 0.1) 48%, transparent 78%), radial-gradient(ellipse 52% 45% at 78% 76%, rgba(24, 27, 33, 0.16) 0%, transparent 70%), radial-gradient(ellipse 46% 40% at 18% 72%, rgba(20, 23, 28, 0.14) 0%, transparent 68%)',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 82% 80% at 50% 50%, transparent 52%, rgba(2, 3, 4, 0.45) 82%, rgba(0, 0, 0, 0.78) 100%)',
        }}
      />
    </div>
  );
});
