const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github/workflows/deploy-cloudflare-pages.yml');
const workflowSource = fs.readFileSync(workflowPath, 'utf8');

const requiredPaths = [
  'src/**',
  'public/**',
  'scripts/**',
  'tests/**',
  'e2e/**',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'playwright.config.js',
  '.github/workflows/deploy-cloudflare-pages.yml'
];

const exactStepNames = [
  'Check out repository',
  'Set up Node.js',
  'Install dependencies',
  'Test and build',
  'Install Playwright browser',
  'Run browser tests against dist',
  'Validate installer artifact',
  'Check deployment credentials',
  'Deploy to Cloudflare Pages',
  'Verify production site'
];

function parseWorkflow(source) {
  const document = YAML.parseDocument(source, { prettyErrors: true });
  assert.deepEqual(
    document.errors.map(error => error.message),
    [],
    'workflow must be valid YAML'
  );
  assert.ok(document.getIn(['on'], true), 'YAML 1.2 parser must preserve the literal on key');
  assert.equal(document.getIn([true], true), undefined, 'on must not be parsed as boolean true');
  return document;
}

function watchedPaths(document) {
  const pathsNode = document.getIn(['on', 'push', 'paths'], true);
  assert.ok(YAML.isSeq(pathsNode), 'on.push.paths must be a YAML sequence');
  return pathsNode.items.map(item => item.value);
}

function deploySteps(document) {
  const stepsNode = document.getIn(['jobs', 'deploy', 'steps'], true);
  assert.ok(YAML.isSeq(stepsNode), 'jobs.deploy.steps must be a YAML sequence');
  return stepsNode.items.map(item => item.toJSON());
}

function assertWatchedPaths(document) {
  const actualPaths = watchedPaths(document);
  for (const requiredPath of requiredPaths) {
    assert.ok(
      actualPaths.some(actualPath => actualPath === requiredPath),
      `Cloudflare workflow does not watch ${requiredPath}`
    );
  }
  assert.equal(
    actualPaths.length,
    new Set(actualPaths).size,
    'on.push.paths must not contain duplicates'
  );
  assert.deepEqual(
    [...actualPaths].sort(),
    [...requiredPaths].sort(),
    'on.push.paths must be the exact required set'
  );
}

function assertExactJobs(document) {
  const jobsNode = document.getIn(['jobs'], true);
  assert.ok(YAML.isMap(jobsNode), 'workflow jobs must be a YAML mapping');
  assert.deepEqual(
    jobsNode.items.map(pair => pair.key.value),
    ['deploy'],
    'workflow jobs must be exactly deploy'
  );
}

function assertExactSteps(document) {
  const steps = deploySteps(document);
  assert.deepEqual(
    steps.map(step => step.name),
    exactStepNames,
    'deploy step names must be exact and unique'
  );
}

function assertProductionRefGuard(document) {
  assert.equal(
    document.getIn(['jobs', 'deploy', 'if']),
    "github.ref == 'refs/heads/main'",
    'deploy job must allow only the main branch ref'
  );
}

function namedStep(document, name) {
  const step = deploySteps(document).find(candidate => candidate.name === name);
  assert.ok(step, `Missing workflow step: ${name}`);
  return step;
}

function executableShell(run) {
  return run
    .split('\n')
    .filter(line => !line.trimStart().startsWith('#'))
    .join('\n');
}

function normalizedShell(run) {
  return executableShell(run)
    .trim()
    .replace(/\\\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ');
}

function secretReferences(value) {
  return [...JSON.stringify(value).matchAll(/\$\{\{\s*secrets\.[^}]+\}\}/g)]
    .map(match => match[0]);
}

