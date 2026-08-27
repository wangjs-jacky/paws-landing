const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const mascotIds = ['astro', 'explorer', 'hoodie', 'ninja', 'scientist', 'barista', 'florist'];

test('the approved Paws Crew images are public and registered by stable ID', () => {
  for (const id of mascotIds) {
    const relative = `public/assets/mascots/${id}.png`;
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative);
  }

  const registry = fs.readFileSync(
    path.join(root, 'src/components/MascotCrew/mascotRegistry.js'),
    'utf8'
  );

  for (const id of mascotIds) {
    assert.match(registry, new RegExp(`/assets/mascots/\\$\\{id\\}\\.png|/assets/mascots/${id}\\.png`));
  }

  const staticVerifier = fs.readFileSync(path.join(root, 'scripts/verify-static.cjs'), 'utf8');
  for (const id of mascotIds) {
    assert.match(
      staticVerifier,
      new RegExp(`dist/assets/mascots/\\$\\{id\\}\\.png|dist/assets/mascots/${id}\\.png`)
    );
  }
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
