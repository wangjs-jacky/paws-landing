const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const defaultRoot = path.resolve(__dirname, '..');
const mascotIds = ['astro', 'explorer', 'hoodie', 'ninja', 'scientist', 'barista', 'florist'];
const HERO_IMAGE_COMPONENTS = new Set([
  'src/components/Hero.jsx',
  'src/components/MascotLook.jsx'
]);
const HOMEPAGE_BRAND_SOURCE = '/assets/mascots/hoodie.png';
const HOMEPAGE_BRAND_LIMIT = 300_000;
const HOMEPAGE_BRAND_FILES = [
  'index.html',
  'src/components/Header.jsx',
  'src/components/Footer.jsx',
  'src/components/CrossDeviceStory/CrossDeviceStory.jsx'
];
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngDimensions(input) {
  const data = Buffer.from(input);
  assert.ok(data.length >= 24, 'PNG is too short to contain an IHDR chunk');
  assert.ok(data.subarray(0, 8).equals(PNG_SIGNATURE), 'Invalid PNG signature');
  assert.equal(data.toString('ascii', 12, 16), 'IHDR', 'PNG first chunk must be IHDR');
  assert.ok(data.readUInt32BE(8) >= 13, 'PNG IHDR chunk is truncated');
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  assert.ok(width > 0 && height > 0, 'PNG dimensions must be positive');
  return { width, height };
}

function skipQuoted(source, start, quote) {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') {
      index += 1;
    } else if (source[index] === quote) {
      return index + 1;
    }
  }
  return source.length;
}

function skipBalancedExpression(source, start) {
  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' || character === "'" || character === '`') {
      index = skipQuoted(source, index, character) - 1;
    } else if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return source.length;
}

function readJsxOpeningTag(source, start) {
  let expressionDepth = 0;

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' || character === "'" || character === '`') {
      index = skipQuoted(source, index, character) - 1;
    } else if (character === '{') {
      expressionDepth += 1;
    } else if (character === '}') {
      expressionDepth = Math.max(0, expressionDepth - 1);
    } else if (character === '>' && expressionDepth === 0) {
      return index + 1;
    }
  }

  return source.length;
}

function extractJsxOpeningTags(source, tagName) {
  const tags = [];
  const marker = `<${tagName}`;

  for (let index = 0; index < source.length;) {
    if (source.startsWith('//', index)) {
      const newline = source.indexOf('\n', index + 2);
      index = newline === -1 ? source.length : newline + 1;
      continue;
    }
    if (source.startsWith('/*', index)) {
      const commentEnd = source.indexOf('*/', index + 2);
      index = commentEnd === -1 ? source.length : commentEnd + 2;
      continue;
    }
    if (source[index] === '"' || source[index] === "'" || source[index] === '`') {
      index = skipQuoted(source, index, source[index]);
      continue;
    }
    if (source.startsWith(marker, index)) {
      const boundary = source[index + marker.length];
      if (boundary === '>' || boundary === '/' || /\s/.test(boundary ?? '')) {
        const end = readJsxOpeningTag(source, index);
        tags.push(source.slice(index, end));
        index = end;
        continue;
      }
    }
    index += 1;
  }

  return tags;
}

function jsxAttributes(openingTag) {
  const attributes = new Map();
  let index = openingTag.indexOf('img') + 3;

  while (index < openingTag.length) {
    while (/\s/.test(openingTag[index] ?? '')) index += 1;
    if (openingTag[index] === '>' || openingTag[index] === '/') break;
    if (openingTag[index] === '{') {
      index = skipBalancedExpression(openingTag, index);
      continue;
    }

    const start = index;
    while (/[A-Za-z0-9_:.-]/.test(openingTag[index] ?? '')) index += 1;
    if (start === index) {
      index += 1;
      continue;
    }
    const name = openingTag.slice(start, index);

    while (/\s/.test(openingTag[index] ?? '')) index += 1;
    if (openingTag[index] !== '=') {
      attributes.set(name, { kind: 'boolean', value: true });
      continue;
    }
    index += 1;
    while (/\s/.test(openingTag[index] ?? '')) index += 1;

    if (openingTag[index] === '"' || openingTag[index] === "'") {
      const valueStart = index + 1;
      const nextIndex = skipQuoted(openingTag, index, openingTag[index]);
      attributes.set(name, { kind: 'literal', value: openingTag.slice(valueStart, nextIndex - 1) });
      index = nextIndex;
    } else if (openingTag[index] === '`') {
      const valueStart = index + 1;
      const nextIndex = skipQuoted(openingTag, index, openingTag[index]);
      attributes.set(name, { kind: 'template', value: openingTag.slice(valueStart, nextIndex - 1) });
      index = nextIndex;
    } else if (openingTag[index] === '{') {
      const valueStart = index + 1;
      const nextIndex = skipBalancedExpression(openingTag, index);
      attributes.set(name, { kind: 'expression', value: openingTag.slice(valueStart, nextIndex - 1) });
      index = nextIndex;
    } else {
      const valueStart = index;
      while (!/[\s/>]/.test(openingTag[index] ?? '>')) index += 1;
      attributes.set(name, { kind: 'unquoted', value: openingTag.slice(valueStart, index) });
    }
  }

  return attributes;
}

