import React from 'react';
import { RotateCcw, LayoutDashboard, Target, Zap, Clock, Trophy, Flame, Play } from 'lucide-react';
import { SessionResult } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { InteractiveParticleObject } from '../../components/three/InteractiveParticleObject';

interface ResultsScreenProps {
  result: SessionResult | null;
  onRetry: () => void;
  onReturnDashboard: () => void;
  onViewHistory: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onRetry,
  onReturnDashboard,
  onViewHistory,
}) => {
  if (!result) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-dark-750 flex items-center justify-center mx-auto text-brand-cyan">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold uppercase text-slate-100">
            No Recent Performance Debrief
          </h2>
          <p className="text-xs text-slate-400">
            Launch a training run in the arena to generate live performance statistics.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={<Play className="w-4 h-4 fill-current" />}
          onClick={onReturnDashboard}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const getRankBadge = (acc: number) => {
    if (acc >= 95) return { label: 'GODLIKE // S-TIER', variant: 'cyan' as const };
    if (acc >= 90) return { label: 'MASTER // A-TIER', variant: 'emerald' as const };
    if (acc >= 75) return { label: 'ELITE // B-TIER', variant: 'amber' as const };
    return { label: 'DRILL // C-TIER', variant: 'neutral' as const };
  };

  const rank = getRankBadge(result.accuracy);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Badge variant={rank.variant} size="md" pulse>
            {rank.label}
          </Badge>
          <span className="text-xs font-mono text-slate-400">SESSION RECORDED</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-wider text-slate-100 uppercase">
          Performance Debrief
        </h1>
        <p className="text-sm text-slate-400 font-mono">
          Session #{result.id.substring(0, 10)} &bull; {result.config.duration}s Drill &bull; {result.config.mode.replace('_', ' ').toUpperCase()} &bull; {result.config.targetShape.toUpperCase()} ({result.config.targetSize})
        </p>
      </div>

      {/* Primary Score Highlight */}
      <div className="lab-panel relative rounded-lg bg-[#0a0b0e]/55 border border-[#35383E]/75 backdrop-blur-[3px] p-6 sm:p-8 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs font-mono uppercase tracking-widest text-[#BEC7D7] flex items-center justify-center md:justify-start gap-1.5 mb-1">
              <Trophy className="w-4 h-4" /> TOTAL SCORE
            </div>
            <div className="text-5xl sm:text-7xl font-display font-bold text-[#E4E2E3] tracking-tight">
              {result.score.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-[#9FA4AE] mt-2">
              {result.hits} targets eliminated &bull; {result.avgReactionTimeMs > 0 ? `${result.avgReactionTimeMs}ms average reaction` : 'Instant execution'}
            </div>
          </div>

          <div className="w-48 h-44 sm:w-56 sm:h-48 shrink-0 rounded-lg bg-[#050608]/50 border border-[#35383E]/75 overflow-hidden">
            <InteractiveParticleObject
              variant="precision_target"
              scale={1.16}
              className="w-full h-full"
              hint="DRAG PRECISION CORE"
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Accuracy */}
        <Card className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase text-slate-400 mb-1">
            <Target className="w-3.5 h-3.5 text-brand-emerald" /> ACCURACY
          </div>
          <div
            className={`text-2xl sm:text-3xl font-display font-black ${
              result.accuracy >= 90
                ? 'text-brand-emerald'
                : result.accuracy >= 75
                ? 'text-brand-amber'
                : 'text-brand-rose'
            }`}
          >
            {result.accuracy}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            {result.hits} / {result.totalShots} on target
          </div>
        </Card>

        {/* Avg Reaction Time */}
        <Card className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" /> REACTION TIME
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-brand-cyan">
            {result.avgReactionTimeMs > 0 ? `${result.avgReactionTimeMs}ms` : '---'}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Average time to hit
          </div>
        </Card>

        {/* Hits */}
        <Card className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-brand-amber" /> TARGETS HIT
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-slate-100">
            {result.hits}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Clean eliminations
          </div>
        </Card>

        {/* Misses */}
        <Card className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-brand-rose" /> MISSES
          </div>
          <div className="text-2xl sm:text-3xl font-display font-black text-brand-rose">
            {result.misses}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Off-target clicks
          </div>
        </Card>
      </div>

      {/* Action Footer Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          icon={<RotateCcw className="w-5 h-5" />}
          onClick={onRetry}
          className="w-full sm:w-auto"
        >
          Retry Session
        </Button>
        <Button
          variant="secondary"
          size="lg"
          icon={<LayoutDashboard className="w-5 h-5" />}
          onClick={onReturnDashboard}
          className="w-full sm:w-auto"
        >
          Return to Dashboard
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onViewHistory}
          className="w-full sm:w-auto"
        >
          View History
        </Button>
      </div>
    </div>
  );
};
