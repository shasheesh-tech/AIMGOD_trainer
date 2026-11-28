import React from 'react';
import { CrosshairStyle } from '../types';

export interface CrosshairOption {
  id: CrosshairStyle;
  label: string;
  desc: string;
}

export const CROSSHAIR_OPTIONS: CrosshairOption[] = [
  { id: 'dot', label: 'Dot', desc: 'Center point' },
  { id: 'plus', label: 'Plus', desc: 'Cross with center dot' },
  { id: 'diamond', label: 'Diamond', desc: 'Hollow 4-point frame' },
  { id: 'open_plus', label: 'Open Plus', desc: 'Tight open center' },
  { id: 'plus_no_center', label: 'Plus Without Center', desc: 'Wide center gap' },
];

export function getCrosshairLabel(style: CrosshairStyle): string {
  return CROSSHAIR_OPTIONS.find((o) => o.id === style)?.label ?? 'Plus';
}

/**
 * Shared SVG body on a 32x32 grid with exact center at (16, 16).
 * Dark outer outline ensures crisp visibility on both Void Space and Arctic White.
 */
function buildCrosshairSvgInner(style: CrosshairStyle, color: string): string {
  const outline = '#06070a';

  switch (style) {
    case 'dot':
      return `<circle cx="16" cy="16" r="3.4" fill="${outline}"/><circle cx="16" cy="16" r="2.3" fill="${color}"/>`;

    case 'plus':
      return [
        `<line x1="16" y1="6" x2="16" y2="26" stroke="${outline}" stroke-width="3.8" stroke-linecap="round"/>`,
        `<line x1="6" y1="16" x2="26" y2="16" stroke="${outline}" stroke-width="3.8" stroke-linecap="round"/>`,
        `<line x1="16" y1="6" x2="16" y2="26" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
        `<line x1="6" y1="16" x2="26" y2="16" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
        `<circle cx="16" cy="16" r="2.2" fill="${color}"/>`,
      ].join('');

    case 'diamond':
      return [
        `<polygon points="16,6 26,16 16,26 6,16" fill="none" stroke="${outline}" stroke-width="3.8" stroke-linejoin="round"/>`,
        `<polygon points="16,6 26,16 16,26 6,16" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>`,
      ].join('');

    case 'open_plus':
      // Tight 4px center opening (arms reach 14 and 18) with thicker classic arms
      return [
        `<line x1="16" y1="6" x2="16" y2="13.5" stroke="${outline}" stroke-width="4" stroke-linecap="butt"/>`,
        `<line x1="16" y1="18.5" x2="16" y2="26" stroke="${outline}" stroke-width="4" stroke-linecap="butt"/>`,
        `<line x1="6" y1="16" x2="13.5" y2="16" stroke="${outline}" stroke-width="4" stroke-linecap="butt"/>`,
        `<line x1="18.5" y1="16" x2="26" y2="16" stroke="${outline}" stroke-width="4" stroke-linecap="butt"/>`,
        `<line x1="16" y1="6" x2="16" y2="13.5" stroke="${color}" stroke-width="2" stroke-linecap="butt"/>`,
        `<line x1="16" y1="18.5" x2="16" y2="26" stroke="${color}" stroke-width="2" stroke-linecap="butt"/>`,
        `<line x1="6" y1="16" x2="13.5" y2="16" stroke="${color}" stroke-width="2" stroke-linecap="butt"/>`,
        `<line x1="18.5" y1="16" x2="26" y2="16" stroke="${color}" stroke-width="2" stroke-linecap="butt"/>`,
      ].join('');

    case 'plus_no_center':
      // Wide 12px center gap (arms 4..10 and 22..28) with crisp slim arms and no center dot
      return [
        `<line x1="16" y1="4" x2="16" y2="10" stroke="${outline}" stroke-width="3.6" stroke-linecap="round"/>`,
        `<line x1="16" y1="22" x2="16" y2="28" stroke="${outline}" stroke-width="3.6" stroke-linecap="round"/>`,
        `<line x1="4" y1="16" x2="10" y2="16" stroke="${outline}" stroke-width="3.6" stroke-linecap="round"/>`,
        `<line x1="22" y1="16" x2="28" y2="16" stroke="${outline}" stroke-width="3.6" stroke-linecap="round"/>`,
        `<line x1="16" y1="4" x2="16" y2="10" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
        `<line x1="16" y1="22" x2="16" y2="28" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
        `<line x1="4" y1="16" x2="10" y2="16" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
        `<line x1="22" y1="16" x2="28" y2="16" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`,
      ].join('');
  }
}

const CURSOR_CSS_CACHE: Partial<Record<CrosshairStyle, string>> = {};

/**
 * Returns a CSS `cursor` value centered at exact hotspot (16, 16)
 * so the crosshair's visual center matches the exact raycast aiming point.
 */
export function getCrosshairCursorCss(style: CrosshairStyle = 'plus'): string {
  const cached = CURSOR_CSS_CACHE[style];
  if (cached) return cached;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${buildCrosshairSvgInner(
    style,
    '#00f0ff'
  )}</svg>`;
  const css = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, crosshair`;
  CURSOR_CSS_CACHE[style] = css;
  return css;
}

interface CrosshairPreviewProps {
  style: CrosshairStyle;
  size?: number;
  active?: boolean;
}

export const CrosshairPreview: React.FC<CrosshairPreviewProps> = ({
  style,
  size = 32,
  active = false,
}) => {
  const color = active ? '#e4e2e3' : '#9fa4ae';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
      dangerouslySetInnerHTML={{ __html: buildCrosshairSvgInner(style, color) }}
    />
  );
};
