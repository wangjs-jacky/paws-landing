import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AgentStrip from '../components/AgentStrip';
import FeatureGrid from '../components/FeatureGrid';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';
import OpenSource from '../components/OpenSource';
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
        <AgentStrip agents={copy.agents} labels={copy.labels} />
        <HowItWorks copy={copy} />
        <FeatureGrid copy={copy} />
        <OpenSource copy={copy} language={language} />
        <FinalCTA copy={copy} language={language} />
      </main>
      <Footer copy={copy} language={language} />
    </>
  );
}
