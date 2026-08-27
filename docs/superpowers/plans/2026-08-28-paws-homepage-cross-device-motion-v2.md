# Paws Cross-Device Homepage Motion V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Paws V2 homepage as a content-rich, bilingual cross-device product story with seven mascot roles, truthful App/PC UI demonstrations, and GSAP-driven motion that degrades cleanly on mobile and reduced-motion devices.

**Architecture:** Keep the existing React/Vite application and first make every section complete as static semantic HTML. Model the four cross-device scenes as pure localized data and pure state transitions; React renders product-demo UI, while GSAP and `@gsap/react` own only presentation timelines inside scoped components. Reuse the existing Hero/terminal/mascot components, replace sparse sections with focused modules, and keep all production assets local.

**Tech Stack:** React 19, Vite 8, GSAP 3 + ScrollTrigger, `@gsap/react`, React Bits-derived DotField/SpotlightCard, Vitest/Testing Library, Playwright, Canvas 2D, ffmpeg/ffprobe, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-28-paws-homepage-cross-device-motion-v2-design.md`

## Global Constraints

- App is the core mobile control surface; PC means browser Web and is equally important.
- Tell the factual lifecycle: remote start → inspect execution → approve remotely → hand off the same session → manage sessions.
- Never claim Paws removes Codex/Claude provider login or network requirements; Aliyun wording must distinguish the Paws relay from provider connectivity.
- Chrome extension is roadmap-only and must never render an install/download action.
- Reuse the existing H3 output only; do not submit another paid MiniMax task.
- Keep the Hero terminal interaction and the current black-hoodie mascot identity.
- Use the seven existing transparent mascot files as distinct “Paws Crew” members, not as sequential frames of one identity.
- Production App/PC demonstrations use semantic React DOM based on real product states, not enlarged screenshots or empty skeleton cards.
- Use local npm dependencies; production must not load GSAP or other runtime code from a CDN.
- Desktop may pin and scrub; tablet/mobile must use normal document flow without long pinned blank regions.
- `prefers-reduced-motion: reduce` must expose the complete story without autoplay, scrub, pointer animation, or looping motion.
- Preserve `/docs`, `/docs/zh-CN`, `/install.sh`, browser-language selection, explicit language persistence, and theme persistence.
- Keep every touch target at least 44×44px and prevent horizontal page overflow at 1440×1000, 1280×900, 1024×768, and 390×844.
- Use `apply_patch` for text edits. Preserve unrelated user changes and keep `.superpowers/brainstorm/` untracked.
- Each task ends with focused tests, `git diff --check`, and a Conventional Commit; do not merge or deploy production before public-preview approval.

## File Map

Create:

- `src/app/storyContent.js` — bilingual product-demo content and stable scene IDs.
- `src/components/AgentMarquee.jsx` — supported-agent rail without a play/pause glyph.
- `src/components/CrossDeviceStory/CrossDeviceStory.jsx` — semantic four-scene composition.
- `src/components/CrossDeviceStory/StorySteps.jsx` — scene navigation and accessible progress.
- `src/components/CrossDeviceStory/PcConsoleDemo.jsx` — high-fidelity PC Web mini UI.
- `src/components/CrossDeviceStory/MobileConsoleDemo.jsx` — high-fidelity App mini UI.
- `src/components/CrossDeviceStory/ConnectionFlow.jsx` — decorative connection state.
- `src/components/CrossDeviceStory/storyModel.js` — pure scene selection and state helpers.
- `src/components/MascotCrew/MascotCrew.jsx` — seven-role chapter rail.
- `src/components/MascotCrew/MascotCard.jsx` — one semantic character card.
- `src/components/MascotCrew/mascotRegistry.js` — asset/role/section registry.
- `src/components/ProductProof.jsx` — content-rich capability cases.
- `src/components/ValueComparison.jsx` — factual local-terminal/Paws comparison.
- `src/components/ArchitectureStory.jsx` — App/Web → relay → daemon → Agent topology.
- `src/components/Roadmap.jsx` — implemented versus planned capabilities.
- `src/hooks/useReducedMotion.js` — one shared reduced-motion subscription.
- `src/hooks/useStoryMotion.js` — scoped GSAP/ScrollTrigger lifecycle.
- `src/styles/story.css` — story, console, connection, mascot-crew motion layout.
- `tests/storyContent.test.js`, `tests/storyModel.test.js`.
- `tests/AgentMarquee.test.jsx`, `tests/CrossDeviceStory.test.jsx`.
- `tests/MascotCrew.test.jsx`, `tests/ProductProof.test.jsx`.
- `tests/ArchitectureStory.test.jsx`, `tests/Roadmap.test.jsx`.

Copy/version:

- `public/assets/mascots/{astro,barista,explorer,florist,hoodie,ninja,scientist}.png` from the main `happy` repository.
- Rebuild `public/assets/mascot-turn-atlas.webp` from the existing local H3 MP4 at 768px per frame.

Modify:

- `package.json`, lockfile — exact GSAP dependencies.
- `src/app/App.jsx`, `src/app/content.js` — new section order and shared labels.
- `src/components/AgentStrip.jsx` — remove after `AgentMarquee` integration.
- `src/components/HowItWorks.jsx`, `src/components/FeatureGrid.jsx` — remove after their replacements are integrated.
- `src/components/Header.jsx`, `src/components/Hero.jsx`, `src/components/MascotLook.jsx`.
- `src/components/OpenSource.jsx`, `src/components/FinalCTA.jsx`, `src/components/Footer.jsx`.
- `src/styles/global.css`, `src/styles/components.css`, `src/main.jsx`.
- `scripts/build-mascot-atlas.sh`, `scripts/verify-static.cjs`.
- Existing unit tests, `e2e/homepage.spec.js`, and `.github/workflows/deploy-cloudflare-pages.yml`.

---

### Task 1: Lock the Bilingual Story Contract

**Files:**
- Create: `src/app/storyContent.js`
- Create: `tests/storyContent.test.js`
- Modify: `src/app/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Produces: `STORY_SCENE_IDS`, `storyContent.en`, `storyContent.zh`, and `getStoryContent(language)`.
- Each language returns `{ intro, scenes, consoles, crew, proof, comparison, architecture, roadmap }` with the same object keys and scene IDs.
- Later tasks consume `scene.id` values `start`, `watch`, `approve`, and `handoff`; do not rename them.

- [ ] **Step 1: Write the failing schema tests**

```js
import { describe, expect, it } from 'vitest';
import { STORY_SCENE_IDS, getStoryContent, storyContent } from '../src/app/storyContent';

describe('cross-device story content', () => {
  it('keeps four stable scenes in the approved order', () => {
    expect(STORY_SCENE_IDS).toEqual(['start', 'watch', 'approve', 'handoff']);
    for (const language of ['en', 'zh']) {
      expect(getStoryContent(language).scenes.map(scene => scene.id)).toEqual(STORY_SCENE_IDS);
    }
  });

  it('keeps English and Chinese object shapes identical', () => {
    expect(Object.keys(storyContent.en)).toEqual(Object.keys(storyContent.zh));
    expect(storyContent.en.crew.map(item => item.id)).toEqual(storyContent.zh.crew.map(item => item.id));
    expect(storyContent.en.proof).toHaveLength(6);
    expect(storyContent.zh.comparison).toHaveLength(5);
  });

  it('marks the Chrome extension as planned and uses qualified Aliyun copy', () => {
    expect(storyContent.zh.roadmap.planned.find(item => item.id === 'chrome-extension')).toBeTruthy();
    expect(storyContent.zh.architecture.note).toContain('底层 Agent');
    expect(storyContent.zh.architecture.note).not.toMatch(/无需\s*VPN/);
  });
});
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/storyContent.test.js tests/content.test.js`

Expected: FAIL because `storyContent.js` does not exist.

- [ ] **Step 3: Implement stable scene and content exports**

