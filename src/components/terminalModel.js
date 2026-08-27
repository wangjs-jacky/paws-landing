export function createTerminalState() {
  return { phase: 'typing', lineIndex: 0, charIndex: 0, rendered: [] };
}

export function advanceTerminal(state, transcript) {
  if (state.phase !== 'typing') return state;
  if (transcript.length === 0) {
    return { phase: 'hold', lineIndex: 0, charIndex: 0, rendered: [] };
  }

  const line = transcript[state.lineIndex] ?? '';
  if (state.charIndex < line.length) {
    return { ...state, charIndex: state.charIndex + 1 };
  }

  const rendered = [...state.rendered, line];
  if (state.lineIndex === transcript.length - 1) {
    return { phase: 'hold', lineIndex: state.lineIndex, charIndex: line.length, rendered };
  }

  return { phase: 'typing', lineIndex: state.lineIndex + 1, charIndex: 0, rendered };
}
