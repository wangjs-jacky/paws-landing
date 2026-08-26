const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function loadControls() {
  try {
    return require(path.join(__dirname, '..', 'public', 'assets', 'docs-controls.js'));
  } catch {
    return {};
  }
}

const controls = loadControls();

test('saved theme wins over the system preference', () => {
  assert.equal(typeof controls.resolveTheme, 'function');
  assert.equal(controls.resolveTheme('light', true), 'light');
  assert.equal(controls.resolveTheme('dark', false), 'dark');
});

test('system preference is used when no valid theme is saved', () => {
  assert.equal(typeof controls.resolveTheme, 'function');
  assert.equal(controls.resolveTheme(null, true), 'dark');
  assert.equal(controls.resolveTheme('unexpected', false), 'light');
});

test('theme toggle always selects the opposite theme', () => {
  assert.equal(typeof controls.nextTheme, 'function');
  assert.equal(controls.nextTheme('dark'), 'light');
  assert.equal(controls.nextTheme('light'), 'dark');
});

test('language switch keeps the current documentation section', () => {
  assert.equal(typeof controls.withCurrentHash, 'function');
  assert.equal(controls.withCurrentHash('docs/zh-CN.html', '#daemon'), 'docs/zh-CN.html#daemon');
  assert.equal(controls.withCurrentHash('../docs.html', ''), '../docs.html');
});
