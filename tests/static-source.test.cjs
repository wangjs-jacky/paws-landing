const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');
const staticVerifier = require('../scripts/verify-static.cjs');

const root = path.resolve(__dirname, '..');
const mascotIds = ['astro', 'explorer', 'hoodie', 'ninja', 'scientist', 'barista', 'florist'];
const mascotSources = {
  astro: '/assets/mascots/astro.png',
  explorer: '/assets/mascots/explorer.png',
  hoodie: '/assets/mascots/hoodie.png',
  ninja: '/assets/mascots/ninja.png',
  scientist: '/assets/mascots/scientist.png',
  barista: '/assets/mascots/barista.png',
  florist: '/assets/mascots/florist.png'
};

test('the approved Paws Crew images are public source files', () => {
  for (const id of mascotIds) {
    const relative = `public/assets/mascots/${id}.png`;
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative);
  }
});

test('the Paws Crew registry exports exactly seven approved IDs and sources', async () => {
  const registryUrl = pathToFileURL(
    path.join(root, 'src/components/MascotCrew/mascotRegistry.js')
  );
  const registry = await import(registryUrl.href);

  assert.deepEqual(registry.MASCOT_IDS, mascotIds);
  assert.deepEqual(Object.keys(registry.mascotSources), mascotIds);
  assert.deepEqual(registry.mascotSources, mascotSources);
});

test('Vite public directory owns the documentation routes', () => {
  for (const relative of [
    'public/docs.html',
    'public/docs/zh-CN.html',
    'public/assets/docs-controls.js',
    'public/assets/docs-controls.css',
    'public/assets/mascot-avatar.png',
    'public/assets/mascot-hero.png',
    'public/assets/mascot-static.png',
    'public/assets/mascot-turn-atlas.webp'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative);
  }
});

test('the React entry replaces the static homepage', () => {
  assert.equal(fs.existsSync(path.join(root, 'index.html')), true);
  assert.equal(fs.existsSync(path.join(root, 'src/main.jsx')), true);
  assert.equal(fs.existsSync(path.join(root, 'web/index.html')), false);
});

test('the homepage favicon uses the approved lightweight hoodie asset', () => {
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const document = new JSDOM(home).window.document;
  const icon = document.querySelector('link[rel~="icon"]');

  assert.ok(icon, 'index.html must declare a favicon');
  const iconPath = icon.getAttribute('href');
  assert.equal(iconPath, '/assets/mascots/hoodie.png');
  const iconSource = path.join(root, 'public', iconPath.slice(1));
  assert.equal(fs.existsSync(iconSource), true, `favicon source does not exist: ${iconPath}`);
  assert.ok(fs.statSync(iconSource).size <= 300_000, 'homepage brand asset exceeds 300,000 bytes');
});

test('homepage sources never load the documentation-only mascot avatar', () => {
  const homepageFiles = [
    'index.html',
    'src/components/Header.jsx',
    'src/components/Footer.jsx',
    'src/components/CrossDeviceStory/CrossDeviceStory.jsx'
  ];

  for (const relative of homepageFiles) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.doesNotMatch(source, /mascot-avatar\.png/, `${relative} loads the 2.1MB docs avatar`);
    assert.match(source, /\/assets\/mascots\/hoodie\.png/, `${relative} must use the hoodie brand asset`);
  }
});

test('the production verifier enforces the homepage brand asset contract', () => {
  assert.equal(
    typeof staticVerifier.verifyHomepageBrandAssets,
    'function',
    'static verifier must expose a homepage brand asset gate'
  );
  const metrics = staticVerifier.verifyHomepageBrandAssets(root);
  assert.deepEqual(metrics.firstViewportPathBytes, {
    desktopFine: 1_563_340,
    mobileCoarse: 1_490_472,
    desktopReduced: 1_697_477
  });
  for (const [context, bytes] of Object.entries(metrics.firstViewportPathBytes)) {
    assert.ok(bytes <= 1_800_000, `${context} first-viewport images exceed 1,800,000 bytes`);
  }
});

test('the static image verifier reads real JSX tags instead of comments or string decoys', () => {
  const source = `
    // <img loading="lazy" width="1" height="1" />
    const decoy = '<img loading="lazy" width="1" height="1" />';
    export function Image({ copy, visible }) {
      return <img src="/real.png" alt={visible ? copy.label : ''}
        loading="lazy" width="512" height="512" />;
    }
  `;
  const tags = staticVerifier.extractJsxOpeningTags(source, 'img');

  assert.equal(tags.length, 1);
  assert.deepEqual(
    [...staticVerifier.jsxAttributeNames(tags[0])].sort(),
    ['alt', 'height', 'loading', 'src', 'width']
  );
  assert.throws(
    () => staticVerifier.assertImageMetadata('<img src="/missing.png" alt="" />', 'Missing.jsx'),
    /Missing\.jsx.*loading.*width.*height/
  );
});

test('the static image verifier accepts only a quoted lazy loading literal', () => {
  const doubleQuoted = '<img src="/one.png" loading="lazy" width="10" height="10" />';
  const singleQuoted = "<img src='/two.png' loading='lazy' width='10' height='10' />";

  assert.doesNotThrow(() => staticVerifier.assertImageMetadata(doubleQuoted, 'Double.jsx'));
  assert.doesNotThrow(() => staticVerifier.assertImageMetadata(singleQuoted, 'Single.jsx'));
  assert.deepEqual(staticVerifier.jsxAttributes(doubleQuoted).get('loading'), {
    kind: 'literal',
    value: 'lazy'
  });

  for (const [label, loading] of [
    ['Eager.jsx', 'loading="eager"'],
    ['Undefined.jsx', 'loading={undefined}'],
    ['Conditional.jsx', "loading={visible ? 'lazy' : 'eager'}"],
    ['Template.jsx', 'loading=`lazy`'],
    ['Unquoted.jsx', 'loading=lazy'],
    ['Boolean.jsx', 'loading']
  ]) {
    assert.throws(
      () => staticVerifier.assertImageMetadata(
        `<img src="/invalid.png" ${loading} width="10" height="10" />`,
        label
      ),
      new RegExp(`${label.replace('.', '\\.') }.*loading.*literal.*lazy`)
    );
  }
});
