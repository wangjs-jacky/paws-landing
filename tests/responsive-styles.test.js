import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8');

function block(source, startPattern) {
  const match = startPattern.exec(source);
  if (!match) return '';
  const openBrace = source.indexOf('{', match.index);
  let depth = 1;

  for (let index = openBrace + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  return '';
}

function rule(selector, source = css) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return block(source, new RegExp(`${escaped}\\s*\\{`));
}

it('hides only the header CTA on narrow screens', () => {
  expect(css).not.toMatch(/\n\s*\.primary-action\s*\{\s*display:\s*none/);
  expect(css).toMatch(/\.preference-controls\s*>\s*\.primary-action\s*\{\s*display:\s*none/);
});

it('gives footer links at least 44 by 44 pixel touch targets', () => {
  expect(rule('.footer-brand')).toMatch(/min-height:\s*44px/);
  expect(rule('.footer-brand')).toMatch(/min-width:\s*44px/);
  expect(rule('.site-footer nav a')).toMatch(/min-height:\s*44px/);
  expect(rule('.site-footer nav a')).toMatch(/min-width:\s*44px/);
});

it('connects the user pause state to the marquee animation', () => {
  expect(css).toMatch(/\.agent-strip\[data-paused=['"]true['"]\]\s+\.agent-strip__track\s*\{\s*animation-play-state:\s*paused/);
});

it('defines the header and hero layout anchors', () => {
  expect(css).toContain('min-height: 72px');
  expect(css).toContain('grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr)');
  expect(css).toContain('.hero-title__line');
  expect(css).toContain('.hero-media');
});

it('keeps mobile hero media visible and ordered before the copy', () => {
  const mobile = block(css, /@media\s*\(max-width:\s*800px\)\s*\{/);

  expect(rule('.hero-grid', mobile)).toMatch(/grid-template-columns:\s*1fr/);
  expect(rule('.hero-media', mobile)).toMatch(/grid-row:\s*1/);
  expect(rule('.hero-copy', mobile)).toMatch(/grid-row:\s*2/);
  expect(rule('.hero', mobile)).toMatch(/overflow:\s*visible/);
});

it('reserves one stable mascot box and reveals the atlas without relayout', () => {
  expect(rule('.mascot-look')).toMatch(/position:\s*relative/);
  expect(rule('.mascot-look')).toMatch(/aspect-ratio:\s*1/);
  expect(rule('.mascot-look')).toMatch(/width:\s*min\(100%,\s*34rem\)/);
  expect(css).toMatch(/\.mascot-look canvas,\s*\.mascot-look img\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s);
  expect(rule(".mascot-look[data-ready='true'] img")).toMatch(/opacity:\s*0/);
});

it('breathes only the coarse static mascot and disables that motion by preference', () => {
  const lastReducedMotion = css.lastIndexOf('@media (prefers-reduced-motion: reduce)');
  const reduced = block(css.slice(lastReducedMotion), /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/);
  expect(rule(".mascot-look[data-mode='coarse']")).toMatch(/animation:\s*mascot-breathe/);
  expect(rule(".mascot-look[data-mode='coarse']", reduced)).toMatch(/animation:\s*none/);
});
