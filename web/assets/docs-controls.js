(function (root, factory) {
  var controls = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = controls;
  }

  if (root && root.document) {
    root.PawsDocsControls = controls;
    controls.applyInitialTheme(root);
    root.document.addEventListener('DOMContentLoaded', function () {
      controls.init(root);
    });
  }
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var STORAGE_KEY = 'paws-docs-theme';

  function resolveTheme(storedTheme, prefersDark) {
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    return prefersDark ? 'dark' : 'light';
  }

  function nextTheme(currentTheme) {
    return currentTheme === 'dark' ? 'light' : 'dark';
  }

  function withCurrentHash(target, hash) {
    return hash ? target + hash : target;
  }

  function readStoredTheme(win) {
    try {
      return win.localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function prefersDark(win) {
    return Boolean(win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function setTheme(win, theme) {
    win.document.documentElement.dataset.theme = theme;
    win.document.documentElement.style.colorScheme = theme;
    updateThemeButton(win.document, theme);
  }

  function applyInitialTheme(win) {
    var theme = resolveTheme(readStoredTheme(win), prefersDark(win));
    setTheme(win, theme);
    return theme;
  }

  function updateThemeButton(doc, theme) {
    var button = doc.querySelector('[data-theme-toggle]');
    if (!button) return;

    var next = nextTheme(theme);
    var isChinese = doc.documentElement.lang.toLowerCase().indexOf('zh') === 0;
    var label = isChinese
      ? (next === 'light' ? '切换到亮色主题' : '切换到深色主题')
      : (next === 'light' ? 'Switch to light theme' : 'Switch to dark theme');

    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  function init(win) {
    var doc = win.document;
    var themeButton = doc.querySelector('[data-theme-toggle]');
    var languageSwitch = doc.querySelector('[data-language-switch]');

    updateThemeButton(doc, doc.documentElement.dataset.theme || applyInitialTheme(win));

    if (themeButton) {
      themeButton.addEventListener('click', function () {
        var theme = nextTheme(doc.documentElement.dataset.theme);
        setTheme(win, theme);
        try {
          win.localStorage.setItem(STORAGE_KEY, theme);
        } catch (_) {
          // Theme still works when storage is unavailable.
        }
      });
    }

    if (languageSwitch) {
      languageSwitch.addEventListener('click', function (event) {
        event.preventDefault();
        win.location.assign(withCurrentHash(languageSwitch.getAttribute('href'), win.location.hash));
      });
    }

    if (!readStoredTheme(win) && win.matchMedia) {
      var preference = win.matchMedia('(prefers-color-scheme: dark)');
      var syncWithSystem = function (event) {
        if (!readStoredTheme(win)) setTheme(win, event.matches ? 'dark' : 'light');
      };
      if (preference.addEventListener) preference.addEventListener('change', syncWithSystem);
    }
  }

  return {
    resolveTheme: resolveTheme,
    nextTheme: nextTheme,
    withCurrentHash: withCurrentHash,
    applyInitialTheme: applyInitialTheme,
    init: init
  };
});
