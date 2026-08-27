# Paws Hero Mascot Motion and Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the Paws homepage first screen with a precisely aligned Header/Hero, an identity-preserving transparent mascot that looks left and right with the pointer, and the restored terminal typewriter interaction.

**Architecture:** Keep the existing React/Vite page and isolate new behavior into `TerminalDemo`, `MascotLook`, and pure timing/frame models. Build a static fallback before the single authorized H3 call, then convert the verified clip into one transparent 6x4 WebP atlas so runtime animation uses one image request and a parked Canvas RAF rather than video seeking.

**Tech Stack:** React 19, Vite 8, Vitest/Testing Library, Playwright, Canvas 2D, ffmpeg/ffprobe, OpenAI image editing, MiniMax H3 CLI.

**Spec:** `docs/superpowers/specs/2026-08-27-hero-mascot-motion-terminal-design.md`

## Global Constraints

- Modify Header + Hero only; later homepage content and structure remain unchanged except the hero boundary spacing.
- Keep `/docs`, `/docs/zh-CN`, and existing preference behavior unchanged; do not create or modify `/install.sh`.
- Preserve the marmot identity, black hoodie, orange paw mark, thumbs-up pose, friendly expression, and full-body framing.
- Generate one transparent static image and submit exactly one paid H3 task: `768P`, `5 seconds`, `1:1`. Authorization is already granted; do not ask again and do not submit a paid retry.
- Target a 120–160-degree left-to-right head/gaze range, not a literal 360-degree turn.
- Do not produce Android Motion Photo, GIF, or social-media artifacts.
- Use one atlas request and keep the atlas at 3 MB or less.
- Reduced motion uses a static mascot and complete transcript without animation RAF/timers.
- Stop pointer geometry and RAF while the hero is offscreen.
- Keep every touch target at least 44x44px and every accessible label bilingual.
- Use `apply_patch` for text edits. Keep intermediate media under git-ignored `artifacts/`.
- Publish a public preview, but do not merge production until the user approves that preview.

## File Map

Create:

- `src/components/TerminalDemo.jsx` — terminal shell, typewriter lifecycle, integrated copy.
- `src/components/terminalModel.js` — pure transcript progression.
- `src/components/MascotLook.jsx` — atlas loading, Canvas drawing, visibility/pointer lifecycle.
- `src/components/react-bits/mascotFrameModel.js` — pure pointer/frame calculations.
- `tests/TerminalDemo.test.jsx`, `tests/terminalModel.test.js`.
- `tests/MascotLook.test.jsx`, `tests/mascotFrameModel.test.js`.
- `scripts/build-mascot-atlas.sh` — reproducible chroma key and atlas creation.
- `assets/motion/mascot-h3-prompt.txt` — exact H3 direction.
- `public/assets/mascot-static.png` and `public/assets/mascot-turn-atlas.webp`.

Modify:

- `src/app/content.js`, `src/components/Header.jsx`, `src/components/Hero.jsx`.
- `src/styles/components.css`; `src/styles/global.css` only with overflow evidence.
- `tests/App.test.jsx`, `tests/Hero.test.jsx`, `tests/content.test.js`, `tests/responsive-styles.test.js`.
- `e2e/homepage.spec.js`, `scripts/verify-static.cjs`, `tests/static-source.test.cjs`, `.gitignore`.

---

### Task 1: Header and Hero Layout Contract

**Files:**
- Modify: `src/app/content.js`
- Modify: `src/components/Header.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/styles/components.css`
- Test: `tests/App.test.jsx`
- Test: `tests/content.test.js`
- Test: `tests/responsive-styles.test.js`

**Interfaces:**
- Consumes: current `content`, `docsHref(language)`, Header/Hero props.
- Produces: `hero.titleLines: [string, string]`, `labels.languageDestination`, `.hero-title__line`, `.hero-media`, and `.hero-terminal-slot`.

- [ ] **Step 1: Write failing content, App, and CSS tests**

