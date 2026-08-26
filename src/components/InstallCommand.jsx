import { useState } from 'react';
import { INSTALL_COMMAND } from '../app/siteConstants';

export async function copyToClipboard(text, clipboard, targetDocument) {
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Continue to the selection-based fallback.
    }
  }

  let textarea;

  try {
    textarea = targetDocument.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.inset = '-9999px auto auto -9999px';
    targetDocument.body.appendChild(textarea);
    textarea.select();
    return targetDocument.execCommand('copy') === true;
  } catch {
    return false;
  } finally {
    textarea?.remove();
  }
}

export default function InstallCommand({ command = INSTALL_COMMAND, labels, compact = false }) {
  const [copyState, setCopyState] = useState('idle');

  async function handleCopy() {
    setCopyState('idle');
    const copied = await copyToClipboard(command, navigator.clipboard, document);
    setCopyState(copied ? 'copied' : 'error');
  }

  const status = copyState === 'copied'
    ? labels.copied
    : copyState === 'error'
      ? labels.copyFailed
      : '';

  return (
    <div
      className="install-command"
      data-compact={compact || undefined}
      data-state={copyState}
      onClick={handleCopy}
    >
      <code className="install-command__text">{command}</code>
      <button
        className="install-command__button"
        type="button"
        aria-label={labels.copy}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M5 8h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
        </svg>
      </button>
      <span className="install-command__status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
