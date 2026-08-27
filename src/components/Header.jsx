import { useEffect, useState } from 'react';
import { docsHref } from '../app/siteConstants';

export default function Header({ copy, language, theme, onLanguageChange, onThemeChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <header className="site-header" data-open={menuOpen || undefined}>
      <a className="brand" href="#top" aria-label={copy.labels.home} onClick={closeMenu}>
        <img
          src="/assets/mascot-avatar.png"
          alt=""
          width="1254"
          height="1254"
          loading="lazy"
          decoding="async"
        />
        <span>Paws</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? copy.labels.menuClose : copy.labels.menuOpen}
        onClick={() => setMenuOpen(value => !value)}
      >
        <span /><span /><span />
      </button>
      <nav id="primary-navigation" aria-label={copy.labels.primaryNavigation}>
        <a href="#product" onClick={closeMenu}>{copy.nav.product}</a>
        <a href="#app-pc" onClick={closeMenu}>{copy.nav.how}</a>
        <a href="#architecture" onClick={closeMenu}>{copy.nav.architecture}</a>
        <a href="#open-source" onClick={closeMenu}>{copy.nav.openSource}</a>
        <a href={docsHref(language)} onClick={closeMenu}>{copy.nav.docs}</a>
        <a href="https://github.com/wangjs-jacky/happy" onClick={closeMenu}>GitHub</a>
      </nav>
      <div className="preference-controls">
        <button
          className="language-toggle"
          type="button"
          aria-label={copy.labels.language}
          data-language={language}
          onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
        >
          <span aria-hidden="true">{copy.labels.languageDestination}</span>
        </button>
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme === 'dark' ? copy.labels.themeLight : copy.labels.themeDark}
          onClick={onThemeChange}
        >
          <span aria-hidden="true" className={theme === 'dark' ? 'icon-sun' : 'icon-moon'} />
        </button>
        <a className="primary-action" href={docsHref(language, '#quick-start')}>
          {copy.nav.getPaws}
        </a>
      </div>
    </header>
  );
}