```js
export const STORY_SCENE_IDS = ['start', 'watch', 'approve', 'handoff'];

export const storyContent = {
  en: {
    intro: { eyebrow: 'ONE SESSION · EVERY SCREEN', title: 'Start here. Approve anywhere. Continue everywhere.', summary: 'A four-step demonstration of starting, watching, approving and continuing one Paws session across PC Web and App.' },
    scenes: [
      { id: 'start', number: '01', title: 'Start remotely from the browser', body: 'Choose an online machine, project and agent, then send the first task.' },
      { id: 'watch', number: '02', title: 'See every step', body: 'Follow skills, tool calls and subagents instead of treating the run as a black box.' },
      { id: 'approve', number: '03', title: 'Approve from your phone', body: 'Review a blocked command and decide without returning to the computer.' },
      { id: 'handoff', number: '04', title: 'Continue the same session', body: 'Move between App and PC Web without copying the conversation.' }
    ],
    consoles: {
      machine: 'Mac mini', project: 'paws', agent: 'Codex', sessionId: 'paws/refactor-auth',
      online: 'Online', running: 'Running', approvalPending: 'Approval required', complete: 'Complete',
      approveOnce: 'Approve once', allowSession: 'Allow for this session', reject: 'Reject',
      demoDisclaimer: 'Product demonstration — controls are not connected to an account.',
      pcSummary: {
        start: 'PC Web session composer with an online Mac mini, paws project and Codex selected.',
        watch: 'PC Web session showing skills, tools and subagents in progress.',
        approve: 'PC Web session paused while a command waits for approval.',
        handoff: 'PC Web showing the same session that is open in the App.'
      }
    },
    crew: [
      { id: 'astro', role: 'REMOTE LAUNCH', title: 'Astronaut', body: 'Start work across distance.', alt: 'Paws astronaut mascot' },
      { id: 'explorer', role: 'ANYWHERE', title: 'Explorer', body: 'Continue after leaving the desk.', alt: 'Paws explorer mascot' },
      { id: 'hoodie', role: 'LIVE CODE', title: 'Developer', body: 'Follow agents and tool activity.', alt: 'Paws developer mascot' },
      { id: 'ninja', role: 'PERMISSION', title: 'Ninja', body: 'Make focused security decisions.', alt: 'Paws ninja mascot' },
      { id: 'scientist', role: 'ENCRYPTED SYNC', title: 'Scientist', body: 'Explain relay and sync architecture.', alt: 'Paws scientist mascot' },
      { id: 'barista', role: 'PC WEB', title: 'Barista', body: 'Settle into deep browser work.', alt: 'Paws barista mascot' },
      { id: 'florist', role: 'OPEN SOURCE', title: 'Florist', body: 'Grow open-source and self-hosted workflows.', alt: 'Paws florist mascot' }
    ],
    proof: [
      { id: 'remote-start', status: 'Mac mini · Online', title: 'Start remotely', body: 'Choose a machine, directory and agent from the browser.', evidence: 'Mac mini → paws → Codex' },
      { id: 'live-process', status: 'Agent · Running', title: 'See the process', body: 'Skills, tools and subagents remain visible.', evidence: 'Skill ✓ · Tool ◐ · Subagent ◐' },
      { id: 'approval', status: 'Approval required', title: 'Decide remotely', body: 'Approve or reject blocked operations from App or Web.', evidence: 'npm run build' },
      { id: 'session-overview', status: '5 states', title: 'Manage every session', body: 'Scan running, pending, idle, complete and failed work.', evidence: 'Running · Pending · Idle · Complete · Failed' },
      { id: 'encrypted-sync', status: 'Relay connected', title: 'Keep sync controlled', body: 'Connect clients to the daemon through the Paws relay.', evidence: 'App/Web → Relay → Daemon' },
      { id: 'open-source', status: 'Source available', title: 'Host it your way', body: 'Inspect the code and deploy the Paws services yourself.', evidence: 'GitHub · Self-hosting guide' }
    ],
    comparisonLabels: { topic: 'When you need to…', local: 'Local terminal only' },
    comparison: [
      { id: 'away', topic: 'Away from the computer', local: 'Return to the terminal or configure remote access', paws: 'View the same session in App or PC Web' },
      { id: 'approval', topic: 'Permission requests', local: 'Handle them at the terminal', paws: 'Approve or reject remotely' },
      { id: 'overview', topic: 'Multiple agents', local: 'Spread across terminal windows', paws: 'One cross-device session overview' },
      { id: 'start', topic: 'Starting work', local: 'Operate the target computer', paws: 'Start on an online machine remotely' },
      { id: 'hosting', topic: 'Service deployment', local: 'Depends on the individual tool', paws: 'Open-source, self-hostable Paws services' }
    ],
    architecture: {
      nodes: { clients: 'App / PC Web', relay: 'Encrypted Paws relay', daemon: 'Paws daemon on your computer', agents: 'Codex / Claude Code / Gemini / OpenCode / ACP' },
      note: 'The Paws Web and sync services can run on Aliyun for a more controllable domestic access path. Underlying agent login and API connectivity still depend on each provider.'
    },
    roadmap: {
      shipped: [{ id: 'app', title: 'Mobile App' }, { id: 'pc-web', title: 'PC Web' }, { id: 'daemon', title: 'CLI / daemon' }, { id: 'handoff', title: 'Cross-device sessions' }],
      planned: [{ id: 'browser-first', title: 'Browser-first improvements' }, { id: 'chrome-extension', title: 'Chrome extension update' }, { id: 'mascot-motion', title: 'Richer mascot motion assets' }]
    }
  },
  zh: {
    intro: { eyebrow: '一个会话 · 所有屏幕', title: '在这里启动，随时审批，到处继续。', summary: '通过四幕演示，在 PC Web 与 App 之间启动、查看、审批并继续同一个 Paws 会话。' },
    scenes: [
      { id: 'start', number: '01', title: '浏览器里，远程开工', body: '选择在线机器、项目目录和 Agent，然后发送第一条任务。' },
      { id: 'watch', number: '02', title: '每一步，都看得见', body: 'Skill、工具调用和子 Agent 进度直接呈现在会话中。' },
      { id: 'approve', number: '03', title: '关键操作，手机拍板', body: '任务被权限请求阻塞时，不必赶回电脑。' },
      { id: 'handoff', number: '04', title: '同一个会话，跨端接力', body: 'App 与 PC Web 共享同一条消息时间线。' }
    ],
    consoles: {
      machine: 'Mac mini', project: 'paws', agent: 'Codex', sessionId: 'paws/refactor-auth',
      online: '在线', running: '运行中', approvalPending: '等待批准', complete: '已完成',
      approveOnce: '批准一次', allowSession: '本次会话允许', reject: '拒绝',
      demoDisclaimer: '产品演示界面，不连接真实账号。',
      pcSummary: {
        start: 'PC Web 新建会话，已选择在线 Mac mini、paws 项目和 Codex。',
        watch: 'PC Web 会话正在展示 Skill、工具和子 Agent 进度。',
        approve: 'PC Web 会话暂停，等待用户批准命令。',
        handoff: 'PC Web 与 App 正在显示同一个会话。'
      }
    },
    crew: [
      { id: 'astro', role: '远程启动', title: '宇航员', body: '跨越距离，远程开始工作。', alt: 'Paws 宇航员土拨鼠' },
      { id: 'explorer', role: '随处继续', title: '探险家', body: '离开电脑以后继续任务。', alt: 'Paws 探险家土拨鼠' },
      { id: 'hoodie', role: '实时编程', title: '程序员', body: '查看 Agent 与工具活动。', alt: 'Paws 程序员土拨鼠' },
      { id: 'ninja', role: '权限审批', title: '忍者', body: '专注处理安全决策。', alt: 'Paws 忍者土拨鼠' },
      { id: 'scientist', role: '加密同步', title: '科学家', body: '解释中继与同步架构。', alt: 'Paws 科学家土拨鼠' },
      { id: 'barista', role: 'PC WEB', title: '咖啡师', body: '在浏览器中进行深度工作。', alt: 'Paws 咖啡师土拨鼠' },
      { id: 'florist', role: '开源生态', title: '花艺师', body: '发展开源与自托管工作流。', alt: 'Paws 花艺师土拨鼠' }
    ],
    proof: [
      { id: 'remote-start', status: 'Mac mini · 在线', title: '远程启动', body: '在浏览器里选择机器、目录和 Agent。', evidence: 'Mac mini → paws → Codex' },
      { id: 'live-process', status: 'Agent · 运行中', title: '查看执行过程', body: 'Skill、工具和子 Agent 始终可见。', evidence: 'Skill ✓ · 工具 ◐ · 子 Agent ◐' },
      { id: 'approval', status: '等待批准', title: '远程处理权限', body: '从 App 或 Web 批准、拒绝被阻塞的操作。', evidence: 'npm run build' },
      { id: 'session-overview', status: '五种状态', title: '管理全部会话', body: '查看运行中、等待、空闲、完成和失败。', evidence: '运行 · 等待 · 空闲 · 完成 · 失败' },
      { id: 'encrypted-sync', status: '中继已连接', title: '可控的同步链路', body: '客户端通过 Paws 中继连接本机 daemon。', evidence: 'App/Web → 中继 → daemon' },
      { id: 'open-source', status: '源码开放', title: '按你的方式部署', body: '检查源码并自行部署 Paws 服务。', evidence: 'GitHub · 自托管文档' }
    ],
    comparisonLabels: { topic: '当你需要……', local: '仅使用本机终端' },
    comparison: [
      { id: 'away', topic: '离开电脑后查看', local: '返回终端或自行配置远程方案', paws: '在 App 或 PC Web 查看同一会话' },
      { id: 'approval', topic: '权限请求', local: '在终端前处理', paws: '远程批准或拒绝' },
      { id: 'overview', topic: '多个 Agent', local: '分散在不同终端窗口', paws: '一个跨设备会话总览' },
      { id: 'start', topic: '启动新任务', local: '操作目标电脑', paws: '在在线机器上远程启动' },
      { id: 'hosting', topic: '服务部署', local: '取决于单个工具', paws: 'Paws 服务开源并可自托管' }
    ],
    architecture: {
      nodes: { clients: 'App / PC Web', relay: 'Paws 加密同步服务', daemon: '用户电脑上的 Paws daemon', agents: 'Codex / Claude Code / Gemini / OpenCode / ACP' },
      note: 'Paws 的 Web 与同步服务可部署在阿里云，国内访问路径更可控；底层 Agent 的账号登录与 API 网络要求仍取决于对应服务提供商。'
    },
    roadmap: {
      shipped: [{ id: 'app', title: '移动 App' }, { id: 'pc-web', title: 'PC Web' }, { id: 'daemon', title: 'CLI / daemon' }, { id: 'handoff', title: '跨端会话' }],
      planned: [{ id: 'browser-first', title: '浏览器优先增强' }, { id: 'chrome-extension', title: 'Chrome 插件更新' }, { id: 'mascot-motion', title: '更丰富的角色动作资产' }]
    }
  }
};

export function getStoryContent(language) {
  return storyContent[language] ?? storyContent.en;
}
```

