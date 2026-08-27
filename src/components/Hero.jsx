import { useEffect, useRef, useState } from 'react';
import { docsHref, INSTALL_COMMAND } from '../app/siteConstants';
import InstallCommand from './InstallCommand';
import DotField from './react-bits/DotField';

export default function Hero({ copy, language, theme }) {
  const stageRef = useRef(null);
  const stageVisibleRef = useRef(true);
  const [dotFieldMode, setDotFieldMode] = useState('static');
  const titleLines = copy.hero.titleLines ?? [copy.hero.title];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      stageVisibleRef.current = entry.isIntersecting;
      if (!entry.isIntersecting) {
        stage.style.removeProperty('--mascot-x');
        stage.style.removeProperty('--mascot-y');
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dotFieldMode !== 'interactive') {
      stageRef.current?.style.removeProperty('--mascot-x');
      stageRef.current?.style.removeProperty('--mascot-y');
      return undefined;
    }

    return undefined;
  }, [dotFieldMode]);

  function handleMascotPointerMove(event) {
    const stage = stageRef.current;
    if (dotFieldMode !== 'interactive' || !stageVisibleRef.current || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(-8, Math.min(8, ((event.clientX - rect.left) / rect.width - 0.5) * 16));
    const y = Math.max(-8, Math.min(8, ((event.clientY - rect.top) / rect.height - 0.5) * 16));
    stage.style.setProperty('--mascot-x', `${x.toFixed(2)}px`);
    stage.style.setProperty('--mascot-y', `${y.toFixed(2)}px`);
  }

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <DotField theme={theme} onModeChange={setDotFieldMode} />
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
            <InstallCommand command={INSTALL_COMMAND} labels={copy.labels} />
          </div>
        </div>
        <div className="hero-media">
          <div ref={stageRef} className="mascot-stage" onPointerMove={handleMascotPointerMove}>
            <img src="/assets/mascot-hero.png" alt={language === 'zh' ? '竖起拇指的 Paws 吉祥物' : 'Paws mascot giving a thumbs up'} />
          </div>
        </div>
      </div>
    </section>
  );
}
