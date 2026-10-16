import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  SessionConfig,
  SessionResult,
  MM_TO_SCENE,
  SIZE_PRESETS,
  CUSTOM_SIZE_DEFAULT_MM,
} from '../../types';
import { ArenaScene, ActiveTarget } from './ArenaScene';
import { ArenaHUD } from './ArenaHUD';

interface ArenaScreenProps {
  config: SessionConfig;
  onFinishSession: (result: SessionResult) => void;
  onExit: () => void;
}

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

  // 3 active targets
  const [targets, setTargets] = useState<ActiveTarget[]>([]);

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
    setTargets(initial);
  }, [generateNewPosition]);

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
      const now = performance.now();

      setTargets((prev) => {
        const hitTarget = prev.find((t) => t.id === hitId);
        if (!hitTarget) return prev;

        const reactionMs = Math.round(now - hitTarget.spawnTime);
        setReactionTimes((r) => [...r, reactionMs]);
        const speedBonus = Math.max(0, Math.min(150, Math.round((600 - reactionMs) * 0.4)));
        setScore((s) => s + 100 + speedBonus);
        setHits((h) => h + 1);

        const remaining = prev.filter((t) => t.id !== hitId);
        const newPos = generateNewPosition(remaining.map((t) => t.position));
        const replacement: ActiveTarget = {
          id: `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          position: newPos,
          spawnTime: now,
        };
        return [...remaining, replacement];
      });

      setLastFeedback({ type: 'hit', time: Date.now() });
    },
    [generateNewPosition]
  );

  const handleMissClick = useCallback(() => {
    if (!isPlayingRef.current || hasEndedRef.current) return;
    setMisses((m) => m + 1);
    setLastFeedback({ type: 'miss', time: Date.now() });
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
      onContextMenu={(e) => e.preventDefault()}
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

      <div className="w-full h-full cursor-crosshair">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <ArenaScene
            targets={targets}
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
