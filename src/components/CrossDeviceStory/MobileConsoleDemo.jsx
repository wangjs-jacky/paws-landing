function MobileMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.1 10.7c1.5 0 2.6-1.3 2.6-3s-1.1-3-2.6-3-2.7 1.4-2.7 3 1.2 3 2.7 3Zm9.8 0c1.5 0 2.7-1.3 2.7-3s-1.2-3-2.7-3-2.6 1.4-2.6 3 1.1 3 2.6 3ZM12 19.4c3.7 0 6.6-1.9 6.6-4.4 0-2.2-2.4-3.8-4.1-3.8-1.1 0-1.6.6-2.5.6s-1.4-.6-2.5-.6c-1.7 0-4.1 1.6-4.1 3.8 0 2.5 2.9 4.4 6.6 4.4Z" />
    </svg>
  );
}

function MobileSendIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m3 10 13-6-4.8 12-1.7-4.4L3 10Z" />
      <path d="m9.5 11.6 2.7-2.8" />
    </svg>
  );
}

function mobileStatusLabel(state, copy) {
  if (state.sessionStatus === 'approval-pending') return copy.consoles.approvalPending;
  if (state.sessionStatus === 'complete') return copy.consoles.complete;
  if (state.sessionStatus === 'ready') return copy.consoles.online;
  return copy.consoles.running;
}

function PermissionCard({ state, copy, scene }) {
  return (
    <div className="permission-card">
      <div className="permission-card__alert">
        <span aria-hidden="true">!</span>
        <div>
          <strong>{copy.consoles.approvalPending}</strong>
          <p>{scene.body}</p>
        </div>
      </div>
      <div className="permission-card__command">
        <span aria-hidden="true">›_</span>
        <code>{state.permission.command}</code>
      </div>
      <div className="permission-card__actions">
        <button type="button" disabled>{copy.consoles.approveOnce}</button>
        <button type="button" disabled>{copy.consoles.allowSession}</button>
        <button type="button" disabled>{copy.consoles.reject}</button>
      </div>
    </div>
  );
}

function CondensedTranscript({ state, copy, scene }) {
  return (
    <div className="mobile-console__transcript">
      <div className="mobile-console__scene-heading">
        <span>{scene.number}</span>
        <strong>{scene.title}</strong>
      </div>
      <div className="mobile-console__message mobile-console__message--user">
        <p>{scene.title}</p>
      </div>
      <div className="mobile-console__message mobile-console__message--agent">
        <span className="mobile-console__agent-mark"><MobileMarkIcon /></span>
        <div>
          <p>{scene.body}</p>
          {state.toolStates.length > 0 && (
            <div className="mobile-console__activity">
              {state.toolStates.map(toolState => (
                <i data-state={toolState} key={toolState} aria-hidden="true" />
              ))}
              <small>{copy.consoles.agent}</small>
            </div>
          )}
          {state.permission?.status === 'approved' && (
            <div className="mobile-console__approved">
              <span aria-hidden="true">✓</span>
              <code>{state.permission.command}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MobileConsoleDemo({ state, copy }) {
  const focused = state.focus === 'mobile' || state.focus === 'shared';
  const scene = copy.scenes.find(item => item.id === state.sceneId);
  const needsApproval = state.sceneId === 'approve' && state.permission?.status === 'pending';

  return (
    <section
      className="mobile-console"
      data-testid="mobile-console"
      data-scene={state.sceneId}
      data-status={state.sessionStatus}
      data-focus={String(focused)}
      aria-label={copy.consoles.demoDisclaimer}
    >
      <div className="mobile-console__shell">
        <div className="mobile-console__island" aria-hidden="true" />
        <div className="mobile-console__statusbar" aria-hidden="true">
          <span>9:41</span>
          <span>● ◔ ▰</span>
        </div>
        <header className="mobile-console__header">
          <button type="button" disabled aria-label={scene.title}>‹</button>
          <div>
            <span>{state.sessionId}</span>
            <strong data-status={state.sessionStatus}>
              <i />{mobileStatusLabel(state, copy)}
            </strong>
          </div>
          <span className="mobile-console__header-mark"><MobileMarkIcon /></span>
        </header>
        <div className="mobile-console__body">
          {needsApproval
            ? <PermissionCard state={state} copy={copy} scene={scene} />
            : <CondensedTranscript state={state} copy={copy} scene={scene} />}
        </div>
        {!needsApproval && (
          <div className="mobile-console__composer">
            <span aria-hidden="true">＋</span>
            <span className="mobile-console__composer-line" aria-hidden="true" />
            <button type="button" disabled aria-label={copy.consoles.demoDisclaimer}><MobileSendIcon /></button>
          </div>
        )}
        <p className="console-demo__disclaimer console-demo__disclaimer--mobile">
          <span aria-hidden="true">ⓘ</span>
          {copy.consoles.demoDisclaimer}
        </p>
        <div className="mobile-console__home" aria-hidden="true" />
      </div>
    </section>
  );
}
