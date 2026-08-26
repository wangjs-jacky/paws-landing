import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

const storedValues = new Map();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: key => storedValues.has(String(key)) ? storedValues.get(String(key)) : null,
    setItem: (key, value) => storedValues.set(String(key), String(value)),
    removeItem: key => storedValues.delete(String(key)),
    clear: () => storedValues.clear(),
    key: index => [...storedValues.keys()][index] ?? null,
    get length() { return storedValues.size; }
  }
});
