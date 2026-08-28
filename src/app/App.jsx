import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AgentMarquee from '../components/AgentMarquee';
import CrossDeviceStory from '../components/CrossDeviceStory/CrossDeviceStory';
import MascotCrew from '../components/MascotCrew/MascotCrew';
import ProductProof from '../components/ProductProof';
import ValueComparison from '../components/ValueComparison';
import ArchitectureStory from '../components/ArchitectureStory';
import Roadmap from '../components/Roadmap';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import OpenSource from '../components/OpenSource';
import { content } from './content';
import { getStoryContent } from './storyContent';
import { usePreferences } from './usePreferences';
import { usePageMotion } from '../hooks/usePageMotion';

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
  const mainRef = useRef(null);
  const { language, theme, setLanguage, toggleTheme } = usePreferences();
  const copy = content[language];
  const storyCopy = getStoryContent(language);

  usePageMotion(mainRef);

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
      <main id="top" ref={mainRef}>
        <Hero copy={copy} language={language} theme={theme} />
        <AgentMarquee agents={copy.agents} labels={copy.labels} />
        <CrossDeviceStory language={language} />
        <MascotCrew copy={storyCopy} />
        <ProductProof copy={{
          ...storyCopy,
          proofTitle: copy.nav.product,
          proofLabel: copy.sectionLabels.capabilities
        }} language={language} />
        <ValueComparison copy={storyCopy} />
        <ArchitectureStory copy={storyCopy} language={language} title={copy.nav.architecture} />
        <OpenSource copy={copy} language={language} />
        <Roadmap copy={{ ...storyCopy, labels: copy.labels }} />
        <FinalCTA copy={copy} language={language} />
      </main>
      <Footer copy={copy} language={language} />
    </>
  );
}
