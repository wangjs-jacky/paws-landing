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
  expect(Object.keys(content.zh.sectionLabels)).toEqual(Object.keys(content.en.sectionLabels));
  expect(Object.keys(content.zh.labels)).toEqual(Object.keys(content.en.labels));
});

it('localizes the capability eyebrow, home label and marquee controls', () => {
  expect(content.en.sectionLabels.capabilities).toBe('PAWS / CAPABILITIES');
  expect(content.zh.sectionLabels.capabilities).toBe('PAWS / 产品能力');
  expect(content.en.labels).toMatchObject({
    home: 'Paws home',
    pauseAgents: 'Pause supported-agent animation',
    resumeAgents: 'Resume supported-agent animation'
  });
  expect(content.zh.labels).toMatchObject({
    home: 'Paws 首页',
    pauseAgents: '暂停智能体兼容列表动画',
    resumeAgents: '继续智能体兼容列表动画'
  });
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