- [ ] **Step 4: Move shared navigation/labels into the existing content shape**

Add `nav.appPc`, `nav.architecture`, and labels for online, running, pending approval, complete, planned, current session, demo disclaimer, and marquee interaction to both languages. Preserve every existing key consumed by Header, Hero, TerminalDemo, Footer, and documentation links.

```js
// en additions
nav: { ...existingNav, appPc: 'App + PC', architecture: 'Architecture' },
labels: { ...existingLabels, agentMarquee: 'Supported coding agents', planned: 'Planned', shipped: 'Available now' }

// zh additions
nav: { ...existingNav, appPc: 'App + PC', architecture: '系统架构' },
labels: { ...existingLabels, agentMarquee: '支持的编程智能体', planned: '计划中', shipped: '现已支持' }
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/storyContent.test.js tests/content.test.js
git diff --check
git add src/app/storyContent.js src/app/content.js tests/storyContent.test.js tests/content.test.js
git commit -m "feat(web): define cross-device homepage story"
```

Expected: both focused test files PASS; all content collections are populated and bilingual keys match.

---

### Task 2: Replace the Agent Strip with a Control-Free Marquee

**Files:**
- Create: `src/components/AgentMarquee.jsx`
- Create: `tests/AgentMarquee.test.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/components.css`
- Delete: `src/components/AgentStrip.jsx`
- Modify: `tests/App.test.jsx`
- Modify: `tests/responsive-styles.test.js`

**Interfaces:**
- Consumes: `agents: string[]`, `labels.agentMarquee: string`.
- Produces: `<AgentMarquee agents labels />` with `data-testid="agent-marquee"`, no button, and a duplicated `aria-hidden` visual track only on desktop.

- [ ] **Step 1: Write RED tests for readable names and no play control**

```jsx
render(<AgentMarquee agents={['Claude Code', 'Codex']} labels={{ agentMarquee: 'Supported agents' }} />);
expect(screen.getByRole('region', { name: 'Supported agents' })).toBeInTheDocument();
expect(screen.getByText('Claude Code')).toBeVisible();
expect(screen.queryByRole('button')).not.toBeInTheDocument();
expect(screen.getByTestId('agent-marquee')).toHaveAttribute('data-motion', 'auto');
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/AgentMarquee.test.jsx tests/App.test.jsx`

Expected: FAIL because `AgentMarquee` is absent and App still renders the play/pause button.

- [ ] **Step 3: Implement the semantic marquee**

```jsx
export default function AgentMarquee({ agents, labels }) {
  return (
    <section className="agent-marquee" aria-label={labels.agentMarquee} data-testid="agent-marquee" data-motion="auto">
      <div className="agent-marquee__track">
        <ul className="agent-marquee__list">{agents.map(agent => <li key={agent}>{agent}</li>)}</ul>
        <ul className="agent-marquee__list agent-marquee__duplicate" aria-hidden="true">
          {agents.map(agent => <li key={agent}>{agent}</li>)}
        </ul>
      </div>
    </section>
  );
}
```

Pause the CSS animation via `.agent-marquee:hover`, `.agent-marquee:focus-within`, and `@media (prefers-reduced-motion: reduce)`. At widths below 768px, hide the duplicate and render the primary list as a wrapping static row or manual horizontal scroller.

- [ ] **Step 4: Integrate and remove the obsolete component**

Replace the `AgentStrip` import/render in `App.jsx`, delete its file, remove `.agent-strip__control` rules, and update App/CSS tests to assert there is no supported-agent button.

```jsx
import AgentMarquee from '../components/AgentMarquee';
// ...
<AgentMarquee agents={copy.agents} labels={copy.labels} />
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/AgentMarquee.test.jsx tests/App.test.jsx tests/responsive-styles.test.js
npm run build
git diff --check
git add src/components/AgentMarquee.jsx src/app/App.jsx src/styles/components.css tests/AgentMarquee.test.jsx tests/App.test.jsx tests/responsive-styles.test.js
git rm src/components/AgentStrip.jsx
git commit -m "fix(web): replace agent playback strip"
```

---

### Task 3: Build the Pure Cross-Device Scene Model

**Files:**
- Create: `src/components/CrossDeviceStory/storyModel.js`
- Create: `tests/storyModel.test.js`

**Interfaces:**
- Produces:
  - `clampSceneIndex(index, sceneCount): number`
  - `sceneIndexFromProgress(progress, sceneCount): number`
  - `buildConsoleState(sceneId, content): ConsoleState`
