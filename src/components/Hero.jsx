import { useEffect, useRef, useState } from 'react';
import InstallCommand from './InstallCommand';
import DotField from './react-bits/DotField';

export default function Hero({ copy, language, theme }) {
  const stageRef = useRef(null);
  const [dotFieldMode, setDotFieldMode] = useState('static');

  useEffect(() => {
    if (dotFieldMode !== 'interactive') {
      stageRef.current?.style.removeProperty('--mascot-x');
      stageRef.current?.style.removeProperty('--mascot-y');
      return undefined;
    }

    function handlePointerMove(event) {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const x = Math.max(-8, Math.min(8, ((event.clientX - rect.left) / rect.width - 0.5) * 16));
      const y = Math.max(-8, Math.min(8, ((event.clientY - rect.top) / rect.height - 0.5) * 16));
      stage.style.setProperty('--mascot-x', `${x.toFixed(2)}px`);
      stage.style.setProperty('--mascot-y', `${y.toFixed(2)}px`);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [dotFieldMode]);

  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <DotField theme={theme} onModeChange={setDotFieldMode} />
      <div className="hero-ambient" aria-hidden="true" />
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">{copy.hero.eyebrow}</span>
          <h1 id="hero-title">{copy.hero.title}</h1>
          <p className="hero-lead">{copy.hero.body}</p>
          <div className="hero-actions">
            <a className="primary-action" href={language === 'zh' ? '/docs/zh-CN#quick-start' : '/docs#quick-start'}>{copy.hero.primary}</a>
            <a className="secondary-action" href="https://github.com/wangjs-jacky/happy">{copy.hero.secondary}</a>
          </div>
          <InstallCommand command="npm i -g @wangjs-jacky/paws && paws" labels={copy.labels} />
        </div>
        <div ref={stageRef} className="mascot-stage">
          <img src="/assets/mascot-hero.png" alt={language === 'zh' ? '竖起拇指的 Paws 吉祥物' : 'Paws mascot giving a thumbs up'} />
        </div>
      </div>
    </section>
  );
}
