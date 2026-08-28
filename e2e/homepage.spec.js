import { expect, test } from '@playwright/test';

const LANGUAGE_KEY = 'paws-home-language-v1';
const THEME_KEY = 'paws-home-theme-v1';
const BASE_URL = `http://127.0.0.1:${process.env.PAWS_E2E_PORT ?? 4173}`;
const CHINESE_TITLE_LINES = ['让编程智能体，', '随时触手可及。'];
const ENGLISH_TRANSCRIPT = [
  '$ paws',
  '→ relay started · local machine',
  '✔ phone paired',
  '◐ agent · refactor-auth',
  '  edit src/auth/session.ts (+42 −8)',
  '✔ waiting for approval on your phone…'
];

async function resetPreferences(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function expectCompletePageCounts(page) {
  await expect(page.getByTestId('cross-device-story')).toBeVisible();
  await expect(page.getByTestId('mascot-card')).toHaveCount(7);
  await expect(page.getByTestId('proof-case')).toHaveCount(6);
  await expect(page.getByTestId('comparison-row')).toHaveCount(5);
  await expect(page.getByTestId('architecture-node')).toHaveCount(4);
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  ))).toBe(0);
}

async function expectStaticStoryEvidence(page) {
  const story = page.getByTestId('cross-device-story');
  const evidence = story.getByTestId('story-static-evidence');
  const scenes = [
    { id: 'start', status: 'ready', focus: 'pc', pcFocused: 'true', mobileFocused: 'false' },
    { id: 'watch', status: 'running', focus: 'pc', pcFocused: 'true', mobileFocused: 'false' },
    { id: 'approve', status: 'approval-pending', focus: 'mobile', pcFocused: 'false', mobileFocused: 'true' },
    { id: 'handoff', status: 'running', focus: 'shared', pcFocused: 'true', mobileFocused: 'true' }
  ];

  await expect(evidence).toHaveCount(4);
  await expect(story.locator('.cross-device-story__stage--shared')).toBeHidden();

  for (const scene of scenes) {
    const scoped = story.locator(`[data-testid="story-static-evidence"][data-static-scene="${scene.id}"]`);
    const pc = scoped.locator('[data-static-surface="pc"]');
    const app = scoped.locator('[data-static-surface="mobile"]');
    const connection = scoped.locator('.connection-flow');
    await expect(scoped).toHaveCount(1);
    await expect(scoped).toBeVisible();
    await expect(pc).toBeVisible();
    await expect(app).toBeVisible();
    await expect(connection).toBeVisible();
    await expect(pc).toHaveAttribute('data-scene', scene.id);
    await expect(pc).toHaveAttribute('data-status', scene.status);
    await expect(pc).toHaveAttribute('data-focus', scene.pcFocused);
    await expect(app).toHaveAttribute('data-scene', scene.id);
    await expect(app).toHaveAttribute('data-status', scene.status);
    await expect(app).toHaveAttribute('data-focus', scene.mobileFocused);
    await expect(connection).toHaveAttribute('data-status', scene.status);
    await expect(connection).toHaveAttribute('data-focus', scene.focus);
  }

  await expect(story.locator('[data-static-surface="pc"]:visible')).toHaveCount(4);
  await expect(story.locator('[data-static-surface="mobile"]:visible')).toHaveCount(4);
  await expect(story.locator('[data-testid="story-static-evidence"] > .connection-flow:visible')).toHaveCount(4);

  await expect(story.locator('[data-static-scene="watch"]')).toContainText('Skill');
  await expect(story.locator('[data-static-scene="watch"]')).toContainText('Subagent');
  await expect(story.locator('[data-static-scene="approve"]')).toContainText('npm run build');
  await expect(story.locator('[data-static-scene="handoff"] [data-static-surface="pc"] .story-static-console__permission'))
    .toHaveAttribute('data-status', 'approved');
  await expect(story.locator('[data-static-scene="handoff"] [data-static-surface="mobile"] .story-static-console__permission'))
    .toHaveAttribute('data-status', 'approved');
  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  ))).toBe(0);
}

