import type { Merchant, MerchantVertical } from '../types';

const VERTICAL_DEFAULTS: Record<MerchantVertical, string> = {
  POWERSPORTS: '#E01020',
  AUTOMOTIVE: '#FFB347',
  TATTOO: '#FFB347',
  BEAUTY: '#FFB347',
  GENERIC: '#FFB347',
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function resolveAccent(merchant: Pick<Merchant, 'accentColor' | 'vertical'> | null): string {
  const explicit = merchant?.accentColor;
  if (explicit && HEX_RE.test(explicit)) return explicit;
  return VERTICAL_DEFAULTS[merchant?.vertical ?? 'GENERIC'];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = hex.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function accentCssVars(accent: string): Record<string, string> {
  const { r, g, b } = hexToRgb(accent);
  return {
    '--bk-accent': accent,
    '--bk-accent-rgb': `${r}, ${g}, ${b}`,
  };
}

/**
 * The full app-level accent variable family (dashboard chrome, not just the
 * booking flow). Mirrors the defaults hardcoded in index.css :root so a
 * merchant's chosen color re-themes buttons, nav highlights, borders, and glows.
 * Keep the alpha values in sync with index.css if those defaults change.
 */
export function appAccentCssVars(accent: string): Record<string, string> {
  const { r, g, b } = hexToRgb(accent);
  const rgb = `${r}, ${g}, ${b}`;
  return {
    '--color-accent': accent,
    '--color-accent-dim': `rgba(${rgb}, 0.6)`,
    '--color-accent-muted': `rgba(${rgb}, 0.15)`,
    '--color-accent-subtle': `rgba(${rgb}, 0.05)`,
    '--color-border-accent': `rgba(${rgb}, 0.15)`,
    '--color-border-accent-strong': `rgba(${rgb}, 0.3)`,
  };
}
