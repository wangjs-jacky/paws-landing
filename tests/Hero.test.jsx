import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('../src/components/react-bits/DotField', () => ({
  default: function DotFieldStub() {
    return <div data-testid="dot-field-stub" />;
  }
}));

import Hero from '../src/components/Hero';
import { content } from '../src/app/content';

const copy = {
  hero: {
    eyebrow: 'Open',
    title: 'Within reach',
    titleLines: ['Your agents.', 'Within reach.'],
    body: 'Body',
    outcome: 'One live session follows you across every screen.',
    productRolesLabel: 'Paws product roles',
    appPill: 'App · Review and approve',
    webPill: 'PC Web · Start and steer',
    daemonPill: 'Daemon · Runs locally',
    mascotAlt: 'Paws marmot mascot',
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

it('presents the cross-device outcome, product roles and decorative Paws Crew', () => {
  const originalObserver = window.IntersectionObserver;
  window.IntersectionObserver = vi.fn(function MockIntersectionObserver() {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  });

  try {
    const { container } = render(<Hero copy={copy} language="en" theme="dark" />);

    expect(screen.getByTestId('mascot-look')).toBeVisible();
    expect(screen.getByTestId('terminal-demo')).toBeVisible();
    expect(screen.getByText(copy.hero.outcome)).toBeVisible();
    expect(screen.getByRole('list', { name: copy.hero.productRolesLabel })).toBeVisible();
    expect(screen.getByText(copy.hero.appPill)).toBeVisible();
    expect(screen.getByText(copy.hero.webPill)).toBeVisible();
    expect(screen.getByText(copy.hero.daemonPill)).toBeVisible();

    const crew = screen.getAllByTestId('hero-crew-member');
    expect(crew).toHaveLength(3);
    expect(crew.map(image => image.getAttribute('src'))).toEqual([
      '/assets/mascots/astro.png',
      '/assets/mascots/ninja.png',
      '/assets/mascots/scientist.png'
    ]);
    crew.forEach(image => {
      expect(image).toHaveAttribute('alt', '');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).toHaveAttribute('width', '512');
      expect(image).toHaveAttribute('height', '512');
      expect(image).toHaveAttribute('decoding', 'async');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    const gridRegions = [...container.querySelector('.hero-grid').children]
      .map(element => element.className);
    expect(gridRegions).toEqual(['hero-copy', 'hero-media', 'hero-terminal-slot']);
  } finally {
    if (originalObserver) window.IntersectionObserver = originalObserver;
    else delete window.IntersectionObserver;
  }
});

it.each([
  ['en', {
    outcome: 'Start on App or PC Web, stay with the same live session, and answer permission requests away from your desk.',
    productRolesLabel: 'Paws product roles',
    appPill: 'App · Review and approve',
    webPill: 'PC Web · Start and steer',
    daemonPill: 'Daemon · Runs locally',
    mascotAlt: 'Paws marmot mascot'
  }],
  ['zh', {
    outcome: '从 App 或 PC Web 远程开工、跟进同一个实时会话，并在离开电脑时处理权限请求。',
    productRolesLabel: 'Paws 产品角色',
    appPill: 'App · 查看与审批',
    webPill: 'PC Web · 启动与引导',
    daemonPill: 'Daemon · 本机运行',
    mascotAlt: 'Paws 土拨鼠吉祥物'
  }]
])('keeps the %s hero outcome and product roles concrete and localized', (language, heroCopy) => {
  expect(content[language].hero).toMatchObject(heroCopy);
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
