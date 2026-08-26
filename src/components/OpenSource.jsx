function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export default function OpenSource({ copy, language }) {
  const selfHostingHref = language === 'zh' ? '/docs/zh-CN#self-hosting' : '/docs#self-hosting';

  return (
    <section id="open-source" className="open-source-section" aria-labelledby="open-source-title">
      <div className="page-shell open-source-grid">
        <div className="open-source-copy">
          <p className="eyebrow">{copy.openSource.eyebrow}</p>
          <h2 id="open-source-title">{copy.openSource.title}</h2>
          <p>{copy.openSource.body}</p>
          <div className="section-actions">
            <a className="primary-action" href="https://github.com/wangjs-jacky/happy">{copy.openSource.actions.github}</a>
            <a className="secondary-action" href={selfHostingHref}>{copy.openSource.actions.selfHosting}</a>
          </div>
        </div>
        <ol className="topology" aria-label={copy.openSource.title}>
          {copy.openSource.topology.map((node, index) => (
            <li key={node}>
              <span>{node}</span>
              {index < copy.openSource.topology.length - 1 ? <Arrow /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