- `ConsoleState` shape: `{ sceneId, machineStatus, sessionStatus, focus, permission, toolStates, sessionId }`.

- [ ] **Step 1: Write exhaustive RED tests**

```js
expect(sceneIndexFromProgress(0, 4)).toBe(0);
expect(sceneIndexFromProgress(0.249, 4)).toBe(0);
expect(sceneIndexFromProgress(0.25, 4)).toBe(1);
expect(sceneIndexFromProgress(0.999, 4)).toBe(3);
expect(sceneIndexFromProgress(1, 4)).toBe(3);
expect(sceneIndexFromProgress(-1, 4)).toBe(0);

expect(buildConsoleState('approve', copy)).toMatchObject({
  focus: 'mobile',
  sessionStatus: 'approval-pending',
  permission: { command: 'npm run build', status: 'pending' }
});
expect(buildConsoleState('handoff', copy)).toMatchObject({
  focus: 'shared',
  sessionStatus: 'running',
  permission: { status: 'approved' },
  sessionId: 'paws/refactor-auth'
});
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/storyModel.test.js`

Expected: FAIL because the pure model is absent.

- [ ] **Step 3: Implement explicit state mapping**

```js
export function clampSceneIndex(index, sceneCount) {
  return Math.max(0, Math.min(sceneCount - 1, Math.trunc(index)));
}

export function sceneIndexFromProgress(progress, sceneCount) {
  const normalized = Math.max(0, Math.min(1, progress));
  return clampSceneIndex(Math.floor(normalized * sceneCount), sceneCount);
}

export function buildConsoleState(sceneId, content) {
  const base = { sceneId, machineStatus: 'online', sessionId: content.consoles.sessionId, toolStates: [] };
  const states = {
    start: { sessionStatus: 'ready', focus: 'pc', permission: null },
    watch: { sessionStatus: 'running', focus: 'pc', permission: null, toolStates: ['skill-complete', 'tool-running', 'subagent-running'] },
    approve: { sessionStatus: 'approval-pending', focus: 'mobile', permission: { command: 'npm run build', status: 'pending' } },
    handoff: { sessionStatus: 'running', focus: 'shared', permission: { command: 'npm run build', status: 'approved' }, toolStates: ['skill-complete', 'tool-complete'] }
  };
  if (!states[sceneId]) throw new RangeError(`Unknown Paws story scene: ${sceneId}`);
  return { ...base, ...states[sceneId] };
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx vitest run tests/storyModel.test.js
git diff --check
git add src/components/CrossDeviceStory/storyModel.js tests/storyModel.test.js
git commit -m "feat(web): model cross-device story states"
```

---

### Task 4: Render High-Fidelity PC and App Demonstrations

**Files:**
- Create: `src/components/CrossDeviceStory/PcConsoleDemo.jsx`
- Create: `src/components/CrossDeviceStory/MobileConsoleDemo.jsx`
- Create: `src/components/CrossDeviceStory/ConnectionFlow.jsx`
- Create: `tests/CrossDeviceStory.test.jsx`
- Create: `src/styles/story.css`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `ConsoleState` from Task 3 and localized `copy` from Task 1.
- Produces: `<PcConsoleDemo state copy />`, `<MobileConsoleDemo state copy />`, `<ConnectionFlow focus status />`.
- Each demo root exposes `data-scene`, `data-status`, and a localized accessible summary.

- [ ] **Step 1: Write RED component tests for every scene**

```jsx
const approve = buildConsoleState('approve', copy);
render(<><PcConsoleDemo state={approve} copy={copy} /><MobileConsoleDemo state={approve} copy={copy} /></>);
expect(screen.getByTestId('pc-console')).toHaveAttribute('data-status', 'approval-pending');
expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-focus', 'true');
expect(screen.getByText('npm run build')).toBeVisible();
expect(screen.getByRole('button', { name: copy.consoles.approveOnce })).toBeDisabled();
expect(screen.getByRole('button', { name: copy.consoles.reject })).toBeDisabled();
```

Buttons are disabled because this is a landing-page demonstration, not a live control surface; the surrounding summary must say so.

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/CrossDeviceStory.test.jsx`

Expected: FAIL because the console components do not exist.

- [ ] **Step 3: Implement the PC Web mini UI**

Render a browser chrome, session sidebar, active session header, transcript/tool activity, and composer. Branch on `state.sceneId`: `start` shows machine/project/agent controls; later scenes show the session transcript. Use actual DOM text and icons; do not use screenshot backgrounds.

```jsx
export default function PcConsoleDemo({ state, copy }) {
  return (
    <section className="pc-console" data-testid="pc-console" data-scene={state.sceneId} data-status={state.sessionStatus} aria-label={copy.consoles.pcSummary[state.sceneId]}>
      <div className="pc-console__chrome" aria-hidden="true"><i /><i /><i /><span>paws · web</span></div>
      {state.sceneId === 'start' ? <ComposePanel state={state} copy={copy} /> : <SessionPanel state={state} copy={copy} />}
    </section>
  );
}
```

- [ ] **Step 4: Implement the App mini UI and permission card**

Render a phone shell, session header, condensed transcript and permission footer. For `approve`, include disabled demonstration buttons for approve once, allow session, and reject. For `handoff`, show the same `state.sessionId` rendered by PC.

```jsx
export default function MobileConsoleDemo({ state, copy }) {
  const focused = state.focus === 'mobile' || state.focus === 'shared';
  return <section className="mobile-console" data-testid="mobile-console" data-scene={state.sceneId} data-focus={String(focused)} aria-label={copy.consoles.demoDisclaimer}>
    <header><span>{state.sessionId}</span><strong>{copy.consoles[state.sessionStatus === 'approval-pending' ? 'approvalPending' : 'running']}</strong></header>
    {state.permission ? <div className="permission-card"><code>{state.permission.command}</code><button disabled>{copy.consoles.approveOnce}</button><button disabled>{copy.consoles.allowSession}</button><button disabled>{copy.consoles.reject}</button></div> : <div className="mobile-console__transcript">{copy.scenes.find(scene => scene.id === state.sceneId).body}</div>}
  </section>;
}
```

- [ ] **Step 5: Implement the decorative connection layer**

```jsx
export default function ConnectionFlow({ focus, status }) {
  return <div className="connection-flow" data-focus={focus} data-status={status} aria-hidden="true"><i /><i /><i /></div>;
}
```

CSS uses transforms and opacity only. The connection layer must never contribute document width or receive pointer events.

- [ ] **Step 6: Import `story.css` and verify**

```js
// src/main.jsx
import './styles/story.css';
```

Run:

```bash
npx vitest run tests/CrossDeviceStory.test.jsx
npm run build
git diff --check
git add src/components/CrossDeviceStory src/styles/story.css src/main.jsx tests/CrossDeviceStory.test.jsx
git commit -m "feat(web): add App and PC product demos"
```

Expected: demos render all four states with crisp DOM text and no image dependency.

---

### Task 5: Integrate the Static Four-Scene Story

**Files:**
- Create: `src/components/CrossDeviceStory/StorySteps.jsx`
- Create: `src/components/CrossDeviceStory/CrossDeviceStory.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/story.css`
- Modify: `tests/CrossDeviceStory.test.jsx`
- Modify: `tests/App.test.jsx`
- Delete: `src/components/HowItWorks.jsx`

**Interfaces:**
- Consumes: `language`, `getStoryContent(language)`, Task 3 model, and Task 4 demos.
- Produces: `<CrossDeviceStory language />` with four semantic `<article>` elements and `data-active-scene`.
- Accept optional `activeSceneOverride` only for component tests; production leaves it undefined.

- [ ] **Step 1: Extend RED tests for static completeness**

```jsx
render(<CrossDeviceStory language="zh" activeSceneOverride="approve" />);
expect(screen.getAllByRole('article')).toHaveLength(4);
expect(screen.getByRole('heading', { name: '关键操作，手机拍板' })).toBeVisible();
expect(screen.getByTestId('cross-device-story')).toHaveAttribute('data-active-scene', 'approve');
expect(screen.getByTestId('pc-console')).toHaveAttribute('data-scene', 'approve');
expect(screen.getByTestId('mobile-console')).toHaveAttribute('data-scene', 'approve');
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/CrossDeviceStory.test.jsx tests/App.test.jsx`

Expected: FAIL because the composed story and new App order are absent.

- [ ] **Step 3: Build the semantic composition before motion**

```jsx
export default function CrossDeviceStory({ language, activeSceneOverride }) {
  const copy = getStoryContent(language);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeId = activeSceneOverride ?? copy.scenes[activeIndex].id;
  const state = buildConsoleState(activeId, copy);
  return (
    <section id="app-pc" className="cross-device-story" data-testid="cross-device-story" data-active-scene={activeId}>
      <StorySteps scenes={copy.scenes} activeId={activeId} onSelect={setActiveIndex} />
      <div className="cross-device-story__stage">
        <PcConsoleDemo state={state} copy={copy} />
        <ConnectionFlow focus={state.focus} status={state.sessionStatus} />
        <MobileConsoleDemo state={state} copy={copy} />
      </div>
    </section>
  );
}
```

`StorySteps` renders all four articles in DOM order. Its buttons are optional progressive enhancement for tablet/mobile and set the same active index; they must have `aria-current="step"` on the active scene.

- [ ] **Step 4: Replace `HowItWorks` in App**

Render `CrossDeviceStory` after `AgentMarquee`, pass `language`, remove `HowItWorks`, and update Header navigation anchor from `#how-it-works` to `#app-pc` only after both localized links are tested.

