export function clampSceneIndex(index, sceneCount) {
  return Math.max(0, Math.min(sceneCount - 1, Math.trunc(index)));
}

export function sceneIndexFromProgress(progress, sceneCount) {
  const normalized = Math.max(0, Math.min(1, progress));
  return clampSceneIndex(Math.floor(normalized * sceneCount), sceneCount);
}

export function buildConsoleState(sceneId, content) {
  const base = {
    sceneId,
    machineStatus: 'online',
    sessionId: content.consoles.sessionId,
    toolStates: []
  };
  const states = {
    start: {
      sessionStatus: 'ready',
      focus: 'pc',
      permission: null
    },
    watch: {
      sessionStatus: 'running',
      focus: 'pc',
      permission: null,
      toolStates: ['skill-complete', 'tool-running', 'subagent-running']
    },
    approve: {
      sessionStatus: 'approval-pending',
      focus: 'mobile',
      permission: { command: 'npm run build', status: 'pending' }
    },
    handoff: {
      sessionStatus: 'running',
      focus: 'shared',
      permission: { command: 'npm run build', status: 'approved' },
      toolStates: ['skill-complete', 'tool-complete']
    }
  };

  if (!states[sceneId]) {
    throw new RangeError(`Unknown Paws story scene: ${sceneId}`);
  }

  return { ...base, ...states[sceneId] };
}