```jsx
for (const language of ['en', 'zh']) {
  expect(content[language].hero.titleLines).toHaveLength(2);
  expect(content[language].labels.languageDestination).toBeTruthy();
}

expect(screen.getAllByTestId('hero-title-line')).toHaveLength(2);
expect(screen.getByRole('button', { name: content.en.labels.language })).toHaveTextContent('中文');
await user.click(screen.getByRole('button', { name: content.en.labels.language }));
expect(screen.getByRole('button', { name: content.zh.labels.language })).toHaveTextContent('EN');
```

```js
expect(css).toContain('min-height: 72px');
expect(css).toContain('grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr)');
expect(css).toContain('.hero-title__line');
expect(css).toContain('.hero-media');
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/content.test.js tests/App.test.jsx tests/responsive-styles.test.js
```

Expected: FAIL because the new copy and layout hooks are absent.

- [ ] **Step 3: Add exact localized contracts**

Keep `hero.title` for metadata/accessible naming and add:

```js
// English
titleLines: ['Your coding agents.', 'Within reach.'],
// Chinese
titleLines: ['让编程智能体，', '随时触手可及。'],
```

Add `labels.languageDestination` as `中文` in English and `EN` in Chinese.

- [ ] **Step 4: Replace the segmented language control**

```jsx
<button
  className="language-toggle"
  type="button"
  aria-label={copy.labels.language}
  data-language={language}
  onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
>
  <span aria-hidden="true">{copy.labels.languageDestination}</span>
</button>
```

- [ ] **Step 5: Add explicit title/media/terminal hooks**

```jsx
<h1 id="hero-title" aria-label={copy.hero.title}>
  {copy.hero.titleLines.map(line => (
    <span key={line} className="hero-title__line" data-testid="hero-title-line" aria-hidden="true">
      {line}
    </span>
  ))}
</h1>
```

Wrap the right column in `.hero-media` and the current install component in `.hero-terminal-slot`; Task 2 replaces that install component.

- [ ] **Step 6: Apply exact layout anchors**

```css
.site-header { min-height: 72px; padding: 8px 12px; }
.language-toggle, .theme-toggle { width: 44px; height: 44px; }
.language-toggle { display: grid; place-items: center; padding: 0 10px; border-radius: 12px; }
.hero-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr);
  gap: clamp(32px, 4vw, 64px);
  align-items: center;
}
.hero-title__line { display: block; }
.hero-copy h1 { max-width: 11ch; }
.hero-media { position: relative; min-width: 0; }
```

At the existing mobile breakpoint, use one column and place `.hero-media` before `.hero-copy` without concealing overflow.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run tests/content.test.js tests/App.test.jsx tests/responsive-styles.test.js
npm run build
git diff --check
git add src/app/content.js src/components/Header.jsx src/components/Hero.jsx src/styles/components.css tests/App.test.jsx tests/content.test.js tests/responsive-styles.test.js
git commit -m "fix(web): realign landing header and hero"
```

---

### Task 2: Restore the Accessible Terminal Interaction

**Files:**
- Create: `src/components/terminalModel.js`
- Create: `src/components/TerminalDemo.jsx`
- Create: `tests/terminalModel.test.js`
- Create: `tests/TerminalDemo.test.jsx`
- Modify: `src/app/content.js`
- Modify: `src/components/Hero.jsx`
- Modify: `src/styles/components.css`
- Test: `tests/App.test.jsx`

**Interfaces:**
- Consumes: `INSTALL_COMMAND`, `copyToClipboard`, `copy.labels`, `copy.terminal`.
- Produces: `createTerminalState()`, `advanceTerminal(state, transcript)`, `<TerminalDemo command labels terminalCopy />`.

- [ ] **Step 1: Write pure-model RED tests**

```js
import { advanceTerminal, createTerminalState } from '../src/components/terminalModel';

