const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const helperUrl = pathToFileURL(path.resolve(__dirname, '../e2e/image-budget.js')).href;

test('the first-viewport budget includes every supported image URL without an allowlist', async () => {
  const { summarizeImageResources } = await import(helperUrl);
  const summary = summarizeImageResources([
    { name: 'https://preview.example/assets/mascot.webp', encodedBodySize: 600 },
    { name: 'https://preview.example/assets/future-banner.avif?revision=1', encodedBodySize: 700 },
    { name: 'https://preview.example/assets/mascot.webp', encodedBodySize: 600 },
    { name: 'https://preview.example/assets/app.js', encodedBodySize: 50_000 }
  ]);

  assert.equal(summary.totalBytes, 1_300);
  assert.deepEqual(
    summary.resources.map(resource => resource.pathname).sort(),
    ['/assets/future-banner.avif', '/assets/mascot.webp']
  );
});

test('zero Resource Timing sizes require a positive same-origin response fallback', async () => {
  const { summarizeImageResources } = await import(helperUrl);
  const iconUrl = 'https://preview.example/favicon.ico';
  const entries = [{ name: iconUrl, encodedBodySize: 0 }];

  assert.throws(
    () => summarizeImageResources(entries),
    /favicon\.ico has no positive byte size/
  );
  assert.deepEqual(
    summarizeImageResources(entries, new Map([[iconUrl, 4_096]])),
    {
      totalBytes: 4_096,
      resources: [{ url: iconUrl, pathname: '/favicon.ico', bytes: 4_096 }]
    }
  );
});
