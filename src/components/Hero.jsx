import { useRef } from 'react';
import { docsHref, INSTALL_COMMAND } from '../app/siteConstants';
import MascotLook from './MascotLook';
import TerminalDemo from './TerminalDemo';
import DotField from './react-bits/DotField';

const HERO_SATELLITES = ['astro', 'ninja', 'scientist'];

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
          <p className="hero-outcome">{copy.hero.outcome}</p>
          <ul className="hero-product-roles" aria-label={copy.hero.productRolesLabel}>
            <li>{copy.hero.appPill}</li>
            <li>{copy.hero.webPill}</li>
            <li>{copy.hero.daemonPill}</li>
          </ul>
          <div className="hero-actions">
            <a className="primary-action" href={docsHref(language, '#quick-start')}>{copy.hero.primary}</a>
            <a className="secondary-action" href="https://github.com/wangjs-jacky/happy">{copy.hero.secondary}</a>
          </div>
        </div>
        <div className="hero-media">
          <MascotLook
            pointerSurfaceRef={heroRef}
            theme={theme}
            atlasSrc="/assets/mascot-turn-atlas.webp"
            fallbackSrc="/assets/mascot-static.png"
            alt={copy.hero.mascotAlt}
          />
          <div className="hero-crew" aria-hidden="true">
            {HERO_SATELLITES.map(id => (
              <img
                key={id}
                data-testid="hero-crew-member"
                data-crew-id={id}
                src={`/assets/hero-crew/${id}.webp`}
                alt=""
                aria-hidden="true"
                width="256"
                height="256"
                decoding="async"
                loading="lazy"
              />
            ))}
          </div>
        </div>
        <div className="hero-terminal-slot">
          <TerminalDemo command={INSTALL_COMMAND} labels={copy.labels} terminalCopy={copy.terminal} />
        </div>
      </div>
    </section>
  );
}
