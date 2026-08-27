import { useRef } from 'react';
import { docsHref, INSTALL_COMMAND } from '../app/siteConstants';
import MascotLook from './MascotLook';
import TerminalDemo from './TerminalDemo';
import DotField from './react-bits/DotField';

export default function Hero({ copy, language, theme }) {
  const heroRef = useRef(null);
  const titleLines = copy.hero.titleLines ?? [copy.hero.title];

  return (
    <section ref={heroRef} id="hero" className="hero" aria-labelledby="hero-title">
      <DotField theme={theme} />
      <div className="hero-ambient" aria-hidden="true" />
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">{copy.hero.eyebrow}</span>
          <h1 id="hero-title" aria-label={copy.hero.title}>
            {titleLines.map(line => (
              <span key={line} className="hero-title__line" data-testid="hero-title-line" aria-hidden="true">
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-lead">{copy.hero.body}</p>
          <div className="hero-actions">
            <a className="primary-action" href={docsHref(language, '#quick-start')}>{copy.hero.primary}</a>
            <a className="secondary-action" href="https://github.com/wangjs-jacky/happy">{copy.hero.secondary}</a>
          </div>
          <div className="hero-terminal-slot">
            <TerminalDemo command={INSTALL_COMMAND} labels={copy.labels} terminalCopy={copy.terminal} />
          </div>
        </div>
        <div className="hero-media">
          <MascotLook
            pointerSurfaceRef={heroRef}
            atlasSrc="/assets/mascot-turn-atlas.webp"
            fallbackSrc="/assets/mascot-static.png"
            alt={language === 'zh' ? 'Paws 土拨鼠吉祥物' : 'Paws marmot mascot'}
          />
        </div>
      </div>
    </section>
  );
}