```jsx
<Hero copy={copy} language={language} theme={theme} />
<AgentMarquee agents={copy.agents} labels={copy.labels} />
<CrossDeviceStory language={language} />
```

- [ ] **Step 5: Add non-pinned responsive layout first**

The default CSS is vertical and complete. Only a later desktop media query may pin the stage. This guarantees JS failure and reduced motion preserve the story.

```css
.cross-device-story { display: grid; gap: clamp(2rem, 6vw, 6rem); }
.story-steps { display: grid; gap: 1rem; }
.cross-device-story__stage { position: relative; min-width: 0; }
@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
  .cross-device-story__stage { position: sticky; top: calc(var(--header-height) + 1rem); }
}
```

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run tests/CrossDeviceStory.test.jsx tests/App.test.jsx tests/content.test.js
npm run build
git diff --check
git add src/components/CrossDeviceStory src/app/App.jsx src/styles/story.css tests/CrossDeviceStory.test.jsx tests/App.test.jsx tests/content.test.js
git rm src/components/HowItWorks.jsx
git commit -m "feat(web): integrate the cross-device story"
```

---

### Task 6: Add Scoped GSAP Scroll Motion with Mobile Fallback

**Files:**
- Modify: `package.json`
- Modify: lockfile
- Create: `src/hooks/useReducedMotion.js`
- Create: `src/hooks/useStoryMotion.js`
- Modify: `src/components/CrossDeviceStory/CrossDeviceStory.jsx`
- Modify: `src/styles/story.css`
- Modify: `tests/CrossDeviceStory.test.jsx`
- Modify: `tests/responsive-styles.test.js`

**Interfaces:**
- Produces:
  - `useReducedMotion(): boolean`
  - `useStoryMotion({ rootRef, sceneCount, disabled, onSceneChange }): void`
- `onSceneChange(index)` receives an integer `0..sceneCount-1`; the hook never owns product copy/state.

- [ ] **Step 1: Install exact local dependencies**

Run: `npm install gsap@3.13.0 @gsap/react@2.1.2 --save-exact`

Expected: package manifest and lockfile contain exact versions; no CDN script is added.

- [ ] **Step 2: Write RED lifecycle tests**

Mock `gsap`, `ScrollTrigger`, and `useGSAP`; assert reduced motion skips timeline creation, desktop creates one scoped timeline/trigger, and unmount calls context cleanup. Add a CSS assertion that pin styles appear only inside `@media (min-width: 1024px)` and `@media (prefers-reduced-motion: no-preference)`.

- [ ] **Step 3: Implement the shared media hook**

```js
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}
```

- [ ] **Step 4: Implement one scoped story timeline**

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { sceneIndexFromProgress } from '../components/CrossDeviceStory/storyModel';

gsap.registerPlugin(ScrollTrigger);

export function useStoryMotion({ rootRef, sceneCount, disabled, onSceneChange }) {
  useGSAP(() => {
    if (disabled) return undefined;
    const media = gsap.matchMedia();
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => onSceneChange(sceneIndexFromProgress(self.progress, sceneCount))
      });
    });
    return () => media.revert();
  }, { scope: rootRef, dependencies: [disabled, sceneCount, onSceneChange], revertOnUpdate: true });
}
```

Use GSAP timelines for device focus, connection progress and scene mascot transforms, but keep React state as the source of current scene. Do not create one ScrollTrigger per tiny child element.

- [ ] **Step 5: Integrate and refresh only after language layout changes**

Memoize `onSceneChange`, call the hook once from `CrossDeviceStory`, and run a single `ScrollTrigger.refresh()` after language changes using `requestAnimationFrame`. Cleanup the scheduled frame.

```jsx
const rootRef = useRef(null);
const reducedMotion = useReducedMotion();
const onSceneChange = useCallback(index => setActiveIndex(index), []);
useStoryMotion({ rootRef, sceneCount: copy.scenes.length, disabled: reducedMotion, onSceneChange });
useEffect(() => {
  const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => cancelAnimationFrame(frame);
}, [language]);
```

- [ ] **Step 6: Verify and commit**

```bash
npx vitest run tests/CrossDeviceStory.test.jsx tests/responsive-styles.test.js
npm run build
git diff --check
git add package.json package-lock.json src/hooks src/components/CrossDeviceStory/CrossDeviceStory.jsx src/styles/story.css tests/CrossDeviceStory.test.jsx tests/responsive-styles.test.js
git commit -m "feat(web): animate cross-device story with GSAP"
```

---

### Task 7: Add the Seven-Role Paws Crew

**Files:**
- Create: `public/assets/mascots/*.png`
- Create: `src/components/MascotCrew/mascotRegistry.js`
- Create: `src/components/MascotCrew/MascotCard.jsx`
- Create: `src/components/MascotCrew/MascotCrew.jsx`
- Create: `tests/MascotCrew.test.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/story.css`
- Modify: `scripts/verify-static.cjs`
- Modify: `tests/static-source.test.cjs`

**Interfaces:**
- Produces `MASCOT_IDS` and `getMascotCrew(copy)`; stable IDs are `astro`, `explorer`, `hoodie`, `ninja`, `scientist`, `barista`, `florist`.
- `<MascotCrew copy />` exposes seven `data-mascot-id` cards with fixed `width` and `height` attributes on images.

- [ ] **Step 1: Write RED registry/component/static tests**

```jsx
expect(MASCOT_IDS).toEqual(['astro', 'explorer', 'hoodie', 'ninja', 'scientist', 'barista', 'florist']);
render(<MascotCrew copy={copy} />);
expect(screen.getAllByTestId('mascot-card')).toHaveLength(7);
expect(screen.getByTestId('mascot-card-astro')).toHaveTextContent(copy.crew[0].title);
```

Static tests must assert each `/assets/mascots/<id>.png` exists and its source appears in `mascotRegistry.js`.

- [ ] **Step 2: Copy the approved existing assets**

```bash
mkdir -p public/assets/mascots
cp /Users/jacky/jacky-github/happy/packages/happy-app/sources/assets/images/mascots/{astro,barista,explorer,florist,hoodie,ninja,scientist}.png public/assets/mascots/
```

