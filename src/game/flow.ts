import type { GameMode } from '../logic/types';

export type Phase = 'idle' | 'rolling' | 'waiting' | 'resolving' | 'gap';
export type FlowEvent = 'start' | 'answered' | 'reachedEnd' | 'resolved' | 'next' | 'stop';

export const PHASES: readonly Phase[] = Object.freeze(['idle', 'rolling', 'waiting', 'resolving', 'gap']);
export const FLOW_EVENTS: readonly FlowEvent[] = Object.freeze(['start', 'answered', 'reachedEnd', 'resolved', 'next', 'stop']);

// A target is either one phase for every mode, or one phase per mode.
// Only rolling + reachedEnd depends on the mode.
type Target = Phase | Readonly<Record<GameMode, Phase>>;

/** Allowed transitions. Any phase/event pair missing here is invalid. */
export const TRANSITIONS: Readonly<Record<Phase, Readonly<Partial<Record<FlowEvent, Target>>>>> = Object.freeze({
  idle: Object.freeze({ start: 'rolling', stop: 'idle' }),
  rolling: Object.freeze({
    answered: 'resolving',
    reachedEnd: Object.freeze({ training: 'waiting', challenge: 'resolving' }),
    stop: 'idle',
  }),
  waiting: Object.freeze({ answered: 'resolving', stop: 'idle' }),
  resolving: Object.freeze({ resolved: 'gap', stop: 'idle' }),
  gap: Object.freeze({ next: 'rolling', stop: 'idle' }),
});

/** Returns the next phase, or throws an Error for a transition that is not allowed. */
export function nextPhase(phase: Phase, event: FlowEvent, mode: GameMode): Phase {
  const target = TRANSITIONS[phase]?.[event];
  if (target === undefined) throw new Error(`Invalid transition: ${phase} + ${event}`);
  return typeof target === 'string' ? target : target[mode];
}

/** True only in 'rolling' and 'waiting'. */
export function acceptsAnswer(phase: Phase): boolean {
  return phase === 'rolling' || phase === 'waiting';
}
