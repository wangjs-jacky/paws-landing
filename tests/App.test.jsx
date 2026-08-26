import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import App from '../src/app/App';

beforeEach(() => localStorage.clear());

it('switches all visible copy and document metadata to Chinese', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Switch to Chinese/i }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('让你的编程智能体');
  expect(document.documentElement.lang).toBe('zh-CN');
  expect(document.title).toContain('随时控制');
  expect(document.querySelector('meta[name="description"]').content).toContain('通过手机');
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

it('renders factual agents, three steps and four capabilities without testimonials', () => {
  render(<App />);
  for (const agent of ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'ACP Agents']) {
    expect(screen.getByText(agent)).toBeInTheDocument();
  }
  expect(screen.getAllByTestId('workflow-step')).toHaveLength(3);
  expect(screen.getAllByTestId('feature-card')).toHaveLength(4);
  expect(screen.queryByText(/Loved by developers|Testimonials/i)).not.toBeInTheDocument();
});

it('renders the approved product flow, actions and section order', () => {
  const { container } = render(<App />);
  expect(screen.getByText('Phone / Web')).toBeInTheDocument();
  expect(screen.getByText('Encrypted relay')).toBeInTheDocument();
  expect(screen.getByText('Paws CLI')).toBeInTheDocument();
  expect(screen.getByText('Coding agent')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Self-hosting guide' })).toHaveAttribute('href', '/docs#self-hosting');

  const sectionIds = [...container.querySelectorAll('main > section')].map(section => section.id);
  expect(sectionIds).toEqual(['hero', 'supported-agents', 'how-it-works', 'product', 'open-source', 'final-cta']);
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