it('types lines in order and holds after the final line', () => {
  let state = createTerminalState();
  const transcript = ['one', 'two'];
  for (let step = 0; step < 4; step += 1) state = advanceTerminal(state, transcript);
  expect(state).toMatchObject({ lineIndex: 1, charIndex: 0, rendered: ['one'] });
  for (let step = 0; step < 4; step += 1) state = advanceTerminal(state, transcript);
  expect(state.phase).toBe('hold');
});
```

- [ ] **Step 2: Verify RED, then implement the deterministic model**

```bash
npx vitest run tests/terminalModel.test.js
```

```js
export function createTerminalState() {
  return { phase: 'typing', lineIndex: 0, charIndex: 0, rendered: [] };
}

export function advanceTerminal(state, transcript) {
  if (state.phase !== 'typing') return state;
  const line = transcript[state.lineIndex] ?? '';
  if (state.charIndex < line.length) return { ...state, charIndex: state.charIndex + 1 };
  const rendered = [...state.rendered, line];
  if (state.lineIndex === transcript.length - 1) {
    return { phase: 'hold', lineIndex: state.lineIndex, charIndex: line.length, rendered };
  }
  return { phase: 'typing', lineIndex: state.lineIndex + 1, charIndex: 0, rendered };
}
```

- [ ] **Step 3: Write component RED tests**

Use fake timers plus controllable `IntersectionObserver`/`matchMedia`. Assert reduced motion shows all lines immediately; normal mode starts only after intersection; offscreen/unmount clears timers; copy success and fallback failure use localized live-region messages.

```jsx
window.matchMedia = reducedMotionMatchMedia(true);
render(<TerminalDemo command={INSTALL_COMMAND} labels={labels} terminalCopy={terminalCopy} />);
for (const line of terminalCopy.lines) expect(screen.getByText(line)).toBeVisible();
```

- [ ] **Step 4: Add bilingual terminal content**

Use the same six-line structure in both locales:

```js
terminal: {
  title: 'paws — live session',
  installLabel: 'Install and start Paws',
  lines: [
    '$ paws',
    '→ relay started · local machine',
    '✔ phone paired',
    '◐ agent · refactor-auth',
    '  edit src/auth/session.ts (+42 −8)',
    '✔ waiting for approval on your phone…'
  ]
}
```

Localize Chinese status words but keep commands, agent name, and file path unchanged.

- [ ] **Step 5: Implement `TerminalDemo`**

The component shows a `$ ${command}` install row with a native 44px copy button, reuses `copyToClipboard`, starts/pauses through `IntersectionObserver`, owns one timeout at a time, holds 3200ms before looping, clears timers on pause/unmount, renders complete output for reduced motion, and exposes `data-phase`. Copy feedback alone uses `role="status" aria-live="polite"`.

- [ ] **Step 6: Replace the standalone hero install card and style the terminal**

```jsx
<div className="hero-terminal-slot">
  <TerminalDemo command={INSTALL_COMMAND} labels={copy.labels} terminalCopy={copy.terminal} />
