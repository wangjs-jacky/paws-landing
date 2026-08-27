import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import App from '../src/app/App';
import { content } from '../src/app/content';

beforeEach(() => localStorage.clear());

it('switches all visible copy and document metadata to Chinese', async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  expect(screen.getAllByTestId('hero-title-line')).toHaveLength(2);
  expect(screen.getByRole('button', { name: content.en.labels.language })).toHaveTextContent('中文');
  await user.click(screen.getByRole('button', { name: content.en.labels.language }));
  expect(screen.getByRole('button', { name: content.zh.labels.language })).toHaveTextContent('EN');
  expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(content.zh.hero.title);
  expect(screen.getAllByTestId('hero-title-line')).toHaveLength(2);
  expect(screen.getByText('PAWS / 产品能力')).toBeInTheDocument();
  expect(container.querySelector('.footer-brand')).toHaveAttribute('aria-label', 'Paws 首页');
  const marquee = screen.getByRole('region', { name: content.zh.labels.agentMarquee });
  expect(within(marquee).queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('zh-CN');
  expect(document.title).toContain('随时控制');
  expect(document.querySelector('meta[name="description"]').content).toContain('通过手机');
});

it('exposes stable hero media and terminal layout slots', () => {
  const { container } = render(<App />);
  const hero = container.querySelector('#hero');
  expect(hero.querySelectorAll('.dot-field')).toHaveLength(1);
  expect(hero.querySelectorAll('.hero-media .mascot-look')).toHaveLength(1);
  expect(hero.querySelectorAll('.hero-terminal-slot .terminal-demo')).toHaveLength(1);
  expect(hero.querySelectorAll('[data-testid="hero-title-line"]')).toHaveLength(2);
  expect(hero.querySelector('.install-command')).not.toBeInTheDocument();
  expect(hero.querySelector('.mascot-stage')).not.toBeInTheDocument();
});

it('renders a control-free supported-agent marquee', () => {
  render(<App />);
  const marquee = screen.getByRole('region', { name: content.en.labels.agentMarquee });

  expect(marquee).toHaveAttribute('data-motion', 'auto');
  expect(within(marquee).queryByRole('button')).not.toBeInTheDocument();
});

it('toggles theme and persists it', async () => {
  const user = userEvent.setup();
  render(<App />);
  const initialThemeColor = document.querySelector('meta[name="theme-color"]').content;
  const button = screen.getByRole('button', { name: /theme|主题/i });
  await user.click(button);
  expect(localStorage.getItem('paws-home-theme-v1')).toMatch(/light|dark/);
  expect(document.documentElement.dataset.theme).toBe(localStorage.getItem('paws-home-theme-v1'));
  expect(document.querySelector('meta[name="theme-color"]').content).not.toBe(initialThemeColor);
});

it('opens and closes an accessible mobile navigation menu', async () => {
  const user = userEvent.setup();
  render(<App />);
  const menu = screen.getByRole('button', { name: /Open navigation/i });
  await user.click(menu);
  expect(menu).toHaveAttribute('aria-expanded', 'true');
  await user.click(screen.getByRole('link', { name: 'Product' }));
  expect(menu).toHaveAttribute('aria-expanded', 'false');
});

it('renders factual agents, four story scenes and six product-proof cases without testimonials', () => {
  render(<App />);
  const marquee = screen.getByRole('region', { name: content.en.labels.agentMarquee });
  const readableAgents = within(marquee).getByRole('list');
  for (const agent of ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'OpenClaw', 'ACP Agents']) {
    expect(within(readableAgents).getByText(agent)).toBeInTheDocument();
  }
  expect(document.querySelectorAll('.story-step')).toHaveLength(4);
  expect(screen.getAllByTestId('proof-case')).toHaveLength(6);
  expect(screen.getAllByTestId('comparison-row')).toHaveLength(5);
  expect(screen.queryByTestId('feature-card')).not.toBeInTheDocument();
  expect(screen.queryByText(/Loved by developers|Testimonials/i)).not.toBeInTheDocument();
});

