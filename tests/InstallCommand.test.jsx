import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import InstallCommand, { copyToClipboard } from '../src/components/InstallCommand';

const labels = {
  copy: 'Copy install command',
  copied: 'Install command copied',
  copyFailed: 'Copy failed'
};

it('uses the Clipboard API when available', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  await expect(copyToClipboard('paws', { writeText }, document)).resolves.toBe(true);
  expect(writeText).toHaveBeenCalledWith('paws');
});

it('falls back to a temporary textarea when the Clipboard API rejects', async () => {
  const textarea = document.createElement('textarea');
  const fakeDocument = {
    body: document.body,
    createElement: vi.fn(() => textarea),
    execCommand: vi.fn(() => true)
  };

  await expect(copyToClipboard('paws', { writeText: vi.fn().mockRejectedValue(new Error('denied')) }, fakeDocument)).resolves.toBe(true);
  expect(fakeDocument.execCommand).toHaveBeenCalledWith('copy');
  expect(textarea).not.toBeInTheDocument();
});

it('reports success through an ARIA live region', async () => {
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) }
  });

  render(<InstallCommand command="npm i -g @wangjs-jacky/paws && paws" labels={labels} />);
  await user.click(screen.getByRole('button', { name: labels.copy }));

  expect(screen.getByRole('status')).toHaveTextContent(labels.copied);
});

it('returns false when both clipboard paths fail', async () => {
  const fakeDocument = {
    execCommand: () => false,
    body: document.body,
    createElement: document.createElement.bind(document)
  };

  await expect(copyToClipboard('paws', null, fakeDocument)).resolves.toBe(false);
});

it('removes the fallback textarea when execCommand throws', async () => {
  const textarea = document.createElement('textarea');
  const fakeDocument = {
    body: document.body,
    createElement: vi.fn(() => textarea),
    execCommand: vi.fn(() => { throw new Error('copy blocked'); })
  };

  await expect(copyToClipboard('paws', null, fakeDocument)).resolves.toBe(false);
  expect(textarea).not.toBeInTheDocument();
});

it('reports failure without hiding the selectable command', async () => {
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
  });
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: vi.fn(() => false)
  });

  render(<InstallCommand command="npm i -g @wangjs-jacky/paws && paws" labels={labels} />);
  await user.click(screen.getByRole('button', { name: labels.copy }));

  expect(screen.getByRole('status')).toHaveTextContent(labels.copyFailed);
  expect(screen.getByText('npm i -g @wangjs-jacky/paws && paws')).toBeVisible();
});
