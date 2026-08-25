# Paws React Bits Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Paws homepage with a bilingual React/Vite landing page featuring the approved orange Ember DotField interaction, persistent language/theme preferences, truthful product content, and unchanged documentation URLs.

**Architecture:** A single React application owns homepage rendering and preferences, while existing documentation remains static under Vite’s `public/` directory. Free React Bits source is adapted locally into focused components; Vite emits one deployable `dist/` tree containing both the React homepage and static documentation.

**Tech Stack:** React 19.2.8, React DOM 19.2.8, Vite 8.2.2, `@vitejs/plugin-react` 6.1.0, Vitest 4.1.11, Testing Library, Playwright 1.62.1, vanilla CSS, Canvas 2D, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-25-paws-homepage-react-bits-design.md`

## Global Constraints

- Use only free React Bits source under its “MIT + Commons Clause License Condition v1.0”; retain the copyright/permission notice, use it only inside this website, and do not copy React Bits Pro code.
- Keep the Paws orange/black identity and the existing mascot assets.
- English and Simplified Chinese share one React component tree; first visit follows browser language and manual choice persists.
- First theme follows `prefers-color-scheme`; manual choice persists and is applied before React paints.
- Remove fabricated company endorsements, statistics, and testimonials.
- Preserve `/docs`, `/docs/zh-CN`, mascot images, and documentation controls after migration.
- Preserve `/install.sh` only if it is present in the branch integrated into this feature; do not recreate or alter an unmerged installer.
- Coarse pointers and reduced-motion users must not run the full cursor-tracking animation.
- Touch targets are at least 44 by 44 CSS pixels and all controls are keyboard operable.
- Do not start Vite dev/preview servers until the user confirms the exact browser-verification command at execution handoff.
- Use Node.js 22 in GitHub Actions and commit the npm lockfile.

---

## Planned File Map

```text
index.html                          Vite document shell and pre-paint preference script
package.json                        dependency pins and verification scripts
package-lock.json                   reproducible npm dependency graph
vite.config.js                      React plugin, Vitest setup, build configuration
playwright.config.js                production-preview browser checks
THIRD_PARTY_NOTICES.md              React Bits copyright and license condition
scripts/verify-static.cjs           validates required files in dist/
src/main.jsx                        React root entry
src/app/App.jsx                     page composition and document metadata
src/app/content.js                  complete English and Chinese content dictionaries
src/app/preferences.js              pure preference resolution/storage helpers
src/app/usePreferences.js           React preference state and media-query synchronization
src/components/Header.jsx           desktop/mobile navigation and preference controls
src/components/Hero.jsx             hero composition, mascot stage, and install action
src/components/InstallCommand.jsx   accessible clipboard behavior and feedback
src/components/AgentStrip.jsx       factual supported-agent list
src/components/HowItWorks.jsx       three-step product flow
src/components/FeatureGrid.jsx      four truthful product capability cards
src/components/OpenSource.jsx       open-source/self-hosting section
src/components/FinalCTA.jsx         closing installation/documentation action
src/components/Footer.jsx           truthful legal/project links
src/components/react-bits/DotField.jsx       adapted cursor-reactive canvas
src/components/react-bits/dotFieldModel.js   pure grid/mode helpers
src/components/react-bits/SpotlightCard.jsx  adapted pointer spotlight card
src/styles/tokens.css               dark/light Paws design tokens
src/styles/global.css               reset, typography, focus, layout primitives
src/styles/components.css           component, responsive, and motion styles
tests/setup.js                      Testing Library DOM matchers and browser stubs
tests/preferences.test.js           language/theme resolution unit tests
tests/App.test.jsx                  page preference and metadata component tests
tests/InstallCommand.test.jsx       clipboard success/fallback/error tests
tests/DotField.test.jsx             animation mode and canvas fallback tests
tests/content.test.js               truthful/bilingual content assertions
e2e/homepage.spec.js                desktop/mobile Playwright acceptance checks
public/assets/**                    existing mascot and documentation control assets
public/docs.html                    existing English documentation
public/docs/zh-CN.html              existing Chinese documentation
.github/workflows/deploy-cloudflare-pages.yml  test/build/deploy dist/
```

---

### Task 1: Establish the Vite Build and Preserve Static Routes

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/app/App.jsx`
- Create: `scripts/verify-static.cjs`
- Create: `tests/static-source.test.cjs`
- Create: `tests/setup.js`
- Move: `web/assets/` → `public/assets/`
- Move: `web/docs.html` → `public/docs.html`
- Move: `web/docs/` → `public/docs/`
- Delete after replacement: `web/index.html`
- Modify: `tests/docs-controls.test.cjs`
- Generate: `package-lock.json`

**Interfaces:**
- Produces: Vite root element `#root`, `npm run build`, `npm run verify:static`, and static source paths under `public/`.
- Produces: `App(): JSX.Element`, initially rendering the real Paws brand, a concise product heading, and links to `/docs` and GitHub; later tasks replace the internal composition without changing the export.

- [ ] **Step 1: Write the failing source-layout test**

Create `tests/static-source.test.cjs`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Vite public directory owns the documentation routes', () => {
  for (const relative of [
    'public/docs.html',
    'public/docs/zh-CN.html',
    'public/assets/docs-controls.js',
    'public/assets/docs-controls.css',
    'public/assets/mascot-avatar.png',
    'public/assets/mascot-hero.png'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative);
  }
});

test('the React entry replaces the static homepage', () => {
  assert.equal(fs.existsSync(path.join(root, 'index.html')), true);
  assert.equal(fs.existsSync(path.join(root, 'src/main.jsx')), true);
  assert.equal(fs.existsSync(path.join(root, 'web/index.html')), false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/static-source.test.cjs`

Expected: FAIL because `public/docs.html` and the Vite entry files do not exist.

- [ ] **Step 3: Move static files and update the existing docs-control test path**

Move the existing documentation and assets without changing their contents. In `tests/docs-controls.test.cjs`, replace:

```js
return require(path.join(__dirname, '..', 'web', 'assets', 'docs-controls.js'));
```

with:

```js
return require(path.join(__dirname, '..', 'public', 'assets', 'docs-controls.js'));
```

If `web/install.sh` exists in the implementation branch after integration, move it to `public/install.sh` in this step and include it in `tests/static-source.test.cjs`. If it does not exist, leave the route absent.

- [ ] **Step 4: Add the pinned toolchain and minimal working React entry**

Create `package.json`:

```json
{
  "name": "paws-landing",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:node": "node --test tests/*.test.cjs",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "verify:static": "node scripts/verify-static.cjs",
    "check": "npm run test:node && npm test && npm run build && npm run verify:static"
  },
  "dependencies": {
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@playwright/test": "1.62.1",
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.6",
    "@vitejs/plugin-react": "6.1.0",
    "jsdom": "30.0.1",
    "vite": "8.2.2",
    "vitest": "4.1.11"
  },
  "engines": {
    "node": ">=22"
  }
}
```

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    include: ['tests/**/*.test.{js,jsx}'],
    css: true
  }
});
```

Create `index.html` with `#root`, a descriptive title/description, a warm dark background, a documentation link inside `<noscript>`, and `<script type="module" src="/src/main.jsx"></script>`.

