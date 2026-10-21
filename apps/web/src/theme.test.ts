import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The Tailwind theme must hold exactly the Design Brief tokens (sections 9 to 11, decision 0025), and no component
// may hard-code a hex value (TRD-FE-06, Phase 4 acceptance).
const srcDir = fileURLToPath(new URL('.', import.meta.url));
const themeFile = join(srcDir, 'app', 'theme.css');
const theme = readFileSync(themeFile, 'utf8');
const themeBlock = theme.slice(theme.indexOf('@theme {'), theme.indexOf('\n}\n'));
const desktopBlock = theme.slice(theme.indexOf('@media (width >= 64rem)'));

function declarations(block: string, prefix: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value && name.startsWith(prefix) && !name.endsWith('*')) found.set(name, value.trim());
  }
  return found;
}

const brief = {
  ink: '#18212f',
  blue: '#2f6fed',
  teal: '#1f9d8b',
  gold: '#e6a23c',
  red: '#c94c4c',
  paper: '#f7f5ef',
  surface: '#eef3f8',
  muted: '#667085',
  'blue-text': '#1c62eb',
  'red-text': '#c13a3a',
  'teal-text': '#18796b',
  'gold-text': '#956113',
  'muted-text': '#636c81',
  white: '#ffffff',
};

// Section 9: [mobile size, mobile line height, desktop size, desktop line height] in px, and the weight.
const typeScale: Record<string, [number, number, number, number, number]> = {
  display: [28, 36, 36, 44, 700],
  h2: [24, 32, 28, 36, 600],
  h3: [20, 28, 22, 30, 600],
  'german-lg': [22, 32, 24, 34, 500],
  'german-md': [18, 28, 20, 30, 500],
  reading: [17, 28, 18, 30, 400],
  body: [16, 26, 16, 26, 400],
  small: [14, 22, 14, 22, 400],
  caption: [13, 18, 13, 18, 500],
};

const px = (rem: string | undefined) => (rem === undefined ? undefined : Number.parseFloat(rem) * 16);

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('Tailwind theme', () => {
  it('clears Tailwind defaults so only Brief tokens exist', () => {
    for (const group of ['color', 'font', 'font-weight', 'text', 'radius', 'shadow']) {
      expect(themeBlock).toContain(`--${group}-*: initial;`);
    }
  });

  it('defines exactly the colour tokens of section 11 with the section 10 values', () => {
    const colours = declarations(themeBlock, 'color-');
    expect([...colours.keys()].sort()).toEqual([...Object.keys(brief), 'border'].map((k) => `color-${k}`).sort());
    for (const [name, hex] of Object.entries(brief)) expect(colours.get(`color-${name}`)).toBe(hex);
    expect(colours.get('color-border')).toBe('rgb(24 33 47 / 0.12)');
  });

  it('text variants and ink pass 4.5:1 on white, paper and surface (DESIGN-COLOR-01)', () => {
    for (const fg of ['ink', 'blue-text', 'red-text', 'teal-text', 'gold-text', 'muted-text'] as const) {
      for (const bg of ['white', 'paper', 'surface'] as const) {
        expect(contrast(brief[fg], brief[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('defines the nine type-scale steps with their mobile and desktop sizes in rem', () => {
    const mobile = declarations(themeBlock, 'text-');
    const desktop = declarations(desktopBlock, 'text-');
    expect([...mobile.keys()].filter((k) => !k.includes('--')).sort()).toEqual(
      Object.keys(typeScale)
        .map((k) => `text-${k}`)
        .sort(),
    );
    for (const [token, [size, line, dSize, dLine, weight]] of Object.entries(typeScale)) {
      expect(px(mobile.get(`text-${token}`)), token).toBe(size);
      expect(px(mobile.get(`text-${token}--line-height`)), token).toBe(line);
      expect(mobile.get(`text-${token}--font-weight`), token).toBe(String(weight));
      expect(px(desktop.get(`text-${token}`) ?? mobile.get(`text-${token}`)), token).toBe(dSize);
      expect(px(desktop.get(`text-${token}--line-height`) ?? mobile.get(`text-${token}--line-height`)), token).toBe(
        dLine,
      );
    }
  });

  it('defines weights 400 to 700, Inter first with a system fallback, and radius sm, md, lg', () => {
    expect(Object.fromEntries(declarations(themeBlock, 'font-weight-'))).toEqual({
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-semibold': '600',
      'font-weight-bold': '700',
    });
    const font = declarations(themeBlock, 'font-sans').get('font-sans');
    expect(font).toMatch(/^var\(--font-inter\),/);
    expect(font).toMatch(/sans-serif$/);
    const radius = declarations(themeBlock, 'radius-');
    expect([...radius.entries()].map(([k, v]) => [k, px(v)])).toEqual([
      ['radius-sm', 4],
      ['radius-md', 8],
      ['radius-lg', 12],
    ]);
  });
});

describe('no hard-coded colours', () => {
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
    );
  }

  it('no source file outside the theme contains a hex colour', () => {
    const offenders = files(srcDir)
      .filter((file) => /\.(tsx?|css)$/.test(file) && file !== themeFile && !file.endsWith('.test.ts'))
      .filter((file) => /#[0-9a-f]{3,8}(?![0-9a-z_-])/i.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
