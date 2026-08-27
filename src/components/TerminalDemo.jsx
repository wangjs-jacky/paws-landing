import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from './InstallCommand';
import { advanceTerminal, createTerminalState } from './terminalModel';

const TYPE_DELAY_MS = 40;
const HOLD_DELAY_MS = 3200;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export default function TerminalDemo({ command, labels, terminalCopy }) {
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [terminalState, setTerminalState] = useState(createTerminalState);
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return undefined;
    const handleChange = event => setReducedMotion(event.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) {
      setActive(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !active) return undefined;

    const timeout = window.setTimeout(() => {
      setTerminalState(current => current.phase === 'hold'
        ? createTerminalState()
        : advanceTerminal(current, terminalCopy.lines));
    }, terminalState.phase === 'hold' ? HOLD_DELAY_MS : TYPE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [active, reducedMotion, terminalCopy.lines, terminalState]);

  async function handleCopy() {
    setCopyState('idle');
    const copied = await copyToClipboard(command, navigator.clipboard, document);
    setCopyState(copied ? 'copied' : 'error');
  }

  const lines = reducedMotion ? terminalCopy.lines : terminalState.rendered;
  const currentLine = !reducedMotion && terminalState.phase === 'typing'
    ? (terminalCopy.lines[terminalState.lineIndex] ?? '').slice(0, terminalState.charIndex)
    : '';
  const phase = reducedMotion ? 'complete' : terminalState.phase;
  const status = copyState === 'copied'
    ? labels.copied
    : copyState === 'error'
      ? labels.copyFailed
      : '';

  return (
    <div ref={rootRef} className="terminal-demo" data-testid="terminal-demo" data-phase={phase}>
      <div className="terminal-demo__bar">
        <span className="terminal-demo__lights" aria-hidden="true"><i /><i /><i /></span>
        <span className="terminal-demo__title">{terminalCopy.title}</span>
      </div>
      <div className="terminal-demo__install" aria-label={terminalCopy.installLabel}>
        <code>$ {command}</code>
        <button className="terminal-demo__copy" type="button" aria-label={labels.copy} onClick={handleCopy}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M5 8h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
          </svg>
        </button>
      </div>
      <div className="terminal-demo__body" aria-label={terminalCopy.title}>
        {lines.map((line, index) => <div key={`${index}-${line}`}>{line}</div>)}
        {terminalState.phase === 'typing' && !reducedMotion && (
          <div>{currentLine}<span className="terminal-demo__caret" aria-hidden="true">▋</span></div>
        )}
      </div>
      <span className="terminal-demo__status" role="status" aria-live="polite">{status}</span>
    </div>
  );
}
