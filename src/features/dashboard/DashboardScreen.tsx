import React, { useState } from 'react';
import {
  Play, Target, Clock, Palette, Maximize2, Shield, Sparkles, Upload,
  RotateCcw, Sliders,
} from 'lucide-react';
import {
  SessionConfig,
  SessionDuration,
  TargetShape,
  TargetSize,
  ArenaTheme,
  SIZE_PRESETS,
  CUSTOM_SIZE_MIN_MM,
  CUSTOM_SIZE_MAX_MM,
  CUSTOM_SIZE_DEFAULT_MM,
  MM_TO_SCENE,
} from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface DashboardScreenProps {
  config: SessionConfig;
  onUpdateConfig: (newConfig: Partial<SessionConfig>) => void;
  onStartTraining: () => void;
  onViewHistory: () => void;
}

const DURATION_OPTIONS: { value: SessionDuration; label: string; desc: string }[] = [
  { value: 15, label: '15s', desc: 'Blitz' },
  { value: 30, label: '30s', desc: 'Standard' },
  { value: 60, label: '60s', desc: '1 min' },
  { value: 90, label: '90s', desc: '1.5 min' },
  { value: 120, label: '2 min', desc: '2 min' },
  { value: 150, label: '2.5m', desc: '2.5 min' },
  { value: 180, label: '3 min', desc: '3 min' },
];

const SHAPE_OPTIONS: { id: TargetShape; label: string; icon: string; color: string }[] = [
  { id: 'sphere', label: 'Sphere', icon: '●', color: 'text-brand-cyan' },
  { id: 'box', label: 'Cube', icon: '■', color: 'text-orange-400' },
  { id: 'cylinder', label: 'Disc', icon: '⬬', color: 'text-brand-amber' },
  { id: 'torus', label: 'Ring', icon: '◎', color: 'text-brand-purple' },
  { id: 'diamond', label: 'Diamond', icon: '◆', color: 'text-sky-300' },
  { id: 'triangle', label: 'Tri', icon: '▲', color: 'text-brand-emerald' },
  { id: 'custom', label: 'PNG', icon: '★', color: 'text-slate-300' },
];

const PRESET_SIZES: { id: Exclude<TargetSize, 'custom'>; label: string; desc: string }[] = [
  { id: 'small', label: 'Small', desc: `${SIZE_PRESETS.small}mm` },
  { id: 'medium', label: 'Medium', desc: `${SIZE_PRESETS.medium}mm` },
  { id: 'large', label: 'Large', desc: `${SIZE_PRESETS.large}mm` },
];

