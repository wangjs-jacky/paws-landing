import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getStoryContent } from '../../app/storyContent';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useStoryMotion } from '../../hooks/useStoryMotion';
import ConnectionFlow from './ConnectionFlow';
import MobileConsoleDemo from './MobileConsoleDemo';
import PcConsoleDemo from './PcConsoleDemo';
import StorySteps from './StorySteps';
import { buildConsoleState } from './storyModel';

export default function CrossDeviceStory({ language, activeSceneOverride }) {
  const copy = getStoryContent(language);
  const rootRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const onSceneChange = useCallback(index => setActiveIndex(index), []);
  const activeId = activeSceneOverride ?? copy.scenes[activeIndex].id;
  const state = buildConsoleState(activeId, copy);

  useStoryMotion({
    rootRef,
    sceneCount: copy.scenes.length,
    disabled: reducedMotion,
    onSceneChange
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [language]);

  return (
    <section
      ref={rootRef}
      id="app-pc"
      className="cross-device-story"
      data-testid="cross-device-story"
      data-active-scene={activeId}
      aria-labelledby="cross-device-story-title"
    >
      <header className="cross-device-story__intro">
        <p className="eyebrow">{copy.intro.eyebrow}</p>
        <h2 id="cross-device-story-title">{copy.intro.title}</h2>
        <p>{copy.intro.summary}</p>
      </header>
      <StorySteps scenes={copy.scenes} activeId={activeId} onSelect={onSceneChange} />
      <div className="cross-device-story__stage">
        <PcConsoleDemo state={state} copy={copy} />
        <ConnectionFlow focus={state.focus} status={state.sessionStatus} />
        <div className="story-scene-mascot" aria-hidden="true">
          <img src="/assets/mascot-avatar.png" alt="" />
        </div>
        <MobileConsoleDemo state={state} copy={copy} />
      </div>
    </section>
  );
}
