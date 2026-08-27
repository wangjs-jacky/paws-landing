function RoadmapGroup({ items, label, planned = false, testId }) {
  return (
    <div className="roadmap__group" data-testid={testId}>
      <h3>{label}</h3>
      <ul className="roadmap__list">
        {items.map(item => (
          <li key={item.id} className="roadmap__item" data-roadmap-id={item.id}>
            {planned ? <span className="roadmap__badge">{label}</span> : null}
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Roadmap({ copy }) {
  return (
    <section
      id="roadmap"
      className="shell-section roadmap"
      aria-label={`${copy.labels.shipped} / ${copy.labels.planned}`}
    >
      <RoadmapGroup
        items={copy.roadmap.shipped}
        label={copy.labels.shipped}
        testId="roadmap-shipped"
      />
      <RoadmapGroup
        items={copy.roadmap.planned}
        label={copy.labels.planned}
        planned
        testId="roadmap-planned"
      />
    </section>
  );
}
