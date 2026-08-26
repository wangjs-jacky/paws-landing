export const LANGUAGE_KEY = 'paws-home-language-v1';
export const THEME_KEY = 'paws-home-theme-v1';

export function detectLanguage(languages = []) {
  return (languages[0] || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function resolveLanguage(saved, languages) {
  return saved === 'en' || saved === 'zh' ? saved : detectLanguage(languages);
}

export function resolveTheme(saved, prefersDark) {
  return saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light';
}

export function readStored(storage, key) {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}

export function writeStored(storage, key, value) {
  if (!storage) return false;
  try { storage.setItem(key, value); return true; } catch { return false; }
}
