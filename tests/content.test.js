import { expect, it } from 'vitest';
import { content } from '../src/app/content';

it('keeps English and Chinese content structurally identical', () => {
  expect(Object.keys(content.zh)).toEqual(Object.keys(content.en));
  expect(content.en.agents).toEqual(['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents']);
  expect(content.zh.agents).toEqual(content.en.agents);
  expect(content.en.features).toHaveLength(4);
  expect(content.zh.features).toHaveLength(4);
  expect(Object.keys(content.zh.openSource)).toEqual(Object.keys(content.en.openSource));
  expect(Object.keys(content.zh.footer)).toEqual(Object.keys(content.en.footer));
});

it('contains no fabricated social proof sections', () => {
  const serialized = JSON.stringify(content);
  for (const forbidden of ['testimonials', 'trustedBy', 'Mara Ils', 'Jonas Reyes', 'Priya N.']) {
    expect(serialized).not.toContain(forbidden);
  }
});

it('contains factual self-hosting actions and no adoption claims', () => {
  expect(content.en.openSource.actions).toEqual({
    github: 'View on GitHub',
    selfHosting: 'Self-hosting guide'
  });
  expect(content.zh.openSource.actions).toEqual({
    github: '查看 GitHub',
    selfHosting: '自托管指南'
  });

  const serialized = JSON.stringify(content);
  for (const forbidden of ['customers', 'developers love', 'users worldwide', 'downloads']) {
    expect(serialized.toLowerCase()).not.toContain(forbidden);
  }
});
