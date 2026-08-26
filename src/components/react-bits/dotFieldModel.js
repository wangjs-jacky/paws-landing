export function selectDotFieldMode({ reducedMotion, coarsePointer, saveData, width }) {
  if (reducedMotion) return 'static';
  if (coarsePointer || saveData || width < 768) return 'ambient';
  return 'interactive';
}

export function buildDotGrid(width, height, spacing) {
  if (![width, height, spacing].every(Number.isFinite) || width <= 0 || height <= 0 || spacing <= 0) {
    return [];
  }

  const columns = Math.floor(width / spacing);
  const rows = Math.floor(height / spacing);
  const offsetX = (width - (columns - 1) * spacing) / 2;
  const offsetY = (height - (rows - 1) * spacing) / 2;
  const dots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const ax = offsetX + column * spacing;
      const ay = offsetY + row * spacing;
      dots.push({ ax, ay, x: ax, y: ay, vx: 0, vy: 0 });
    }
  }

  return dots;
}
