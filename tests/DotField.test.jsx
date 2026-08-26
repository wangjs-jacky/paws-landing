import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import DotField from '../src/components/react-bits/DotField';
import { buildDotGrid, selectDotFieldMode } from '../src/components/react-bits/dotFieldModel';

it('selects an animation mode appropriate to the device', () => {
  expect(selectDotFieldMode({ reducedMotion: true, coarsePointer: false, saveData: false, width: 1440 })).toBe('static');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: true, saveData: false, width: 390 })).toBe('ambient');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: false, saveData: true, width: 1440 })).toBe('ambient');
  expect(selectDotFieldMode({ reducedMotion: false, coarsePointer: false, saveData: false, width: 1440 })).toBe('interactive');
});

it('builds a deterministic finite dot grid', () => {
  const dots = buildDotGrid(100, 60, 20);
  expect(dots.length).toBe(15);
  expect(dots.every(dot => Number.isFinite(dot.ax) && dot.x === dot.ax)).toBe(true);
});

it('renders a decorative canvas and CSS fallback', () => {
  const { container } = render(<DotField theme="dark" />);
  expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  expect(container.querySelector('canvas')).toBeTruthy();
  expect(container.querySelector('.dot-field-fallback')).toBeTruthy();
});
