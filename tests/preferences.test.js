import { act, renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LANGUAGE_KEY,
  THEME_KEY,
  detectLanguage,
  readStored,
  resolveLanguage,
  resolveTheme,
  writeStored
} from '../src/app/preferences';
import { usePreferences } from '../src/app/usePreferences';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
});

describe('homepage preferences', () => {
  it('uses Chinese only when a browser language begins with zh', () => {
    expect(detectLanguage(['zh-CN', 'en'])).toBe('zh');
    expect(detectLanguage(['en-US', 'zh-CN'])).toBe('en');
    expect(detectLanguage([])).toBe('en');
  });

  it('lets a valid saved language override the browser', () => {
    expect(resolveLanguage('en', ['zh-CN'])).toBe('en');
    expect(resolveLanguage('invalid', ['zh-CN'])).toBe('zh');
  });

  it('lets a valid saved theme override the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('invalid', true)).toBe('dark');
  });

  it('guards inaccessible storage', () => {
    const storage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); }
    };
    expect(readStored(storage, LANGUAGE_KEY)).toBe(null);
    expect(writeStored(storage, THEME_KEY, 'dark')).toBe(false);
  });
});

describe('usePreferences', () => {
  it('applies stored preferences and persists user changes', () => {
    window.localStorage.setItem(LANGUAGE_KEY, 'zh');
    window.localStorage.setItem(THEME_KEY, 'dark');

    const { result } = renderHook(() => usePreferences());

    expect(result.current.language).toBe('zh');
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.lang).toBe('zh-CN');
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => {
      result.current.setLanguage('en');
      result.current.toggleTheme();
    });

    expect(result.current.language).toBe('en');
    expect(result.current.theme).toBe('light');
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('en');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('light');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('tracks system theme changes only until an explicit theme is stored', () => {
    let onChange;
    const media = {
      matches: false,
      addEventListener: vi.fn((event, listener) => { if (event === 'change') onChange = listener; }),
      removeEventListener: vi.fn()
    };
    window.matchMedia = vi.fn(() => media);

    const { result } = renderHook(() => usePreferences());

    act(() => onChange({ matches: true }));
    expect(result.current.theme).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');

    act(() => onChange({ matches: true }));
    expect(result.current.theme).toBe('light');
  });

  it('keeps an explicit theme for the session when storage throws', () => {
    let onChange;
    const media = {
      matches: false,
      addEventListener: vi.fn((event, listener) => { if (event === 'change') onChange = listener; }),
      removeEventListener: vi.fn()
    };
    const storageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => { throw new Error('blocked'); },
        setItem: () => { throw new Error('blocked'); }
      }
    });
    window.matchMedia = vi.fn(() => media);

    const { result, unmount } = renderHook(() => usePreferences());

    try {
      act(() => result.current.toggleTheme());
      expect(result.current.theme).toBe('dark');

      act(() => onChange({ matches: false }));
      expect(result.current.theme).toBe('dark');
    } finally {
      unmount();
      Object.defineProperty(window, 'localStorage', storageDescriptor);
    }
  });
});

describe('theme bootstrap', () => {
  it('applies a stored theme before the application module runs', () => {
    const html = readFileSync('index.html', 'utf8');
    const page = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'https://paws.example',
      beforeParse(window) {
        window.localStorage.setItem(THEME_KEY, 'dark');
        window.matchMedia = () => ({ matches: false });
      }
    });

    expect(page.window.document.documentElement.dataset.theme).toBe('dark');
    expect(page.window.document.documentElement.style.colorScheme).toBe('dark');
    page.window.close();
  });

  it('falls back to the system theme when storage is inaccessible', () => {
    const html = readFileSync('index.html', 'utf8');
    const page = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'https://paws.example',
      beforeParse(window) {
        Object.defineProperty(window, 'localStorage', {
          value: { getItem: () => { throw new Error('blocked'); } }
        });
        window.matchMedia = () => ({ matches: true });
      }
    });

    expect(page.window.document.documentElement.dataset.theme).toBe('dark');
    page.window.close();
  });
});