</div>
```

```css
.terminal-demo { border-radius: 16px; background: #101013; color: #f5f2ec; }
.terminal-demo__bar { min-height: 42px; }
.terminal-demo__copy { min-width: 44px; min-height: 44px; }
.terminal-demo__body { min-height: 148px; font-family: var(--font-mono); }
.terminal-demo__caret { animation: terminal-caret 1s steps(1) infinite; }
```

Disable caret animation under reduced motion.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run tests/terminalModel.test.js tests/TerminalDemo.test.jsx tests/App.test.jsx tests/content.test.js
npm run build
git diff --check
git add src/components/terminalModel.js src/components/TerminalDemo.jsx src/app/content.js src/components/Hero.jsx src/styles/components.css tests/terminalModel.test.js tests/TerminalDemo.test.jsx tests/App.test.jsx tests/content.test.js
git commit -m "feat(web): restore interactive terminal demo"
```

---

### Task 3: Build the Pointer-Controlled Mascot Runtime

**Files:**
- Create: `src/components/react-bits/mascotFrameModel.js`
- Create: `src/components/MascotLook.jsx`
- Create: `tests/mascotFrameModel.test.js`
- Create: `tests/MascotLook.test.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/styles/components.css`
- Modify: `tests/Hero.test.jsx`

**Interfaces:**
- Consumes: `pointerSurfaceRef`, `atlasSrc`, `fallbackSrc`, `alt`, `frameCount=24`, `columns=6`, `rows=4`.
- Produces: `pointerRatio(clientX, rect)`, `ratioToFrame(ratio, frameCount)`, `easeFrame(current, target, factor)`, and `<MascotLook />` with `data-frame`, `data-ready`, `data-mode`.

- [ ] **Step 1: Write frame-model RED tests**

```js
expect(pointerRatio(0, { left: 0, width: 100 })).toBe(-1);
expect(pointerRatio(50, { left: 0, width: 100 })).toBe(0);
expect(pointerRatio(100, { left: 0, width: 100 })).toBe(1);
expect(ratioToFrame(-1, 24)).toBe(0);
expect(ratioToFrame(0, 24)).toBe(12);
expect(ratioToFrame(1, 24)).toBe(23);
expect(easeFrame(0, 23, 0.25)).toBeCloseTo(5.75);
```

- [ ] **Step 2: Verify RED and implement pure helpers**

```bash
npx vitest run tests/mascotFrameModel.test.js
```

```js
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function pointerRatio(clientX, rect) {
  if (!rect.width) return 0;
  return clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
}

export function ratioToFrame(ratio, frameCount) {
  return Math.round(((clamp(ratio, -1, 1) + 1) / 2) * (frameCount - 1));
}

export function easeFrame(current, target, factor = 0.22) {
  return Math.abs(target - current) < 0.05 ? target : current + (target - current) * factor;
}
```

- [ ] **Step 3: Write `MascotLook` RED lifecycle tests**

Mock `Image`, Canvas 2D, `IntersectionObserver`, RAF, fine/coarse pointer, and reduced motion. Assert a visible pointer reaches edge frames, offscreen pointer movement performs no geometry/RAF work, pointer leave returns to frame 12, atlas decode failure shows the static image, reduced motion never starts RAF, and unmount disconnects/removes/cancels everything.

```jsx
expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-frame', '23');
observerCallback([{ isIntersecting: false }]);
surface.dispatchEvent(new PointerEvent('pointermove', { clientX: 100 }));
expect(surface.getBoundingClientRect).not.toHaveBeenCalled();
expect(requestAnimationFrame).not.toHaveBeenCalled();
```

- [ ] **Step 4: Implement the component lifecycle**

Keep refs for visible, ready, current/target frames, RAF, atlas image, and context. Attach events only to `pointerSurfaceRef.current`; return before geometry unless visible, ready, fine-pointer, and not reduced-motion.

```js
const sourceX = (frame % columns) * frameWidth;
const sourceY = Math.floor(frame / columns) * frameHeight;
context.clearRect(0, 0, canvas.width, canvas.height);
context.drawImage(atlas, sourceX, sourceY, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
```

Park RAF inside a 0.05-frame threshold. On pointer leave target frame 12. Under coarse pointer/reduced motion/load failure show the static image. Clean every observer/listener/RAF/image callback.

- [ ] **Step 5: Integrate a temporary runtime boundary**

Add `heroRef` to the section and render:

```jsx
<MascotLook
  pointerSurfaceRef={heroRef}
  atlasSrc="/assets/mascot-turn-atlas.webp"
  fallbackSrc="/assets/mascot-hero.png"
  alt={language === 'zh' ? 'Paws 土拨鼠吉祥物' : 'Paws marmot mascot'}
/>
```

Task 4 replaces the fallback with the transparent file. Until the atlas exists, load failure must display the old asset so this task remains independently testable.

- [ ] **Step 6: Add stable layout CSS**

```css
.mascot-look { position: relative; aspect-ratio: 1; width: min(100%, 34rem); }
.mascot-look canvas, .mascot-look img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
}
.mascot-look[data-ready='true'] img { opacity: 0; }
.mascot-look[data-mode='coarse'] { animation: mascot-breathe 5.5s ease-in-out infinite; }
```

Disable breathing under reduced motion and reserve identical layout before/after atlas load.

- [ ] **Step 7: Verify and commit**

```bash
npx vitest run tests/mascotFrameModel.test.js tests/MascotLook.test.jsx tests/Hero.test.jsx
npm run build
git diff --check
git add src/components/react-bits/mascotFrameModel.js src/components/MascotLook.jsx src/components/Hero.jsx src/styles/components.css tests/mascotFrameModel.test.js tests/MascotLook.test.jsx tests/Hero.test.jsx
git commit -m "feat(web): add pointer-controlled mascot runtime"
```

---

### Task 4: Generate and Extract the Authorized Mascot Motion Assets

**Files:**
- Create: `assets/motion/mascot-h3-prompt.txt`
- Create: `scripts/build-mascot-atlas.sh`
- Create: `public/assets/mascot-static.png`
- Create: `public/assets/mascot-turn-atlas.webp`
- Modify: `.gitignore`
- Modify: `src/components/Hero.jsx`
- Modify: `scripts/verify-static.cjs`
- Modify: `tests/static-source.test.cjs`

**Interfaces:**
- Consumes: exact `public/assets/mascot-hero.png`, `photo-to-styled-motion`, the image editing tool, `/Users/jacky/.local/bin/minimax-h3`, ffmpeg, ffprobe.
- Produces: real transparent still, real 6x4 atlas, verified task report, reproducible extraction script.

- [ ] **Step 1: Read generation instructions and inspect the exact source**

Read the complete image-generation skill before its tool. Inspect `public/assets/mascot-hero.png` dimensions, RGB/no-alpha status, face, pose, hands, hoodie/logo, and framing. Never use the uploaded page screenshot as the generation source.

- [ ] **Step 2: Generate exactly one transparent still**

Use this exact edit direction:

```text
Preserve this exact friendly Paws marmot mascot: identical face shape, eye spacing,
muzzle, ears, brown fur, black hoodie, drawstrings, orange paw emblem, thumbs-up
hand, other hand in pocket, full-body proportions, expression, lighting direction,
and centered full-body framing. Remove the entire black background and replace it
with true transparent alpha. Clean natural fur edges with no dark rectangular halo.
Do not redesign the character, change the pose, add props or text, alter the hoodie
logo, add fingers, crop the feet, or add a floor/background.
```

Inspect at original detail. If identity, hands, logo, feet, or transparency fail, stop and report; the confirmed static batch allows no automatic second image. Save a passing file as `public/assets/mascot-static.png` and send it through Happy's image-delivery tool.

- [ ] **Step 3: Integrate and expose the viewable v0 before the paid video**

Change the `MascotLook` fallback to `/assets/mascot-static.png`, run `npm run build`, and publish `dist/` using the first authenticated target from `vercel`, `wrangler`, then `cloudflared`. Verify the homepage plus both docs routes, send the public URL and the transparent still preview to the user, and continue without a review pause because the exact H3 batch is already authorized. This v0 must contain the final header grid, two-line title, terminal interaction, static transparent mascot, and DotField; only pointer head-turn frames are pending.

- [ ] **Step 4: Prepare the H3 input and committed prompt**

Composite the transparent still over uniform `#00ff00` under `artifacts/mascot-motion/mascot-h3-first-frame.png`. Commit this exact prompt:

```text
Locked square studio camera. Preserve the exact Paws marmot identity, friendly face,
black hoodie, orange paw emblem, thumbs-up hand, pocket hand, full body framing and
proportions. The torso, hoodie, logo, hands and feet remain fixed and stable. The
background remains a perfectly uniform flat chroma green with no texture, shadows,
objects or color changes. Begin facing the camera, briefly turn the head and gaze to
the character's left extreme, then perform one smooth continuous monotonic head and
eye turn from left to right covering approximately 120 to 160 degrees total. Include
one natural blink and extremely subtle breathing. End looking to the character's
right. No camera motion, zoom, reframing, body turn, arm motion, walking, talking,
mouth deformation, scene cut, background motion, logo drift, clothing drift, extra
limbs, extra fingers, duplicated features, morphing, or text.
```

Use the skill's `build_h3_request.mjs` with `--resolution 768P --duration 5 --seed 42`, plus `1:1` in the request.

- [ ] **Step 5: Submit exactly one paid task**

```bash
/Users/jacky/.local/bin/minimax-h3 create-json artifacts/mascot-motion/request.json --confirm-cost
```

Record the returned task ID. Poll only it. On failure, stop and keep the static CSS-parallax fallback; never submit a replacement automatically.

- [ ] **Step 6: Download, verify, inspect, and deliver the MP4**

Download to `artifacts/mascot-motion/h3-output.mp4`. Run the skill verifier, `ffprobe`, and full decode. Build a contact sheet and inspect identity, hands, hoodie/logo, chroma stability, monotonic head motion, cuts, and black frames. Send the verified MP4 through Happy's file-delivery tool.

- [ ] **Step 7: Create the reproducible atlas script**

Expose this interface:

```bash
scripts/build-mascot-atlas.sh \
  artifacts/mascot-motion/h3-output.mp4 \
  public/assets/mascot-turn-atlas.webp \
  0.60 4.00
```

Validate numeric arguments and required tools. Use 6 fps for exactly 24 frames; chroma-key `0x00ff00`; normalize to 512x512 RGBA; tile 6x4 chronologically; encode WebP quality 82 with alpha. Fail on empty output, missing alpha, non-24 frame extraction, or size above 3,145,728 bytes. Tune only trim, key similarity/blend, and quality after inspection, and report final exact values.

- [ ] **Step 8: Integrate assets and static checks**

Change the fallback to `/assets/mascot-static.png`. Require both new web assets in `scripts/verify-static.cjs` and `tests/static-source.test.cjs`. Add `/artifacts/` to `.gitignore`.

- [ ] **Step 9: Verify and commit**

```bash
node --test tests/static-source.test.cjs
npm run build
npm run verify:static
git diff --check
git add .gitignore assets/motion/mascot-h3-prompt.txt scripts/build-mascot-atlas.sh public/assets/mascot-static.png public/assets/mascot-turn-atlas.webp src/components/Hero.jsx scripts/verify-static.cjs tests/static-source.test.cjs
git commit -m "feat(web): add transparent interactive mascot assets"
```

No file under `artifacts/` may be staged.

---

### Task 5: Final Hero Integration and Responsive Hardening

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/styles/components.css`
- Modify: `src/styles/global.css` only if measured overflow requires it
- Modify: `tests/Hero.test.jsx`
- Modify: `tests/responsive-styles.test.js`
- Modify: `tests/App.test.jsx`

**Interfaces:**
- Consumes: final `TerminalDemo`, `MascotLook`, two-line copy, real assets, existing `DotField`.
- Produces: final Header/Hero DOM and CSS hooks consumed by browser acceptance.

- [ ] **Step 1: Write final integration RED assertions**

Assert one DotField, one TerminalDemo, one MascotLook, two title lines, and no legacy `.install-command` or `.mascot-stage` inside the hero.

```js
expect(css).toContain('.hero-media::before');
expect(css).toContain('radial-gradient');
expect(css).toContain('@media (prefers-reduced-motion: reduce)');
expect(css).toContain('.terminal-demo__body');
expect(css).not.toContain('.mascot-stage img');
```

- [ ] **Step 2: Verify RED and remove legacy mascot composition**

```bash
npx vitest run tests/Hero.test.jsx tests/App.test.jsx tests/responsive-styles.test.js
```

Delete old mascot parallax state/effects and `.mascot-stage` CSS. Preserve DotField capability and visibility behavior.

- [ ] **Step 3: Apply final desktop hierarchy**

- Hero top padding clears 72px header plus 48px.
- H1: `clamp(3.25rem, 5.2vw, 5.9rem)`, line-height `0.98`.
- Terminal: `min(100%, 42rem)`.
- Mascot: `min(100%, 34rem)` with no rectangular background.
- `.hero-media::before` supplies one soft orange radial halo.
- DotField cannot reduce text contrast.
- Actions, terminal, and media use the 8px spacing rhythm.

- [ ] **Step 4: Apply final mobile hierarchy**

At the existing breakpoint, make one column; place media first and cap it at 17rem; retain two explicit title lines with `clamp(2.7rem, 13vw, 4rem)`; keep terminal readable and within viewport; retain all 44px controls. Do not add `overflow-x: hidden` to conceal a layout defect.

- [ ] **Step 5: Run full gate and commit**

```bash
npm run check
git diff --check
git add src/components/Hero.jsx src/styles/components.css tests/Hero.test.jsx tests/responsive-styles.test.js tests/App.test.jsx
git commit -m "fix(web): polish interactive mascot hero"
```

Add `src/styles/global.css` only if it changed for a measured, explained reason.

---

### Task 6: Browser Acceptance and Public Preview

**Files:**
- Modify: `e2e/homepage.spec.js`
- Modify: `playwright.config.js` only if an environment override is required
- Review: all branch changes and generated web assets

**Interfaces:**
- Consumes: build output, `data-frame/data-ready/data-mode/data-phase`, and preserved docs routes.
- Produces: browser evidence, four screenshots, independent review, verified public preview URL.

- [ ] **Step 1: Add browser RED assertions**

```js
await expect(page.getByTestId('hero-title-line')).toHaveCount(2);

const controls = [
  page.locator('.language-toggle'),
  page.locator('.theme-toggle'),
  page.locator('.preference-controls .primary-action')
];
const boxes = await Promise.all(controls.map(locator => locator.boundingBox()));
const centers = boxes.map(box => box.y + box.height / 2);
expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(2);

const mascot = page.getByTestId('mascot-look');
await expect(mascot).toHaveAttribute('data-ready', 'true');
const centerFrame = Number(await mascot.getAttribute('data-frame'));
await page.locator('#hero').hover({ position: { x: 1, y: 200 } });
await expect.poll(async () => Number(await mascot.getAttribute('data-frame'))).toBeLessThan(centerFrame);
await page.locator('#hero').hover({ position: { x: 1300, y: 200 } });
await expect.poll(async () => Number(await mascot.getAttribute('data-frame'))).toBeGreaterThan(centerFrame);
```

Also cover terminal progression/copy, reduced-motion full transcript/static mascot, no rectangular mascot background in light/dark screenshots, 390x844 no overflow/menu/44px controls, and unchanged docs headings.

- [ ] **Step 2: Run local browser acceptance**

```bash
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:e2e
```

Expected: required scenarios PASS; Playwright starts and cleans its Vite preview.

- [ ] **Step 3: Inspect four screenshots**

Inspect dark/light at 1440x1000 and 390x844 for centerline alignment, exact two-line Chinese title, transparent fur edges, readable terminal, mascot/terminal balance, clipping, and absence of fabricated content. Use browser-test artifacts, not a second implementation.

- [ ] **Step 4: Run final gates and independent review**

```bash
npm ci
npm run check
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:e2e
git diff --check origin/main...HEAD
git status --short
```

Request a whole-branch review against the spec. Fix every Critical/Important finding before preview publication.

- [ ] **Step 5: Publish and verify a public preview**

Tell the user it is public, then detect targets in order:

```bash
command -v vercel
command -v wrangler
command -v cloudflared
```

Use the first authenticated/available target and deploy only `dist/`. For `cloudflared`, run `npm run preview -- --host 127.0.0.1`, tunnel that loopback port, and keep both processes alive until review completes. Verify homepage, `/docs`, and `/docs/zh-CN` by HTTP and browser. Clearly label a cloudflared URL temporary.

- [ ] **Step 6: Commit acceptance and hand off**

```bash
git add e2e/homepage.spec.js
git commit -m "test(web): verify refined interactive hero"
git status --short
```

If `playwright.config.js` changed, add it to the same commit. Report preview URL, exact tests, H3 task ID/specification, atlas size, and no-retry result. Stop for explicit user visual approval before production PR/merge.
