import React from 'react';
import { Play, ArrowLeft, Crosshair, Target, Clock, Palette, Maximize2, Sliders } from 'lucide-react';
import {
  SessionConfig,
  SIZE_PRESETS,
  CUSTOM_SIZE_DEFAULT_MM,
  ArenaTheme,
} from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface ArenaReadyScreenProps {
  config: SessionConfig;
  onStartSession: () => void;
  onBackToDashboard: () => void;
}

const THEME_LABELS: Record<ArenaTheme, string> = {
  cyber_dark: 'Cyber Dark',
  tactical_gray: 'Tactical Gray',
  neon_grid: 'Neon Grid',
  void_space: 'Void Space',
  arctic_white: 'Arctic White',
  ember_forge: 'Ember Forge',
  deep_ocean: 'Deep Ocean',
};

const THEME_ACCENT: Record<ArenaTheme, string> = {
  cyber_dark: 'text-brand-cyan',
  tactical_gray: 'text-slate-300',
  neon_grid: 'text-brand-purple',
  void_space: 'text-blue-400',
  arctic_white: 'text-sky-200',
  ember_forge: 'text-orange-400',
  deep_ocean: 'text-cyan-400',
};

export const ArenaReadyScreen: React.FC<ArenaReadyScreenProps> = ({
  config,
  onStartSession,
  onBackToDashboard,
}) => {
  const diameterMm =
    config.targetSize === 'custom'
      ? (config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM)
      : SIZE_PRESETS[config.targetSize];

  const sizeLabel =
    config.targetSize === 'custom'
      ? `Custom — ${diameterMm}mm virtual`
      : `${config.targetSize.charAt(0).toUpperCase() + config.targetSize.slice(1)} — ${diameterMm}mm virtual`;

  const shapeLabel = config.targetShape === 'custom'
    ? 'Custom PNG'
    : config.targetShape.charAt(0).toUpperCase() + config.targetShape.slice(1);

  const themeAccent = THEME_ACCENT[config.arenaTheme];

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in space-y-8">
      {/* Glowing crosshair hero */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          {/* Outer glow ring animation */}
          <div className="absolute w-32 h-32 rounded-full bg-brand-cyan/10 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-24 h-24 rounded-full bg-brand-cyan/15 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-dark-900 border-2 border-brand-cyan/70 shadow-glow-cyan flex items-center justify-center">
            <Crosshair className="w-10 h-10 text-brand-cyan" />
          </div>
        </div>
        <div>
          <Badge variant="cyan" size="md" pulse>READY TO ENGAGE</Badge>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-black text-slate-100 uppercase tracking-wide">
            Arena Briefing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your session parameters below, then press <strong className="text-brand-cyan">Start Session</strong> to begin the countdown.
          </p>
        </div>
      </div>

      {/* Config summary card */}
      <div className="rounded-2xl bg-dark-900/90 border border-brand-cyan/25 shadow-glow-cyan-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-dark-800 bg-dark-950/60">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Mission Parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-dark-800/60">
          {/* Mode */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Target className="w-3 h-3" /> Mode
            </div>
            <div className="text-xs font-display font-bold text-slate-200 uppercase">Static Practice</div>
          </div>

          {/* Duration */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Duration
            </div>
            <div className="text-lg font-display font-black text-brand-cyan">
              {config.duration}s
            </div>
          </div>

          {/* Shape */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Sliders className="w-3 h-3" /> Target
            </div>
            <div className="text-xs font-display font-bold text-slate-200 uppercase">{shapeLabel}</div>
          </div>

          {/* Size */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Maximize2 className="w-3 h-3" /> Size
            </div>
            <div className="text-xs font-display font-bold text-slate-200 uppercase leading-tight">{sizeLabel}</div>
          </div>

          {/* Theme — spans half */}
          <div className="col-span-2 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Palette className="w-3 h-3" /> Arena
            </div>
            <div className={`text-xs font-display font-bold uppercase ${themeAccent}`}>
              {THEME_LABELS[config.arenaTheme]}
            </div>
          </div>

          {/* Custom PNG notice if applicable */}
          {config.targetShape === 'custom' && config.customTargetUrl && (
            <div className="col-span-2 p-4 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Custom PNG</div>
              <div className="flex items-center gap-2">
                <img
                  src={config.customTargetUrl}
                  alt="Custom target preview"
                  className="w-8 h-8 rounded object-contain bg-dark-800 border border-dark-700"
                />
                <span className="text-xs text-brand-cyan font-mono">Loaded</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gameplay instructions */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Aim', desc: 'Move mouse over targets' },
          { label: 'Shoot', desc: 'Click to register hit' },
          { label: 'Score', desc: 'Speed bonus for fast hits' },
        ].map((tip) => (
          <div key={tip.label} className="p-3 rounded-xl bg-dark-900/60 border border-dark-800 space-y-1">
            <div className="text-xs font-display font-bold text-brand-cyan uppercase tracking-wide">{tip.label}</div>
            <div className="text-[11px] text-slate-400">{tip.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="ghost"
          size="md"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBackToDashboard}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={<Play className="w-5 h-5 fill-current" />}
          onClick={onStartSession}
          className="sm:flex-1"
          fullWidth
        >
          Start Session
        </Button>
      </div>

      <p className="text-center text-[11px] font-mono text-slate-500">
        FREE CURSOR AIM &bull; RAYCAST HIT DETECTION &bull; NO POINTER LOCK
      </p>
    </div>
  );
};