async function scrollStoryToProgress(page, progress) {
  await page.getByTestId('cross-device-story').evaluate(async (story, targetProgress) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    if (!window.__pawsStoryScrollRange) {
      const stage = story.querySelector('.cross-device-story__stage');
      const header = document.querySelector('.site-header');
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const storyBottom = story.getBoundingClientRect().bottom + window.scrollY;
      const provisionalStart = stageTop - Math.round(header.getBoundingClientRect().height + 16);
      window.scrollTo(0, provisionalStart);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const pinnedViewportTop = stage.getBoundingClientRect().top;
      window.__pawsStoryScrollRange = {
        start: stageTop - pinnedViewportTop,
        end: storyBottom - window.innerHeight
      };
    }
    const { start, end } = window.__pawsStoryScrollRange;
    window.scrollTo(0, start + ((end - start) * targetProgress));
  }, progress);
  await page.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function expectTransparentMascotSurface(page, mode) {
  const surfaces = page.locator('.mascot-look, .mascot-look canvas, .mascot-look img');
  const expectedSurfaceCount = mode === 'interactive' ? 2 : 3;
  await expect(surfaces).toHaveCount(expectedSurfaceCount);
  for (let index = 0; index < expectedSurfaceCount; index += 1) {
    await expect(surfaces.nth(index)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  }

  const pixelSource = mode === 'interactive'
    ? page.getByTestId('mascot-look').locator('canvas')
    : page.getByTestId('mascot-look').locator('img');
  const cornerAlpha = await pixelSource.evaluate((source, sourceMode) => {
    const canvas = sourceMode === 'interactive' ? source : document.createElement('canvas');
    if (sourceMode !== 'interactive') {
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      canvas.getContext('2d').drawImage(source, 0, 0);
    }
    const context = canvas.getContext('2d');
    const corners = [
      [0, 0],
      [canvas.width - 1, 0],
      [0, canvas.height - 1],
      [canvas.width - 1, canvas.height - 1]
    ];
    return corners.map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
  }, mode);
  expect(cornerAlpha).toEqual([0, 0, 0, 0]);
}

async function expectAlertMascotCenterFrame(page) {
  const alertEyePixels = await page.getByTestId('mascot-look').locator('canvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(255, 90, 270, 143).data;
    let count = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const alpha = pixels[offset + 3];
      if (alpha > 200 && Math.min(red, green, blue) >= 205
        && Math.max(red, green, blue) - Math.min(red, green, blue) <= 40) {
        count += 1;
      }
    }
    return count;
  });
  expect(
    alertEyePixels,
    'center frame 12 eye crop (255,90 270x143) should contain >=8 opaque near-white alert pixels'
  ).toBeGreaterThanOrEqual(8);
}