function assertSecretScope(document) {
  const deployJob = document.getIn(['jobs', 'deploy']).toJSON();
  const expectedEnv = {
    CLOUDFLARE_API_TOKEN: '${{ secrets.CLOUDFLARE_API_TOKEN }}',
    CLOUDFLARE_ACCOUNT_ID: '${{ secrets.CLOUDFLARE_ACCOUNT_ID }}'
  };
  const authorizedSteps = new Set(['Check deployment credentials', 'Deploy to Cloudflare Pages']);
  const jobWithoutSteps = { ...deployJob };
  delete jobWithoutSteps.steps;

  assert.equal(deployJob.env, undefined, 'deploy job must not expose secrets through job env');
  assert.deepEqual(secretReferences(jobWithoutSteps), [], 'deploy job secret reference is forbidden');

  for (const step of deployJob.steps) {
    const references = secretReferences(step);
    if (!authorizedSteps.has(step.name)) {
      assert.deepEqual(references, [], `${step.name} secret reference is forbidden`);
      continue;
    }

    assert.deepEqual(
      Object.keys(step.env ?? {}).sort(),
      Object.keys(expectedEnv).sort(),
      `${step.name} secret env keys must be exact`
    );
    assert.deepEqual(step.env, expectedEnv, `${step.name} secret expressions must be exact`);
    assert.deepEqual(
      references.sort(),
      Object.values(expectedEnv).sort(),
      `${step.name} must reference each approved secret exactly once`
    );
  }
}

