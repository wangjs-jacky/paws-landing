const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const script = fs.readFileSync(
  path.resolve(__dirname, '../scripts/build-mascot-atlas.sh'),
  'utf8'
);

test('mascot atlas builder preflights Pillow WebP alpha support before extraction', () => {
  const preflight = script.indexOf('Pillow WebP alpha round-trip failed');
  const extraction = script.indexOf('ffmpeg -v error');

  assert.notEqual(preflight, -1);
  assert.notEqual(script.indexOf('features.check("webp")'), -1);
  assert.ok(preflight < extraction);
});

test('mascot atlas builder applies reproducible green despill before tiling', () => {
  const despill = script.indexOf('DESPILL_GREEN_DOMINANCE_THRESHOLD = 16');
  const tile = script.indexOf('tile=6x4');

  assert.notEqual(despill, -1);
  assert.notEqual(script.indexOf('green - neutral_anchor > DESPILL_GREEN_DOMINANCE_THRESHOLD'), -1);
  assert.notEqual(script.indexOf('green = max(0, neutral_anchor - 1)'), -1);
  assert.notEqual(script.indexOf('ALPHA_TRANSPARENT_THRESHOLD = 16'), -1);
  assert.notEqual(script.indexOf('ALPHA_OPAQUE_THRESHOLD = 96'), -1);
  assert.notEqual(script.indexOf('alpha = 255'), -1);
  assert.ok(despill < tile);
});

test('mascot atlas builder rejects a closed-eye center frame', () => {
  for (const marker of [
    'CENTER_FRAME_NUMBER = 13',
    'EYE_CROP = (405, 165, 490, 240)',
    'EYE_DARK_MAX_CHANNEL = 75',
    'EYE_PUPIL_MIN_PIXELS = 100',
    'center frame open-eye pupil proxy failed'
  ]) {
    assert.ok(script.includes(marker), marker);
  }
});

test('mascot atlas builder keeps the fixed runtime asset contract', () => {
  for (const marker of [
    'normalized_duration=4.00',
    'MASCOT_FRAME_TIMES',
    'expected exactly 24 comma-separated frame times',
    'fps=6',
    '-frames:v 24',
    'chromakey=0x2acf58:0.18:0.08',
    'scale=1024:1024',
    'pad=1024:1024',
    'tile=6x4',
    '6144',
    '4096',
    '1024px cells',
    'quality=84',
    '3145728'
  ]) {
    assert.ok(script.includes(marker), marker);
  }
});