test('desktop hero meets title, controls, mascot, terminal and preference contracts', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  await resetPreferences(page);

  const dotField = page.locator('.dot-field');
  await expect(dotField.locator('canvas')).toBeVisible();
  await expect(dotField).toHaveAttribute('data-mode', 'interactive');
  await page.mouse.move(900, 320);
  await expect(dotField).toHaveAttribute('data-engaged', 'true');

  await expect(page.getByTestId('hero-title-line')).toHaveCount(2);
  const titleLineBoxes = await page.getByTestId('hero-title-line').evaluateAll(lines => lines.map(line => {
    const range = document.createRange();
    range.selectNodeContents(line);
    return range.getClientRects().length;
  }));
  expect(titleLineBoxes).toEqual([1, 1]);
  const controls = [
    page.locator('.language-toggle'),
    page.locator('.theme-toggle'),
    page.locator('.preference-controls .primary-action')
  ];
  const boxes = await Promise.all(controls.map(locator => locator.boundingBox()));
  for (const box of boxes) expect(box).not.toBeNull();
  const centers = boxes.map(box => box.y + box.height / 2);
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(2);

  const mascot = page.getByTestId('mascot-look');
  await expect(mascot).toHaveAttribute('data-ready', 'true');
  const mascotBox = await mascot.boundingBox();
  expect(mascotBox).not.toBeNull();
  expect(mascotBox.width).toBeLessThanOrEqual(520);
  const heroCrew = page.getByTestId('hero-crew-member');
  await expect(heroCrew).toHaveCount(3);
  await expect.poll(() => heroCrew.evaluateAll(images => images.every(image => (
    image.complete && image.naturalWidth === 512 && image.naturalHeight === 512
  )))).toBe(true);
  await expect(mascot.locator('canvas')).toHaveJSProperty('width', 768);
  await expect(mascot.locator('canvas')).toHaveJSProperty('height', 768);
  const centerFrame = Number(await mascot.getAttribute('data-frame'));
  await page.locator('#hero').hover({ position: { x: 1, y: 200 } });
  await expect.poll(async () => Number(await mascot.getAttribute('data-frame'))).toBeLessThan(centerFrame);
  await page.locator('#hero').hover({ position: { x: 1300, y: 200 } });
  await expect.poll(async () => Number(await mascot.getAttribute('data-frame'))).toBeGreaterThan(centerFrame);

  const terminal = page.getByTestId('terminal-demo');
  await expect(terminal).toHaveAttribute('data-phase', 'typing');
  await expect.poll(async () => terminal.locator('.terminal-demo__body').textContent()).toContain('$ paws');
  await terminal.locator('.terminal-demo__copy').click();
  await expect(terminal.getByRole('status')).toHaveText('Install command copied');

  await page.getByRole('button', { name: 'Switch to Chinese' }).click();
  await expect(page.getByTestId('hero-title-line')).toHaveText(CHINESE_TITLE_LINES);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('让你的编程智能体，随时触手可及。');
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), LANGUAGE_KEY)).toBe('zh');
  await page.reload();
  await expect(page.getByTestId('hero-title-line')).toHaveText(CHINESE_TITLE_LINES);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});

