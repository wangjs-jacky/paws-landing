import { describe, expect, it } from 'vitest';
import { advanceTerminal, createTerminalState } from '../src/components/terminalModel';

describe('terminalModel', () => {
  it('types lines in order and holds after the final line', () => {
    let state = createTerminalState();
    const transcript = ['one', 'two'];

    for (let step = 0; step < 4; step += 1) state = advanceTerminal(state, transcript);
    expect(state).toMatchObject({ lineIndex: 1, charIndex: 0, rendered: ['one'] });

    for (let step = 0; step < 4; step += 1) state = advanceTerminal(state, transcript);
    expect(state).toMatchObject({ phase: 'hold', rendered: ['one', 'two'] });
  });

  it('settles an empty transcript into a stable empty hold', () => {
    const state = advanceTerminal(createTerminalState(), []);

    expect(state).toEqual({ phase: 'hold', lineIndex: 0, charIndex: 0, rendered: [] });
    expect(advanceTerminal(state, [])).toBe(state);
  });

  it('keeps every hold state idempotent', () => {
    const state = { phase: 'hold', lineIndex: 1, charIndex: 3, rendered: ['one', 'two'] };

    expect(advanceTerminal(state, ['replacement'])).toBe(state);
  });
});
