import ConnectionFlow from './ConnectionFlow';

function sessionStatusLabel(state, copy) {
  if (state.sessionStatus === 'approval-pending') return copy.consoles.approvalPending;
  if (state.sessionStatus === 'complete') return copy.consoles.complete;
  if (state.sessionStatus === 'ready') return copy.consoles.online;
  return copy.consoles.running;
}

function StaticConsoleSurface({ kind, state, copy, scene }) {
  const focused = state.focus === kind || state.focus === 'shared';
  const isPc = kind === 'pc';
  const facts = isPc
    ? [
        [copy.consoles.labels.machine, copy.consoles.machine],
        [copy.consoles.labels.project, copy.consoles.project],
        [copy.consoles.labels.agent, copy.consoles.agent],
        [copy.consoles.labels.session, state.sessionId]
      ]
    : [
        [copy.consoles.labels.session, state.sessionId],
        [copy.consoles.labels.agent, copy.consoles.agent]
      ];

  return (
    <div
      className={`story-static-console story-static-console--${isPc ? 'pc' : 'app'}`}
      data-static-surface={kind}
      data-scene={state.sceneId}
      data-status={state.sessionStatus}
      data-focus={String(focused)}
      role="group"
      aria-label={isPc ? copy.consoles.pcSummary[state.sceneId] : `${copy.consoles.labels.app} · ${scene.title}`}
    >
      <header className="story-static-console__header">
        <span>{isPc ? copy.consoles.labels.pcWeb : copy.consoles.labels.app}</span>
        <strong data-status={state.sessionStatus}><i />{sessionStatusLabel(state, copy)}</strong>
      </header>
      <p className="story-static-console__scene">{scene.title}</p>
      <dl className="story-static-console__facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {state.toolStates.length > 0 && (
        <ul className="story-static-console__activity" aria-label={copy.consoles.labels.activity}>
          {state.toolStates.map(toolState => {
            const [tool, phase] = toolState.split('-');
            return (
              <li data-phase={phase} key={toolState}>
                <span>{copy.consoles.labels[tool]}</span>
                <i aria-hidden="true">{phase === 'complete' ? '✓' : '◐'}</i>
              </li>
            );
          })}
        </ul>
      )}
      {state.permission && (
        <p className="story-static-console__permission" data-status={state.permission.status}>
          <span>
            {state.permission.status === 'approved' ? `${copy.consoles.complete} ✓` : copy.consoles.approvalPending}
          </span>
          <code>{state.permission.command}</code>
        </p>
      )}
    </div>
  );
}

export default function StaticStoryEvidence({ state, copy, scene }) {
  return (
    <div
      className="story-step__evidence"
      data-testid="story-static-evidence"
      data-static-scene={scene.id}
    >
      <StaticConsoleSurface kind="pc" state={state} copy={copy} scene={scene} />
      <ConnectionFlow focus={state.focus} status={state.sessionStatus} />
      <StaticConsoleSurface kind="mobile" state={state} copy={copy} scene={scene} />
    </div>
  );
}
