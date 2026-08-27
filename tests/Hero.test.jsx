import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('../src/components/react-bits/DotField', () => ({
  default: function DotFieldStub() {
    return <div data-testid="dot-field-stub" />;
  }
}));

import Hero from '../src/components/Hero';

const copy = {
  hero: {
    eyebrow: 'Open',
    title: 'Within reach',
    titleLines: ['Your agents.', 'Within reach.'],
    body: 'Body',
    primary: 'Start',
    secondary: 'GitHub'
  },
  labels: { copy: 'Copy', copied: 'Copied', copyFailed: 'Failed' },
  terminal: { title: 'Live session', installLabel: 'Install and start', lines: ['$ paws'] }
};

it('uses the hero alone as the mascot pointer and visibility surface', () => {
  const observers = [];
  const hadObserver = Object.hasOwn(window, 'IntersectionObserver');
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
      '/assets/mascot-static.png'
    );
    expect(mascotObserver).toBeDefined();
    expect(terminalObserver).toBeDefined();
    expect(observers.some(observer => observer.target?.classList?.contains('mascot-stage'))).toBe(false);

    unmount();
    expect(mascotObserver.disconnect).toHaveBeenCalledOnce();
    expect(terminalObserver.disconnect).toHaveBeenCalledOnce();
  } finally {
    if (hadObserver) window.IntersectionObserver = originalObserver;
    else delete window.IntersectionObserver;
  }
});

it('integrates one of each interactive layer without legacy hero composition', () => {
  const originalObserver = window.IntersectionObserver;
  window.IntersectionObserver = vi.fn(function MockIntersectionObserver() {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  });

  try {
    const { container } = render(<Hero copy={copy} language="en" theme="dark" />);
    const hero = container.querySelector('#hero');

    expect(within(hero).getAllByTestId('dot-field-stub')).toHaveLength(1);
    expect(within(hero).getAllByTestId('terminal-demo')).toHaveLength(1);
    expect(within(hero).getAllByTestId('mascot-look')).toHaveLength(1);
    expect(within(hero).getAllByTestId('hero-title-line')).toHaveLength(2);
    expect(hero.querySelector('.install-command')).not.toBeInTheDocument();
    expect(hero.querySelector('.mascot-stage')).not.toBeInTheDocument();
  } finally {
    if (originalObserver) window.IntersectionObserver = originalObserver;
    else delete window.IntersectionObserver;
  }
});
