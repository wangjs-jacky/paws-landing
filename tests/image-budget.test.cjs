const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const helperUrl = pathToFileURL(path.resolve(__dirname, '../e2e/image-budget.js')).href;

test('the first-viewport budget includes every supported image URL without an allowlist', async () => {
  const { summarizeImageResources } = await import(helperUrl);
  const pageOrigin = 'https://preview.example';
  const summary = summarizeImageResources([
    { name: 'https://preview.example/assets/mascot.webp', encodedBodySize: 600 },
    { name: 'https://preview.example/assets/future-banner.avif?revision=1', encodedBodySize: 700 },
    { name: 'https://preview.example/assets/mascot.webp', encodedBodySize: 600 },
    { name: 'https://preview.example/assets/app.js', encodedBodySize: 50_000 },
    { name: 'https://cdn.third-party.example/cross-origin.svg', encodedBodySize: 800 }
  ], { pageOrigin });

  assert.equal(summary.totalBytes, 2_100);
  assert.deepEqual(
    summary.resources.map(resource => resource.pathname).sort(),
    ['/assets/future-banner.avif', '/assets/mascot.webp', '/cross-origin.svg']
  );
});

test('zero Resource Timing sizes require a positive same-origin response fallback', async () => {
  const { summarizeImageResources } = await import(helperUrl);
  const pageOrigin = 'https://preview.example';
  const iconUrl = 'https://preview.example/favicon.ico';
  const entries = [{ name: '/favicon.ico', encodedBodySize: 0 }];

  assert.throws(
    () => summarizeImageResources(entries, { pageOrigin }),
    /favicon\.ico has no positive byte size/
  );
  assert.deepEqual(
    summarizeImageResources(entries, {
      pageOrigin,
      responseContentLengths: new Map([[iconUrl, 4_096]])
    }),
    {
      totalBytes: 4_096,
      resources: [{ url: iconUrl, pathname: '/favicon.ico', bytes: 4_096 }]
    }
  );
});

test('zero Resource Timing sizes reject cross-origin Content-Length fallback', async () => {
  const { summarizeImageResources } = await import(helperUrl);
  const pageOrigin = 'https://preview.example';
  const thirdPartyUrl = 'https://cdn.third-party.example/future.avif';

  assert.throws(
    () => summarizeImageResources(
      [{ name: thirdPartyUrl, encodedBodySize: 0 }],
      {
        pageOrigin,
        responseContentLengths: new Map([[thirdPartyUrl, 9_999]])
      }
    ),
    /future\.avif cannot use a cross-origin Content-Length fallback/
  );
});
