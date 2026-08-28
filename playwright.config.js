import { defineConfig, devices } from '@playwright/test';

const localExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const previewPort = Number(process.env.PAWS_E2E_PORT ?? 4173);
const previewBaseUrl = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: 'homepage.spec.js',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  workers: 1,
  outputDir: '.preview/playwright-results',
  use: {
    baseURL: previewBaseUrl,
    locale: 'en-US',
    trace: 'retain-on-failure',
    launchOptions: localExecutable ? { executablePath: localExecutable } : undefined
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    port: previewPort,
    reuseExistingServer: false
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true }
    }
  ]
});