Do not edit, regenerate, or convert these source images in this task.

- [ ] **Step 3: Implement the registry and cards**

```js
export const MASCOT_IDS = ['astro', 'explorer', 'hoodie', 'ninja', 'scientist', 'barista', 'florist'];
export const mascotSources = Object.fromEntries(MASCOT_IDS.map(id => [id, `/assets/mascots/${id}.png`]));
export function getMascotCrew(copy) {
  return copy.crew.map(item => ({ ...item, src: mascotSources[item.id] }));
}
```

Each card renders role label, title and one-sentence meaning. Decorative cards use `alt=""`; when the role itself is referenced by surrounding text, use the localized `alt` from content.

- [ ] **Step 4: Integrate after the cross-device story**

Desktop uses a scroll-linked or drag-friendly horizontal rail with no control glyph. Tablet/mobile uses native horizontal overflow with scroll snap; reduced motion disables automated transforms.

```css
.mascot-crew__rail { display: flex; gap: 1rem; overflow-x: auto; scroll-snap-type: x proximity; }
.mascot-card { flex: 0 0 min(18rem, 78vw); scroll-snap-align: start; }
@media (prefers-reduced-motion: reduce) { .mascot-crew__rail { transform: none !important; } }
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/MascotCrew.test.jsx tests/static-source.test.cjs
npm run verify:static
npm run build
git diff --check
git add public/assets/mascots src/components/MascotCrew src/app/App.jsx src/styles/story.css scripts/verify-static.cjs tests/MascotCrew.test.jsx tests/static-source.test.cjs
git commit -m "feat(web): add the Paws Crew role system"
```

---

### Task 8: Rebuild the Existing H3 Atlas at 768px Per Frame

**Files:**
- Modify: `scripts/build-mascot-atlas.sh`
- Modify: `tests/mascot-atlas-script.test.cjs`
- Replace: `public/assets/mascot-turn-atlas.webp`
- Modify: `src/components/MascotLook.jsx`
- Modify: `tests/MascotLook.test.jsx`
- Modify: `e2e/homepage.spec.js`

**Interfaces:**
- Preserve the runtime contract: 24 frames, 6 columns, 4 rows, center frame index 12.
- Change only cell size from 512 to 768 and atlas dimensions from 3072×2048 to 4608×3072.
- Preserve true alpha, open-eye center-frame validation and ≤3,145,728-byte target; if 768px cannot meet both clarity and byte target, document measured output and stop for review instead of silently reverting to 512.

- [ ] **Step 1: Change tests first**

```js
for (const marker of [
  'scale=768:768',
  'pad=768:768',
  '4608',
  '3072',
  '768px cells'
]) assert.ok(script.includes(marker), marker);
```

Update the eye crop proportionally from `(170, 60, 350, 155)` to `(255, 90, 525, 233)` and adjust the E2E crop to the same coordinates.

- [ ] **Step 2: Run RED**

Run: `node --test tests/mascot-atlas-script.test.cjs`

Expected: FAIL because the script still emits 512px cells.

- [ ] **Step 3: Update the reproducible script**

Change extraction scale/pad, validation dimensions, proportional eye crop, and final log string. Keep 24 frames, `fps=6`, chroma-key values, despill threshold, and alpha coverage validation unchanged.

```sh
-vf "trim=duration=${duration_seconds},setpts=(${normalized_duration}/${duration_seconds})*(PTS-STARTPTS),fps=6,chromakey=0x00ff00:0.18:0.08,scale=768:768:force_original_aspect_ratio=decrease:flags=lanczos,pad=768:768:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba"
# validation
[ "$atlas_width" -eq 4608 ] && [ "$atlas_height" -eq 3072 ] || fail "unexpected atlas dimensions: ${atlas_width}x${atlas_height}"
```

- [ ] **Step 4: Rebuild from the existing paid artifact**

```bash
scripts/build-mascot-atlas.sh artifacts/mascot-motion/h3-output.mp4 public/assets/mascot-turn-atlas.webp 3.25 1.75
ffprobe -v error -show_entries stream=width,height,pix_fmt -of default=noprint_wrappers=1 public/assets/mascot-turn-atlas.webp
wc -c public/assets/mascot-turn-atlas.webp
```

Expected: `4608×3072`, alpha-capable pixel format, 24-frame runtime contract, ≤3,145,728 bytes. The approved source interval is exactly `3.25s + 1.75s`, matching the current center-open atlas build.

- [ ] **Step 5: Cap display size and validate fallback**

Set Hero mascot visual width to a maximum 520 CSS px at desktop. Keep the 1254px static transparent fallback for coarse pointer/reduced motion/error. Verify canvas logical size remains one frame, not the full atlas.

```css
.mascot-look { width: min(100%, 520px); aspect-ratio: 1; }
.mascot-look canvas, .mascot-look img { width: 100%; height: 100%; object-fit: contain; }
```

- [ ] **Step 6: Verify and commit**

```bash
node --test tests/mascot-atlas-script.test.cjs
npx vitest run tests/MascotLook.test.jsx tests/mascotFrameModel.test.js
npm run build
git diff --check
git add scripts/build-mascot-atlas.sh tests/mascot-atlas-script.test.cjs public/assets/mascot-turn-atlas.webp src/components/MascotLook.jsx tests/MascotLook.test.jsx e2e/homepage.spec.js
git commit -m "fix(web): rebuild the mascot atlas in high resolution"
```

No `minimax-h3 create` or `create-json` command is permitted.

---

### Task 9: Expand Hero Composition with Paws Crew Satellites

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/app/content.js`
- Modify: `src/styles/components.css`
- Modify: `tests/Hero.test.jsx`
- Modify: `tests/responsive-styles.test.js`
- Modify: `e2e/homepage.spec.js`

**Interfaces:**
- Preserve `<MascotLook pointerSurfaceRef theme alt />` and `<TerminalDemo command labels terminalCopy />` contracts.
- Add three decorative crew satellites with IDs `astro`, `ninja`, `scientist`; these do not replace the Hero mascot or create new pointer listeners.

- [ ] **Step 1: Write RED composition tests**

```jsx
expect(screen.getByTestId('mascot-look')).toBeVisible();
expect(screen.getByTestId('terminal-demo')).toBeVisible();
expect(screen.getAllByTestId('hero-crew-member')).toHaveLength(3);
expect(screen.getByText(copy.hero.appPill)).toBeVisible();
expect(screen.getByText(copy.hero.webPill)).toBeVisible();
expect(screen.getByText(copy.hero.daemonPill)).toBeVisible();
```

- [ ] **Step 2: Render the approved composition**

Add an outcome-focused paragraph and the three product-role pills. Render crew satellites around `MascotLook` with lazy-decoded local images. Satellites share the existing Hero pointer CSS variables; do not attach three new `pointermove` handlers.

```jsx
const satellites = ['astro', 'ninja', 'scientist'];
<div className="hero-media">
  <MascotLook pointerSurfaceRef={heroRef} theme={theme} alt={copy.hero.mascotAlt} />
  <div className="hero-crew" aria-hidden="true">{satellites.map(id => <img key={id} data-testid="hero-crew-member" src={`/assets/mascots/${id}.png`} alt="" width="512" height="512" decoding="async" />)}</div>