it('renders the approved product flow, actions and section order', async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  const architecture = container.querySelector('#architecture');
  const openSource = container.querySelector('#open-source');

  expect(within(architecture).getAllByTestId('architecture-node').map(node => node.dataset.nodeId)).toEqual([
    'clients',
    'relay',
    'daemon',
    'agents'
  ]);
  expect(openSource.querySelector('ol')).not.toBeInTheDocument();
  expect(within(openSource).getByRole('link', { name: 'View on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/wangjs-jacky/happy'
  );
  expect(within(openSource).getByRole('link', { name: 'Self-hosting guide' }))
    .toHaveAttribute('href', '/docs#self-hosting');

  const sectionIds = [...container.querySelectorAll('main > section')].map(section => section.id);
  expect(sectionIds).toEqual([
    'hero',
    'supported-agents',
    'app-pc',
    'paws-crew',
    'product',
    'comparison',
    'architecture',
    'open-source',
    'roadmap',
    'final-cta'
  ]);

  await user.click(screen.getByRole('button', { name: content.en.labels.language }));
  expect(within(openSource).getByRole('link', { name: '自托管指南' }))
    .toHaveAttribute('href', '/docs/zh-CN#self-hosting');
});

it('exposes exactly one main landmark for the page', () => {
  const { container } = render(<App />);

  expect(container.querySelectorAll('main')).toHaveLength(1);
});

it('links both localized work-flow navigation labels to the cross-device story', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('link', { name: content.en.nav.how })).toHaveAttribute('href', '#app-pc');
  await user.click(screen.getByRole('button', { name: content.en.labels.language }));
  expect(screen.getByRole('link', { name: content.zh.nav.how })).toHaveAttribute('href', '#app-pc');
});

it('routes product-proof self-hosting actions to the current documentation language', async () => {
  const user = userEvent.setup();
  render(<App />);
  const proofActions = () => within(document.querySelector('[data-proof-id="open-source"]'))
    .getByTestId('open-source-actions');

  expect(within(proofActions()).getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/wangjs-jacky/happy'
  );
  expect(within(proofActions()).getByRole('link', { name: 'Self-hosting guide' }))
    .toHaveAttribute('href', '/docs#self-hosting');

  await user.click(screen.getByRole('button', { name: content.en.labels.language }));

  expect(within(proofActions()).getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/wangjs-jacky/happy'
  );
  expect(within(proofActions()).getByRole('link', { name: '自托管文档' }))
    .toHaveAttribute('href', '/docs/zh-CN#self-hosting');
});

it('links both documentation languages and privacy without making a license claim', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'English docs' })).toHaveAttribute('href', '/docs');
  expect(screen.getByRole('link', { name: '中文文档' })).toHaveAttribute('href', '/docs/zh-CN');
  expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
    'href',
    'https://github.com/wangjs-jacky/happy/blob/main/PRIVACY.md'
  );
  expect(screen.queryByText(/MIT License/i)).not.toBeInTheDocument();
});

it('connects stable navigation targets, story context and non-Hero image metadata', () => {
  const { container } = render(<App />);
  const navigation = screen.getByRole('navigation', { name: content.en.labels.primaryNavigation });
  const hashLinks = within(navigation).getAllByRole('link')
    .filter(link => link.getAttribute('href')?.startsWith('#'));

  expect(within(navigation).getByRole('link', { name: content.en.nav.architecture }))
    .toHaveAttribute('href', '#architecture');
  for (const link of hashLinks) {
    expect(container.querySelector(link.getAttribute('href'))).toBeInTheDocument();
  }

  const story = screen.getByTestId('cross-device-story');
  const storySummary = container.querySelector('#cross-device-summary');
  expect(storySummary).toHaveClass('sr-only');
  expect(storySummary).toHaveTextContent('A four-step demonstration');
  expect(story.querySelector('.cross-device-story__stage'))
    .toHaveAttribute('aria-describedby', 'cross-device-summary');

  expect(within(container.querySelector('footer')).getByRole('link', {
    name: content.en.openSource.actions.selfHosting
  }))
    .toHaveAttribute('href', '/docs#self-hosting');

  const nonHeroImages = [...container.querySelectorAll('img')]
    .filter(image => !image.closest('#hero'));
  expect(nonHeroImages.length).toBeGreaterThan(0);
  for (const image of nonHeroImages) {
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
  }
});
