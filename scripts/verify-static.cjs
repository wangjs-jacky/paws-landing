const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = [
  'dist/index.html',
  'dist/docs.html',
  'dist/docs/zh-CN.html',
  'dist/assets/docs-controls.js',
  'dist/assets/docs-controls.css',
  'dist/assets/mascot-avatar.png',
  'dist/assets/mascot-hero.png'
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Missing production file: ${relative}`);
  }
}

const home = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
if (!home.includes('id="root"')) throw new Error('React root is missing from dist/index.html');

const assetFiles = fs.readdirSync(path.join(root, 'dist/assets'));
const javascript = assetFiles
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(root, 'dist/assets', name), 'utf8'))
  .join('\n');

for (const marker of ['Your coding agents. Within reach.', '让你的编程智能体，随时触手可及。']) {
  if (!javascript.includes(marker)) throw new Error(`Missing localized bundle marker: ${marker}`);
}

console.log(`Verified ${required.length} production files`);
