import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import { content } from './content';
import { usePreferences } from './usePreferences';

const THEME_COLORS = {
  dark: '#0e0d0c',
  light: '#fbf7ef'
};

function getOrCreateMeta(name) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.append(element);
  }
  return element;
}

export default function App() {
  const { language, theme, setLanguage, toggleTheme } = usePreferences();
  const copy = content[language];

  useEffect(() => {
    document.title = copy.meta.title;
    getOrCreateMeta('description').setAttribute('content', copy.meta.description);
    getOrCreateMeta('theme-color').setAttribute('content', THEME_COLORS[theme]);
  }, [copy, theme]);

  return (
    <>
      <Header
        copy={copy}
        language={language}
        theme={theme}
        onLanguageChange={setLanguage}
        onThemeChange={toggleTheme}
      />
      <main id="top">
        <Hero copy={copy} language={language} theme={theme} />
        <section id="how-it-works" className="shell-section" aria-labelledby="how-title">
          <h2 id="how-title">{copy.nav.how}</h2>
          {copy.steps.map(step => (
            <div key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </section>
        <section id="open-source" className="shell-section" aria-labelledby="open-source-title">
          <p className="eyebrow">{copy.openSource.eyebrow}</p>
          <h2 id="open-source-title">{copy.openSource.title}</h2>
          <p>{copy.openSource.body}</p>
        </section>
      </main>
    </>
  );
}
