import React, { useEffect, useRef } from 'react';
import { getParticleGeometry, ParticleObjectVariant } from './particleGeometries';

interface InteractiveParticleObjectProps {
  variant: ParticleObjectVariant;
  className?: string;
  /** Scale multiplier for the 3D geometry inside its canvas */
  scale?: number;
  /** Disable pointer capture for purely ambient background usage */
  interactive?: boolean;
  /** Overall opacity multiplier (useful for subtle background placement) */
  opacity?: number;
  /** Optional subtle hint shown only when interactive */
  hint?: string;
}

/**
 * Monochrome interactive 3D point-cloud & wireframe object.
 * Supports drag-to-rotate with inertia, cursor parallax/proximity distortion,
 * off-screen IntersectionObserver pausing, and prefers-reduced-motion.
 */
export const InteractiveParticleObject: React.FC<InteractiveParticleObjectProps> = React.memo(
  ({
    variant,
    className = '',
    scale = 1,
    interactive = true,
    opacity = 1,
    hint,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const geom = getParticleGeometry(variant);
      const { points, edges, defaultRotation, aspectMode } = geom;

      let width = container.clientWidth || 240;
      let height = container.clientHeight || 240;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);

      const rot = {
        x: defaultRotation[0],
        y: defaultRotation[1],
        z: defaultRotation[2],
      };
      const vel = { x: 0, y: 0 };
      const drag = { active: false, lastX: 0, lastY: 0 };
      const pointer = { x: 0, y: 0, normX: 0, normY: 0, inside: false };

      let isVisible = true;
      let isHidden = document.hidden;
      let rafId: number | null = null;
      let lastTime = 0;
      let elapsed = 0;

      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      let reducedMotion = reducedMotionQuery.matches;

      // Pre-allocated projection buffers to avoid per-frame GC allocations
      const projX = new Float32Array(points.length);
      const projY = new Float32Array(points.length);
      const projZ = new Float32Array(points.length);
      const projAlpha = new Float32Array(points.length);
      const projSize = new Float32Array(points.length);
      const sortOrder = new Int32Array(points.length);
      for (let i = 0; i < points.length; i++) sortOrder[i] = i;

      const updateCanvasSize = () => {
        width = Math.max(1, container.clientWidth);
        height = Math.max(1, container.clientHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const renderFrame = (time: number) => {
        ctx.clearRect(0, 0, width, height);

        const baseScale =
          aspectMode === 'wide'
            ? Math.min(width * 0.275, height * 0.82) * scale
            : Math.min(width, height) * 0.42 * scale;
        const fov = 4.6;
        const cx = width * 0.5;
        const cy = height * 0.48 + (reducedMotion ? 0 : Math.sin(time * 1.15) * 3.5);

        // Include subtle cursor parallax tilt + gentle directional sway for wide silhouettes
        const swayYaw =
          aspectMode === 'wide' && !reducedMotion ? Math.sin(time * 0.75) * 0.16 : 0;
        const swayPitch =
          aspectMode === 'wide' && !reducedMotion ? Math.cos(time * 0.55) * 0.05 : 0;
        const parallaxX = interactive && pointer.inside ? pointer.normY * 0.14 : 0;
        const parallaxY = interactive && pointer.inside ? pointer.normX * 0.18 : 0;

        const rx = rot.x + parallaxX + swayPitch;
        const ry = rot.y + parallaxY + swayYaw;
        const rz = rot.z;

        const cosX = Math.cos(rx);
        const sinX = Math.sin(rx);
        const cosY = Math.cos(ry);
        const sinY = Math.sin(ry);
        const cosZ = Math.cos(rz);
        const sinZ = Math.sin(rz);

        const focusPull = interactive && pointer.inside ? 0.92 : 1.0;

        // 1. Render thin structural wireframe edges first (subtle backdrop)
        ctx.lineWidth = 0.95;
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];

          // Rotate p1
          let x1 = e.x1;
          let y1 = e.y1 * cosX - e.z1 * sinX;
          let z1 = e.y1 * sinX + e.z1 * cosX;
          const x1y = x1 * cosY + z1 * sinY;
          z1 = -x1 * sinY + z1 * cosY;
          x1 = x1y;
          const x1z = x1 * cosZ - y1 * sinZ;
          y1 = x1 * sinZ + y1 * cosZ;
          x1 = x1z;

          // Rotate p2
          let x2 = e.x2;
          let y2 = e.y2 * cosX - e.z2 * sinX;
          let z2 = e.y2 * sinX + e.z2 * cosX;
          const x2y = x2 * cosY + z2 * sinY;
          z2 = -x2 * sinY + z2 * cosY;
          x2 = x2y;
          const x2z = x2 * cosZ - y2 * sinZ;
          y2 = x2 * sinZ + y2 * cosZ;
          x2 = x2z;

          const p1Scale = fov / (fov + z1);
          const p2Scale = fov / (fov + z2);
          const sx1 = cx + x1 * baseScale * p1Scale;
          const sy1 = cy + y1 * baseScale * p1Scale;
          const sx2 = cx + x2 * baseScale * p2Scale;
          const sy2 = cy + y2 * baseScale * p2Scale;

          const avgDepth = (z1 + z2) * 0.5;
          const depthFade = Math.max(0.25, Math.min(1.0, 0.72 - avgDepth * 0.32));
          const alpha = e.alpha * depthFade * opacity;
          if (alpha <= 0.01) continue;

          ctx.strokeStyle = `rgba(176, 184, 196, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(sx1, sy1);
          ctx.lineTo(sx2, sy2);
          ctx.stroke();
        }

        // 2. Project all 3D particles + apply gentle cursor proximity field
        const interactR = Math.min(width, height) * 0.28;
        const interactRSq = interactR * interactR;

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const groupScale = p.group === 1 ? focusPull : 1;

          const px0 = p.x * groupScale;
          const py0 = p.y * groupScale;
          const pz0 = p.z * groupScale;

          // Rotate X -> Y -> Z
          const y1 = py0 * cosX - pz0 * sinX;
          const z1 = py0 * sinX + pz0 * cosX;
          const x2 = px0 * cosY + z1 * sinY;
          const z2 = -px0 * sinY + z1 * cosY;
          const x3 = x2 * cosZ - y1 * sinZ;
          const y3 = x2 * sinZ + y1 * cosZ;

          const persp = fov / (fov + z2);
          let sx = cx + x3 * baseScale * persp;
          let sy = cy + y3 * baseScale * persp;

          let excitement = 0;
          if (interactive && pointer.inside && !drag.active && !reducedMotion) {
            const dx = sx - pointer.x;
            const dy = sy - pointer.y;
            const dSq = dx * dx + dy * dy;
            if (dSq < interactRSq && dSq > 0.01) {
              const dist = Math.sqrt(dSq);
              const falloff = 1 - dist / interactR;
              const push = falloff * falloff * 11;
              sx += (dx / dist) * push;
              sy += (dy / dist) * push;
              excitement = falloff;
            }
          }

          const depthFactor = Math.max(0.22, Math.min(1.15, 0.78 - z2 * 0.38));
          const pulse = reducedMotion ? 1 : 0.88 + 0.12 * Math.sin(time * 2.1 + p.phase);

          projX[i] = sx;
          projY[i] = sy;
          projZ[i] = z2;
          projAlpha[i] = Math.min(0.95, p.brightness * depthFactor * pulse * opacity + excitement * 0.25);
          projSize[i] = p.size * persp * (1.08 + excitement * 0.45);
        }

        // Depth-sort back-to-front (largest z first)
        sortOrder.sort((a, b) => projZ[b] - projZ[a]);

        for (let idx = 0; idx < sortOrder.length; idx++) {
          const i = sortOrder[idx];
          const alpha = projAlpha[i];
          if (alpha <= 0.02) continue;

          const z = projZ[i];
          // Far particles look space-gray; near particles look crisp silver-starlight
          const shade = Math.round(135 + Math.max(0, Math.min(1, 0.55 - z * 0.45)) * 105);
          ctx.fillStyle = `rgba(${shade}, ${shade + 4}, ${Math.min(255, shade + 10)}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(projX[i], projY[i], projSize[i], 0, Math.PI * 2);
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
        if (rafId !== null || !isVisible || isHidden || reducedMotion) return;
        lastTime = performance.now();
        const tick = (now: number) => {
          if (!isVisible || isHidden || reducedMotion) {
            rafId = null;
            return;
          }
          const dt = Math.min((now - lastTime) / 16.6667, 2.5);
          lastTime = now;
          elapsed += dt * 0.01667;

          if (!drag.active) {
            // Apply drag inertia; radial objects gently spin continuously while directional silhouettes sway
            const idleYawRate = aspectMode === 'radial' ? 0.0032 : 0;
            rot.x += vel.x * dt;
            rot.y += (vel.y + idleYawRate) * dt;
            vel.x *= Math.pow(0.93, dt);
            vel.y *= Math.pow(0.93, dt);

            // Softly guide pitch back toward balanced viewing angle when idle
            rot.x += (defaultRotation[0] - rot.x) * 0.012 * dt;
          }

          renderFrame(elapsed);
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (!interactive) return;
        if (typeof e.button === 'number' && e.button !== 0) return;
        drag.active = true;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        vel.x = 0;
        vel.y = 0;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          // ignore if synthetic
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.normX = Math.max(-1, Math.min(1, (pointer.x / Math.max(1, rect.width) - 0.5) * 2));
        pointer.normY = Math.max(-1, Math.min(1, (pointer.y / Math.max(1, rect.height) - 0.5) * 2));
        pointer.inside =
          pointer.x >= 0 &&
          pointer.y >= 0 &&
          pointer.x <= rect.width &&
          pointer.y <= rect.height;

        if (drag.active) {
          const dx = e.clientX - drag.lastX;
          const dy = e.clientY - drag.lastY;
          drag.lastX = e.clientX;
          drag.lastY = e.clientY;

          const sens = 0.0085;
          rot.y += dx * sens;
          rot.x = Math.max(-1.25, Math.min(1.25, rot.x + dy * sens));
          vel.y = dx * sens * 0.45;
          vel.x = dy * sens * 0.45;
          if (reducedMotion) renderFrame(0);
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!drag.active) return;
        drag.active = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      };

      const onPointerLeave = () => {
        pointer.inside = false;
        drag.active = false;
      };

      const resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
        if (reducedMotion || !isVisible) renderFrame(elapsed);
      });
      resizeObserver.observe(container);

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
          if (isVisible && !isHidden && !reducedMotion) start();
          else stop();
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(container);

      const onVisibilityChange = () => {
        isHidden = document.hidden;
        if (isHidden) stop();
        else if (isVisible && !reducedMotion) start();
      };

      const onReducedMotionChange = (e: MediaQueryListEvent) => {
        reducedMotion = e.matches;
        if (reducedMotion) {
          stop();
          renderFrame(0);
        } else if (isVisible && !isHidden) {
          start();
        }
      };

      if (interactive) {
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerLeave);
      }
      document.addEventListener('visibilitychange', onVisibilityChange);
      reducedMotionQuery.addEventListener('change', onReducedMotionChange);

      updateCanvasSize();
      if (reducedMotion) renderFrame(0);
      else start();

      return () => {
        stop();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        if (interactive) {
          canvas.removeEventListener('pointerdown', onPointerDown);
          canvas.removeEventListener('pointermove', onPointerMove);
          canvas.removeEventListener('pointerup', onPointerUp);
          canvas.removeEventListener('pointercancel', onPointerUp);
          canvas.removeEventListener('pointerleave', onPointerLeave);
        }
        document.removeEventListener('visibilitychange', onVisibilityChange);
        reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
      };
    }, [variant, scale, interactive, opacity]);

    return (
      <div
        ref={containerRef}
        className={`relative select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'} ${className}`}
      >
        <canvas
          ref={canvasRef}
          className={`block w-full h-full ${interactive ? 'touch-none' : 'pointer-events-none'}`}
          aria-hidden="true"
        />
        {interactive && hint && (
          <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500/80 whitespace-nowrap">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
