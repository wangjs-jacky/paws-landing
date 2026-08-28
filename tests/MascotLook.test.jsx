import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MascotLook from '../src/components/MascotLook';

function Harness(props) {
  const surfaceRef = useRef(null);
  return (
    <section ref={surfaceRef} data-testid="pointer-surface">
      <MascotLook
        pointerSurfaceRef={surfaceRef}
        atlasSrc="/atlas.webp"
        fallbackSrc="/fallback.png"
        alt="Paws mascot"
        {...props}
      />
      <div
        data-testid="satellite-transform-probe"
        style={{ transform: 'translate3d(0, var(--mascot-y, 0px), 0)' }}
      />
    </section>
  );
}

function installMatchMedia({ reduced = false, fine = true } = {}) {
  const queries = new Map();
  window.matchMedia = vi.fn(query => {
    const media = {
      matches: query === '(prefers-reduced-motion: reduce)' ? reduced : fine,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    queries.set(query, media);
    return media;
  });
  return queries;
}

function flushAnimationFrames(limit = 80) {
  for (let step = 0; step < limit && rafCallbacks.size; step += 1) {
    const callbacks = [...rafCallbacks.values()];
    rafCallbacks.clear();
    act(() => callbacks.forEach(callback => callback(step * 16)));
  }
}

let imageInstances;
let observerInstances;
let rafCallbacks;
let nextRafId;
let context;

beforeEach(() => {
  imageInstances = [];
  observerInstances = [];
  rafCallbacks = new Map();
  nextRafId = 1;
  context = { clearRect: vi.fn(), drawImage: vi.fn() };
  HTMLCanvasElement.prototype.getContext.mockReturnValue(context);

  window.Image = vi.fn(function MockImage() {
    this.naturalWidth = 4608;
    this.naturalHeight = 3072;
    this.decode = vi.fn().mockResolvedValue(undefined);
    imageInstances.push(this);
  });
  window.IntersectionObserver = vi.fn(function MockIntersectionObserver(callback) {
    this.callback = callback;
    this.observe = vi.fn(target => { this.target = target; });
    this.disconnect = vi.fn();
    observerInstances.push(this);
  });
  window.requestAnimationFrame = vi.fn(callback => {
    const id = nextRafId;
    nextRafId += 1;
    rafCallbacks.set(id, callback);
    return id;
  });
  window.cancelAnimationFrame = vi.fn(id => rafCallbacks.delete(id));
  installMatchMedia();
});

afterEach(() => {
  HTMLCanvasElement.prototype.getContext.mockReturnValue(null);
});

async function loadAtlas() {
  const atlas = imageInstances[0];
  expect(atlas).toBeDefined();
  await act(async () => atlas.onload());
  return atlas;
}

function setVisible(surface, isIntersecting) {
  const observer = observerInstances.findLast(candidate => candidate.target === surface);
  act(() => observer.callback([{ isIntersecting }]));
  return observer;
}

describe('MascotLook pointer lifecycle', () => {
  it('defers the static fallback while the fine-pointer atlas is loading', async () => {
    render(<Harness />);

    expect(imageInstances).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Paws mascot' })).not.toHaveAttribute('src');

    await loadAtlas();

    expect(screen.getByRole('img', { name: 'Paws mascot' })).not.toHaveAttribute('src');
  });

  it('keeps the high-resolution atlas on a single-frame logical canvas', async () => {
    render(<Harness />);
    await loadAtlas();

    const canvas = screen.getByTestId('mascot-look').querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '768');
    expect(canvas).toHaveAttribute('height', '768');
    expect(context.drawImage).toHaveBeenCalledWith(
      imageInstances[0], 0, 1536, 768, 768, 0, 0, 768, 768
    );
  });

  it('draws the edge frame for a visible pointer at the right edge', async () => {
    render(<Harness />);
    const surface = screen.getByTestId('pointer-surface');
    const mascot = screen.getByTestId('mascot-look');
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
    await loadAtlas();
    setVisible(surface, true);

    fireEvent.pointerMove(surface, { clientX: 100 });
    flushAnimationFrames();

    expect(mascot).toHaveAttribute('data-frame', '23');
    expect(context.drawImage).toHaveBeenLastCalledWith(
      imageInstances[0], 3840, 2304, 768, 768, 0, 0, 768, 768
    );
  });

  it('publishes clamped pointer Y translation for the mascot and sibling satellites', async () => {
    render(<Harness />);
    const surface = screen.getByTestId('pointer-surface');
    const mascot = screen.getByTestId('mascot-look');
    const satellite = screen.getByTestId('satellite-transform-probe');
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
    await loadAtlas();
    setVisible(surface, true);

    fireEvent.pointerMove(surface, { clientX: 50, clientY: 200 });
    expect(surface.style.getPropertyValue('--mascot-y')).toBe('4px');
    expect(mascot.style.getPropertyValue('--mascot-y')).toBe('');
    expect(surface).toContainElement(satellite);
    expect(satellite).toHaveStyle({ transform: 'translate3d(0, var(--mascot-y, 0px), 0)' });

    fireEvent.pointerMove(surface, { clientX: 50, clientY: -100 });
    expect(surface.style.getPropertyValue('--mascot-y')).toBe('-4px');
  });

  it('returns to center frame 12 after the pointer leaves', async () => {
    render(<Harness />);
    const surface = screen.getByTestId('pointer-surface');
    const mascot = screen.getByTestId('mascot-look');
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
    await loadAtlas();
    setVisible(surface, true);
    fireEvent.pointerMove(surface, { clientX: 100 });
    flushAnimationFrames();

    fireEvent.pointerLeave(surface);
    flushAnimationFrames();

    expect(mascot).toHaveAttribute('data-frame', '12');
    expect(surface.style.getPropertyValue('--mascot-y')).toBe('0px');
  });

  it('resets translation and does no pointer geometry or RAF work while offscreen', async () => {
    render(<Harness />);
    const surface = screen.getByTestId('pointer-surface');
    const mascot = screen.getByTestId('mascot-look');
    const rect = vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
    await loadAtlas();
    setVisible(surface, true);
    fireEvent.pointerMove(surface, { clientX: 100, clientY: 100 });
    expect(surface.style.getPropertyValue('--mascot-y')).toBe('4px');

    setVisible(surface, false);
    expect(surface.style.getPropertyValue('--mascot-y')).toBe('0px');
    rect.mockClear();
    window.requestAnimationFrame.mockClear();

    fireEvent.pointerMove(surface, { clientX: 100, clientY: 0 });

    expect(rect).not.toHaveBeenCalled();
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});

it('falls back without another RAF when an atlas draw fails after load', async () => {
  render(<Harness />);
  const surface = screen.getByTestId('pointer-surface');
  const mascot = screen.getByTestId('mascot-look');
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
  await loadAtlas();
  setVisible(surface, true);
  context.drawImage.mockImplementationOnce(() => {
    throw new Error('canvas lost');
  });
  window.requestAnimationFrame.mockClear();

  fireEvent.pointerMove(surface, { clientX: 100, clientY: 50 });
  flushAnimationFrames();

  expect(mascot).toHaveAttribute('data-ready', 'false');
  expect(mascot).toHaveAttribute('data-mode', 'fallback');
  expect(screen.getByRole('img', { name: 'Paws mascot' })).toHaveAttribute('src', '/fallback.png');
  expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
  expect(rafCallbacks.size).toBe(0);
});

it('keeps the static fallback visible when atlas decoding fails', async () => {
  render(<Harness />);
  const atlas = imageInstances[0];
  atlas.decode.mockRejectedValueOnce(new Error('bad atlas'));

  await act(async () => atlas.onload());

  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-ready', 'false');
  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-mode', 'fallback');
  expect(screen.getByRole('img', { name: 'Paws mascot' })).toHaveAttribute('src', '/fallback.png');
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
});

it('keeps the static fallback visible when atlas cells are not 768 pixels', async () => {
  render(<Harness />);
  const atlas = imageInstances[0];
  atlas.naturalWidth = 3072;
  atlas.naturalHeight = 2048;

  await act(async () => atlas.onload());

  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-ready', 'false');
  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-mode', 'fallback');
  expect(screen.getByRole('img', { name: 'Paws mascot' })).toHaveAttribute('src', '/fallback.png');
  expect(context.drawImage).not.toHaveBeenCalled();
});

it.each([
  ['reduced motion', { reduced: true, fine: true }, 'reduced'],
  ['a coarse pointer', { reduced: false, fine: false }, 'coarse']
])('uses a static mascot with no RAF for %s', async (_label, media, mode) => {
  installMatchMedia(media);
  render(<Harness />);
  const surface = screen.getByTestId('pointer-surface');
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
  setVisible(surface, true);

  fireEvent.pointerMove(surface, { clientX: 100 });

  expect(imageInstances).toHaveLength(0);
  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-mode', mode);
  expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-ready', 'false');
  expect(screen.getByRole('img', { name: 'Paws mascot' })).toHaveAttribute('src', '/fallback.png');
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
});

it('cleans hero listeners, observer, RAF, media listeners, and image callbacks on unmount', async () => {
  const mediaQueries = installMatchMedia();
  const { unmount } = render(<Harness />);
  const surface = screen.getByTestId('pointer-surface');
  const removeEventListener = vi.spyOn(surface, 'removeEventListener');
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
  const atlas = await loadAtlas();
  const observer = setVisible(surface, true);
  fireEvent.pointerMove(surface, { clientX: 100, clientY: 100 });
  const pendingRaf = [...rafCallbacks.keys()][0];
  expect(surface.style.getPropertyValue('--mascot-y')).toBe('4px');

  unmount();

  expect(surface.style.getPropertyValue('--mascot-y')).toBe('0px');
  expect(observer.disconnect).toHaveBeenCalledOnce();
  expect(removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
  expect(removeEventListener).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingRaf);
  for (const media of mediaQueries.values()) {
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  }
  expect(atlas.onload).toBeNull();
  expect(atlas.onerror).toBeNull();
});
