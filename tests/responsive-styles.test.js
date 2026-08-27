import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8');

function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? '';
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
