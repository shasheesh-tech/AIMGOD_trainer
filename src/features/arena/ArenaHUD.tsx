import React from 'react';
import { Clock, Zap, Target, ArrowLeft, Crosshair, Activity } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface ArenaHUDProps {
  timeLeft: number;
  score: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgReactionTime: number;
  countdown: number | null; // 3, 2, 1, or null when active
  lastFeedback: { type: 'hit' | 'miss'; time: number } | null;
  onAbort: () => void;
}

export const ArenaHUD: React.FC<ArenaHUDProps> = React.memo(({
  timeLeft,
  score,
  hits,
  misses,
  accuracy,
  avgReactionTime,
  countdown,
  lastFeedback,
  onAbort,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between bg-dark-950/85 border border-dark-750/90 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md pointer-events-auto max-w-5xl mx-auto w-full">
        {/* Left: Abort & Mode Badge */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={onAbort}
          >
            Abort
          </Button>
          <div className="h-6 w-px bg-dark-750 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
              Static Target Practice
            </span>
          </div>
        </div>

        {/* Center/Right: Live Telemetry Digits */}
        <div className="flex items-center gap-5 sm:gap-7 font-mono text-center">
          {/* Time Remaining */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-brand-cyan" /> TIME
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${timeLeft <= 5 ? 'text-brand-rose animate-pulse' : 'text-brand-cyan'}`}>
              {timeLeft.toFixed(1)}s
            </div>
          </div>

          <div className="h-8 w-px bg-dark-800" />

          {/* Current Score */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-brand-amber" /> SCORE
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100">
              {score}
            </div>
          </div>

          <div className="h-8 w-px bg-dark-800" />

          {/* Live Accuracy */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-brand-emerald" /> ACCURACY
            </div>
            <div className="text-xl sm:text-2xl font-bold text-brand-emerald">
              {accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="h-8 w-px bg-dark-800 hidden md:block" />

          {/* Hits vs Misses */}
          <div className="hidden md:block">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">
              HITS / MISS
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-300">
              <span className="text-brand-emerald">{hits}</span> / <span className="text-brand-rose">{misses}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-dark-800 hidden lg:block" />

          {/* Average Reaction Time */}
          <div className="hidden lg:block">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-brand-cyan" /> REACTION
            </div>
            <div className="text-sm sm:text-base font-bold text-brand-cyan">
              {avgReactionTime > 0 ? `${avgReactionTime}ms` : '---'}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Edge Hit / Miss Feedback Flash */}
      {lastFeedback && (
        <div
          key={`${lastFeedback.type}-${lastFeedback.time}`}
          className={`absolute inset-0 pointer-events-none animate-feedback-flash ${
            lastFeedback.type === 'hit'
              ? 'border-2 border-brand-cyan/35'
              : 'border-2 border-brand-rose/40 bg-brand-rose/5'
          }`}
        />
      )}

      {/* Ready Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-dark-950/75 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto z-30">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="cyan" size="md">
              DRILL COMMENCING
            </Badge>
            <div className="text-7xl sm:text-9xl font-display font-black text-brand-cyan text-glow-cyan">
              {countdown > 0 ? countdown : 'ENGAGE!'}
            </div>
            <p className="text-xs font-mono text-slate-300 uppercase tracking-wider">
              Aim with mouse cursor &bull; Click 3D targets &bull; Eliminate rapidly
            </p>
          </div>
        </div>
      )}

      {/* Footer Aim Guidance */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400/80 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-brand-cyan" />
          <span>RAYCAST HIT ENGINE ACTIVE &bull; FREE CURSOR MODE</span>
        </div>
        <div className="hidden sm:block">
          CLICK TARGETS = HIT &bull; CLICK WALL = MISS
        </div>
      </div>
    </div>
  );
});
