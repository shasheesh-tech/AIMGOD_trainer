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
import { InteractiveParticleObject } from '../../components/three/InteractiveParticleObject';
import { CrosshairPreview, getCrosshairLabel } from '../../utils/crosshair';

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
      {/* Interactive 3D Ballistic Projectile Hero */}
      <div className="text-center space-y-3">
        <div className="w-72 h-44 sm:w-80 sm:h-48 mx-auto rounded-lg bg-[#050608]/50 border border-[#35383E]/75 overflow-hidden">
          <InteractiveParticleObject
            variant="projectile"
            scale={1.18}
            className="w-full h-full"
            hint="DRAG 3D PROJECTILE"
          />
        </div>
        <div>
          <Badge variant="cyan" size="md" pulse>READY TO ENGAGE</Badge>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold text-[#E4E2E3] uppercase tracking-wide">
            Arena Briefing
          </h1>
          <p className="text-sm text-[#9FA4AE] mt-1">
            Review your session parameters below, then press <strong className="text-[#E4E2E3]">Start Session</strong> to begin the countdown.
          </p>
        </div>
      </div>

      {/* Config summary card */}
      <div className="lab-panel rounded-lg bg-[#0a0b0e]/55 border border-[#35383E]/75 backdrop-blur-[3px] overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-3.5 border-b border-[#35383E]/60">
          <span className="text-xs font-mono text-[#9FA4AE] uppercase tracking-widest">Mission Parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-[#35383E]/55">
          {/* Mode */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Target className="w-3 h-3" /> Mode
            </div>
            <div className="text-xs font-display font-bold text-[#E4E2E3] uppercase">Static Practice</div>
          </div>

          {/* Duration */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Duration
            </div>
            <div className="text-lg font-display font-bold text-[#BEC7D7]">
              {config.duration}s
            </div>
          </div>

          {/* Shape */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Sliders className="w-3 h-3" /> Target
            </div>
            <div className="text-xs font-display font-bold text-[#E4E2E3] uppercase">{shapeLabel}</div>
          </div>

          {/* Size */}
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Maximize2 className="w-3 h-3" /> Size
            </div>
            <div className="text-xs font-display font-bold text-[#E4E2E3] uppercase leading-tight">{sizeLabel}</div>
          </div>

          {/* Theme — spans half */}
          <div className="col-span-2 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Palette className="w-3 h-3" /> Arena
            </div>
            <div className={`text-xs font-display font-bold uppercase ${themeAccent}`}>
              {THEME_LABELS[config.arenaTheme]}
            </div>
          </div>

          {/* Crosshair — spans half */}
          <div className="col-span-2 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9FA4AE] uppercase tracking-widest">
              <Crosshair className="w-3 h-3" /> Crosshair
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#050608]/75 border border-[#8F9196]/55 flex items-center justify-center shrink-0">
                <CrosshairPreview style={config.crosshair ?? 'plus'} size={22} active />
              </div>
              <span className="text-xs font-display font-bold uppercase text-[#BEC7D7]">
                {getCrosshairLabel(config.crosshair ?? 'plus')}
              </span>
            </div>
          </div>

          {/* Custom PNG notice if applicable */}
          {config.targetShape === 'custom' && config.customTargetUrl && (
            <div className="col-span-2 sm:col-span-4 p-4 space-y-1">
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
