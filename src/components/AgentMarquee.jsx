export default function AgentMarquee({ agents, labels }) {
  return (
    <section
      id="supported-agents"
      className="agent-marquee"
      aria-label={labels.agentMarquee}
      data-testid="agent-marquee"
      data-motion="auto"
      tabIndex={0}
    >
      <div className="agent-marquee__track">
        <ul className="agent-marquee__list">
          {agents.map(agent => <li key={agent}>{agent}</li>)}
        </ul>
        <ul className="agent-marquee__list agent-marquee__duplicate" aria-hidden="true">
          {agents.map(agent => <li key={agent}>{agent}</li>)}
        </ul>
      </div>
    </section>
  );
}