const THEME_OPTIONS: {
  id: ArenaTheme;
  label: string;
  swatchBg: string;
  swatchBorder: string;
  accentText: string;
  desc: string;
}[] = [
  { id: 'cyber_dark', label: 'Cyber Dark', swatchBg: 'bg-[#0b0f17]', swatchBorder: 'border-cyan-500', accentText: 'text-brand-cyan', desc: 'Neon-lit tactical HUD' },
  { id: 'tactical_gray', label: 'Tactical Gray', swatchBg: 'bg-[#1c2233]', swatchBorder: 'border-slate-500', accentText: 'text-slate-300', desc: 'Military grey walls' },
  { id: 'neon_grid', label: 'Neon Grid', swatchBg: 'bg-[#0c0620]', swatchBorder: 'border-fuchsia-500', accentText: 'text-fuchsia-400', desc: 'Magenta grid arcade' },
  { id: 'void_space', label: 'Void Space', swatchBg: 'bg-[#000010]', swatchBorder: 'border-blue-700', accentText: 'text-blue-400', desc: 'Empty cosmos black' },
  { id: 'arctic_white', label: 'Arctic White', swatchBg: 'bg-[#e8eef8]', swatchBorder: 'border-sky-300', accentText: 'text-sky-600', desc: 'Bright snow range' },
  { id: 'ember_forge', label: 'Ember Forge', swatchBg: 'bg-[#190a02]', swatchBorder: 'border-orange-600', accentText: 'text-orange-400', desc: 'Volcanic fire arena' },
  { id: 'deep_ocean', label: 'Deep Ocean', swatchBg: 'bg-[#010d1a]', swatchBorder: 'border-cyan-700', accentText: 'text-cyan-400', desc: 'Abyssal underwater' },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  config,
  onUpdateConfig,
  onStartTraining,
  onViewHistory,
}) => {
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(
    config.customTargetUrl || null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCustomFilePreview(previewUrl);
      onUpdateConfig({ targetShape: 'custom', customTargetUrl: previewUrl });
    }
  };

  const effectiveDiameterMm =
    config.targetSize === 'custom'
      ? (config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM)
      : SIZE_PRESETS[config.targetSize as Exclude<typeof config.targetSize, 'custom'>];

  // Live preview size for the small circle indicator (max 48px at 400mm)
  const previewPx = Math.round(
    8 + ((effectiveDiameterMm - CUSTOM_SIZE_MIN_MM) / (CUSTOM_SIZE_MAX_MM - CUSTOM_SIZE_MIN_MM)) * 40
  );

  const handleSliderChange = (value: number) => {
    onUpdateConfig({ targetSize: 'custom', customSizeMm: value });
  };

  const handleResetToPreset = (preset: Exclude<TargetSize, 'custom'>) => {
    onUpdateConfig({ targetSize: preset, customSizeMm: SIZE_PRESETS[preset] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Banner ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-brand-cyan/30 p-6 sm:p-8 overflow-hidden shadow-glow-cyan-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="cyan" size="md">SESSION BRIEFING</Badge>
              <span className="text-xs font-mono text-slate-400">CONFIGURE &bull; LAUNCH &bull; ELIMINATE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-black tracking-wide text-slate-100 uppercase">
              Target Practice Arena
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Configure your session below. Free-cursor aiming · 3D raycast hit detection · live accuracy tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button variant="outline" size="md" onClick={onViewHistory}>
              Session History
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Play className="w-5 h-5 fill-current" />}
              onClick={onStartTraining}
            >
              Enter Arena
            </Button>
          </div>
        </div>
      </div>

      {/* ── Settings Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Shooting Mode — locked, descriptive */}
        <Card
          title="Shooting Mode"
          subtitle="Core training discipline"
          icon={<Target className="w-4 h-4" />}
          badge={<Badge variant="cyan">STATIC</Badge>}
        >
          <div className="p-4 rounded-xl bg-dark-950/70 border-2 border-brand-cyan/60 shadow-glow-cyan-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-slate-100 text-sm uppercase tracking-wider">
                Static Target Practice
              </span>
              <span className="text-brand-cyan font-mono text-xs">ACTIVE</span>
            </div>
            <p className="text-xs text-slate-400">
              3 targets appear on the wall simultaneously. Hitting one immediately relocates it to a new random position.
            </p>
          </div>
        </Card>

        {/* Session Duration */}
        <Card
          title="Session Duration"
          subtitle="Timer length for the drill"
          icon={<Clock className="w-4 h-4" />}
        >
          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((d) => {
              const sel = config.duration === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => onUpdateConfig({ duration: d.value })}
                  className={`p-2 rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                    sel
                      ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-glow-cyan-sm'
                      : 'bg-dark-950/60 border-dark-750 text-slate-300 hover:border-dark-600 hover:text-slate-100'
                  }`}
                >
                  <div className="font-display font-bold text-sm">{d.label}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5 hidden sm:block">{d.desc}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Target Shape */}
        <Card
          title="Target Visual"
          subtitle="3D shape or custom PNG"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_OPTIONS.map((s) => {
                const sel = config.targetShape === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onUpdateConfig({ targetShape: s.id })}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer ${
                      sel
                        ? 'bg-brand-cyan/20 border-brand-cyan shadow-glow-cyan-sm'
                        : 'bg-dark-950/60 border-dark-750 hover:border-dark-600'
                    }`}
                  >
                    <span className={`text-base font-bold leading-none ${sel ? 'text-brand-cyan' : s.color}`}>
                      {s.icon}
                    </span>
                    <span className={`font-display font-bold text-[10px] uppercase ${sel ? 'text-brand-cyan' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom PNG uploader */}
            {config.targetShape === 'custom' && (
              <div className="p-3 rounded-xl bg-dark-950/80 border border-brand-cyan/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-dark-900 border border-dark-700 flex items-center justify-center overflow-hidden shrink-0">
                  {customFilePreview ? (
                    <img src={customFilePreview} alt="Target Preview" className="w-full h-full object-contain" />
                  ) : (
                    <Target className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-display font-semibold text-slate-200 uppercase truncate">
                    {customFilePreview ? 'PNG loaded' : 'Upload target PNG'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Transparent PNG recommended
                  </div>
                </div>
                <label className="cursor-pointer shrink-0">
                  <input type="file" accept="image/png" onChange={handleFileUpload} className="hidden" />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-brand-cyan text-xs font-display font-bold uppercase border border-brand-cyan/40 hover:border-brand-cyan transition-all">
                    <Upload className="w-3 h-3" />
                    Browse
                  </span>
                </label>
              </div>
            )}
          </div>
        </Card>

        {/* Target Size (full width on md) */}
        <Card
          title="Virtual Target Diameter"
          subtitle="Size in the 3D arena — not a physical measurement"
          icon={<Maximize2 className="w-4 h-4" />}
          className="md:col-span-2 xl:col-span-2"
        >
          <div className="space-y-4">
            {/* Preset buttons */}
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_SIZES.map((s) => {
                const sel = config.targetSize === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleResetToPreset(s.id)}
                    className={`p-3 rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                      sel
                        ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-glow-cyan-sm'
                        : 'bg-dark-950/60 border-dark-750 text-slate-300 hover:border-dark-600'
                    }`}
                  >
                    <div className="font-display font-bold text-sm uppercase">{s.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.desc}</div>
                  </button>
                );
              })}

              {/* Custom button */}
              <button
                onClick={() =>
                  onUpdateConfig({ targetSize: 'custom', customSizeMm: config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM })
                }
                className={`p-3 rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                  config.targetSize === 'custom'
                    ? 'bg-brand-amber/20 border-brand-amber text-brand-amber shadow-glow-amber'
                    : 'bg-dark-950/60 border-dark-750 text-slate-300 hover:border-dark-600'
                }`}
              >
                <Sliders className="w-4 h-4 mx-auto mb-0.5" />
                <div className="font-display font-bold text-[10px] uppercase">Custom</div>
              </button>
            </div>

            {/* Custom slider + live preview */}
            {config.targetSize === 'custom' && (
              <div className="space-y-3 pt-1 border-t border-dark-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                    Virtual Diameter
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={CUSTOM_SIZE_MIN_MM}
                      max={CUSTOM_SIZE_MAX_MM}
                      value={config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM}
                      onChange={(e) => {
                        const v = Math.max(CUSTOM_SIZE_MIN_MM, Math.min(CUSTOM_SIZE_MAX_MM, Number(e.target.value)));
                        handleSliderChange(v);
                      }}
                      className="w-20 bg-dark-950 border border-dark-700 focus:border-brand-amber rounded-md px-2 py-1 text-brand-amber font-mono font-bold text-sm text-right outline-none transition-colors"
                    />
                    <span className="text-xs text-slate-400 font-mono">mm</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={CUSTOM_SIZE_MIN_MM}
                  max={CUSTOM_SIZE_MAX_MM}
                  step={5}
                  value={config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                    bg-dark-800 [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-amber
                    [&::-webkit-slider-thumb]:shadow-glow-amber [&::-webkit-slider-thumb]:cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{CUSTOM_SIZE_MIN_MM}mm</span>
                  <span>{CUSTOM_SIZE_MAX_MM}mm</span>
                </div>

                {/* Live circle preview */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-950/80 border border-dark-800">
                  <div className="flex-1 text-xs font-mono text-slate-400">
                    <div>Scene radius: <span className="text-brand-amber">{((effectiveDiameterMm / 2) * MM_TO_SCENE).toFixed(4)}</span> units</div>
                    <div>Virtual: <span className="text-brand-amber">{effectiveDiameterMm}mm</span> diameter</div>
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center bg-dark-900 rounded-lg border border-dark-700 shrink-0">
                    <div
                      className="rounded-full bg-brand-amber/70 border border-brand-amber shadow-glow-amber transition-all duration-100"
                      style={{ width: previewPx, height: previewPx }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {PRESET_SIZES.map((ps) => (
                    <button
                      key={ps.id}
                      onClick={() => handleResetToPreset(ps.id)}
                      className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-brand-amber cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset to {ps.label} ({ps.desc})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Arena Background Theme */}
        <Card
          title="Arena Background"
          subtitle="Visual environment style"
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-1.5">
            {THEME_OPTIONS.map((t) => {
              const sel = config.arenaTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateConfig({ arenaTheme: t.id })}
                  className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all duration-150 cursor-pointer ${
                    sel
                      ? 'bg-dark-850 border-brand-cyan/50 shadow-glow-cyan-sm'
                      : 'bg-dark-950/60 border-dark-750 hover:border-dark-600'
                  }`}
                >
                  {/* Theme colour swatch */}
                  <div className={`w-8 h-6 rounded shrink-0 ${t.swatchBg} border ${t.swatchBorder}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-display font-bold text-xs uppercase ${sel ? t.accentText : 'text-slate-200'}`}>
                      {t.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </div>
                  {sel && <Badge variant="cyan" size="sm">ON</Badge>}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-cyan" />
          <span>FIXED CAMERA RAYCAST ENGINE &bull; FREE CURSOR &bull; NO POINTER-LOCK</span>
        </div>
        <div className="text-slate-500">
          SIZE SCALE: 1 virtual mm = {MM_TO_SCENE} scene units
        </div>
      </div>
    </div>
  );
};
