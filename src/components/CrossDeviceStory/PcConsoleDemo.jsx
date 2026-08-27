function MarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.1 10.7c1.5 0 2.6-1.3 2.6-3s-1.1-3-2.6-3-2.7 1.4-2.7 3 1.2 3 2.7 3Zm9.8 0c1.5 0 2.7-1.3 2.7-3s-1.2-3-2.7-3-2.6 1.4-2.6 3 1.1 3 2.6 3ZM12 19.4c3.7 0 6.6-1.9 6.6-4.4 0-2.2-2.4-3.8-4.1-3.8-1.1 0-1.6.6-2.5.6s-1.4-.6-2.5-.6c-1.7 0-4.1 1.6-4.1 3.8 0 2.5 2.9 4.4 6.6 4.4Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m5 6 3 3 3-3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m3 10 13-6-4.8 12-1.7-4.4L3 10Z" />
      <path d="m9.5 11.6 2.7-2.8" />
    </svg>
  );
}

function statusLabel(state, copy) {
  if (state.sessionStatus === 'approval-pending') return copy.consoles.approvalPending;
  if (state.sessionStatus === 'complete') return copy.consoles.complete;
  if (state.sessionStatus === 'ready') return copy.consoles.online;
  return copy.consoles.running;
}

function ProductDisclaimer({ copy }) {
  return (
    <p className="console-demo__disclaimer">
      <span aria-hidden="true">ⓘ</span>
      {copy.consoles.demoDisclaimer}
    </p>
  );
}

function WorkspaceSidebar({ state, copy }) {
  return (
    <aside className="pc-console__sidebar">
      <div className="pc-console__brand">
        <span className="pc-console__brand-mark"><MarkIcon /></span>
        <span>Paws</span>
      </div>
      <button className="pc-console__new-session" type="button" disabled aria-label={copy.scenes[0].title}>
        <span aria-hidden="true">＋</span>
        <span>{copy.scenes[0].number}</span>
      </button>
      <div className="pc-console__nav-label" aria-hidden="true">Sessions</div>
      <div className="pc-console__session-link" data-active={String(state.sceneId !== 'start')}>
        <span className="pc-console__session-glyph" aria-hidden="true">›_</span>
        <span>
          <strong>refactor-auth</strong>
          <small>{statusLabel(state, copy)}</small>
        </span>
        <i data-status={state.sessionStatus} />
      </div>
      <div className="pc-console__sidebar-spacer" />
      <div className="pc-console__machine-mini">
        <span className="console-status-dot" data-status={state.machineStatus} />
        <span>{copy.consoles.machine}</span>
      </div>
    </aside>
  );
}

