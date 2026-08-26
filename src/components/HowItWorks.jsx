function StepIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function HowItWorks({ copy }) {
  return (
    <section id="how-it-works" className="shell-section workflow-section" aria-labelledby="how-title">
      <div className="section-heading">
        <p className="eyebrow">01 — 03</p>
        <h2 id="how-title">{copy.nav.how}</h2>
      </div>
      <ol className="workflow-list">
        {copy.steps.map((step, index) => (
          <li key={step.title} className="workflow-step" data-testid="workflow-step">
            <span className="workflow-step__number">0{index + 1}</span>
            <StepIcon />
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
