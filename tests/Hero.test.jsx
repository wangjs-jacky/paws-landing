import { act, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { expect, it, vi } from 'vitest';

vi.mock('../src/components/react-bits/DotField', () => ({
  default: function DotFieldStub({ onModeChange }) {
    useEffect(() => onModeChange('interactive'), [onModeChange]);
    return <div data-testid="dot-field-stub" />;
  }
}));

import Hero from '../src/components/Hero';

const copy = {
  hero: { eyebrow: 'Open', title: 'Within reach', body: 'Body', primary: 'Start', secondary: 'GitHub' },
  labels: { copy: 'Copy', copied: 'Copied', copyFailed: 'Failed' }
};

it('stops mascot pointer geometry work while offscreen and disconnects visibility tracking', () => {
  let visibilityCallback;
  const disconnect = vi.fn();
  const originalObserver = window.IntersectionObserver;
  window.IntersectionObserver = vi.fn(function MockIntersectionObserver(callback) {
    visibilityCallback = callback;
    this.observe = vi.fn();
    this.disconnect = disconnect;
  });

  const { container, unmount } = render(<Hero copy={copy} language="en" theme="dark" />);
  const stage = container.querySelector('.mascot-stage');
  const rect = vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({
    width: 400, height: 300, left: 0, top: 0, right: 400, bottom: 300
  });

  try {
    fireEvent.pointerMove(stage, { clientX: 200, clientY: 150 });
    expect(rect).toHaveBeenCalledOnce();
    expect(stage.style.getPropertyValue('--mascot-x')).toBe('0.00px');

    act(() => visibilityCallback([{ isIntersecting: false }]));
    const offscreenStyle = stage.getAttribute('style');
    fireEvent.pointerMove(stage, { clientX: 300, clientY: 200 });
    expect(rect).toHaveBeenCalledOnce();
    expect(stage.getAttribute('style')).toBe(offscreenStyle);

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    fireEvent.pointerMove(stage, { clientX: 350, clientY: 250 });
    expect(rect).toHaveBeenCalledOnce();
  } finally {
    if (stage.isConnected) unmount();
    window.IntersectionObserver = originalObserver;
  }
});