function assertWorkflowContract(source) {
  const document = parseWorkflow(source);
  const workflow = document.toJS();
  assert.ok(Object.hasOwn(workflow, 'on'), 'workflow must expose an on mapping');
  assertWatchedPaths(document);
  assertExactJobs(document);
  assertExactSteps(document);
  assertProductionRefGuard(document);
  assertSecretScope(document);

  assert.equal(namedStep(document, 'Check out repository').uses, 'actions/checkout@v4');
  assert.equal(namedStep(document, 'Set up Node.js').uses, 'actions/setup-node@v4');
  assert.deepEqual(namedStep(document, 'Set up Node.js').with, { 'node-version': 22 });

  assert.equal(namedStep(document, 'Install dependencies').run, 'npm ci');
  assert.equal(namedStep(document, 'Test and build').run, 'npm run check');
  assert.equal(
    namedStep(document, 'Install Playwright browser').run,
    'npx playwright install --with-deps chromium'
  );
  assert.equal(
    namedStep(document, 'Run browser tests against dist').run,
    'npm run test:e2e',
    'Run browser tests against dist must execute npm run test:e2e'
  );

  const installerGate = executableShell(namedStep(document, 'Validate installer artifact').run);
  assert.match(installerGate, /test -f dist\/install\.sh/);
  assert.match(installerGate, /file --brief --mime-type dist\/install\.sh/);
  assert.match(installerGate, /text\/html/);
  assert.match(installerGate, /head -n 1 dist\/install\.sh \| grep .*['"]\^#!['"]/);

  const deploy = normalizedShell(namedStep(document, 'Deploy to Cloudflare Pages').run);
  assert.equal(
    deploy,
    'npx --yes wrangler@4.105.0 pages deploy dist --project-name paws-landing --branch main '
      + '--commit-hash "$GITHUB_SHA" --commit-message "GitHub Actions deployment" '
      + '--commit-dirty=false',
    'Wrangler run block must be exact'
  );

  const verify = executableShell(namedStep(document, 'Verify production site').run);
  assert.match(verify, /verify_exact_artifact/);
  assert.match(
    verify,
    /verify_exact_artifact "homepage" "\$\{production_origin\}\/" "dist\/index\.html"/
  );
  assert.match(
    verify,
    /verify_exact_artifact "hero-atlas" "\$\{production_origin\}\/assets\/mascot-turn-atlas\.webp" \\\n\s+"dist\/assets\/mascot-turn-atlas\.webp"/
  );
  assert.match(verify, /verify_installer/);
  assert.match(verify, /text\/html/);
  assert.match(verify, /head -n 1 .* \| grep .*['"]\^#!['"]/);
  assert.match(
    verify,
    /verify_installer "\$\{production_origin\}\/install\.sh" "dist\/install\.sh"/
  );

  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.match(packageJson.scripts.check, /(?:^|&&\s*)npm run build(?:\s*&&|$)/);
  assert.equal(packageJson.devDependencies.yaml, '2.9.0');
}

test('production deploy is structurally gated before Cloudflare publication', () => {
  assertWorkflowContract(workflowSource);
});

test('workflow dispatch from a non-main ref cannot publish as production main', () => {
  const unguardedDispatchDocument = parseWorkflow(workflowSource);
  unguardedDispatchDocument.setIn(
    ['jobs', 'deploy', 'if'],
    "github.event_name == 'push' || github.event_name == 'workflow_dispatch'"
  );

  assert.throws(
    () => assertWorkflowContract(unguardedDispatchDocument.toString()),
    /deploy job must allow only the main branch ref/
  );
});

test('a second unguarded deployment job cannot bypass the production contract', () => {
  const shadowDeployDocument = parseWorkflow(workflowSource);
  const jobsNode = shadowDeployDocument.getIn(['jobs'], true);
  const shadowDeployJob = jobsNode.get('deploy').toJSON();
  delete shadowDeployJob.if;
  jobsNode.set('shadow-deploy', shadowDeployDocument.createNode(shadowDeployJob));

  assert.throws(
    () => assertWorkflowContract(shadowDeployDocument.toString()),
    /workflow jobs must be exactly deploy/
  );
});

test('YAML comments cannot fake watched paths or executable steps', () => {
  const missingPathDocument = parseWorkflow(workflowSource);
  const pathsNode = missingPathDocument.getIn(['on', 'push', 'paths'], true);
  pathsNode.items = pathsNode.items.filter(item => item.value !== 'e2e/**');
  const fakePathComment = `# - "e2e/**"\n${missingPathDocument.toString()}`;
  assert.throws(
    () => assertWatchedPaths(parseWorkflow(fakePathComment)),
    /does not watch e2e\/\*\*/
  );

  const commentedCommandDocument = parseWorkflow(workflowSource);
  const stepsNode = commentedCommandDocument.getIn(['jobs', 'deploy', 'steps'], true);
  const browserStep = stepsNode.items.find(step => step.get('name') === 'Run browser tests against dist');
  browserStep.set('run', '# npm run test:e2e');
  assert.throws(
    () => assertWorkflowContract(commentedCommandDocument.toString()),
    /must execute npm run test:e2e/
  );
});

test('Cloudflare secrets remain scoped to credential and deploy steps in the YAML AST', () => {
  const document = parseWorkflow(workflowSource);
  assert.doesNotThrow(() => assertSecretScope(document));
});

test('a duplicate early credential/deploy pair cannot bypass step ordering', () => {
  const duplicateDocument = parseWorkflow(workflowSource);
  const duplicateSteps = duplicateDocument.getIn(['jobs', 'deploy', 'steps'], true);
  const credentialStep = duplicateSteps.items
    .find(step => step.get('name') === 'Check deployment credentials').toJSON();
  const deployStep = duplicateSteps.items
    .find(step => step.get('name') === 'Deploy to Cloudflare Pages').toJSON();
  duplicateSteps.items.splice(
    2,
    0,
    duplicateDocument.createNode(credentialStep),
    duplicateDocument.createNode(deployStep)
  );
  assert.throws(
    () => assertWorkflowContract(duplicateDocument.toString()),
    /step names must be exact and unique/
  );
});

test('an extra Wrangler argument cannot bypass the exact deploy command', () => {
  const extraArgumentDocument = parseWorkflow(workflowSource);
  const extraArgumentSteps = extraArgumentDocument.getIn(['jobs', 'deploy', 'steps'], true);
  const extraArgumentDeploy = extraArgumentSteps.items
    .find(step => step.get('name') === 'Deploy to Cloudflare Pages');
  extraArgumentDeploy.set('run', `${extraArgumentDeploy.get('run').trimEnd()} \\\n+  --dry-run\n`);
  assert.throws(
    () => assertWorkflowContract(extraArgumentDocument.toString()),
    /Wrangler run block must be exact/
  );
});

test('an arbitrary direct secret reference cannot bypass step scoping', () => {
  const secretLeakDocument = parseWorkflow(workflowSource);
  const secretLeakSteps = secretLeakDocument.getIn(['jobs', 'deploy', 'steps'], true);
  const installerStep = secretLeakSteps.items
    .find(step => step.get('name') === 'Validate installer artifact');
  installerStep.set('env', secretLeakDocument.createNode({
    ARBITRARY_SECRET: '${{ secrets.ARBITRARY_SECRET }}'
  }));
  assert.throws(
    () => assertWorkflowContract(secretLeakDocument.toString()),
    /secret reference is forbidden/
  );
});
