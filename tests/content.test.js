import { expect, it } from 'vitest';
import { content } from '../src/app/content';

it('keeps English and Chinese content structurally identical', () => {
  expect(Object.keys(content.zh)).toEqual(Object.keys(content.en));
  expect(content.en.agents).toEqual(['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents']);
  expect(content.zh.agents).toEqual(content.en.agents);
  expect(content.en.features).toHaveLength(4);
  expect(content.zh.features).toHaveLength(4);
});

it('contains no fabricated social proof sections', () => {
  const serialized = JSON.stringify(content);
  for (const forbidden of ['testimonials', 'trustedBy', 'Mara Ils', 'Jonas Reyes', 'Priya N.']) {
    expect(serialized).not.toContain(forbidden);
  }
});