function jsxAttributeNames(openingTag) {
  return new Set(jsxAttributes(openingTag).keys());
}

function assertImageMetadata(source, fileLabel) {
  const tags = extractJsxOpeningTags(source, 'img');
  const requiredAttributes = ['loading', 'width', 'height'];

  tags.forEach((tag, index) => {
    const attributes = jsxAttributes(tag);
    const names = new Set(attributes.keys());
    const missing = requiredAttributes.filter(attribute => !names.has(attribute));
    assert.equal(
      missing.length,
      0,
      `${fileLabel} img #${index + 1} is missing required attributes: ${missing.join(', ')}`
    );
    const loading = attributes.get('loading');
    assert.ok(
      loading.kind === 'literal' && loading.value === 'lazy',
      `${fileLabel} img #${index + 1} loading must be the quoted literal "lazy"`
    );
  });

  return tags.length;
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

function verifyNonHeroImageMetadata(root) {
  const sourceRoot = path.join(root, 'src');
  let imageCount = 0;

  for (const absolute of listFiles(sourceRoot).filter(file => file.endsWith('.jsx'))) {
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (HERO_IMAGE_COMPONENTS.has(relative)) continue;
    imageCount += assertImageMetadata(fs.readFileSync(absolute, 'utf8'), relative);
  }

  assert.ok(imageCount > 0, 'No non-Hero JSX images were verified');
  return imageCount;
}

function verifyHomepageBrandAssets(root = defaultRoot) {
  for (const relative of HOMEPAGE_BRAND_FILES) {
    const source = fs.readFileSync(path.join(root, relative), 'utf8');
    assert.ok(!source.includes('mascot-avatar.png'), `${relative} loads the documentation avatar`);
    assert.ok(source.includes(HOMEPAGE_BRAND_SOURCE), `${relative} does not use the hoodie brand asset`);
  }

  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const document = new JSDOM(home).window.document;
  const icon = document.querySelector('link[rel~="icon"]');
  assert.equal(icon?.getAttribute('href'), HOMEPAGE_BRAND_SOURCE, 'Unexpected homepage favicon');

  const brandPath = path.join(root, 'public', HOMEPAGE_BRAND_SOURCE.slice(1));
  assert.ok(fs.existsSync(brandPath), `Missing homepage brand asset: ${HOMEPAGE_BRAND_SOURCE}`);
  const brandBytes = fs.statSync(brandPath).size;
  assert.ok(brandBytes <= HOMEPAGE_BRAND_LIMIT, `Homepage brand exceeds ${HOMEPAGE_BRAND_LIMIT} bytes`);
  assert.deepEqual(
    readPngDimensions(fs.readFileSync(brandPath)),
    { width: 512, height: 512 },
    'Homepage brand must be exactly 512x512'
  );

  const docsAvatarBytes = fs.statSync(path.join(root, 'public/assets/mascot-avatar.png')).size;

  return {
    brandBytes,
    docsAvatarBytes,
    savedBrandBytes: docsAvatarBytes - brandBytes
  };
}

function verifyStatic(root = defaultRoot) {
  const homepageBrand = verifyHomepageBrandAssets(root);
  const required = [
    'dist/index.html',
    'dist/docs.html',
    'dist/docs/zh-CN.html',
    'dist/assets/docs-controls.js',
    'dist/assets/docs-controls.css',
    'dist/assets/mascot-avatar.png',
    'dist/assets/mascot-hero.png',
    'dist/assets/mascot-static.png',
    'dist/assets/mascot-turn-atlas.webp',
    ...mascotIds.map(id => `dist/assets/mascots/${id}.png`)
  ];

  for (const relative of required) {
    assert.ok(fs.existsSync(path.join(root, relative)), `Missing production file: ${relative}`);
  }

  const atlasPath = path.join(root, 'dist/assets/mascot-turn-atlas.webp');
  const heroStillPaths = [
    path.join(root, 'dist/assets/mascot-static.png'),
    path.join(root, 'dist/assets/mascot-hero.png')
  ];
  assert.ok(fs.statSync(atlasPath).size <= 3_145_728, 'Hero atlas exceeds 3,145,728 bytes');
  for (const stillPath of heroStillPaths) {
    assert.ok(
      fs.statSync(stillPath).size <= 1_800_000,
      `${path.basename(stillPath)} exceeds 1,800,000 bytes`
    );
  }

  const home = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  assert.ok(home.includes('id="root"'), 'React root is missing from dist/index.html');
  assert.ok(!home.toLowerCase().includes('cdn.jsdelivr.net'), 'dist/index.html uses jsDelivr');

  const document = new JSDOM(home).window.document;
  assert.equal(
    document.querySelector('link[rel~="icon"]')?.getAttribute('href'),
    HOMEPAGE_BRAND_SOURCE,
    'Production homepage favicon does not use the hoodie asset'
  );
  const remoteScripts = [...document.querySelectorAll('script[src]')]
    .map(script => script.getAttribute('src'))
    .filter(source => /^(?:https?:)?\/\//i.test(source));
  assert.deepEqual(remoteScripts, [], `Remote production scripts are not allowed: ${remoteScripts.join(', ')}`);

  const assetFiles = fs.readdirSync(path.join(root, 'dist/assets'));
  const javascript = assetFiles
    .filter(name => name.endsWith('.js'))
    .map(name => fs.readFileSync(path.join(root, 'dist/assets', name), 'utf8'))
    .join('\n');
  assert.ok(!javascript.includes('mascot-avatar.png'), 'Production homepage bundle loads docs avatar');
  assert.ok(javascript.includes(HOMEPAGE_BRAND_SOURCE), 'Production bundle misses hoodie brand asset');

  const builtBrandPath = path.join(root, 'dist', HOMEPAGE_BRAND_SOURCE.slice(1));
  assert.ok(fs.existsSync(builtBrandPath), 'Production homepage brand asset is missing');
  assert.ok(
    fs.statSync(builtBrandPath).size <= HOMEPAGE_BRAND_LIMIT,
    `Production homepage brand exceeds ${HOMEPAGE_BRAND_LIMIT} bytes`
  );

  for (const marker of ['Your coding agents. Within reach.', '让你的编程智能体，随时触手可及。']) {
    assert.ok(javascript.includes(marker), `Missing localized bundle marker: ${marker}`);
  }
  for (const marker of ['gsap', 'ScrollTrigger', 'GreenSock']) {
    assert.ok(javascript.includes(marker), `Local production bundle is missing GSAP marker: ${marker}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(packageJson.dependencies.gsap, '3.13.0', 'GSAP must remain fixed and local');
  assert.equal(packageJson.dependencies['@gsap/react'], '2.1.2', '@gsap/react must remain fixed and local');

  const imageCount = verifyNonHeroImageMetadata(root);
  console.log(
    `Verified ${required.length} production files, ${imageCount} non-Hero JSX images, `
    + `${homepageBrand.brandBytes}-byte homepage brand `
    + `(saves ${homepageBrand.savedBrandBytes} bytes versus docs avatar)`
  );
}

module.exports = {
  assertImageMetadata,
  extractJsxOpeningTags,
  jsxAttributes,
  jsxAttributeNames,
  readPngDimensions,
  verifyHomepageBrandAssets,
  verifyNonHeroImageMetadata,
  verifyStatic
};

if (require.main === module) verifyStatic();