Create `tests/setup.js` so component tests have stable DOM matchers and media queries:

```js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
```

Create `src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `src/app/App.jsx` as a working semantic page with the Paws name, the factual sentence “Control AI coding agents on your computer from anywhere,” a `/docs` link, and a GitHub link. This content is replaced by the approved component tree in later tasks.

Run `npm install` once to generate `package-lock.json`.

- [ ] **Step 5: Add a production-output verifier**

Create `scripts/verify-static.cjs`:

```js
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = [
  'dist/index.html',
  'dist/docs.html',
  'dist/docs/zh-CN.html',
  'dist/assets/docs-controls.js',
  'dist/assets/docs-controls.css',
  'dist/assets/mascot-avatar.png',
  'dist/assets/mascot-hero.png'
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Missing production file: ${relative}`);
  }
}

const home = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
if (!home.includes('id="root"')) throw new Error('React root is missing from dist/index.html');
console.log(`Verified ${required.length} production files`);
```

Add `dist/` and `node_modules/` to `.gitignore`.

- [ ] **Step 6: Run foundation verification**

Run:

```bash
node --test tests/static-source.test.cjs tests/docs-controls.test.cjs
npm run build
npm run verify:static
git diff --check
```

Expected: all Node tests pass, Vite builds successfully, and the static verifier reports seven files.

- [ ] **Step 7: Commit the build foundation**

```bash
git add -A
git commit -m "build(web): migrate landing page to Vite"
```

---

### Task 2: Implement Localized Content and Preference Resolution

**Files:**
- Create: `src/app/content.js`
- Create: `src/app/preferences.js`
- Create: `src/app/usePreferences.js`
- Create: `tests/preferences.test.js`
- Create: `tests/content.test.js`
- Modify: `tests/setup.js` only if a preference test needs an additional browser stub

**Interfaces:**
- Produces: `LANGUAGE_KEY`, `THEME_KEY`, `detectLanguage(languages)`, `resolveLanguage(saved, languages)`, `resolveTheme(saved, prefersDark)`, `readStored(storage, key)`, and `writeStored(storage, key, value)`.
- Produces: `usePreferences()` returning `{ language, theme, setLanguage, toggleTheme }`.
- Produces: `content.en` and `content.zh` with identical keys for `meta`, `nav`, `hero`, `agents`, `steps`, `features`, `openSource`, `finalCta`, `footer`, and `labels`.

- [ ] **Step 1: Write failing preference tests**

Create `tests/preferences.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  LANGUAGE_KEY,
  THEME_KEY,
  detectLanguage,
  readStored,
  resolveLanguage,
  resolveTheme,
  writeStored
} from '../src/app/preferences';

describe('homepage preferences', () => {
  it('uses Chinese only when a browser language begins with zh', () => {
    expect(detectLanguage(['zh-CN', 'en'])).toBe('zh');
    expect(detectLanguage(['en-US', 'zh-CN'])).toBe('en');
    expect(detectLanguage([])).toBe('en');
  });

  it('lets a valid saved language override the browser', () => {
    expect(resolveLanguage('en', ['zh-CN'])).toBe('en');
    expect(resolveLanguage('invalid', ['zh-CN'])).toBe('zh');
  });

  it('lets a valid saved theme override the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('invalid', true)).toBe('dark');
  });

  it('guards inaccessible storage', () => {
    const storage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); }
    };
    expect(readStored(storage, LANGUAGE_KEY)).toBe(null);
    expect(writeStored(storage, THEME_KEY, 'dark')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the preference test to verify it fails**

Run: `npm test -- tests/preferences.test.js`

Expected: FAIL because `src/app/preferences.js` does not exist.

- [ ] **Step 3: Implement the pure preference API**

Create `src/app/preferences.js` with these exact keys and behaviors:

```js
export const LANGUAGE_KEY = 'paws-home-language-v1';
export const THEME_KEY = 'paws-home-theme-v1';

export function detectLanguage(languages = []) {
  return (languages[0] || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function resolveLanguage(saved, languages) {
  return saved === 'en' || saved === 'zh' ? saved : detectLanguage(languages);
}

export function resolveTheme(saved, prefersDark) {
  return saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
}

export function readStored(storage, key) {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

export function writeStored(storage, key, value) {
  if (!storage) return false;
  try { storage.setItem(key, value); return true; } catch { return false; }
}
```

Use only the first preferred browser language when detecting the default. If product requirements later change to “any Chinese language in the list,” change the test and function together.

- [ ] **Step 4: Write the bilingual-content shape test**

Create `tests/content.test.js`:

```js
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
```

- [ ] **Step 5: Add complete factual English and Chinese dictionaries**

Create `src/app/content.js`. Both dictionaries must contain the exact top-level keys asserted above. Use these core messages:

```js
export const content = {
  en: {
    meta: {
      title: 'Paws — Control coding agents from anywhere',
      description: 'Start, attach and control AI coding agents running on your computer from your phone.'
    },
    nav: { product: 'Product', how: 'How it works', openSource: 'Open source', docs: 'Docs', getPaws: 'Get Paws' },
    hero: {
      eyebrow: 'OPEN SOURCE · RUNS ON YOUR HARDWARE',
      title: 'Your coding agents. Within reach.',
      body: 'Start, steer and approve AI coding sessions on your computer — securely from your phone.',
      primary: 'Get started',
      secondary: 'View on GitHub'
    },
    agents: ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents'],
    steps: [
      { title: 'Install Paws', body: 'Install the CLI on the computer where your coding agent runs.' },
      { title: 'Pair your device', body: 'Scan once to connect your phone or web client to the encrypted account.' },
      { title: 'Control the session', body: 'Start or attach an agent session, then steer it and handle permissions remotely.' }
    ],
    features: [
      { title: 'Remote sessions', body: 'Start, attach and follow coding-agent sessions away from your desk.' },
      { title: 'Encrypted sync', body: 'Session data is encrypted before it reaches the relay.' },
      { title: 'Permission handling', body: 'Review agent permission prompts from your paired device.' },
      { title: 'Open-source hosting', body: 'Inspect the code and run the Paws services on infrastructure you control.' }
    ],
    openSource: {
      eyebrow: 'OPEN BY DESIGN',
      title: 'Your machine stays the source of truth.',
      body: 'Paws connects your devices to the agents already running on your computer. Self-host the relay when you need full infrastructure control.'
    },
    finalCta: { title: 'Take your agents with you.', body: 'Install Paws, pair your device and start with the guide.', action: 'Read the quick start' },
    footer: { privacy: 'Privacy', docs: 'Documentation', github: 'GitHub' },
    labels: {
      language: 'Switch to Chinese', themeLight: 'Switch to light theme', themeDark: 'Switch to dark theme',
      menuOpen: 'Open navigation', menuClose: 'Close navigation', copy: 'Copy install command', copied: 'Install command copied', copyFailed: 'Could not copy; select the command manually'
    }
  },
  zh: {
    meta: {
      title: 'Paws — 随时控制电脑上的编程智能体',
      description: '通过手机启动、接入和控制电脑上运行的 AI 编程智能体。'
    },
    nav: { product: '产品能力', how: '工作方式', openSource: '开源与自托管', docs: '文档', getPaws: '开始使用' },
    hero: {
      eyebrow: '开源 · 运行在你的电脑上',
      title: '让你的编程智能体，随时触手可及。',
      body: '通过手机安全地启动、引导和审批电脑上的 AI 编程会话。',
      primary: '开始使用',
      secondary: '查看 GitHub'
    },
    agents: ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents'],
    steps: [
      { title: '安装 Paws', body: '在运行编程智能体的电脑上安装 Paws CLI。' },
      { title: '绑定设备', body: '扫码一次，把手机或 Web 客户端接入你的加密账号。' },
      { title: '远程控制会话', body: '启动或接入智能体会话，然后远程发送指令并处理权限请求。' }
    ],
    features: [
      { title: '远程会话', body: '离开电脑后继续启动、接入和跟进编程智能体会话。' },
      { title: '加密同步', body: '会话数据在发送到中继服务之前完成加密。' },
      { title: '远程审批', body: '通过已绑定设备处理智能体的权限请求。' },
      { title: '开源自托管', body: '检查完整源码，并在自己控制的基础设施上运行 Paws 服务。' }
    ],
    openSource: {
      eyebrow: '从设计上保持开放',
      title: '你的电脑始终是会话的源头。',
      body: 'Paws 把你的设备连接到电脑上已经运行的智能体；需要完全掌控基础设施时，可以自行托管中继服务。'
    },
    finalCta: { title: '把编程智能体带在身边。', body: '安装 Paws、绑定设备，然后从快速上手开始。', action: '阅读快速上手' },
    footer: { privacy: '隐私', docs: '文档', github: 'GitHub' },
    labels: {
      language: 'Switch to English', themeLight: '切换到亮色主题', themeDark: '切换到深色主题',
      menuOpen: '打开导航', menuClose: '关闭导航', copy: '复制安装命令', copied: '安装命令已复制', copyFailed: '无法自动复制，请手动选择命令'
    }
  }
};
```

- [ ] **Step 6: Implement the React preference hook**

Create `src/app/usePreferences.js` so that it:

```js
import { useCallback, useEffect, useState } from 'react';
import {
  LANGUAGE_KEY,
  THEME_KEY,
  readStored,
  resolveLanguage,
  resolveTheme,
  writeStored
} from './preferences';

function browserStorage() {
  try { return window.localStorage; } catch { return null; }
}

function themeMedia() {
  return window.matchMedia?.('(prefers-color-scheme: dark)') ?? {
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  };
}

export function usePreferences() {
  const storage = browserStorage();
  const [language, updateLanguage] = useState(() =>
    resolveLanguage(readStored(storage, LANGUAGE_KEY), window.navigator.languages)
  );
  const [theme, updateTheme] = useState(() =>
    resolveTheme(readStored(storage, THEME_KEY), themeMedia().matches)
  );

  const setLanguage = useCallback(value => {
    updateLanguage(value);
    writeStored(browserStorage(), LANGUAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    updateTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeStored(browserStorage(), THEME_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [language, theme]);

  useEffect(() => {
    const media = themeMedia();
    function syncSystem(event) {
      if (!readStored(browserStorage(), THEME_KEY)) updateTheme(event.matches ? 'dark' : 'light');
    }
    media.addEventListener('change', syncSystem);
    return () => media.removeEventListener('change', syncSystem);
  }, []);

  return { language, theme, setLanguage, toggleTheme };
}
```

Use `window.navigator.languages`, `window.matchMedia('(prefers-color-scheme: dark)')`, and guarded storage helpers. Listen for system-theme changes only while no explicit theme has been stored.

In `index.html`, add a blocking inline script before the stylesheet/module entry that resolves `paws-home-theme-v1` and sets `document.documentElement.dataset.theme` plus `style.colorScheme`. Catch storage errors and fall back to `matchMedia`.

- [ ] **Step 7: Run preference and content tests**

Run: `npm test -- tests/preferences.test.js tests/content.test.js`

Expected: both files pass.

- [ ] **Step 8: Commit preferences and content**

```bash
git add index.html src/app tests/preferences.test.js tests/content.test.js tests/setup.js
git commit -m "feat(web): add localized homepage preferences"
```

---

### Task 3: Build the Accessible App Shell and Navigation

**Files:**
- Modify: `src/app/App.jsx`
- Create: `src/components/Header.jsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/components.css`
- Create: `tests/App.test.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `usePreferences()` and `content[language]` from Task 2.
- Produces: `Header({ copy, language, theme, onLanguageChange, onThemeChange })`.
- Produces: DOM anchors `#product`, `#how-it-works`, and `#open-source` for later sections.

- [ ] **Step 1: Write failing shell tests**

Create `tests/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import App from '../src/app/App';

beforeEach(() => localStorage.clear());

it('switches all visible copy and document metadata to Chinese', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Switch to Chinese/i }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('让你的编程智能体');
  expect(document.documentElement.lang).toBe('zh-CN');
  expect(document.title).toContain('随时控制');
  expect(document.querySelector('meta[name="description"]').content).toContain('通过手机');
});

it('toggles theme and persists it', async () => {
  const user = userEvent.setup();
  render(<App />);
  const initialThemeColor = document.querySelector('meta[name="theme-color"]').content;
  const button = screen.getByRole('button', { name: /theme|主题/i });
  await user.click(button);
  expect(localStorage.getItem('paws-home-theme-v1')).toMatch(/light|dark/);
  expect(document.documentElement.dataset.theme).toBe(localStorage.getItem('paws-home-theme-v1'));
  expect(document.querySelector('meta[name="theme-color"]').content).not.toBe(initialThemeColor);
});

it('opens and closes an accessible mobile navigation menu', async () => {
  const user = userEvent.setup();
  render(<App />);
  const menu = screen.getByRole('button', { name: /Open navigation/i });
  await user.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('link', { name: 'Product' }));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run shell tests to verify failure**

Run: `npm test -- tests/App.test.jsx`

Expected: FAIL because the final `Header` and preference controls do not exist.

- [ ] **Step 3: Implement `Header`**

The component must render:

```jsx
<header className="site-header" data-open={menuOpen || undefined}>
  <a className="brand" href="#top" aria-label="Paws home">
    <img src="/assets/mascot-avatar.png" alt="" />
    <span>Paws</span>
  </a>
  <button
    className="menu-toggle"
    type="button"
    aria-expanded={menuOpen}
    aria-controls="primary-navigation"
    aria-label={menuOpen ? copy.labels.menuClose : copy.labels.menuOpen}
    onClick={() => setMenuOpen(value => !value)}
  >
    <span /><span /><span />
  </button>
  <nav id="primary-navigation" aria-label="Primary navigation">
    <a href="#product" onClick={closeMenu}>{copy.nav.product}</a>
    <a href="#how-it-works" onClick={closeMenu}>{copy.nav.how}</a>
    <a href="#open-source" onClick={closeMenu}>{copy.nav.openSource}</a>
    <a href={language === 'zh' ? '/docs/zh-CN' : '/docs'}>{copy.nav.docs}</a>
    <a href="https://github.com/wangjs-jacky/happy">GitHub</a>
  </nav>
  <div className="preference-controls">
    <button
      className="language-toggle"
      type="button"
      aria-label={copy.labels.language}
      data-language={language}
      onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
    >
      <span>EN</span><span lang="zh-CN">中文</span>
    </button>
    <button
      className="theme-toggle"
      type="button"
      aria-label={theme === 'dark' ? copy.labels.themeLight : copy.labels.themeDark}
      onClick={onThemeChange}
    >
      <span aria-hidden="true" className={theme === 'dark' ? 'icon-sun' : 'icon-moon'} />
    </button>
    <a className="primary-action" href={language === 'zh' ? '/docs/zh-CN#quick-start' : '/docs#quick-start'}>
      {copy.nav.getPaws}
    </a>
  </div>
</header>
```

Implement `.icon-sun` and `.icon-moon` with CSS masks or local inline SVG markup; do not use emoji or an icon package. Use one EN/中文 segmented button with an active visual segment; clicking selects the other language. Use a separate 44-pixel sun/moon button. Give both controls labels from `copy.labels`. Close the mobile menu on anchor selection and Escape. Lock no body scroll; the menu remains an in-flow overlay beneath the fixed header.

- [ ] **Step 4: Compose `App` and update metadata**

`App` must call `usePreferences`, choose `const copy = content[language]`, and use an effect to update title, description, and `meta[name="theme-color"]`. Use `#0e0d0c` for dark and `#fbf7ef` for light. Render `Header` followed by a `<main id="top">` with semantic sections at the three required IDs containing their approved headings and paragraphs. Task 6 replaces those section bodies with the final card and workflow components without changing IDs or copy.

- [ ] **Step 5: Add foundational tokens and responsive shell styles**

Define all colors, type families, spacing, radii, shadows, header height, and content width in `tokens.css`. Define warm Paws light and dark variable sets under `:root[data-theme='light']` and `:root[data-theme='dark']`. `global.css` supplies reset, body, link, selection, `focus-visible`, and reduced-motion rules. `components.css` supplies fixed translucent header, segmented control, theme control, desktop nav, and an accessible mobile panel at `max-width: 800px`.

Import these files once from `src/main.jsx` in this order:

```js
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
```

- [ ] **Step 6: Run shell tests and build**

Run:

```bash
npm test -- tests/App.test.jsx tests/preferences.test.js
npm run build
git diff --check
```

Expected: tests and build pass.

- [ ] **Step 7: Commit the app shell**

```bash
git add src tests/App.test.jsx
git commit -m "feat(web): add bilingual responsive app shell"
```

---

### Task 4: Add the Accessible Install Command

**Files:**
- Create: `src/components/InstallCommand.jsx`
- Create: `tests/InstallCommand.test.jsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Produces: `copyToClipboard(text, clipboard, document): Promise<boolean>`.
- Produces: `InstallCommand({ command, labels, compact = false })`.

- [ ] **Step 1: Write failing clipboard tests**

Create `tests/InstallCommand.test.jsx` covering all paths:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import InstallCommand, { copyToClipboard } from '../src/components/InstallCommand';

const labels = { copy: 'Copy install command', copied: 'Install command copied', copyFailed: 'Copy failed' };

it('uses the Clipboard API when available', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  await expect(copyToClipboard('paws', { writeText }, document)).resolves.toBe(true);
  expect(writeText).toHaveBeenCalledWith('paws');
});

it('reports success through an ARIA live region', async () => {
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) }
  });
  render(<InstallCommand command="npm i -g @wangjs-jacky/paws" labels={labels} />);
  await user.click(screen.getByRole('button', { name: labels.copy }));
  expect(screen.getByRole('status')).toHaveTextContent(labels.copied);
});

it('returns false when both clipboard paths fail', async () => {
  const fakeDocument = { execCommand: () => false, body: document.body, createElement: document.createElement.bind(document) };
  await expect(copyToClipboard('paws', null, fakeDocument)).resolves.toBe(false);
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/InstallCommand.test.jsx`

Expected: FAIL because `InstallCommand.jsx` does not exist.

- [ ] **Step 3: Implement clipboard behavior and component state**

`copyToClipboard` first awaits `clipboard.writeText`. When unavailable or rejected, create a readonly offscreen `<textarea>`, select it, call `document.execCommand('copy')`, remove it in `finally`, and return the boolean result.

`InstallCommand` renders the fixed command `npm i -g @wangjs-jacky/paws && paws`, a real `<button>`, a mono command display, and `<span role="status" aria-live="polite">`. Show success/error text only after the operation resolves; never claim success before the API returns.

- [ ] **Step 4: Style all interaction states**

Add default, hover, pressed, focus-visible, copied, and error styles. Keep the command selectable even though the wrapper is clickable. At 390 pixels, allow wrapping without horizontal overflow.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/InstallCommand.test.jsx
git diff --check
git add src/components/InstallCommand.jsx src/styles/components.css tests/InstallCommand.test.jsx
git commit -m "feat(web): add accessible install command"
```

---

### Task 5: Build the Ember DotField Hero

**Files:**
- Create: `src/components/react-bits/dotFieldModel.js`
- Create: `src/components/react-bits/DotField.jsx`
- Create: `src/components/Hero.jsx`
- Create: `tests/DotField.test.jsx`
- Create: `THIRD_PARTY_NOTICES.md`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/components.css`

**Interfaces:**
- Produces: `selectDotFieldMode({ reducedMotion, coarsePointer, saveData, width }): 'static' | 'ambient' | 'interactive'`.
- Produces: `buildDotGrid(width, height, spacing): Array<{ ax, ay, x, y, vx, vy }>`.
- Produces: `DotField({ theme, className })` as a decorative `aria-hidden` layer.
- Produces: `Hero({ copy, language, theme })`.

- [ ] **Step 1: Write failing model and fallback tests**

Create `tests/DotField.test.jsx`:

```jsx
import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import DotField from '../src/components/react-bits/DotField';
import { buildDotGrid, selectDotFieldMode } from '../src/components/react-bits/dotFieldModel';

it('selects an animation mode appropriate to the device', () => {
  expect(selectDotFieldMode({ reducedMotion: true, coarsePointer: false, saveData: false, width: 1440 })).toBe('static');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: true, saveData: false, width: 390 })).toBe('ambient');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: false, saveData: true, width: 1440 })).toBe('ambient');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: false, saveData: false, width: 1440 })).toBe('interactive');
});

it('builds a deterministic finite dot grid', () => {
  const dots = buildDotGrid(100, 60, 20);
  expect(dots.length).toBe(15);
  expect(dots.every(dot => Number.isFinite(dot.ax) && dot.x === dot.ax)).toBe(true);
});

it('renders a decorative canvas and CSS fallback', () => {
  const { container } = render(<DotField theme="dark" />);
  expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  expect(container.querySelector('canvas')).toBeTruthy();
  expect(container.querySelector('.dot-field-fallback')).toBeTruthy();
});
```

- [ ] **Step 2: Run the tests to verify failure**

Run: `npm test -- tests/DotField.test.jsx`

Expected: FAIL because the model and component do not exist.

- [ ] **Step 3: Implement deterministic model helpers**

Use this mode rule:

```js
export function selectDotFieldMode({ reducedMotion, coarsePointer, saveData, width }) {
  if (reducedMotion) return 'static';
  if (coarsePointer || saveData || width < 768) return 'ambient';
  return 'interactive';
}
```

`buildDotGrid` lays out centered rows and columns at `spacing` intervals. For `100 × 60` with `20` spacing it must return 5 columns × 3 rows.

- [ ] **Step 4: Adapt the free React Bits DotField**

At the top of `DotField.jsx`, retain attribution:

```js
// Adapted from React Bits DotField (MIT + Commons Clause License Condition v1.0):
// https://github.com/DavidHDev/react-bits/blob/main/src/components/landingnew/Hero/DotField.jsx
```

Create `THIRD_PARTY_NOTICES.md` containing the complete current license text from `https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md`, including `Copyright (c) 2026 David Haz`, the application-use permission, Commons Clause restriction, and no-warranty section.

Implement a Canvas 2D field with these Paws values:

```js
const EMBER = {
  spacingDesktop: 18,
  spacingMobile: 26,
  cursorRadius: 420,
  bulgeStrength: 82,
  dotRadius: 1.35,
  dark: ['rgba(255,163,26,.38)', 'rgba(255,205,128,.12)'],
  light: ['rgba(185,91,0,.28)', 'rgba(110,68,28,.10)']
};
```

Use `ResizeObserver` to rebuild dots, cap DPR at 2, and use one `requestAnimationFrame` loop only while the field is displaced or ambient mode is visible. Read `navigator.connection?.saveData` when selecting the mode. Interactive mode updates pointer position from passive `pointermove`; set the root `.dot-field` element’s `data-engaged="true"` while displacement is active and return it to `false` after settling. Ambient mode uses a slow bounded sine offset without attaching pointer tracking; static mode draws once. Use Intersection Observer to park the loop when the hero leaves the viewport. Cleanup observers, listeners, and RAF on unmount.

If `canvas.getContext('2d')` is unavailable, leave `.dot-field-fallback` visible and return without scheduling frames.

- [ ] **Step 5: Build the hero composition**

`Hero` renders:

```jsx
<section className="hero" aria-labelledby="hero-title">
  <DotField theme={theme} />
  <div className="hero-ambient" aria-hidden="true" />
  <div className="page-shell hero-grid">
    <div className="hero-copy">
      <span className="eyebrow">{copy.hero.eyebrow}</span>
      <h1 id="hero-title">{copy.hero.title}</h1>
      <p className="hero-lead">{copy.hero.body}</p>
      <div className="hero-actions">
        <a className="primary-action" href={language === 'zh' ? '/docs/zh-CN#quick-start' : '/docs#quick-start'}>{copy.hero.primary}</a>
        <a className="secondary-action" href="https://github.com/wangjs-jacky/happy">{copy.hero.secondary}</a>
      </div>
      <InstallCommand command="npm i -g @wangjs-jacky/paws && paws" labels={copy.labels} />
    </div>
    <div className="mascot-stage">
      <img src="/assets/mascot-hero.png" alt={language === 'zh' ? '竖起拇指的 Paws 吉祥物' : 'Paws mascot giving a thumbs up'} />
    </div>
  </div>
</section>
```

Include the eyebrow, one `h1`, body copy, docs/GitHub actions, and `InstallCommand`. Pass `theme` from `App`. Clamp desktop mascot parallax to ±8 pixels and disable it outside interactive pointer mode.

- [ ] **Step 6: Style and integrate the hero**

Use a minimum desktop hero height of `min(900px, 100svh)`, ensure headline contrast over every background state, and keep the mascot visible in the first 844-pixel mobile viewport. On mobile, render mascot above or beside the copy at approximately 180–220 pixels rather than hiding it. Add a static radial/CSS dot fallback.

- [ ] **Step 7: Run tests, build, and commit**

```bash
npm test -- tests/DotField.test.jsx tests/InstallCommand.test.jsx tests/App.test.jsx
npm run build
git diff --check
git add THIRD_PARTY_NOTICES.md src tests/DotField.test.jsx
git commit -m "feat(web): add Ember DotField hero"
```

---

### Task 6: Add Truthful Product Sections and Spotlight Cards

**Files:**
- Create: `src/components/react-bits/SpotlightCard.jsx`
- Create: `src/components/AgentStrip.jsx`
- Create: `src/components/HowItWorks.jsx`
- Create: `src/components/FeatureGrid.jsx`
- Create: `src/components/OpenSource.jsx`
- Create: `src/components/FinalCTA.jsx`
- Create: `src/components/Footer.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/components.css`
- Modify: `tests/content.test.js`
- Modify: `tests/App.test.jsx`

**Interfaces:**
- Produces: `SpotlightCard({ children, className = '', spotlightColor = 'rgba(255,163,26,.16)' })`.
- Produces: section components receiving only `copy` and, where required, `language`.

- [ ] **Step 1: Extend failing page-content tests**

Add to `tests/App.test.jsx`:

```jsx
it('renders factual agents, three steps and four capabilities without testimonials', () => {
  render(<App />);
  for (const agent of ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents']) {
    expect(screen.getByText(agent)).toBeInTheDocument();
  }
  expect(screen.getAllByTestId('workflow-step')).toHaveLength(3);
  expect(screen.getAllByTestId('feature-card')).toHaveLength(4);
  expect(screen.queryByText(/Loved by developers|Testimonials/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/App.test.jsx`

Expected: FAIL because the final content sections are not rendered.

- [ ] **Step 3: Adapt the free SpotlightCard component**

Retain source attribution to `https://reactbits.dev/components/spotlight-card`. On pointer movement, set local CSS custom properties from the card bounding rectangle:

```jsx
function handlePointerMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
}
```

The spotlight is decorative, disabled for coarse pointers/reduced motion through CSS, and never changes the card’s semantic role.

- [ ] **Step 4: Implement all factual sections**

- `AgentStrip`: repeated readable labels from `copy.agents`; duplicate visually only for the desktop loop and mark the duplicate `aria-hidden="true"`.
- `HowItWorks`: `id="how-it-works"`, ordered list of exactly three steps, each with `data-testid="workflow-step"`.
- `FeatureGrid`: `id="product"`, exactly four `SpotlightCard` children with `data-testid="feature-card"`.
- `OpenSource`: `id="open-source"`, factual topology `Phone / Web → encrypted relay → Paws CLI → coding agent`, GitHub and self-hosting docs actions.
- `FinalCTA`: repeat `InstallCommand` and localized docs action.
- `Footer`: docs, Chinese/English docs, GitHub, privacy, current year; omit the current unverified MIT claim.

Use small inline SVG icons with `aria-hidden="true"`; do not use emoji or add an icon dependency.

- [ ] **Step 5: Replace the initial App sections with final composition**

The final order is:

```jsx
<Header
  copy={copy}
  language={language}
  theme={theme}
  onLanguageChange={setLanguage}
  onThemeChange={toggleTheme}
/>
<main id="top">
  <Hero copy={copy} language={language} theme={theme} />
  <AgentStrip agents={copy.agents} />
  <HowItWorks copy={copy} />
  <FeatureGrid copy={copy} />
  <OpenSource copy={copy} language={language} />
  <FinalCTA copy={copy} language={language} />
</main>
<Footer copy={copy} language={language} />
```

- [ ] **Step 6: Style section rhythm and all card states**

Use the approved dark/light tokens, fluid type with `clamp`, asymmetric desktop compositions, visible whitespace, and single-column mobile layouts. Disable the agent loop and card spotlight under reduced motion. Keep every paragraph at a readable line length and every interactive element focusable.

- [ ] **Step 7: Run tests, build, and commit**

```bash
npm test
npm run build
npm run verify:static
git diff --check
git add src tests
git commit -m "feat(web): add truthful product landing sections"
```

---

### Task 7: Add Production Browser Acceptance Tests

**Files:**
- Create: `playwright.config.js`
- Create: `e2e/homepage.spec.js`
- Modify: `package.json` only if the preview command needs an explicit host

**Interfaces:**
- Consumes: production build and all accessible DOM contracts from Tasks 3–6.
- Produces: `npm run test:e2e`, which starts Vite preview on `127.0.0.1:4173` only after explicit user confirmation.

- [ ] **Step 1: Write desktop, persistence, mobile, and reduced-motion checks**

Create `playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'homepage.spec.js',
  use: { baseURL: 'http://127.0.0.1:4173', locale: 'en-US', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: false
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
```

Create `e2e/homepage.spec.js` with assertions for:

```js
import { expect, test } from '@playwright/test';

test('desktop preferences persist and pointer activates the hero field', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const canvas = page.locator('.dot-field canvas');
  await expect(canvas).toBeVisible();
  await page.mouse.move(900, 320);
  await expect(page.locator('.dot-field')).toHaveAttribute('data-mode', 'interactive');
  await expect(page.locator('.dot-field')).toHaveAttribute('data-engaged', 'true');
  await page.getByRole('button', { name: /Switch to Chinese/i }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编程智能体');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编程智能体');
});

test('mobile navigation, mascot and layout remain usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.locator('.mascot-stage img')).toBeVisible();
  await page.getByRole('button', { name: /Open navigation|打开导航/i }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  const box = await page.getByRole('button', { name: /theme|主题/i }).boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('reduced motion selects the static dot field', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.dot-field')).toHaveAttribute('data-mode', 'static');
  await context.close();
});
```

Add route checks for `/docs` and `/docs/zh-CN` returning the existing documentation headings.

- [ ] **Step 2: Run the production browser suite**

After the user confirms local preview execution, run:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

Expected: desktop, mobile, reduced-motion, and documentation-route checks pass.

- [ ] **Step 3: Inspect screenshots at both themes and widths**

Capture 1440×1000 and 390×844 screenshots in dark and light themes. Inspect headline contrast, mascot visibility, cursor field restraint, navigation fit, command wrapping, section rhythm, and absence of fabricated social proof. Fix only concrete failures discovered by this inspection, then rerun affected tests.

- [ ] **Step 4: Commit browser verification**

```bash
git add e2e/homepage.spec.js playwright.config.js package.json package-lock.json src
git commit -m "test(web): cover responsive homepage interactions"
```

---

### Task 8: Build and Deploy `dist/` Through GitHub Actions

**Files:**
- Modify: `.github/workflows/deploy-cloudflare-pages.yml`
- Modify: `scripts/verify-static.cjs`
- Test: local workflow-equivalent commands

**Interfaces:**
- Consumes: `npm ci`, `npm test`, `npm run build`, and `npm run verify:static`.
- Produces: Cloudflare Pages deployment from `dist/` and live route verification.

- [ ] **Step 1: Extend the static verifier before changing deployment**

Add checks that the generated JavaScript bundle contains both unique language markers:

```js
const assetFiles = fs.readdirSync(path.join(root, 'dist/assets'));
const javascript = assetFiles
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(root, 'dist/assets', name), 'utf8'))
  .join('\n');

for (const marker of ['Your coding agents. Within reach.', '让你的编程智能体，随时触手可及。']) {
  if (!javascript.includes(marker)) throw new Error(`Missing localized bundle marker: ${marker}`);
}
```

Run `npm run verify:static` before rebuilding and confirm it fails on the missing marker check, then run `npm run build && npm run verify:static` and confirm it passes.

- [ ] **Step 2: Update workflow triggers and build steps**

Set path filters to:

```yaml
paths:
  - "src/**"
  - "public/**"
  - "tests/**"
  - "scripts/**"
  - "index.html"
  - "package.json"
  - "package-lock.json"
  - "vite.config.js"
  - ".github/workflows/deploy-cloudflare-pages.yml"
```

Before deployment, add:

```yaml
- name: Install dependencies
  run: npm ci

- name: Test and build
  run: npm run check
```

Change Wrangler deployment from `pages deploy web` to:

```yaml
npx --yes wrangler@4.105.0 pages deploy dist \
  --project-name paws-landing \
  --branch main \
  --commit-hash "$GITHUB_SHA" \
  --commit-message "GitHub Actions deployment" \
  --commit-dirty=false
```

- [ ] **Step 3: Expand production verification**

Keep the two documentation checks and add:

```bash
verify_page "https://paws-landing-eo4.pages.dev/" "Paws — Control coding agents from anywhere"
verify_page "https://paws-landing-eo4.pages.dev/docs" "Pair your Paws account"
verify_page "https://paws-landing-eo4.pages.dev/docs/zh-CN" "安装与快速上手"
```

If `public/install.sh` exists in this branch, add a fourth HTTP check for a stable installer marker already present in that script. Do not add the check when the file is absent.

- [ ] **Step 4: Run the workflow-equivalent local gate**

Run:

```bash
npm ci
npm run check
git diff --check
```

Expected: unit/component tests, production build, static route checks, localized bundle checks, and diff checks pass.

- [ ] **Step 5: Commit the deployment migration**

```bash
git add .github/workflows/deploy-cloudflare-pages.yml scripts/verify-static.cjs
git commit -m "ci(web): deploy Vite production build"
```

---

### Task 9: Final Review, Pull Request, and Live Validation

**Files:**
- Review: all files changed by Tasks 1–8
- Modify only if verification finds a concrete defect

**Interfaces:**
- Produces: reviewed pull request, successful GitHub Actions run, and verified production homepage/docs URLs.

- [ ] **Step 1: Run the complete local verification suite**

Run:

```bash
npm ci
npm run check
npm run test:e2e
git diff --check
git status --short
```

Expected: every command passes and the worktree is clean. `npm run test:e2e` requires the previously confirmed Vite preview command.

- [ ] **Step 2: Review the branch diff for scope and truthfulness**

Run:

```bash
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
rg -n "Mara Ils|Jonas Reyes|Priya N\.|TRUSTED BY|Loved by developers" src public index.html || true
```

Expected: no fabricated social-proof markers; changes are limited to the approved homepage/build migration, static-file relocation, tests, and workflow.

- [ ] **Step 3: Push and open a pull request**

```bash
git push -u origin feat-homepage-react-bits
gh pr create --base main --head feat-homepage-react-bits \
  --title "feat(web): rebuild homepage with React Bits" \
  --body "Rebuilds the Paws homepage with React/Vite, the Ember DotField interaction, bilingual and theme preferences, truthful product sections, preserved documentation routes, and a dist-based Cloudflare deployment. Verification: npm run check; npm run test:e2e."
```

The PR body must summarize the React/Vite migration, Ember DotField, localization/theme behavior, removal of fabricated social proof, static-route preservation, and exact verification commands.

- [ ] **Step 4: Inspect the PR and merge only when mergeable**

Run:

```bash
gh pr view --json number,title,state,mergeable,statusCheckRollup,url,files,commits
```

Expected: expected files only, mergeable state, and all required checks successful. Merge through `gh pr merge --merge --delete-branch` from outside a conflicting worktree if necessary.

- [ ] **Step 5: Watch the production workflow**

Resolve the merge commit and its workflow run, then watch it:

```bash
MERGE_SHA=$(gh pr view --json mergeCommit --jq '.mergeCommit.oid')
RUN_ID=$(gh run list --repo wangjs-jacky/paws-landing --workflow "Deploy Cloudflare Pages" --commit "$MERGE_SHA" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --repo wangjs-jacky/paws-landing --exit-status
```

Expected: `Deploy Cloudflare Pages` completes with conclusion `success`.

- [ ] **Step 6: Verify live HTTP and browser behavior**

Check:

```bash
curl -fsS https://paws-landing-eo4.pages.dev/ | rg "Paws — Control coding agents from anywhere"
curl -fsS https://paws-landing-eo4.pages.dev/docs | rg "Pair your Paws account"
curl -fsS https://paws-landing-eo4.pages.dev/docs/zh-CN | rg "安装与快速上手"
```

Then run the same Playwright interaction assertions against the production origin: desktop pointer mode, language persistence, theme persistence, 390-pixel mobile menu/mascot/overflow, reduced-motion static mode, and both documentation routes.

- [ ] **Step 7: Report delivery**

Provide the production homepage, English docs, Chinese docs, pull request, and Actions run URLs. Report the exact tests run and any intentional integration-base decision concerning `/install.sh`.
