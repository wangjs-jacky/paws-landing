const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

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

test('deployment secrets are scoped only to credential and deploy steps', () => {
  const workflow = fs.readFileSync(
    path.join(root, '.github/workflows/deploy-cloudflare-pages.yml'),
    'utf8'
  );
  const workflowWithSentinel = `${workflow}\n      - name: __END__\n`;
  const steps = [...workflowWithSentinel.matchAll(/^      - name: (.+)\n([\s\S]*?)(?=^      - name: )/gm)]
    .reduce((entries, match) => ({ ...entries, [match[1]]: match[2] }), {});
  const secretNames = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
  const authorizedSteps = new Set(['Check deployment credentials', 'Deploy to Cloudflare Pages']);

  for (const [stepName, stepBody] of Object.entries(steps)) {
    if (stepName === '__END__') continue;
    for (const secretName of secretNames) {
      assert.equal(stepBody.includes(secretName), authorizedSteps.has(stepName), stepName);
    }
  }

  const jobConfiguration = workflow.slice(workflow.indexOf('jobs:'), workflow.indexOf('    steps:'));
  for (const name of secretNames) assert.equal(jobConfiguration.includes(name), false);
});
