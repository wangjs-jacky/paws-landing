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