</div>
```

- [ ] **Step 3: Fix desktop and mobile boundaries**

Desktop keeps a stable two-column grid. Mobile order is eyebrow/title/body/actions/mascot/terminal, with satellites reduced or hidden when they would force a blank first viewport. No absolute child may extend `documentElement.scrollWidth`.

```css
.hero-media { isolation: isolate; min-width: 0; overflow: clip; }
@media (max-width: 767px) {
  .hero-grid { grid-template-columns: minmax(0, 1fr); }
  .hero-crew img:nth-child(n+2) { display: none; }
  .hero-media { min-height: 18rem; }
}
```

- [ ] **Step 4: Extend E2E clarity and layout checks**

Assert the main mascot rendered box is ≤520px wide on desktop, all three satellite resources complete, Chinese Hero title remains intentional, and the first mobile viewport contains the title, primary CTA and at least part of the mascot stage.

```js
const mascotBox = await page.getByTestId('mascot-look').boundingBox();
expect(mascotBox.width).toBeLessThanOrEqual(520);
expect(await page.getByTestId('hero-crew-member').evaluateAll(images => images.every(image => image.complete && image.naturalWidth === 512))).toBe(true);
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/Hero.test.jsx tests/responsive-styles.test.js
npm run test:e2e -- --grep "hero|mobile"
git diff --check
git add src/components/Hero.jsx src/app/content.js src/styles/components.css tests/Hero.test.jsx tests/responsive-styles.test.js e2e/homepage.spec.js
git commit -m "feat(web): expand the hero with Paws Crew"
```

---

### Task 10: Replace Empty Capability Cards with Product Proof

**Files:**
- Create: `src/components/ProductProof.jsx`
- Create: `src/components/ValueComparison.jsx`
- Create: `tests/ProductProof.test.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/components.css`
- Modify: `tests/App.test.jsx`
- Delete: `src/components/FeatureGrid.jsx`

**Interfaces:**
- `<ProductProof copy />` renders six evidence-rich cases from `copy.proof` with `id`, `status`, `title`, `body`, and `evidence`.
- `<ValueComparison copy />` renders exactly five rows with columns `local` and `paws`.

- [ ] **Step 1: Write RED tests for meaningful content density**

```jsx
render(<ProductProof copy={copy} />);
expect(screen.getAllByTestId('proof-case')).toHaveLength(6);
for (const card of screen.getAllByTestId('proof-case')) {
  expect(within(card).getByRole('heading')).not.toBeEmptyDOMElement();
  expect(within(card).getByTestId('proof-evidence')).not.toBeEmptyDOMElement();
  expect(within(card).getByTestId('proof-status')).not.toBeEmptyDOMElement();
}

