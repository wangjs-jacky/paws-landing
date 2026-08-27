import { useState } from 'react';
import { getStoryContent } from '../../app/storyContent';
import ConnectionFlow from './ConnectionFlow';
import MobileConsoleDemo from './MobileConsoleDemo';
import PcConsoleDemo from './PcConsoleDemo';
import StorySteps from './StorySteps';
import { buildConsoleState } from './storyModel';

export default function CrossDeviceStory({ language, activeSceneOverride }) {
  const copy = getStoryContent(language);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeId = activeSceneOverride ?? copy.scenes[activeIndex].id;
  const state = buildConsoleState(activeId, copy);

  return (
    <section
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
      <StorySteps scenes={copy.scenes} activeId={activeId} onSelect={setActiveIndex} />
      <div className="cross-device-story__stage">
        <PcConsoleDemo state={state} copy={copy} />
        <ConnectionFlow focus={state.focus} status={state.sessionStatus} />
        <MobileConsoleDemo state={state} copy={copy} />
      </div>
    </section>
  );
}
