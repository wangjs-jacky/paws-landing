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

it('pauses the agent marquee on hover and keyboard focus without a playback control', () => {
  expect(css).toMatch(/\.agent-marquee:hover\s+\.agent-marquee__track,\s*\.agent-marquee:focus-within\s+\.agent-marquee__track\s*\{\s*animation-play-state:\s*paused/);
  expect(css).not.toContain('.agent-strip__control');
  expect(css).not.toContain('.agent-marquee__control');
});

it('makes the agent marquee static on narrow screens and for reduced motion', () => {
  const mobile = block(css, /@media\s*\(max-width:\s*767px\)\s*\{/);
  const lastReducedMotion = css.lastIndexOf('@media (prefers-reduced-motion: reduce)');
  const reduced = block(css.slice(lastReducedMotion), /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/);

  expect(rule('.agent-marquee__track', mobile)).toMatch(/width:\s*100%/);
  expect(rule('.agent-marquee__track', mobile)).toMatch(/animation:\s*none/);
  expect(rule('.agent-marquee__list', mobile)).toMatch(/flex-wrap:\s*wrap/);
  expect(rule('.agent-marquee__duplicate', mobile)).toMatch(/display:\s*none/);
  expect(rule('.agent-marquee__track', reduced)).toMatch(/animation:\s*none/);
  expect(rule('.agent-marquee__duplicate', reduced)).toMatch(/display:\s*none/);
});

it('defines the header and hero layout anchors', () => {
  expect(css).toContain('min-height: 72px');
  expect(css).toContain('grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr)');
  expect(css).toContain('.hero-title__line');
  expect(css).toContain('.hero-media');
});

it('sets the final desktop hero hierarchy and media halo', () => {
  expect(rule('.hero-grid')).toMatch(/padding-top:\s*calc\(72px\s*\+\s*48px\)/);
  expect(rule('.hero-copy h1')).toMatch(/font-size:\s*clamp\(3\.25rem,\s*5\.2vw,\s*5\.9rem\)/);
  expect(rule('.hero-copy h1')).toMatch(/line-height:\s*0\.98/);
  expect(rule('.hero-terminal-slot')).toMatch(/width:\s*min\(100%,\s*42rem\)/);
  expect(rule('.mascot-look')).toMatch(/width:\s*min\(100%,\s*34rem\)/);
  expect(rule('.hero-media::before')).toMatch(/radial-gradient/);
  expect(rule('.hero-media::before')).toMatch(/content:\s*''/);
  expect(rule('.hero-actions')).toMatch(/gap:\s*var\(--space-2\)/);
  expect(rule('.hero-grid')).toMatch(/z-index:\s*3/);
  expect(css).not.toContain('.mascot-stage img');
});

it('keeps mobile hero media visible and ordered before the copy', () => {
  const mobile = block(css, /@media\s*\(max-width:\s*800px\)\s*\{/);

  expect(rule('.hero-grid', mobile)).toMatch(/grid-template-columns:\s*1fr/);
  expect(rule('.hero-media', mobile)).toMatch(/grid-row:\s*1/);
  expect(rule('.hero-copy', mobile)).toMatch(/grid-row:\s*2/);
  expect(rule('.hero', mobile)).toMatch(/overflow:\s*visible/);
  expect(rule('.mascot-look', mobile)).toMatch(/width:\s*min\(100%,\s*17rem\)/);
  expect(rule('.hero-copy h1', mobile)).toMatch(/font-size:\s*clamp\(2\.7rem,\s*13vw,\s*4rem\)/);
  expect(rule('.hero-terminal-slot', mobile)).toMatch(/max-width:\s*100%/);
  expect(rule('.terminal-demo', mobile)).toMatch(/width:\s*100%/);
  expect(css).not.toMatch(/overflow-x:\s*hidden/);
});

it('reserves one stable mascot box and reveals the atlas without relayout', () => {
  expect(rule('.mascot-look')).toMatch(/position:\s*relative/);
  expect(rule('.mascot-look')).toMatch(/aspect-ratio:\s*1/);
  expect(rule('.mascot-look')).toMatch(/width:\s*min\(100%,\s*34rem\)/);
  expect(rule('.mascot-look')).toMatch(/transform:\s*translateY\(var\(--mascot-y,\s*0px\)\)/);
  expect(css).toMatch(/\.mascot-look canvas,\s*\.mascot-look img\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s);
  expect(rule(".mascot-look[data-ready='true'] img")).toMatch(/opacity:\s*0/);
});

it('breathes only the coarse static mascot and disables that motion by preference', () => {
  const lastReducedMotion = css.lastIndexOf('@media (prefers-reduced-motion: reduce)');
  const reduced = block(css.slice(lastReducedMotion), /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/);
  expect(rule(".mascot-look[data-mode='coarse']")).toMatch(/animation:\s*mascot-breathe/);
  expect(rule(".mascot-look[data-mode='coarse']", reduced)).toMatch(/animation:\s*none/);
});
