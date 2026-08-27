import { describe, expect, it } from 'vitest';
import { easeFrame, pointerRatio, ratioToFrame } from '../src/components/react-bits/mascotFrameModel';

describe('pointerRatio', () => {
  it.each([
    [0, -1],
    [50, 0],
    [100, 1],
    [-20, -1],
    [120, 1]
  ])('maps visible pointer x=%s to the clamped ratio %s', (clientX, expected) => {
    expect(pointerRatio(clientX, { left: 0, width: 100 })).toBe(expected);
  });

  it('centers a pointer ratio when the surface has no width', () => {
    expect(pointerRatio(50, { left: 0, width: 0 })).toBe(0);
  });
});

describe('ratioToFrame', () => {
  it.each([
    [-1, 0],
    [0, 12],
    [1, 23],
    [-2, 0],
    [2, 23]
  ])('maps ratio %s to frame %s in a 24-frame atlas', (ratio, expected) => {
    expect(ratioToFrame(ratio, 24)).toBe(expected);
  });
});

describe('easeFrame', () => {
  it('moves one easing step toward the target', () => {
    expect(easeFrame(0, 23, 0.25)).toBeCloseTo(5.75);
  });

  it('parks exactly at the target inside the threshold', () => {
    expect(easeFrame(11.96, 12)).toBe(12);
  });
});
