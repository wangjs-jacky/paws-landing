const IMAGE_PATH_PATTERN = /\.(?:png|jpe?g|webp|avif|svg|ico)$/i;

export function isImageAssetUrl(value, baseUrl) {
  try {
    return IMAGE_PATH_PATTERN.test(new URL(value, baseUrl).pathname);
  } catch {
    return false;
  }
}

export function summarizeImageResources(
  resourceEntries,
  { pageOrigin, responseContentLengths = new Map() } = {}
) {
  const normalizedPageOrigin = new URL(pageOrigin).origin;
  const resourcesByUrl = new Map();

  for (const entry of resourceEntries) {
    if (!isImageAssetUrl(entry.name, normalizedPageOrigin)) continue;
    const url = new URL(entry.name, normalizedPageOrigin).href;
    const encodedBodySize = Number(entry.encodedBodySize);
    const previous = resourcesByUrl.get(url) ?? 0;
    resourcesByUrl.set(
      url,
      Number.isFinite(encodedBodySize) ? Math.max(previous, encodedBodySize) : previous
    );
  }

  const resources = [...resourcesByUrl.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([url, encodedBodySize]) => {
      let bytes = encodedBodySize;
      if (bytes <= 0) {
        if (new URL(url).origin !== normalizedPageOrigin) {
          throw new Error(`${new URL(url).pathname} cannot use a cross-origin Content-Length fallback`);
        }
        bytes = Number(responseContentLengths.get(url));
      }
      if (!Number.isFinite(bytes) || bytes <= 0) {
        throw new Error(`${new URL(url).pathname} has no positive byte size`);
      }
      return { url, pathname: new URL(url).pathname, bytes };
    });

  return {
    totalBytes: resources.reduce((total, resource) => total + resource.bytes, 0),
    resources
  };
}

export async function waitForImageRequestQuiescence(
  page,
  { pageOrigin, idleMs = 1_500, maxWaitMs = 8_000, pollMs = 100 } = {}
) {
  const normalizedPageOrigin = new URL(pageOrigin).origin;
  if (idleMs < 1_500) throw new RangeError('image idle window must be at least 1500ms');
  if (maxWaitMs <= idleMs) throw new RangeError('image quiescence max wait must exceed the idle window');
  if (pollMs <= 0) throw new RangeError('image quiescence poll interval must be positive');

  const startedAt = Date.now();
  let lastChangeAt = startedAt;
  let previousSignature;

  while (Date.now() - startedAt <= maxWaitMs) {
    const resourceEntries = await page.evaluate(() => performance.getEntriesByType('resource')
      .map(entry => ({ name: entry.name, encodedBodySize: entry.encodedBodySize })));
    const signature = resourceEntries
      .filter(entry => isImageAssetUrl(entry.name, normalizedPageOrigin))
      .map(entry => `${new URL(entry.name, normalizedPageOrigin).href}:${Number(entry.encodedBodySize)}`)
      .sort()
      .join('\n');
    const now = Date.now();

    if (signature !== previousSignature) {
      previousSignature = signature;
      lastChangeAt = now;
    } else if (now - lastChangeAt >= idleMs) {
      return resourceEntries;
    }

    const remaining = maxWaitMs - (now - startedAt);
    if (remaining <= 0) break;
    await page.waitForTimeout(Math.min(pollMs, remaining));
  }

  throw new Error(`image resources did not become quiescent within ${maxWaitMs}ms`);
}
