import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TerminalDemo from '../src/components/TerminalDemo';

const command = 'npm i -g @wangjs-jacky/paws && paws';
const labels = {
  copy: 'Copy install command',
  copied: 'Install command copied',
  copyFailed: 'Could not copy; select the command manually'
};
const terminalCopy = {
  title: 'paws — live session',
  installLabel: 'Install and start Paws',
  lines: ['$ paws', '→ relay started · local machine', '✔ phone paired']
};

let intersectionCallback;

function setReducedMotion(matches) {
  window.matchMedia = vi.fn(() => ({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

function intersect(isIntersecting) {
  act(() => intersectionCallback([{ isIntersecting }]));
}

beforeEach(() => {
  intersectionCallback = undefined;
  setReducedMotion(false);
  window.IntersectionObserver = class {
    constructor(callback) {
      intersectionCallback = callback;
      this.observe = vi.fn();
      this.disconnect = vi.fn();
    }
  };
});

afterEach(() => {
  vi.useRealTimers();
  delete window.IntersectionObserver;
});

describe('TerminalDemo motion lifecycle', () => {
  it('renders the complete transcript immediately for reduced motion', () => {
    setReducedMotion(true);
    render(<TerminalDemo command={command} labels={labels} terminalCopy={terminalCopy} />);

    for (const line of terminalCopy.lines) expect(screen.getByText(line)).toBeVisible();
    expect(screen.getByTestId('terminal-demo')).toHaveAttribute('data-phase', 'complete');
  });

  it('starts typing only after entering the viewport', () => {
    vi.useFakeTimers();
    render(<TerminalDemo command={command} labels={labels} terminalCopy={terminalCopy} />);

    expect(screen.queryByText('$', { exact: true })).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    intersect(true);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(40));
    expect(screen.getByText('$', { exact: true })).toBeVisible();
  });

  it('owns one timeout, pauses offscreen, and clears it on unmount', () => {
    vi.useFakeTimers();
    const { unmount } = render(<TerminalDemo command={command} labels={labels} terminalCopy={terminalCopy} />);

    intersect(true);
    expect(vi.getTimerCount()).toBe(1);
    intersect(false);
    expect(vi.getTimerCount()).toBe(0);
    intersect(true);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('holds the completed transcript for 3200ms before looping', () => {
    vi.useFakeTimers();
    render(
      <TerminalDemo
        command={command}
        labels={labels}
        terminalCopy={{ ...terminalCopy, lines: ['a'] }}
      />
    );

    intersect(true);
    act(() => vi.advanceTimersByTime(40));
    act(() => vi.advanceTimersByTime(40));
    expect(screen.getByTestId('terminal-demo')).toHaveAttribute('data-phase', 'hold');
    act(() => vi.advanceTimersByTime(3199));
    expect(screen.getByTestId('terminal-demo')).toHaveAttribute('data-phase', 'hold');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('terminal-demo')).toHaveAttribute('data-phase', 'typing');
  });
});

describe('TerminalDemo copy feedback', () => {
  it('announces localized copy success in the only live region', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    render(<TerminalDemo command={command} labels={labels} terminalCopy={terminalCopy} />);

    fireEvent.click(screen.getByRole('button', { name: labels.copy }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(labels.copied));
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('announces localized fallback failure and leaves the command selectable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) }
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => false)
    });
    render(<TerminalDemo command={command} labels={labels} terminalCopy={terminalCopy} />);

    fireEvent.click(screen.getByRole('button', { name: labels.copy }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(labels.copyFailed));
    expect(screen.getByText(`$ ${command}`)).toBeVisible();
  });
});