test('mobile navigation, mascot, targets and layout remain usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');

  await resetPreferences(page);

  const mascot = page.getByTestId('mascot-look');
  await expect(mascot.locator('img')).toBeVisible();
  await expect(mascot.locator('img')).toHaveJSProperty('naturalWidth', 1254);
  await expect(mascot.locator('img')).toHaveJSProperty('naturalHeight', 1254);
  const firstViewport = await Promise.all([
    page.getByRole('heading', { level: 1 }).boundingBox(),
    page.locator('.hero-actions .primary-action').boundingBox(),
    page.locator('.hero-media').boundingBox(),
    page.getByTestId('terminal-demo').boundingBox()
  ]);
  const [titleBox, primaryCtaBox, mascotStageBox, terminalBox] = firstViewport;
  for (const box of firstViewport) expect(box).not.toBeNull();
  const viewportHeight = page.viewportSize().height;
  expect(titleBox.y).toBeGreaterThanOrEqual(0);
  expect(titleBox.y + titleBox.height).toBeLessThanOrEqual(viewportHeight);
  expect(primaryCtaBox.y).toBeGreaterThanOrEqual(0);
  expect(primaryCtaBox.y + primaryCtaBox.height).toBeLessThanOrEqual(viewportHeight);
  expect(mascotStageBox.y).toBeLessThan(viewportHeight);
  expect(mascotStageBox.y + mascotStageBox.height).toBeGreaterThan(0);
  expect(primaryCtaBox.y).toBeLessThan(mascotStageBox.y);
  expect(mascotStageBox.y).toBeLessThan(terminalBox.y);
  const menuButton = page.locator('.menu-toggle');
  await expect(menuButton).toHaveAccessibleName('Open navigation');
  await menuButton.click();
  const navigation = page.locator('#primary-navigation');
  await expect(navigation).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll('body *')]
      .map(element => ({
        selector: element.className || element.id || element.tagName,
        rect: element.getBoundingClientRect().toJSON(),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth
      }))
      .filter(({ rect, clientWidth, scrollWidth }) => (
        rect.left < 0 || rect.right > document.documentElement.clientWidth || scrollWidth > clientWidth
      ))
  }));
  expect(layout.overflow, JSON.stringify(layout.offenders)).toBe(0);

  const targets = [
    ['menu', menuButton],
    ['language', page.getByRole('button', { name: 'Switch to Chinese' })],
    ['theme', page.getByRole('button', { name: /Switch to (?:light|dark) theme/ })],
    ['first navigation link', navigation.getByRole('link').first()]
  ];
  for (const [name, control] of targets) {
    const box = await control.boundingBox();
    expect(box, `${name} control should have a rendered box`).not.toBeNull();
    expect(box.width, `${name} control width`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${name} control height`).toBeGreaterThanOrEqual(44);
  }
});

test('complete desktop page advances through all four story scenes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  await resetPreferences(page);
  await expectCompletePageCounts(page);

  const story = page.getByTestId('cross-device-story');
  for (const [progress, scene] of [
    [0, 'start'],
    [0.3, 'watch'],
    [0.55, 'approve'],
    [0.8, 'handoff']
  ]) {
    await scrollStoryToProgress(page, progress);
    await expect(story).toHaveAttribute('data-active-scene', scene);
  }
});

test('complete mobile page keeps four scenes in flow and prioritizes App approval', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');

  await resetPreferences(page);
  await expectCompletePageCounts(page);
  await expectStaticStoryEvidence(page);

  const story = page.getByTestId('cross-device-story');
  const sceneHeadings = story.locator('.story-step > h3');
  await expect(sceneHeadings).toHaveCount(4);
  const headingTops = await sceneHeadings.evaluateAll(headings => (
    headings.map(heading => heading.getBoundingClientRect().top + window.scrollY)
  ));
  expect(headingTops).toEqual([...headingTops].sort((a, b) => a - b));
  await expect(story.locator('.cross-device-story__stage')).not.toHaveCSS('position', 'sticky');

  await story.locator('.story-step[data-scene="approve"] > .story-step__meta button').click();
  await expect(story).toHaveAttribute('data-active-scene', 'approve');
  const approvalEvidence = story.locator('[data-static-scene="approve"]');
  const [pcBox, appBox] = await Promise.all([
    approvalEvidence.locator('[data-static-surface="pc"]').boundingBox(),
    approvalEvidence.locator('[data-static-surface="mobile"]').boundingBox()
  ]);
  expect(pcBox).not.toBeNull();
  expect(appBox).not.toBeNull();
  expect(appBox.y).toBeLessThan(pcBox.y);
});

test('reduced motion exposes every major page fact without scrolling', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'en-US' });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/`);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expectCompletePageCounts(page);
    await expectStaticStoryEvidence(page);
    await expect(page.locator('.story-step')).toHaveCount(4);
    await expect(page.getByTestId('proof-case')).toHaveCount(6);
    await expect(page.getByTestId('architecture-node')).toHaveCount(4);
    for (const locator of [
      page.locator('.story-step'),
      page.getByTestId('proof-case'),
      page.getByTestId('architecture-node')
    ]) {
      const visible = await locator.evaluateAll(elements => elements.every(element => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden'
          && Number(style.opacity) > 0;
      }));
      expect(visible).toBe(true);
    }
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    await context.close();
  }
});

test('1280 fine and 1024 coarse desktops select the correct story presentation', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  const fineContext = await browser.newContext({
    baseURL: BASE_URL,
    locale: 'en-US',
    viewport: { width: 1280, height: 900 }
  });
  try {
    const page = await fineContext.newPage();
    await page.goto('/');
    await expectCompletePageCounts(page);
    await expect(page.getByTestId('cross-device-story')).toHaveAttribute('data-story-motion-ready', 'true');
    await expect(page.locator('.cross-device-story__stage--shared')).toBeVisible();
    await expect(page.getByTestId('story-static-evidence')).toHaveCount(4);
    await expect(page.locator('[data-testid="story-static-evidence"]:visible')).toHaveCount(0);
    await expect(page.locator('.pc-console:visible')).toHaveCount(1);
    await expect(page.locator('.mobile-console:visible')).toHaveCount(1);
  } finally {
    await fineContext.close();
  }

  const coarseContext = await browser.newContext({
    baseURL: BASE_URL,
    hasTouch: true,
    locale: 'en-US',
    viewport: { width: 1024, height: 768 }
  });
  try {
    const page = await coarseContext.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    await expectCompletePageCounts(page);
    await expectStaticStoryEvidence(page);
    await expect(page.locator('[data-static-surface="pc"]:visible')).toHaveCount(4);
    await expect(page.locator('[data-static-surface="mobile"]:visible')).toHaveCount(4);
  } finally {
    await coarseContext.close();
  }
});

