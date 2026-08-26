import { expect, test } from '@playwright/test';

const LANGUAGE_KEY = 'paws-home-language-v1';
const THEME_KEY = 'paws-home-theme-v1';

test('desktop preferences persist and pointer activates the hero field', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const dotField = page.locator('.dot-field');
  await expect(dotField.locator('canvas')).toBeVisible();
  await expect(dotField).toHaveAttribute('data-mode', 'interactive');
  await page.mouse.move(900, 320);
  await expect(dotField).toHaveAttribute('data-engaged', 'true');

  await page.getByRole('button', { name: 'Switch to Chinese' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编程智能体');
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), LANGUAGE_KEY)).toBe('zh');

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('编程智能体');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});

test('mobile navigation, mascot, targets and layout remain usable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator('.mascot-stage img')).toBeVisible();
  const menuButton = page.locator('.menu-toggle');
  await expect(menuButton).toHaveAccessibleName('Open navigation');
  await menuButton.click();
  const navigation = page.locator('#primary-navigation');
  await expect(navigation).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBe(0);

  for (const [name, control] of [
    ['menu', menuButton],
    ['language', page.getByRole('button', { name: 'Switch to Chinese' })],
    ['theme', page.getByRole('button', { name: /Switch to (?:light|dark) theme/ })]
  ]) {
    const box = await control.boundingBox();
    expect(box, `${name} control should have a rendered box`).not.toBeNull();
    expect(box.width, `${name} control width`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${name} control height`).toBeGreaterThanOrEqual(44);
  }
});

test('reduced motion selects the static dot field', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'en-US' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.dot-field')).toHaveAttribute('data-mode', 'static');
  await expect(page.locator('.dot-field')).toHaveAttribute('data-engaged', 'false');
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

test('captures both themes at the approved viewport', async ({ page }, testInfo) => {
  for (const theme of ['dark', 'light']) {
    await page.addInitScript(
      ({ languageKey, themeKey, selectedTheme }) => {
        localStorage.setItem(languageKey, 'en');
        localStorage.setItem(themeKey, selectedTheme);
      },
      { languageKey: LANGUAGE_KEY, themeKey: THEME_KEY, selectedTheme: theme }
    );
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.mascot-stage img')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`homepage-${testInfo.project.name}-${theme}.png`),
      fullPage: true
    });
  }
});
