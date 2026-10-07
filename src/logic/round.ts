import { categoryForChoice } from './categories';
import { categoryFor } from './parity';
import type { AnswerRecord, Choice, Egg, GameMode, Round } from './types';

export function createRound(mode: GameMode): Round {
  return { mode, activeEgg: null, answers: Object.freeze([]) };
}

export function setActiveEgg(round: Round, egg: Egg): void {
  if (round.activeEgg !== null && round.activeEgg.status !== 'judged') {
    throw new Error('An egg is already active.');
  }
  if (egg.status !== 'rolling' || round.answers.some(record => record.eggId === egg.id)) {
    throw new Error('Only a new, unjudged egg can be activated.');
  }
  round.activeEgg = egg;
}

function recordAnswer(round: Round, egg: Egg, record: AnswerRecord): AnswerRecord {
  const saved = Object.freeze(record);
  round.activeEgg = Object.freeze({ ...egg, status: 'judged', outcome: saved.outcome });
  round.answers = Object.freeze([...round.answers, saved]);
  return saved;
}

// No clock or position: the first accepted event determines the result.
export function answer(round: Round, eggId: number, choice: Choice): AnswerRecord | null {
  const egg = round.activeEgg;
  if (egg === null || egg.id !== eggId || egg.status === 'judged') return null;

  const correctCategory = categoryFor(egg.value);
  const outcome = categoryForChoice(choice) === correctCategory ? 'correct' : 'wrong-basket';
  return recordAnswer(round, egg, {
    eggId: egg.id, value: egg.value, choice, correctCategory, outcome, mode: round.mode,
  });
}

export function reachEnd(round: Round, eggId: number): AnswerRecord | null {
  const egg = round.activeEgg;
  if (egg === null || egg.id !== eggId || egg.status !== 'rolling') return null;

  switch (round.mode) {
    case 'training':
      round.activeEgg = Object.freeze({ ...egg, status: 'waiting', outcome: null });
      return null;
    case 'challenge':
      return recordAnswer(round, egg, {
        eggId: egg.id, value: egg.value, choice: null,
        correctCategory: categoryFor(egg.value), outcome: 'unanswered', mode: 'challenge',
      });
  }
}
