import { describe, expect, it } from 'vitest';
import {
  buildConsoleState,
  clampSceneIndex,
  sceneIndexFromProgress
} from '../src/components/CrossDeviceStory/storyModel';

const copy = {
  consoles: {
    sessionId: 'paws/refactor-auth'
  }
};

describe('cross-device story model', () => {
  describe('clampSceneIndex', () => {
    it('truncates an index and clamps it to the available scenes', () => {
      expect(clampSceneIndex(-1, 4)).toBe(0);
      expect(clampSceneIndex(0, 4)).toBe(0);
      expect(clampSceneIndex(2.9, 4)).toBe(2);
      expect(clampSceneIndex(4, 4)).toBe(3);
    });
  });

  describe('sceneIndexFromProgress', () => {
    it('maps normalized progress to four scene intervals', () => {
      expect(sceneIndexFromProgress(0, 4)).toBe(0);
      expect(sceneIndexFromProgress(0.249, 4)).toBe(0);
      expect(sceneIndexFromProgress(0.25, 4)).toBe(1);
      expect(sceneIndexFromProgress(0.999, 4)).toBe(3);
      expect(sceneIndexFromProgress(1, 4)).toBe(3);
    });

    it('clamps progress outside the normalized range', () => {
      expect(sceneIndexFromProgress(-1, 4)).toBe(0);
      expect(sceneIndexFromProgress(2, 4)).toBe(3);
    });
  });

  describe('buildConsoleState', () => {
    it('builds the remote-start state', () => {
      expect(buildConsoleState('start', copy)).toEqual({
        sceneId: 'start',
        machineStatus: 'online',
        sessionStatus: 'ready',
        focus: 'pc',
        permission: null,
        toolStates: [],
        sessionId: 'paws/refactor-auth'
      });
    });

    it('builds the visible-work state', () => {
      expect(buildConsoleState('watch', copy)).toEqual({
        sceneId: 'watch',
        machineStatus: 'online',
        sessionStatus: 'running',
        focus: 'pc',
        permission: null,
        toolStates: ['skill-complete', 'tool-running', 'subagent-running'],
        sessionId: 'paws/refactor-auth'
      });
    });

    it('builds the mobile-approval state', () => {
      expect(buildConsoleState('approve', copy)).toEqual({
        sceneId: 'approve',
        machineStatus: 'online',
        sessionStatus: 'approval-pending',
        focus: 'mobile',
        permission: { command: 'npm run build', status: 'pending' },
        toolStates: [],
        sessionId: 'paws/refactor-auth'
      });
    });

    it('builds the shared handoff state', () => {
      expect(buildConsoleState('handoff', copy)).toEqual({
        sceneId: 'handoff',
        machineStatus: 'online',
        sessionStatus: 'running',
        focus: 'shared',
        permission: { command: 'npm run build', status: 'approved' },
        toolStates: ['skill-complete', 'tool-complete'],
        sessionId: 'paws/refactor-auth'
      });
    });

    it('rejects unknown scenes', () => {
      expect(() => buildConsoleState('unknown', copy)).toThrow(
        new RangeError('Unknown Paws story scene: unknown')
      );
    });
  });
});