function ComposePanel({ state, copy, scene }) {
  const controls = [
    { kind: 'machine', label: 'Machine', value: copy.consoles.machine, meta: copy.consoles.online },
    { kind: 'project', label: 'Project', value: copy.consoles.project, meta: 'workspace' },
    { kind: 'agent', label: 'Agent', value: copy.consoles.agent, meta: 'GPT-5' }
  ];

  return (
    <div className="pc-console__main pc-console__main--compose">
      <header className="pc-console__topbar">
        <div>
          <span className="console-kicker">PC WEB</span>
          <h3>{scene.title}</h3>
        </div>
        <span className="console-status-chip" data-status={state.sessionStatus}>
          <i />{copy.consoles.online}
        </span>
      </header>
      <div className="pc-console__compose-wrap">
        <div className="pc-console__compose-card">
          <div className="pc-console__control-grid">
            {controls.map(control => (
              <button
                className="pc-console__selector"
                data-kind={control.kind}
                type="button"
                disabled
                key={control.kind}
              >
                <span className="pc-console__selector-icon" aria-hidden="true">
                  {control.kind === 'machine' ? '⌁' : control.kind === 'project' ? '⌂' : '✦'}
                </span>
                <span>
                  <small>{control.label}</small>
                  <strong>{control.value}</strong>
                </span>
                <span className="pc-console__selector-meta">{control.meta}</span>
                <ChevronIcon />
              </button>
            ))}
          </div>
          <div className="pc-console__prompt">
            <p>{scene.body}</p>
            <div className="pc-console__prompt-footer">
              <span aria-hidden="true">＋</span>
              <span className="pc-console__prompt-agent">{copy.consoles.agent}</span>
              <button type="button" disabled aria-label={scene.title}><SendIcon /></button>
            </div>
          </div>
          <ProductDisclaimer copy={copy} />
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_LABELS = {
  skill: 'Skill',
  tool: 'Tool',
  subagent: 'Subagent'
};

function ActivityList({ toolStates }) {
  if (toolStates.length === 0) return null;

  return (
    <div className="pc-console__activity" aria-label="Agent activity">
      {toolStates.map(toolState => {
        const [kind, phase] = toolState.split('-');
        return (
          <div className="pc-console__activity-row" data-phase={phase} key={toolState}>
            <span className="pc-console__activity-icon" aria-hidden="true">
              {phase === 'complete' ? '✓' : '↻'}
            </span>
            <span>
              <strong>{ACTIVITY_LABELS[kind]}</strong>
              <small>{phase === 'complete' ? 'complete' : 'running'}</small>
            </span>
            <i />
          </div>
        );
      })}
    </div>
  );
}

function SessionPanel({ state, copy, scene }) {
  const pending = state.permission?.status === 'pending';
  return (
    <div className="pc-console__main pc-console__main--session">
      <header className="pc-console__session-header">
        <div className="pc-console__session-title">
          <span className="pc-console__terminal-glyph" aria-hidden="true">›_</span>
          <span>
            <strong>{state.sessionId}</strong>
            <small>{copy.consoles.machine} · {copy.consoles.agent}</small>
          </span>
        </div>
        <span className="console-status-chip" data-status={state.sessionStatus}>
          <i />{statusLabel(state, copy)}
        </span>
      </header>
      <div className="pc-console__transcript">
        <div className="pc-console__message pc-console__message--user">
          <span className="pc-console__avatar">J</span>
          <div>
            <small>{scene.number}</small>
            <p>{scene.title}</p>
          </div>
        </div>
        <div className="pc-console__message pc-console__message--agent">
          <span className="pc-console__avatar pc-console__avatar--agent"><MarkIcon /></span>
          <div className="pc-console__response">
            <p>{scene.body}</p>
            <ActivityList toolStates={state.toolStates} />
            {state.permission && (
              <div className="pc-console__permission" data-status={state.permission.status}>
                <span className="pc-console__permission-icon" aria-hidden="true">
                  {pending ? '!' : '✓'}
                </span>
                <span>
                  <small>{pending ? copy.consoles.approvalPending : copy.consoles.running}</small>
                  <code>{state.permission.command}</code>
                </span>
                <i />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pc-console__composer">
        <span>›</span>
        <span className="pc-console__composer-line" aria-hidden="true" />
        <button type="button" disabled aria-label={copy.consoles.pcSummary[state.sceneId]}><SendIcon /></button>
      </div>
      <ProductDisclaimer copy={copy} />
    </div>
  );
}

export default function PcConsoleDemo({ state, copy }) {
  const scene = copy.scenes.find(item => item.id === state.sceneId);
  const focused = state.focus === 'pc' || state.focus === 'shared';
  return (
    <section
      className="pc-console"
      data-testid="pc-console"
      data-scene={state.sceneId}
      data-status={state.sessionStatus}
      data-focus={String(focused)}
      aria-label={copy.consoles.pcSummary[state.sceneId]}
    >
      <div className="pc-console__chrome" aria-hidden="true">
        <i /><i /><i />
        <span>paws · web</span>
        <b>⌁</b>
      </div>
      <div className="pc-console__app">
        <WorkspaceSidebar state={state} copy={copy} />
        {state.sceneId === 'start'
          ? <ComposePanel state={state} copy={copy} scene={scene} />
          : <SessionPanel state={state} copy={copy} scene={scene} />}
      </div>
    </section>
  );
}
