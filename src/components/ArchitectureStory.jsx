const NODE_IDS = ['clients', 'relay', 'daemon', 'agents'];

export default function ArchitectureStory({ copy, language, title }) {
  return (
    <section
      id="architecture"
      className="shell-section architecture-story"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      aria-labelledby="architecture-title"
      data-motion-section
    >
      <h2 id="architecture-title" data-motion-item>{title}</h2>
      <ol className="architecture-story__topology">
        {NODE_IDS.map(nodeId => (
          <li
            key={nodeId}
            className="architecture-story__node"
            data-testid="architecture-node"
            data-node-id={nodeId}
            data-motion-item
          >
            {copy.architecture.nodes[nodeId]}
          </li>
        ))}
      </ol>
      <div className="architecture-story__packet-track" aria-hidden="true">
        <span className="architecture-story__packet" data-architecture-packet />
      </div>
      <p className="architecture-story__requirement" data-motion-item>{copy.architecture.requirement}</p>
      <p className="architecture-story__note" data-motion-item>{copy.architecture.note}</p>
    </section>
  );
}
