export default function AgentStrip({ agents }) {
  return (
    <section id="supported-agents" className="agent-strip">
      <div className="agent-strip__track">
        <ul className="agent-strip__list">
          {agents.map(agent => <li key={agent}>{agent}</li>)}
        </ul>
        <ul className="agent-strip__list agent-strip__duplicate" aria-hidden="true">
          {agents.map(agent => <li key={agent} data-agent={agent} />)}
        </ul>
      </div>
    </section>
  );
}
