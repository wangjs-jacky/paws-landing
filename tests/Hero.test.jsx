import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('../src/components/react-bits/DotField', () => ({
  default: function DotFieldStub() {
    return <div data-testid="dot-field-stub" />;
  }
}));

import Hero from '../src/components/Hero';

const copy = {
  hero: { eyebrow: 'Open', title: 'Within reach', body: 'Body', primary: 'Start', secondary: 'GitHub' },
  labels: { copy: 'Copy', copied: 'Copied', copyFailed: 'Failed' },
  terminal: { title: 'Live session', installLabel: 'Install and start', lines: ['$ paws'] }
};

it('uses the hero alone as the mascot pointer and visibility surface', () => {
  const observers = [];
  const originalObserver = window.IntersectionObserver;
  window.IntersectionObserver = vi.fn(function MockIntersectionObserver(callback) {
    this.callback = callback;
    this.observe = vi.fn(target => { this.target = target; });
    this.disconnect = vi.fn();
    observers.push(this);
  });

  try {
    const { container, unmount } = render(<Hero copy={copy} language="en" theme="dark" />);
    const hero = container.querySelector('#hero');
    const terminal = container.querySelector('.terminal-demo');
    const mascotObserver = observers.find(observer => observer.target === hero);
    const terminalObserver = observers.find(observer => observer.target === terminal);

    expect(screen.getByTestId('mascot-look')).toHaveAttribute('data-frame', '12');
    expect(screen.getByRole('img', { name: 'Paws marmot mascot' })).toHaveAttribute(
      'src',
      '/assets/mascot-hero.png'
    );
    expect(mascotObserver).toBeDefined();
    expect(terminalObserver).toBeDefined();
    expect(observers.some(observer => observer.target?.classList?.contains('mascot-stage'))).toBe(false);

    unmount();
    expect(mascotObserver.disconnect).toHaveBeenCalledOnce();
    expect(terminalObserver.disconnect).toHaveBeenCalledOnce();
  } finally {
    window.IntersectionObserver = originalObserver;
  }
});
