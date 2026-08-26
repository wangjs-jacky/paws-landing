import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LANGUAGE_KEY,
  THEME_KEY,
  readStored,
  resolveLanguage,
  resolveTheme,
  writeStored
} from './preferences';

function browserStorage() {
  try { return window.localStorage; } catch { return null; }
}

function themeMedia() {
  return window.matchMedia?.('(prefers-color-scheme: dark)') ?? {
    matches: false,
    addEventListener() {},
    removeEventListener() {}
  };
}

export function usePreferences() {
  const storage = browserStorage();
  const initialTheme = useRef(null);
  if (initialTheme.current === null) {
    const savedTheme = readStored(storage, THEME_KEY);
    initialTheme.current = {
      explicit: savedTheme === 'light' || savedTheme === 'dark',
      value: resolveTheme(savedTheme, themeMedia().matches)
    };
  }
  const explicitTheme = useRef(initialTheme.current.explicit);
  const [language, updateLanguage] = useState(() =>
    resolveLanguage(readStored(storage, LANGUAGE_KEY), window.navigator.languages)
  );
  const [theme, updateTheme] = useState(initialTheme.current.value);

  const setLanguage = useCallback(value => {
    updateLanguage(value);
    writeStored(browserStorage(), LANGUAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    explicitTheme.current = true;
    updateTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeStored(browserStorage(), THEME_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language === 'zh' ? 'zh-CN' : 'en';
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [language, theme]);

  useEffect(() => {
    const media = themeMedia();
    function syncSystem(event) {
      if (!explicitTheme.current) updateTheme(event.matches ? 'dark' : 'light');
    }
    media.addEventListener('change', syncSystem);
    return () => media.removeEventListener('change', syncSystem);
  }, []);

  return { language, theme, setLanguage, toggleTheme };
}
