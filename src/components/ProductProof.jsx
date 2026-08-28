import { docsHref } from '../app/siteConstants';

const GITHUB_URL = 'https://github.com/wangjs-jacky/happy';

function evidenceParts(evidence) {
  return evidence.split(/\s*[→·]\s*/);
}

function EvidenceList({ as: List = 'ul', children, evidence, testId, separator }) {
  const parts = evidenceParts(evidence);

  return (
    <List className="proof-evidence__list" data-testid={testId}>
      {parts.map((part, index) => (
        <li key={part}>
          {children ? children(part, index) : <span>{part}</span>}
          {index < parts.length - 1 ? (
            <span className="proof-evidence__separator" aria-hidden="true"> {separator} </span>
          ) : null}
        </li>
      ))}
    </List>
  );
}

function ProofEvidence({ item, language }) {
  switch (item.id) {
    case 'remote-start':
      return (
        <EvidenceList evidence={item.evidence} testId="remote-start-selector" separator="→">
          {(part, index) => (
            <span className="proof-selector__value" data-selected={index === 0 ? 'true' : undefined}>
              {part}
            </span>
          )}
        </EvidenceList>
      );
    case 'live-process':
      return <EvidenceList evidence={item.evidence} testId="live-tool-list" separator="·" />;
    case 'approval':
      return (
        <div className="proof-approval" data-testid="approval-request">
          <span className="proof-approval__status">{item.status}</span>
          <code>{item.evidence}</code>
        </div>
      );
    case 'session-overview':
      return <EvidenceList evidence={item.evidence} testId="session-statuses" separator="·" />;
    case 'encrypted-sync':
      return <EvidenceList as="ol" evidence={item.evidence} testId="sync-topology" separator="→" />;
    case 'open-source': {
      const actions = evidenceParts(item.evidence);
      const hrefs = [GITHUB_URL, docsHref(language, '#self-hosting')];

      return (
        <div className="proof-actions" data-testid="open-source-actions">
          {actions.map((action, index) => (
            <span key={action}>
              <a href={hrefs[index]}>{action}</a>
              {index < actions.length - 1 ? <span aria-hidden="true"> · </span> : null}
            </span>
          ))}
        </div>
      );
    }
    default:
      return <p>{item.evidence}</p>;
  }
}

function ProofCase({ item, language }) {
  const headingId = `proof-${item.id}-title`;

  return (
    <article
      className={`proof-case proof-case--${item.id}`}
      data-testid="proof-case"
      data-proof-id={item.id}
      data-motion-item
      aria-labelledby={headingId}
    >
      <p className="proof-case__status" data-testid="proof-status">
        <span aria-hidden="true" />
        {item.status}
      </p>
      <h3 id={headingId}>{item.title}</h3>
      <p className="proof-case__body">{item.body}</p>
      <div className="proof-evidence" data-testid="proof-evidence">
        <ProofEvidence item={item} language={language} />
      </div>
    </article>
  );
}

export default function ProductProof({ copy, language }) {
  const title = copy.proofTitle ?? copy.proof[0]?.title;

  return (
    <section
      id="product"
      className="shell-section product-proof"
      aria-labelledby="product-proof-title"
      data-motion-section
    >
      <header className="product-proof__heading" data-motion-item>
        <h2 id="product-proof-title">{title}</h2>
        {copy.proofLabel ? <p className="eyebrow">{copy.proofLabel}</p> : null}
      </header>
      <div className="product-proof__grid">
        {copy.proof.map(item => <ProofCase key={item.id} item={item} language={language} />)}
      </div>
    </section>
  );
}
