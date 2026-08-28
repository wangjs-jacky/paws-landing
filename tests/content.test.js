import { expect, it } from 'vitest';
import { content } from '../src/app/content';

it('keeps English and Chinese content structurally identical', () => {
  expect(Object.keys(content.zh)).toEqual(Object.keys(content.en));
  expect(content.en.agents).toEqual(['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'OpenClaw', 'ACP Agents']);
  expect(content.zh.agents).toEqual(content.en.agents);
  expect(content.en.features).toHaveLength(4);
  expect(content.zh.features).toHaveLength(4);
  expect(Object.keys(content.zh.openSource)).toEqual(Object.keys(content.en.openSource));
  expect(Object.keys(content.zh.footer)).toEqual(Object.keys(content.en.footer));
  expect(Object.keys(content.zh.sectionLabels)).toEqual(Object.keys(content.en.sectionLabels));
  expect(Object.keys(content.zh.labels)).toEqual(Object.keys(content.en.labels));
});

it('provides bilingual navigation and status labels for the cross-device story', () => {
  expect(content.en.nav).toMatchObject({ appPc: 'App + PC', architecture: 'Architecture' });
  expect(content.zh.nav).toMatchObject({ appPc: 'App + PC', architecture: '系统架构' });
  expect(content.en.labels).toMatchObject({
    online: 'Online',
    running: 'Running',
    approvalPending: 'Approval required',
    complete: 'Complete',
    planned: 'Planned',
    shipped: 'Available now',
    currentSession: 'Current session',
    demoDisclaimer: 'Product demonstration — controls are not connected to an account.',
    agentMarquee: 'Supported coding agents'
  });
  expect(content.zh.labels).toMatchObject({
    online: '在线',
    running: '运行中',
    approvalPending: '等待批准',
    complete: '已完成',
    planned: '计划中',
    shipped: '现已支持',
    currentSession: '当前会话',
    demoDisclaimer: '产品演示界面，不连接真实账号。',
    agentMarquee: '支持的编程智能体'
  });
});

it('provides two display title lines and the destination language label in each locale', () => {
  expect(content.en.hero.titleLines).toEqual(['Your coding agents.', 'Within reach.']);
  expect(content.zh.hero.titleLines).toEqual(['让编程智能体，', '随时触手可及。']);
  expect(content.en.labels.languageDestination).toBe('中文');
  expect(content.zh.labels.languageDestination).toBe('EN');
});

it('provides matching six-line terminal sessions in both locales', () => {
  expect(content.en.terminal.lines).toHaveLength(6);
  expect(content.zh.terminal.lines).toHaveLength(6);
  expect(content.en.terminal.lines).toEqual([
    '$ paws',
    '→ relay started · local machine',
    '✔ phone paired',
    '◐ agent · refactor-auth',
    '  edit src/auth/session.ts (+42 −8)',
    '✔ waiting for approval on your phone…'
  ]);
  expect(content.zh.terminal.lines).toEqual([
    '$ paws',
    '→ 中继已启动 · 本机',
    '✔ 手机已配对',
    '◐ 智能体 · refactor-auth',
    '  编辑 src/auth/session.ts (+42 −8)',
    '✔ 正在等待你在手机上批准…'
  ]);
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
