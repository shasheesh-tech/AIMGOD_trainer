import React, { useState } from 'react';
import {
  Play, Target, Clock, Palette, Maximize2, Shield, Sparkles, Upload,
  RotateCcw, Sliders, Crosshair,
} from 'lucide-react';
import { CROSSHAIR_OPTIONS, CrosshairPreview } from '../../utils/crosshair';
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
import { InteractiveParticleObject } from '../../components/three/InteractiveParticleObject';

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

const SHAPE_OPTIONS: { id: TargetShape; label: string; icon: string }[] = [
  { id: 'sphere', label: 'Sphere', icon: '●' },
  { id: 'box', label: 'Cube', icon: '■' },
  { id: 'cylinder', label: 'Disc', icon: '⬬' },
  { id: 'torus', label: 'Ring', icon: '◎' },
  { id: 'diamond', label: 'Diamond', icon: '◆' },
  { id: 'triangle', label: 'Tri', icon: '▲' },
  { id: 'custom', label: 'PNG', icon: '★' },
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
  desc: string;
}[] = [
  { id: 'cyber_dark', label: 'Cyber Dark', swatchBg: 'bg-[#0b0f17]', swatchBorder: 'border-[#35383E]', desc: 'Deep tactical HUD' },
  { id: 'tactical_gray', label: 'Tactical Gray', swatchBg: 'bg-[#2a3140]', swatchBorder: 'border-[#46494F]', desc: 'Military grey walls' },
  { id: 'neon_grid', label: 'Neon Grid', swatchBg: 'bg-[#1a112c]', swatchBorder: 'border-[#46494F]', desc: 'Grid arcade horizon' },
  { id: 'void_space', label: 'Void Space', swatchBg: 'bg-[#030406]', swatchBorder: 'border-[#8F9196]', desc: 'Empty cosmos black' },
  { id: 'arctic_white', label: 'Arctic White', swatchBg: 'bg-[#e4e8f0]', swatchBorder: 'border-[#8F9196]', desc: 'Bright snow range' },
  { id: 'ember_forge', label: 'Ember Forge', swatchBg: 'bg-[#473825]', swatchBorder: 'border-[#8F9196]', desc: 'Volcanic fire arena' },
  { id: 'deep_ocean', label: 'Deep Ocean', swatchBg: 'bg-[#172838]', swatchBorder: 'border-[#46494F]', desc: 'Abyssal underwater' },
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
    <div className="space-y-4 animate-fade-in">
      {/* ── Hero Briefing + Interactive 3D Optic Strip ─────────────────── */}
      <section aria-labelledby="arena-briefing-title">
        <div className="lab-panel relative rounded-lg bg-[#0a0b0e]/55 border border-[#35383E]/75 backdrop-blur-[3px] px-5 py-4 sm:px-6 sm:py-5">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="cyan" size="md">SESSION BRIEFING</Badge>
                <span className="text-[11px] font-mono text-[#9FA4AE] tracking-widest uppercase">
                  CONFIGURE &bull; LAUNCH &bull; ELIMINATE
                </span>
              </div>
              <h1
                id="arena-briefing-title"
                className="text-2xl sm:text-4xl font-display font-bold tracking-wide text-[#E4E2E3] uppercase"
              >
                Target Practice Arena
              </h1>
              <p className="text-sm text-[#9FA4AE] max-w-xl">
                Configure your session below. Free-cursor aiming &middot; 3D raycast hit detection &middot; live accuracy tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {/* Enlarged Interactive 3D Tactical Optic */}
              <div className="w-48 h-40 sm:w-52 sm:h-44 rounded-lg border border-[#35383E]/75 bg-[#050608]/45 shrink-0 overflow-hidden">
                <InteractiveParticleObject
                  variant="scope"
                  scale={1.02}
                  className="w-full h-full"
                  hint="DRAG OPTIC"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <Button variant="secondary" size="md" onClick={onViewHistory}>
                  Session History
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={onStartTraining}
                >
                  Enter Arena
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12-Column Unified Pro-Lab Configuration Grid ───────────────── */}
      <section
        aria-label="Aim lab configuration"
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch"
      >
        {/* LEFT COLUMN (5 cols): Shooting Mode + Enlarged 3D Weapon Inspector */}
        <Card
          title="Shooting Mode"
          subtitle="Core training discipline"
          icon={<Target className="w-4 h-4" />}
          badge={<Badge variant="neutral">STATIC</Badge>}
          className="lg:col-span-5 h-full"
        >
          <div className="flex-1 flex flex-col gap-3">
            <div className="p-4 rounded border border-[#8F9196]/60 bg-[#1F2023]/35">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-bold text-[#E4E2E3] text-xs uppercase tracking-wider">
                  Static Target Practice
                </span>
                <span className="text-[#BEC7D7] font-mono text-[11px] uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#9FA4AE] leading-relaxed">
                3 targets appear on the wall simultaneously. Hitting one immediately relocates it to a new random position.
              </p>
            </div>

            {/* Enlarged Interactive 3D Weapon Particle Model */}
            <div className="relative flex-1 min-h-[250px] sm:min-h-[290px] rounded border border-[#35383E]/70 bg-[#050608]/45 overflow-hidden flex flex-col">
              <InteractiveParticleObject
                variant="weapon"
                scale={0.98}
                className="w-full h-full flex-1"
              />
              <div className="pointer-events-none px-4 pb-2.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                <span className="text-[#9FA4AE]/80">MK-X RAIL CARBINE</span>
                <span className="text-[#BEC7D7]/80">DRAG TO INSPECT</span>
              </div>
            </div>
          </div>
        </Card>

        {/* CENTER COLUMN (4 cols): Stacked Duration + Target Visual + Diameter */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Session Duration */}
          <Card
            title="Session Duration"
            subtitle="Timer length for the drill"
            icon={<Clock className="w-4 h-4" />}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_OPTIONS.map((d) => {
                const sel = config.duration === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => onUpdateConfig({ duration: d.value })}
                    className={`py-2 px-1.5 rounded border text-center transition-colors duration-150 cursor-pointer ${
                      sel
                        ? 'bg-[#2A2B2F]/50 border-[#8F9196] text-[#E4E2E3]'
                        : 'bg-transparent border-[#35383E]/70 text-[#9FA4AE] hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60 hover:text-[#E4E2E3]'
                    }`}
                  >
                    <div className={`font-mono font-semibold text-xs tabular-nums ${sel ? 'text-[#BEC7D7]' : 'text-[#E4E2E3]'}`}>
                      {d.label}
                    </div>
                    <div className="text-[10px] text-[#9FA4AE] mt-0.5 hidden sm:block">
                      {d.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Target Visual */}
          <Card
            title="Target Visual"
            subtitle="3D shape or custom PNG"
            icon={<Sparkles className="w-4 h-4" />}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {SHAPE_OPTIONS.map((s) => {
                  const sel = config.targetShape === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onUpdateConfig({ targetShape: s.id })}
                      className={`py-2 px-1.5 rounded border flex flex-col items-center gap-1 transition-colors duration-150 cursor-pointer ${
                        sel
                          ? 'bg-[#2A2B2F]/50 border-[#8F9196]'
                          : 'bg-transparent border-[#35383E]/70 hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60'
                      }`}
                    >
                      <span className={`text-sm leading-none ${sel ? 'text-[#E4E2E3]' : 'text-[#9FA4AE]'}`}>
                        {s.icon}
                      </span>
                      <span className={`font-mono text-[10px] uppercase tracking-wide ${sel ? 'text-[#BEC7D7] font-semibold' : 'text-[#9FA4AE]'}`}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom PNG uploader */}
              {config.targetShape === 'custom' && (
                <div className="p-3 rounded border border-[#8F9196]/50 bg-[#050608]/55 flex items-center gap-3">
                  <div className="w-11 h-11 rounded bg-[#18191B] border border-[#35383E] flex items-center justify-center overflow-hidden shrink-0">
                    {customFilePreview ? (
                      <img src={customFilePreview} alt="Target Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Target className="w-5 h-5 text-[#9FA4AE]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-display font-semibold text-[#E4E2E3] uppercase truncate">
                      {customFilePreview ? 'PNG loaded' : 'Upload target PNG'}
                    </div>
                    <div className="text-[10px] text-[#9FA4AE] mt-0.5">
                      Transparent PNG recommended
                    </div>
                  </div>
                  <label className="cursor-pointer shrink-0">
                    <input type="file" accept="image/png" onChange={handleFileUpload} className="hidden" />
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1F2023] hover:bg-[#2A2B2F] text-[#E4E2E3] text-[11px] font-display font-semibold uppercase border border-[#8F9196]/55 transition-colors">
                      <Upload className="w-3 h-3" />
                      Browse
                    </span>
                  </label>
                </div>
              )}
            </div>
          </Card>

          {/* Virtual Target Diameter */}
          <Card
            title="Virtual Target Diameter"
            subtitle="Size in the 3D arena — not a physical measurement"
            icon={<Maximize2 className="w-4 h-4" />}
            className="flex-1"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_SIZES.map((s) => {
                  const sel = config.targetSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleResetToPreset(s.id)}
                      className={`py-2 px-1.5 rounded border text-center transition-colors duration-150 cursor-pointer ${
                        sel
                          ? 'bg-[#2A2B2F]/50 border-[#8F9196] text-[#E4E2E3]'
                          : 'bg-transparent border-[#35383E]/70 text-[#9FA4AE] hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60'
                      }`}
                    >
                      <div className={`font-display font-semibold text-[11px] uppercase ${sel ? 'text-[#BEC7D7]' : 'text-[#E4E2E3]'}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-[#9FA4AE] font-mono tabular-nums mt-0.5">{s.desc}</div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ targetSize: 'custom', customSizeMm: config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM })
                  }
                  className={`py-2 px-1.5 rounded border text-center transition-colors duration-150 cursor-pointer ${
                    config.targetSize === 'custom'
                      ? 'bg-[#2A2B2F]/50 border-[#8F9196] text-[#E4E2E3]'
                      : 'bg-transparent border-[#35383E]/70 text-[#9FA4AE] hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60'
                  }`}
                >
                  <Sliders className={`w-3.5 h-3.5 mx-auto mb-0.5 ${config.targetSize === 'custom' ? 'text-[#BEC7D7]' : 'text-[#9FA4AE]'}`} />
                  <div className={`font-display font-semibold text-[10px] uppercase ${config.targetSize === 'custom' ? 'text-[#BEC7D7]' : 'text-[#E4E2E3]'}`}>
                    Custom
                  </div>
                </button>
              </div>

              {config.targetSize === 'custom' && (
                <div className="space-y-2.5 pt-2.5 border-t border-[#35383E]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#9FA4AE] uppercase tracking-wide">
                      Virtual Diameter
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={CUSTOM_SIZE_MIN_MM}
                        max={CUSTOM_SIZE_MAX_MM}
                        value={config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM}
                        onChange={(e) => {
                          const v = Math.max(CUSTOM_SIZE_MIN_MM, Math.min(CUSTOM_SIZE_MAX_MM, Number(e.target.value)));
                          handleSliderChange(v);
                        }}
                        className="w-16 bg-[#050608] border border-[#35383E] focus:border-[#8F9196] rounded px-2 py-0.5 text-[#E4E2E3] font-mono font-semibold text-xs text-right outline-none"
                      />
                      <span className="text-[11px] text-[#9FA4AE] font-mono">mm</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={CUSTOM_SIZE_MIN_MM}
                    max={CUSTOM_SIZE_MAX_MM}
                    step={5}
                    value={config.customSizeMm ?? CUSTOM_SIZE_DEFAULT_MM}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                      bg-[#2A2B2F] [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#BEC7D7]
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9196]">
                    <span>{CUSTOM_SIZE_MIN_MM}mm</span>
                    <span>{CUSTOM_SIZE_MAX_MM}mm</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded bg-[#050608]/55 border border-[#35383E]/70">
                    <div className="flex-1 text-[11px] font-mono text-[#9FA4AE]">
                      <div>Radius: <span className="text-[#E4E2E3]">{((effectiveDiameterMm / 2) * MM_TO_SCENE).toFixed(4)}</span> units</div>
                      <div>Virtual: <span className="text-[#E4E2E3]">{effectiveDiameterMm}mm</span></div>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-[#0B0C0E] rounded border border-[#35383E] shrink-0">
                      <div
                        className="rounded-full bg-[#BEC7D7]/60 border border-[#E4E2E3] transition-all duration-100"
                        style={{ width: previewPx, height: previewPx }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PRESET_SIZES.map((ps) => (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() => handleResetToPreset(ps.id)}
                        className="flex items-center gap-1 text-[10px] font-mono text-[#9FA4AE] hover:text-[#E4E2E3] cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        {ps.label} ({ps.desc})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (3 cols): Arena Background */}
        <Card
          title="Arena Background"
          subtitle="Visual environment style"
          icon={<Palette className="w-4 h-4" />}
          className="lg:col-span-3 h-full"
        >
          <div className="flex-1 flex flex-col justify-between gap-1.5">
            {THEME_OPTIONS.map((t) => {
              const sel = config.arenaTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateConfig({ arenaTheme: t.id })}
                  className={`w-full px-2.5 py-2 rounded border flex items-center gap-2.5 transition-colors duration-150 cursor-pointer ${
                    sel
                      ? 'bg-[#2A2B2F]/50 border-[#8F9196]'
                      : 'bg-transparent border-[#35383E]/70 hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-sm shrink-0 ${t.swatchBg} border ${t.swatchBorder}`} />
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-display font-semibold text-[11px] uppercase truncate ${sel ? 'text-[#BEC7D7]' : 'text-[#E4E2E3]'}`}>
                      {t.label}
                    </div>
                    <div className="text-[10px] text-[#9FA4AE] truncate">{t.desc}</div>
                  </div>
                  {sel && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#BEC7D7] text-[#181C22] font-mono font-bold text-[9px] uppercase shrink-0">
                      ON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Full-Width Bottom Row: Crosshair Reticle Bar ───────────────── */}
      <section aria-label="Crosshair reticle selection">
        <Card
          title="CROSSHAIR"
          subtitle="Aiming reticle displayed in the arena"
          icon={<Crosshair className="w-4 h-4" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {CROSSHAIR_OPTIONS.map((c) => {
              const sel = (config.crosshair ?? 'plus') === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdateConfig({ crosshair: c.id })}
                  aria-pressed={sel}
                  className={`p-3 rounded border flex flex-col items-center text-center gap-2 transition-colors duration-150 cursor-pointer ${
                    sel
                      ? 'bg-[#2A2B2F]/50 border-[#8F9196]'
                      : 'bg-transparent border-[#35383E]/70 hover:bg-[#1F2023]/40 hover:border-[#8F9196]/60'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded flex items-center justify-center border ${
                      sel
                        ? 'bg-[#050608]/80 border-[#8F9196]/70'
                        : 'bg-[#050608]/40 border-[#35383E]'
                    }`}
                  >
                    <CrosshairPreview style={c.id} size={30} active={sel} />
                  </div>
                  <div className="space-y-0.5">
                    <div
                      className={`font-display font-semibold text-[11px] uppercase leading-tight ${
                        sel ? 'text-[#BEC7D7]' : 'text-[#E4E2E3]'
                      }`}
                    >
                      {c.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#9FA4AE]">
                      {c.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ── Unified Bottom Telemetry Strip ─────────────────────────────── */}
      <div className="px-4 py-3 rounded-lg bg-[#0a0b0e]/55 border border-[#35383E]/70 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[#9FA4AE]">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#BEC7D7]" />
          <span>FIXED CAMERA RAYCAST ENGINE &bull; FREE CURSOR &bull; NO POINTER-LOCK</span>
        </div>
        <div className="text-[#8F9196] tabular-nums">
          SIZE SCALE: 1 virtual mm = {MM_TO_SCENE} scene units
        </div>
      </div>
    </div>
  );
};
