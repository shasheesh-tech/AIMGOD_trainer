import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  SessionConfig,
  SessionResult,
  MM_TO_SCENE,
  SIZE_PRESETS,
  CUSTOM_SIZE_DEFAULT_MM,
} from '../../types';
import { ArenaScene, ActiveTarget, DyingTarget } from './ArenaScene';
import { ArenaHUD } from './ArenaHUD';
import { getCrosshairCursorCss } from '../../utils/crosshair';

interface ArenaScreenProps {
  config: SessionConfig;
  onFinishSession: (result: SessionResult) => void;
  onExit: () => void;
}

const CANVAS_CAMERA = { position: [0, 0, 7.5] as [number, number, number], fov: 50 };
const CANVAS_GL = { antialias: true, alpha: false, powerPreference: 'high-performance' as const };
const CANVAS_DPR: [number, number] = [1, 2];
const HIT_TRANSITION_MS = 105;

/** Convert SessionConfig size settings to a Three.js scene radius */
function configToRadius(config: SessionConfig): number {
  const diameterMm =
    config.targetSize === 'custom'
      ? (config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM)
      : SIZE_PRESETS[config.targetSize];
  return (diameterMm / 2) * MM_TO_SCENE;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  config,
  onFinishSession,
  onExit,
}) => {
  const targetRadius = configToRadius(config);

  // Gameplay State
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(config.duration);
  const [score, setScore] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ type: 'hit' | 'miss'; time: number } | null>(null);

  // 3 active targets + transient hit-disappear visuals
  const [targets, setTargets] = useState<ActiveTarget[]>([]);
  const [dyingTargets, setDyingTargets] = useState<DyingTarget[]>([]);
  const targetsRef = useRef<ActiveTarget[]>([]);
  const dyingTimeoutsRef = useRef<Set<number>>(new Set());

  // Minimum scene-space gap between target centres (scale with radius)
  const minDistance = Math.max(1.0, targetRadius * 8);

  const generateNewPosition = useCallback(
    (existingPositions: [number, number, number][]): [number, number, number] => {
      for (let i = 0; i < 60; i++) {
        const x = Number((Math.random() * 7.4 - 3.7).toFixed(2));
        const y = Number((Math.random() * 3.8 - 1.9).toFixed(2));
        const collision = existingPositions.some(
          ([ex, ey]) => Math.hypot(ex - x, ey - y) < minDistance
        );
        if (!collision) return [x, y, 0];
      }
      // Fallback: place anywhere if 60 attempts fail
      return [
        Number((Math.random() * 7.4 - 3.7).toFixed(2)),
        Number((Math.random() * 3.8 - 1.9).toFixed(2)),
        0,
      ];
    },
    [minDistance]
  );

  const initializeTargets = useCallback(() => {
    const initial: ActiveTarget[] = [];
    const now = performance.now();
    for (let i = 0; i < 3; i++) {
      const pos = generateNewPosition(initial.map((t) => t.position));
      initial.push({
        id: `tgt_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        position: pos,
        spawnTime: now,
      });
    }
    targetsRef.current = initial;
    setTargets(initial);
  }, [generateNewPosition]);

  // Clear pending hit-transition cleanup timers on unmount
  useEffect(() => {
    const timeouts = dyingTimeoutsRef.current;
    return () => {
      timeouts.forEach((tid) => window.clearTimeout(tid));
      timeouts.clear();
    };
  }, []);

  // Pre-match countdown then start playing
  useEffect(() => {
    initializeTargets();
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev > 1) return prev - 1;
        clearInterval(id);
        setIsPlaying(true);
        return null;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initializeTargets]);

  // Stable refs so timer callback always reads latest values
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const hitsRef = useRef(hits);
  hitsRef.current = hits;
  const missesRef = useRef(misses);
  missesRef.current = misses;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const reactionTimesRef = useRef(reactionTimes);
  reactionTimesRef.current = reactionTimes;
  const hasEndedRef = useRef(false);

  // Main precision game-loop timer (50ms tick)
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = performance.now();
    const durationMs = config.duration * 1000;

    const id = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, (durationMs - elapsed) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasEndedRef.current) {
        hasEndedRef.current = true;
        clearInterval(id);
        setIsPlaying(false);

        const finalHits = hitsRef.current;
        const finalMisses = missesRef.current;
        const totalShots = finalHits + finalMisses;
        const accuracy = totalShots > 0 ? Number(((finalHits / totalShots) * 100).toFixed(1)) : 0;
        const reactions = reactionTimesRef.current;
        const avgReaction =
          reactions.length > 0
            ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
            : 0;

        const result: SessionResult = {
          id: 'drill_' + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          config,
          score: scoreRef.current,
          accuracy,
          hits: finalHits,
          misses: finalMisses,
          totalShots,
          avgReactionTimeMs: avgReaction,
        };
        onFinishSession(result);
      }
    }, 50);

    return () => clearInterval(id);
  }, [isPlaying, config, onFinishSession]);

  const handleTargetHit = useCallback(
    (hitId: string) => {
      if (!isPlayingRef.current || hasEndedRef.current) return;

      const currentTargets = targetsRef.current;
      const hitTarget = currentTargets.find((t) => t.id === hitId);
      if (!hitTarget) return;

      const now = performance.now();
      const reactionMs = Math.round(now - hitTarget.spawnTime);
      const speedBonus = Math.max(0, Math.min(150, Math.round((600 - reactionMs) * 0.4)));

      const remaining = currentTargets.filter((t) => t.id !== hitId);
      // Also avoid the hit target's position so replacement doesn't overlap the disappear transition
      const newPos = generateNewPosition([
        ...remaining.map((t) => t.position),
        hitTarget.position,
      ]);
      const replacement: ActiveTarget = {
        id: `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        position: newPos,
        spawnTime: now,
      };

      const nextTargets = [...remaining, replacement];
      targetsRef.current = nextTargets;
      setTargets(nextTargets);

      // Brief, non-blocking disappear transition at the hit location
      const dyingId = `${hitTarget.id}_hit_${Math.random().toString(36).slice(2, 6)}`;
      setDyingTargets((prev) => [
        ...prev,
        { id: dyingId, position: hitTarget.position, hitTime: now },
      ]);
      const tid = window.setTimeout(() => {
        setDyingTargets((prev) => prev.filter((d) => d.id !== dyingId));
        dyingTimeoutsRef.current.delete(tid);
      }, HIT_TRANSITION_MS);
      dyingTimeoutsRef.current.add(tid);

      setReactionTimes((r) => [...r, reactionMs]);
      setScore((s) => s + 100 + speedBonus);
      setHits((h) => h + 1);
      setLastFeedback({ type: 'hit', time: now });
    },
    [generateNewPosition]
  );

  const handleMissClick = useCallback(() => {
    if (!isPlayingRef.current || hasEndedRef.current) return;
    setMisses((m) => m + 1);
    setLastFeedback({ type: 'miss', time: performance.now() });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const totalClicks = hits + misses;
  const liveAccuracy = totalClicks > 0 ? (hits / totalClicks) * 100 : 100;
  const liveAvgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  return (
    <div
      className="relative w-full h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden bg-dark-950 border border-dark-750 shadow-2xl select-none"
      onContextMenu={handleContextMenu}
    >
      <ArenaHUD
        timeLeft={timeLeft}
        score={score}
        hits={hits}
        misses={misses}
        accuracy={liveAccuracy}
        avgReactionTime={liveAvgReaction}
        countdown={countdown}
        lastFeedback={lastFeedback}
        onAbort={onExit}
      />

      <div
        className="w-full h-full"
        style={{ cursor: getCrosshairCursorCss(config.crosshair) }}
      >
        <Canvas
          camera={CANVAS_CAMERA}
          gl={CANVAS_GL}
          dpr={CANVAS_DPR}
        >
          <ArenaScene
            targets={targets}
            dyingTargets={dyingTargets}
            shape={config.targetShape}
            targetRadius={targetRadius}
            customUrl={config.customTargetUrl}
            theme={config.arenaTheme}
            onTargetHit={handleTargetHit}
            onMissClick={handleMissClick}
          />
        </Canvas>
      </div>
    </div>
  );
};