render(<ValueComparison copy={copy} />);
expect(screen.getAllByTestId('comparison-row')).toHaveLength(5);
expect(screen.queryByText(/无需\s*VPN/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Implement case-specific mini evidence**

Use small semantic fragments rather than a generic icon grid: machine/Agent selector for remote start, tool list for live progress, permission status for approval, five session-status chips for overview, topology fragment for encrypted sync, and GitHub/self-hosting actions for open source.

```jsx
export default function ProductProof({ copy }) {
  return <section id="product" className="product-proof" aria-labelledby="product-proof-title">
    <h2 id="product-proof-title">{copy.proofTitle}</h2>
    <div className="product-proof__grid">{copy.proof.map(item => <ProofCase key={item.id} item={item} />)}</div>
  </section>;
}
```

- [ ] **Step 3: Implement the factual comparison table**

Use a real `<table>` on desktop and CSS-reformatted labeled rows on mobile while preserving table semantics. The Aliyun note sits immediately below the table and uses the exact qualified wording from the spec.

```jsx
export default function ValueComparison({ copy }) {
  return <section className="value-comparison"><table><thead><tr><th>{copy.comparisonLabels.topic}</th><th>{copy.comparisonLabels.local}</th><th>Paws</th></tr></thead><tbody>{copy.comparison.map(row => <tr key={row.id} data-testid="comparison-row"><th scope="row">{row.topic}</th><td>{row.local}</td><td>{row.paws}</td></tr>)}</tbody></table><p>{copy.architecture.note}</p></section>;
}
```

- [ ] **Step 4: Replace `FeatureGrid` and integrate both sections**

Render after `MascotCrew`; remove the old four generic cards and obsolete SpotlightCard usage from this section. SpotlightCard may remain available for other local effects but is not a substitute for proof content.

```jsx
<MascotCrew copy={storyCopy} />
<ProductProof copy={storyCopy} />
<ValueComparison copy={storyCopy} />
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/ProductProof.test.jsx tests/App.test.jsx tests/storyContent.test.js
npm run build
git diff --check
git add src/components/ProductProof.jsx src/components/ValueComparison.jsx src/app/App.jsx src/styles/components.css tests/ProductProof.test.jsx tests/App.test.jsx
git rm src/components/FeatureGrid.jsx
git commit -m "feat(web): replace feature cards with product proof"
```

---

### Task 11: Add Architecture, Deployment Truth, and Roadmap

**Files:**
- Create: `src/components/ArchitectureStory.jsx`
- Create: `src/components/Roadmap.jsx`
- Create: `tests/ArchitectureStory.test.jsx`
- Create: `tests/Roadmap.test.jsx`
- Modify: `src/components/OpenSource.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/components.css`
- Modify: `tests/App.test.jsx`

**Interfaces:**
- `<ArchitectureStory copy language />` renders four ordered nodes: `clients`, `relay`, `daemon`, `agents`.
- `<Roadmap copy />` renders separate `shipped` and `planned` lists; `chrome-extension` exists only in planned.
- `OpenSource` remains responsible only for GitHub/self-hosting explanation and actions.

- [ ] **Step 1: Write RED truthfulness tests**

```jsx
render(<ArchitectureStory copy={copy} language="zh" />);
expect(screen.getAllByTestId('architecture-node').map(node => node.dataset.nodeId)).toEqual(['clients', 'relay', 'daemon', 'agents']);
expect(screen.getByText(copy.architecture.note)).toBeVisible();
expect(screen.queryByText(/无需\s*VPN/)).not.toBeInTheDocument();

render(<Roadmap copy={copy} />);
expect(within(screen.getByTestId('roadmap-planned')).getByText(/Chrome/)).toBeVisible();
expect(within(screen.getByTestId('roadmap-shipped')).queryByText(/Chrome/)).not.toBeInTheDocument();
expect(screen.queryByRole('link', { name: /Chrome/ })).not.toBeInTheDocument();
```

- [ ] **Step 2: Implement semantic topology and progressive enhancement**

```jsx
const NODE_IDS = ['clients', 'relay', 'daemon', 'agents'];
export default function ArchitectureStory({ copy }) {
  return <section id="architecture" className="architecture-story">
    <ol>{NODE_IDS.map(id => <li key={id} data-testid="architecture-node" data-node-id={id}>{copy.architecture.nodes[id]}</li>)}</ol>
    <p>{copy.architecture.note}</p>
  </section>;
}
```

GSAP may animate a decorative packet along the connection after the static topology works. The DOM order and text remain visible without animation.

- [ ] **Step 3: Implement shipped/planned roadmap separation**

Render two explicitly labeled groups. Planned items use a localized “Planned/计划中” badge and no product action. Do not invent dates or version numbers.

```jsx
export default function Roadmap({ copy }) {
  return <section id="roadmap" className="roadmap"><div data-testid="roadmap-shipped"><h3>{copy.labels.shipped}</h3>{copy.roadmap.shipped.map(item => <p key={item.id}>{item.title}</p>)}</div><div data-testid="roadmap-planned"><h3>{copy.labels.planned}</h3>{copy.roadmap.planned.map(item => <p key={item.id}><span>{copy.labels.planned}</span>{item.title}</p>)}</div></section>;
}
```

- [ ] **Step 4: Narrow OpenSource and integrate order**

App order becomes Hero → AgentMarquee → CrossDeviceStory → MascotCrew → ProductProof → ValueComparison → ArchitectureStory → OpenSource → Roadmap → FinalCTA. Remove the duplicate topology from OpenSource after ArchitectureStory owns it.

```jsx
<CrossDeviceStory language={language} />
<MascotCrew copy={storyCopy} />
<ProductProof copy={storyCopy} />
<ValueComparison copy={storyCopy} />
<ArchitectureStory copy={storyCopy} language={language} />
<OpenSource copy={copy} language={language} />
<Roadmap copy={{ ...storyCopy, labels: copy.labels }} />
```

- [ ] **Step 5: Verify and commit**

```bash
npx vitest run tests/ArchitectureStory.test.jsx tests/Roadmap.test.jsx tests/App.test.jsx tests/storyContent.test.js
npm run build
git diff --check
git add src/components/ArchitectureStory.jsx src/components/Roadmap.jsx src/components/OpenSource.jsx src/app/App.jsx src/styles/components.css tests/ArchitectureStory.test.jsx tests/Roadmap.test.jsx tests/App.test.jsx
git commit -m "feat(web): explain architecture and roadmap"
```

---

### Task 12: Complete Motion, Responsive, Accessibility, and Performance Contracts

**Files:**
- Modify: `src/hooks/useStoryMotion.js`
- Modify: `src/components/MascotCrew/MascotCrew.jsx`
- Modify: `src/components/ProductProof.jsx`
- Modify: `src/components/ArchitectureStory.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/styles/components.css`
- Modify: `src/styles/story.css`
- Modify: `tests/responsive-styles.test.js`
- Modify: `tests/App.test.jsx`
- Modify: `e2e/homepage.spec.js`

**Interfaces:**
- All continuous motion must be created inside a scoped `useGSAP` or existing component-owned RAF with cleanup.
- `html[data-theme]` remains the only theme selector root.
- Every major section exposes a stable ID used by Header links.

- [ ] **Step 1: Add RED E2E coverage for the complete page**

Add tests that:

```js
await expect(page.getByTestId('cross-device-story')).toBeVisible();
await expect(page.getAllByTestId('mascot-card')).toHaveCount(7);
await expect(page.getAllByTestId('proof-case')).toHaveCount(6);
await expect(page.getAllByTestId('comparison-row')).toHaveCount(5);
await expect(page.getAllByTestId('architecture-node')).toHaveCount(4);
expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
```

For desktop, scroll to 0%, 30%, 55%, 80% of the story and assert `data-active-scene` becomes start/watch/approve/handoff. For mobile, assert all four scene headings occur in increasing vertical order and the story stage is not `position: sticky`. For reduced motion, assert all scenes, proof cases and topology nodes are visible without changing scroll position.

- [ ] **Step 2: Add section-specific GSAP reveals**

Use one reveal timeline per major section, not per decorative child. Animate `transform` and `opacity`; architecture packet uses SVG/CSS transform. Never animate `width`, `height`, `top`, or `left` during scroll. Use `gsap.matchMedia()` for desktop-only behavior and revert it on cleanup.

```js
gsap.utils.toArray('[data-motion-section]').forEach(section => {
  gsap.from(section.querySelectorAll('[data-motion-item]'), {
    y: 36, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 82%', once: true }
  });
});
```

- [ ] **Step 3: Finish mobile/tablet rules**

At `<1024px`, remove pinning and display four scene articles in normal flow. At `<768px`, prioritize App UI during approval, keep PC UI as smaller context, use native horizontal crew scrolling, and ensure the Hero title/CTA/mascot appear before a full empty viewport. Hide purely decorative satellites when necessary instead of shrinking core UI below readability.

```css
@media (max-width: 1023px) {
  .cross-device-story__stage { position: relative; top: auto; }
  .story-step { min-height: auto; }
}
@media (max-width: 767px) {
  .cross-device-story__devices { grid-template-columns: 1fr; }
  [data-active-scene="approve"] .mobile-console { order: -1; }
  .pc-console { transform: none; }
}
```

- [ ] **Step 4: Finish keyboard and screen-reader behavior**

Verify Header focus order, 44px targets, marquee readability, disabled demo controls, table headers, section headings, localized alt text, and visible focus rings. Add an offscreen story summary and mark connection/particle layers `aria-hidden="true"`.

```jsx
<p className="sr-only" id="cross-device-summary">{copy.intro.summary}</p>
<div className="cross-device-story__devices" aria-describedby="cross-device-summary">...</div>
<ConnectionFlow aria-hidden="true" focus={state.focus} status={state.sessionStatus} />
```

- [ ] **Step 5: Enforce asset and motion budgets**

Extend static verification to fail when:

```js
const atlasLimit = 3_145_728;
const heroStillLimit = 1_800_000;
assert.ok(fs.statSync(atlasPath).size <= atlasLimit);
assert.ok(fs.statSync(heroStillPath).size <= heroStillLimit);
assert.ok(!builtHtml.includes('cdn.jsdelivr.net'));
```

Also verify all seven mascot paths exist, GSAP is bundled locally, non-Hero images have lazy loading, and width/height attributes are present.

- [ ] **Step 6: Run the full local gate and commit**

```bash
npm run check
npm run test:e2e
git diff --check
git status --short
git add src tests e2e scripts public/assets package.json package-lock.json
git commit -m "feat(web): complete the motion-led homepage"
```

Expected: all unit, Node, build, static and Playwright checks pass at desktop/mobile/reduced-motion contracts. Do not include `.superpowers/brainstorm/` or generated Playwright output.

---

### Task 13: Public Preview, Cloudflare Workflow, and Production Gate

**Files:**
- Modify: `.github/workflows/deploy-cloudflare-pages.yml`
- Modify: `scripts/verify-static.cjs`
- Modify: `e2e/homepage.spec.js`
- No production source change is allowed solely to make preview tooling pass.

**Interfaces:**
- Preview must expose the exact production `dist/` build.
- Production deployment remains GitHub Actions + Cloudflare Pages using repository secrets; never add API tokens or account IDs to files or logs.

- [ ] **Step 1: Verify deployment inputs and watched paths**

Check that the workflow runs `npm ci`, `npm run check`, and builds/deploys `dist/`. Ensure path filters include `src/**`, `public/**`, `scripts/**`, `tests/**`, `e2e/**`, package manifests, Vite/Playwright config and the workflow itself.

- [ ] **Step 2: Run a clean production build**

```bash
npm ci
npm run check
npm run test:e2e
test -f dist/index.html
test -f dist/assets/mascot-turn-atlas.webp
test -f dist/assets/mascots/astro.png
```

Expected: clean install and all gates PASS; docs routes and `install.sh` remain in `dist`.

- [ ] **Step 3: Publish a public preview using the standing frontend-preview authorization**

Use the available target in order `vercel` → `wrangler` → `cloudflared`. Briefly tell the user the selected target and that the URL is public. For `cloudflared`, state that the URL only works while the local preview and tunnel processes remain running.

- [ ] **Step 4: Verify the public URL**

Perform actual HTTP checks for `/`, `/docs`, `/docs/zh-CN`, `/install.sh`, the Hero atlas and one crew mascot. Run a browser pass at 1440×1000 and 390×844 against the public URL, verify no console errors/404s/overflow, exercise language/theme persistence, and capture review screenshots.

- [ ] **Step 5: Present preview for explicit approval**

Report the public URL, exact commit SHA, verification commands, remaining known limitations, and whether the URL is temporary. Do not merge or trigger production deployment until the user explicitly approves the preview.

- [ ] **Step 6: Production deployment after approval**

Push the feature branch, open or update the PR, wait for GitHub Actions, and merge only through the user-approved repository workflow. After deployment, verify `https://paws-landing-eo4.pages.dev/` and the preserved documentation routes with HTTP and browser checks. If validation fails, report the failing layer and revert through a normal Git revert rather than overwriting history.

---

## Plan Completion Gate

The implementation is complete only when all 13 tasks are checked, every task commit exists, `npm run check` and `npm run test:e2e` pass from a clean install, the public preview is explicitly approved, GitHub Actions succeeds, and the final Cloudflare Pages URL passes the same desktop/mobile/documentation verification. A visually impressive first viewport is not completion if the App/PC story, seven-role system, factual copy, responsive fallback, or preserved routes are missing.
