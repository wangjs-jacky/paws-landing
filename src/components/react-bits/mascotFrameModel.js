const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function pointerRatio(clientX, rect) {
  if (!rect.width) return 0;
  return clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
}

export function ratioToFrame(ratio, frameCount) {
  return Math.round(((clamp(ratio, -1, 1) + 1) / 2) * (frameCount - 1));
}

export function easeFrame(current, target, factor = 0.22) {
  return Math.abs(target - current) < 0.05 ? target : current + (target - current) * factor;
}
