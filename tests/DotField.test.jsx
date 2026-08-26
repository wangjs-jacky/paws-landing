import { act, render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import DotField from '../src/components/react-bits/DotField';
import { buildDotGrid, selectDotFieldMode } from '../src/components/react-bits/dotFieldModel';

function createChangeSource(initialMatches = false) {
  let matches = initialMatches;
  const listeners = new Set();

  return {
    get matches() { return matches; },
    media: '',
    onchange: null,
    addEventListener: (type, listener) => { if (type === 'change') listeners.add(listener); },
    removeEventListener: (type, listener) => { if (type === 'change') listeners.delete(listener); },
    addListener: listener => listeners.add(listener),
    removeListener: listener => listeners.delete(listener),
    dispatchEvent: () => true,
    emit(nextMatches) {
      matches = nextMatches;
      listeners.forEach(listener => listener({ matches }));
    },
    listeners
  };
}

function installCapabilityHarness() {
  const reducedMotion = createChangeSource(false);
  const coarsePointer = createChangeSource(false);
  const connectionListeners = new Set();
  const connection = {
    saveData: false,
    downlink: 10,
    effectiveType: '4g',
    onchange: null,
    rtt: 50,
    type: 'wifi',
    addEventListener: (type, listener) => { if (type === 'change') connectionListeners.add(listener); },
    removeEventListener: (type, listener) => { if (type === 'change') connectionListeners.delete(listener); },
    emit() { connectionListeners.forEach(listener => listener()); }
  };
  const originalMatchMedia = window.matchMedia;
  const originalConnection = Object.getOwnPropertyDescriptor(navigator, 'connection');
  const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1440,
    height: 900,
    left: 0,
    top: 0,
    right: 1440,
    bottom: 900,
    x: 0,
    y: 0,
    toJSON: () => ({})
  });

  window.matchMedia = vi.fn(query => query.includes('prefers-reduced-motion') ? reducedMotion : coarsePointer);
  Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  HTMLCanvasElement.prototype.getContext.mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    moveTo: vi.fn(),
    setTransform: vi.fn()
  });

  return {
    reducedMotion,
    coarsePointer,
    connection,
    connectionListeners,
    restore() {
      rectSpy.mockRestore();
      window.matchMedia = originalMatchMedia;
      if (originalConnection) Object.defineProperty(navigator, 'connection', originalConnection);
      else delete navigator.connection;
      HTMLCanvasElement.prototype.getContext.mockReturnValue(null);
    }
  };
}

beforeEach(() => HTMLCanvasElement.prototype.getContext.mockReturnValue(null));

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

it('reselects the live mode when reduced-motion and save-data preferences change', () => {
  const capabilities = installCapabilityHarness();
  const { container, unmount } = render(<DotField theme="dark" />);
  const field = container.querySelector('.dot-field');

  try {
    expect(field).toHaveAttribute('data-mode', 'interactive');

    act(() => capabilities.reducedMotion.emit(true));
    expect(field).toHaveAttribute('data-mode', 'static');

    act(() => capabilities.reducedMotion.emit(false));
    expect(field).toHaveAttribute('data-mode', 'interactive');

    capabilities.connection.saveData = true;
    act(() => capabilities.connection.emit());
    expect(field).toHaveAttribute('data-mode', 'ambient');
  } finally {
    unmount();
    capabilities.restore();
  }
});

it('removes capability preference listeners on unmount', () => {
  const capabilities = installCapabilityHarness();
  const { unmount } = render(<DotField theme="dark" />);

  try {
    expect(capabilities.reducedMotion.listeners).toHaveLength(1);
    expect(capabilities.coarsePointer.listeners).toHaveLength(1);
    expect(capabilities.connectionListeners).toHaveLength(1);

    unmount();

    expect(capabilities.reducedMotion.listeners).toHaveLength(0);
    expect(capabilities.coarsePointer.listeners).toHaveLength(0);
    expect(capabilities.connectionListeners).toHaveLength(0);
  } finally {
    capabilities.restore();
  }
});
