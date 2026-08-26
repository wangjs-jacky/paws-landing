import { useState } from 'react';

export default function AgentStrip({ agents, labels }) {
  const [paused, setPaused] = useState(false);

  return (
    <section id="supported-agents" className="agent-strip" data-paused={paused}>
      <div className="agent-strip__track">
        <ul className="agent-strip__list">
          {agents.map(agent => <li key={agent}>{agent}</li>)}
        </ul>
        <ul className="agent-strip__list agent-strip__duplicate" aria-hidden="true">
          {agents.map(agent => <li key={agent} data-agent={agent} />)}
        </ul>
      </div>
      <button
        className="agent-strip__control"
        type="button"
        aria-label={paused ? labels.resumeAgents : labels.pauseAgents}
        aria-pressed={paused}
        onClick={() => setPaused(value => !value)}
      >
        {paused ? (
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7V5Z" /></svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" /></svg>
        )}
      </button>
    </section>
  );
}