test('fine desktop keeps complete fallback when a motion precondition is missing', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  const context = await browser.newContext({
    baseURL: BASE_URL,
    locale: 'en-US',
    viewport: { width: 1280, height: 900 }
  });
  try {
    await context.addInitScript(() => {
      const nativeQuerySelector = Element.prototype.querySelector;
      Element.prototype.querySelector = function querySelector(selector) {
        if (selector === '.story-scene-mascot'
          && this.classList?.contains('cross-device-story__stage--shared')) {
          return null;
        }
        return nativeQuerySelector.call(this, selector);
      };
    });
    const page = await context.newPage();
    await page.goto('/');

    await expectCompletePageCounts(page);
    await expect(page.getByTestId('cross-device-story')).not.toHaveAttribute('data-story-motion-ready');
    await expectStaticStoryEvidence(page);
  } finally {
    await context.close();
  }
});

test('reduced motion exposes full transcript and a static mascot', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'en-US' });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`);
  await expect(page.locator('.dot-field')).toHaveAttribute('data-mode', 'static');
  await expect(page.locator('.dot-field')).toHaveAttribute('data-engaged', 'false');
  const terminal = page.getByTestId('terminal-demo');
  await expect(terminal).toHaveAttribute('data-phase', 'complete');
  await expect(terminal.locator('.terminal-demo__body > div')).toHaveText(ENGLISH_TRANSCRIPT);
  const mascot = page.getByTestId('mascot-look');
  await expect(mascot).toHaveAttribute('data-mode', 'reduced');
  await expect(mascot).toHaveAttribute('data-ready', 'false');
  await expect(mascot.locator('img')).toBeVisible();
  await context.close();
});

test('English documentation route keeps its existing heading', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/docs');
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Installation & Quick Start');
});

test('Chinese documentation route keeps its existing heading', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/docs/zh-CN');
  await expect(page).toHaveURL(/\/docs\/zh-CN\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('安装与快速上手');
});

test('captures transparent mascot in both themes at approved viewports', async ({ browser }, testInfo) => {
  test.setTimeout(60_000);
  const viewport = testInfo.project.name === 'desktop'
    ? { width: 1440, height: 1000 }
    : { width: 390, height: 844 };

  const context = await browser.newContext({
    baseURL: BASE_URL,
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    viewport
  });

  try {
    await context.addInitScript(
      ({ languageKey, themeKey }) => {
        localStorage.setItem(languageKey, 'zh');
        localStorage.setItem(themeKey, 'light');
      },
      { languageKey: LANGUAGE_KEY, themeKey: THEME_KEY }
    );
    const page = await context.newPage();
    await page.goto('/');

    for (const theme of ['light', 'dark']) {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.getByTestId('hero-title-line')).toHaveText(CHINESE_TITLE_LINES);
      const titleLineBoxes = await page.getByTestId('hero-title-line').evaluateAll(lines => lines.map(line => {
        const range = document.createRange();
        range.selectNodeContents(line);
        return range.getClientRects().length;
      }));
      expect(titleLineBoxes).toEqual([1, 1]);
      const mascotMode = testInfo.project.name === 'desktop' ? 'interactive' : 'coarse';
      await expect(page.getByTestId('mascot-look')).toHaveAttribute('data-mode', mascotMode);
      await expect(page.getByTestId('mascot-look')).toHaveAttribute(
        'data-ready',
        mascotMode === 'interactive' ? 'true' : 'false'
      );
      await expectTransparentMascotSurface(page, mascotMode);
      if (mascotMode === 'interactive') {
        await page.locator('#hero').hover({ position: { x: 720, y: 200 } });
        await expect(page.getByTestId('mascot-look')).toHaveAttribute('data-frame', '12');
        await page.evaluate(() => new Promise(resolve => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }));
        await expectAlertMascotCenterFrame(page);
      }
      await page.screenshot({
        path: testInfo.outputPath(`homepage-${testInfo.project.name}-${theme}.png`)
      });

      if (theme === 'light') {
        await page.getByRole('button', { name: '切换到深色主题' }).click();
      }
    }
  } finally {
    await context.close();
  }
});
