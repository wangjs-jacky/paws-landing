export default function StorySteps({ scenes, activeId, onSelect, renderEvidence }) {
  return (
    <div className="story-steps">
      {scenes.map((scene, index) => {
        const headingId = `story-scene-${scene.id}-title`;
        const isActive = scene.id === activeId;

        return (
          <article
            key={scene.id}
            className="story-step"
            data-scene={scene.id}
            data-active={String(isActive)}
            aria-labelledby={headingId}
          >
            <div className="story-step__meta">
              <span>{scene.number}</span>
              <button
                type="button"
                aria-label={scene.title}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onSelect(index)}
              >
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <h3 id={headingId}>{scene.title}</h3>
            <p>{scene.body}</p>
            {renderEvidence?.(scene)}
          </article>
        );
      })}
    </div>
  );
}
