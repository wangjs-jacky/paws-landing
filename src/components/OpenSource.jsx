import { docsHref } from '../app/siteConstants';

export default function OpenSource({ copy, language }) {
  const selfHostingHref = docsHref(language, '#self-hosting');

  return (
    <section id="open-source" className="open-source-section" aria-labelledby="open-source-title">
      <div className="page-shell open-source-shell">
        <div className="open-source-copy">
          <p className="eyebrow">{copy.openSource.eyebrow}</p>
          <h2 id="open-source-title">{copy.openSource.title}</h2>
          <p>{copy.openSource.body}</p>
          <div className="section-actions">
            <a className="primary-action" href="https://github.com/wangjs-jacky/happy">{copy.openSource.actions.github}</a>
            <a className="secondary-action" href={selfHostingHref}>{copy.openSource.actions.selfHosting}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
