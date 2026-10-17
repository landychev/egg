import { describe, expect, it } from 'vitest';
import { FLOW_EVENTS, PHASES, TRANSITIONS, acceptsAnswer, nextPhase } from './flow';
import type { FlowEvent, Phase } from './flow';
import type { GameMode } from '../logic/types';

const MODES: readonly GameMode[] = ['training', 'challenge'];

// The K2 transition table, written out independently of TRANSITIONS.
const EXPECTED: readonly (readonly [Phase, FlowEvent, GameMode, Phase])[] = [
  ...MODES.map(mode => ['idle', 'start', mode, 'rolling'] as const),
  ...MODES.map(mode => ['rolling', 'answered', mode, 'resolving'] as const),
  ['rolling', 'reachedEnd', 'training', 'waiting'],
  ['rolling', 'reachedEnd', 'challenge', 'resolving'],
  ...MODES.map(mode => ['waiting', 'answered', mode, 'resolving'] as const),
  ...MODES.map(mode => ['resolving', 'resolved', mode, 'gap'] as const),
  ...MODES.map(mode => ['gap', 'next', mode, 'rolling'] as const),
  ...PHASES.flatMap(phase => MODES.map(mode => [phase, 'stop', mode, 'idle'] as const)),
];

function expectedTarget(phase: Phase, event: FlowEvent, mode: GameMode): Phase | undefined {
  return EXPECTED.find(([p, e, m]) => p === phase && e === event && m === mode)?.[3];
}

const INVALID = PHASES.flatMap(phase => FLOW_EVENTS.flatMap(event => MODES
  .filter(mode => expectedTarget(phase, event, mode) === undefined)
  .map(mode => [phase, event, mode] as const)));

function run(mode: GameMode, events: readonly FlowEvent[]): Phase[] {
  const phases: Phase[] = ['idle'];
  for (const event of events) phases.push(nextPhase(phases[phases.length - 1]!, event, mode));
  return phases;
}

describe('Loop phase transitions (K2)', () => {
  it.each(EXPECTED)('%s + %s in %s goes to %s', (phase, event, mode, target) => {
    expect(nextPhase(phase, event, mode)).toBe(target);
  });

  it('lets only reachedEnd depend on the mode', () => {
    for (const phase of PHASES) for (const event of FLOW_EVENTS) {
      const targets = MODES.map(mode => expectedTarget(phase, event, mode));
      if (phase === 'rolling' && event === 'reachedEnd') expect(targets).toEqual(['waiting', 'resolving']);
      else expect(targets[0]).toBe(targets[1]);
    }
  });

  it('allows stop from every phase', () => {
    for (const phase of PHASES) for (const mode of MODES) expect(nextPhase(phase, 'stop', mode)).toBe('idle');
  });

  it('covers every phase and event in the data table', () => {
    expect(Object.keys(TRANSITIONS).sort()).toEqual([...PHASES].sort());
    expect(new Set(PHASES).size).toBe(5);
    expect(new Set(FLOW_EVENTS).size).toBe(6);
    // Six non-stop transitions per mode, plus stop from each of the five phases, in two modes.
    expect(EXPECTED).toHaveLength((6 + PHASES.length) * MODES.length);
  });

  it('keeps the table frozen', () => {
    expect(Object.isFrozen(TRANSITIONS)).toBe(true);
    for (const phase of PHASES) expect(Object.isFrozen(TRANSITIONS[phase])).toBe(true);
    expect(Object.isFrozen(TRANSITIONS.rolling.reachedEnd)).toBe(true);
    expect(Object.isFrozen(PHASES)).toBe(true);
    expect(Object.isFrozen(FLOW_EVENTS)).toBe(true);
  });
});

describe('Invalid loop phase transitions', () => {
  it.each<[Phase, FlowEvent]>([
    ['gap', 'answered'],
    ['resolving', 'answered'],
    ['idle', 'answered'],
    ['rolling', 'next'],
    ['waiting', 'reachedEnd'],
    ['idle', 'next'],
    ['waiting', 'start'],
    ['gap', 'resolved'],
  ])('%s + %s throws in both modes', (phase, event) => {
    for (const mode of MODES) {
      expect(() => nextPhase(phase, event, mode)).toThrow(`Invalid transition: ${phase} + ${event}`);
    }
  });

  it('throws for every combination outside the table, naming phase and event', () => {
    expect(INVALID).toHaveLength(PHASES.length * FLOW_EVENTS.length * MODES.length - EXPECTED.length);
    for (const [phase, event, mode] of INVALID) {
      expect(() => nextPhase(phase, event, mode)).toThrow(new Error(`Invalid transition: ${phase} + ${event}`));
    }
  });
});

describe('Answer acceptance by phase', () => {
  it.each<[Phase, boolean]>([
    ['idle', false],
    ['rolling', true],
    ['waiting', true],
    ['resolving', false],
    ['gap', false],
  ])('%s accepts an answer: %s', (phase, accepts) => {
    expect(acceptsAnswer(phase)).toBe(accepts);
  });

  it('is checked for every phase', () => {
    expect(PHASES.filter(acceptsAnswer)).toEqual(['rolling', 'waiting']);
  });
});

describe('Full loop sequences', () => {
  it('runs a training cycle with an answer in flight and one while waiting', () => {
    const events: FlowEvent[] = ['start', 'answered', 'resolved', 'next', 'reachedEnd', 'answered', 'resolved'];
    expect(run('training', events)).toEqual(
      ['idle', 'rolling', 'resolving', 'gap', 'rolling', 'waiting', 'resolving', 'gap'],
    );
  });

  it('runs a challenge cycle where reaching the end is resolved at once', () => {
    expect(run('challenge', ['start', 'reachedEnd', 'resolved', 'next'])).toEqual(
      ['idle', 'rolling', 'resolving', 'gap', 'rolling'],
    );
  });

  it('cannot wait for an answer in challenge mode', () => {
    expect(() => run('challenge', ['start', 'reachedEnd', 'answered'])).toThrow('Invalid transition: resolving + answered');
  });

  it('returns to idle on stop mid-loop and can start again', () => {
    expect(run('training', ['start', 'reachedEnd', 'stop', 'start'])).toEqual(
      ['idle', 'rolling', 'waiting', 'idle', 'rolling'],
    );
  });
});
