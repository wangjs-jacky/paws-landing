const IMAGE_PATH_PATTERN = /\.(?:png|jpe?g|webp|avif|svg|ico)$/i;

export function isImageAssetUrl(value) {
  try {
    return IMAGE_PATH_PATTERN.test(new URL(value).pathname);
  } catch {
    return false;
  }
}

export function summarizeImageResources(resourceEntries, responseContentLengths = new Map()) {
  const resourcesByUrl = new Map();

  for (const entry of resourceEntries) {
    if (!isImageAssetUrl(entry.name)) continue;
    const url = new URL(entry.name).href;
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
      const fallbackSize = Number(responseContentLengths.get(url));
      const bytes = encodedBodySize > 0 ? encodedBodySize : fallbackSize;
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
