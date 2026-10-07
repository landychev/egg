import { describe, expect, it } from 'vitest';
import { createEgg } from './eggs';
import { createEggIdCounter } from './ids';
import { answer, createRound, reachEnd, setActiveEgg } from './round';
import type { Choice, GameMode } from './types';

function setup(mode: GameMode = 'challenge', value = 7) {
  const ids = createEggIdCounter();
  const round = createRound(mode);
  const egg = createEgg(ids, value, 1);
  setActiveEgg(round, egg);
  return { ids, round, egg };
}

describe('omgång och aktivt ägg, 02.11', () => {
  it.each<GameMode>(['training', 'challenge'])('börjar med tom omgång i %s', mode => {
    expect(createRound(mode)).toEqual({ mode, activeEgg: null, answers: [] });
  });
  it('avvisar ett andra ägg medan det första rullar eller väntar', () => {
    const { ids, round, egg } = setup('training');
    const second = createEgg(ids, 8, 2);
    expect(() => setActiveEgg(round, second)).toThrow('already active');
    reachEnd(round, egg.id);
    expect(() => setActiveEgg(round, second)).toThrow('already active');
    expect(round.activeEgg?.id).toBe(egg.id);
  });
  it('tillåter nästa ägg efter bedömning och bevarar svarsposten', () => {
    const { ids, round, egg } = setup();
    const record = answer(round, egg.id, 'right');
    const second = createEgg(ids, 8, 2);
    setActiveEgg(round, second);
    expect(round.activeEgg).toEqual(second);
    expect(round.answers).toEqual([record]);
    expect(answer(round, egg.id, 'left')).toBeNull();
    expect(reachEnd(round, egg.id)).toBeNull();
    expect(round.activeEgg?.status).toBe('rolling');
  });
  it('avvisar återanvändning även av den ursprungliga rullande äggreferensen', () => {
    const { round, egg } = setup();
    answer(round, egg.id, 'right');
    expect(() => setActiveEgg(round, egg)).toThrow('new, unjudged');
    expect(() => setActiveEgg(round, round.activeEgg!)).toThrow('new, unjudged');
    expect(round.answers).toHaveLength(1);
  });
  it('ignorerar gamla id efter omstart utan att nollställa sessionsräknaren', () => {
    const { ids, round, egg } = setup('training');
    answer(round, egg.id, 'left');
    const restarted = createRound('challenge');
    const next = createEgg(ids, 8, 2);
    setActiveEgg(restarted, next);
    expect(next.id).toBeGreaterThan(egg.id);
    expect(answer(restarted, egg.id, 'right')).toBeNull();
    expect(reachEnd(restarted, egg.id)).toBeNull();
    expect(restarted.answers).toEqual([]);
    expect(answer(restarted, next.id, 'left')?.mode).toBe('challenge');
    expect(round.answers).toHaveLength(1);
    expect(round.answers[0]?.mode).toBe('training');
    expect(restarted.answers).toHaveLength(1);
  });
});

describe('knapptryck, 02.12', () => {
  it.each([
    [7, 'right', 'correct', 'odd'],
    [7, 'left', 'wrong-basket', 'odd'],
    [0, 'left', 'correct', 'even'],
  ] as const)('tal %s med %s ger %s', (value, choice, outcome, correctCategory) => {
    const { round, egg } = setup('challenge', value);
    const record = answer(round, egg.id, choice);
    expect(record).toEqual({ eggId: egg.id, value, choice, correctCategory, outcome, mode: 'challenge' });
    expect(round.answers).toEqual([record]);
    expect(round.activeEgg).toMatchObject({ status: 'judged', outcome });
  });
  it.each<GameMode>(['training', 'challenge'])('låser första trycket i %s', mode => {
    const { round, egg } = setup(mode);
    const record = answer(round, egg.id, 'left');
    expect(answer(round, egg.id, 'right')).toBeNull();
    expect(round.answers).toEqual([record]);
    expect(round.activeEgg?.outcome).toBe('wrong-basket');
  });
  it('ignorerar tryck utan aktivt ägg och med fel id', () => {
    expect(answer(createRound('challenge'), 1, 'right')).toBeNull();
    const { round, egg } = setup();
    expect(answer(round, egg.id + 1, 'right')).toBeNull();
    expect(round.answers).toEqual([]);
    expect(round.activeEgg).toEqual(egg);
  });
  it('skyddar sparade svar och ägg mot direkt ändring', () => {
    const { round, egg } = setup();
    const record = answer(round, egg.id, 'right');
    expect(Object.isFrozen(egg)).toBe(true);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(round.answers)).toBe(true);
    expect(Object.isFrozen(round.activeEgg)).toBe(true);
  });
});

describe('rännans slut, 02.13', () => {
  it('registrerar utan svar i utmaning, en enda gång', () => {
    const { round, egg } = setup();
    const record = reachEnd(round, egg.id);
    expect(record).toEqual({ eggId: egg.id, value: 7, choice: null, correctCategory: 'odd',
      outcome: 'unanswered', mode: 'challenge' });
    expect(round.activeEgg).toMatchObject({ status: 'judged', outcome: 'unanswered' });
    expect(reachEnd(round, egg.id)).toBeNull();
    expect(answer(round, egg.id, 'right')).toBeNull();
    expect(round.answers).toEqual([record]);
  });
  it('väntar i träning utan att registrera en miss, även efter upprepade slut-anrop', () => {
    const { round, egg } = setup('training');
    expect(reachEnd(round, egg.id)).toBeNull();
    expect(reachEnd(round, egg.id)).toBeNull();
    expect(round.activeEgg).toMatchObject({ status: 'waiting', outcome: null });
    expect(round.answers).toEqual([]);
    expect(answer(round, egg.id, 'right')?.outcome).toBe('correct');
    expect(round.activeEgg?.status).toBe('judged');
    expect(round.answers).toHaveLength(1);
  });
  it('ignorerar slut-anrop utan aktivt ägg och med fel id', () => {
    expect(reachEnd(createRound('training'), 1)).toBeNull();
    const { round, egg } = setup();
    expect(reachEnd(round, egg.id + 1)).toBeNull();
    expect(round.activeEgg).toEqual(egg);
    expect(round.answers).toEqual([]);
  });
});

describe('samlade regelkontroller, 02.14', () => {
  it.each(Array.from({ length: 21 }, (_, value) => value))('tal %i har exakt ett rätt val i båda lägena', value => {
    for (const mode of ['training', 'challenge'] as const) {
      const outcomes = (['left', 'right'] as const).map(choice => {
        const { round, egg } = setup(mode, value);
        return answer(round, egg.id, choice)?.outcome;
      });
      expect(outcomes.filter(outcome => outcome === 'correct')).toHaveLength(1);
      expect(outcomes.filter(outcome => outcome === 'wrong-basket')).toHaveLength(1);
    }
  });
  it.each<Choice>(['left', 'right'])('tryck %s före slutet räknas bara en gång i utmaning', choice => {
    const { round, egg } = setup();
    const record = answer(round, egg.id, choice);
    expect(reachEnd(round, egg.id)).toBeNull();
    expect(round.answers).toEqual([record]);
  });
  it.each<Choice>(['left', 'right'])('slutet före tryck %s ger bara utan svar i utmaning', choice => {
    const { round, egg } = setup();
    reachEnd(round, egg.id);
    expect(answer(round, egg.id, choice)).toBeNull();
    expect(round.answers).toHaveLength(1);
    expect(round.answers[0]?.outcome).toBe('unanswered');
  });
  it.each<Choice>(['left', 'right'])('slutet före tryck %s i träning ger samma bedömning som ett tidigt tryck', choice => {
    const early = setup('training');
    const late = setup('training');
    reachEnd(late.round, late.egg.id);
    const record = answer(early.round, early.egg.id, choice);
    expect(answer(late.round, late.egg.id, choice)).toEqual(record);
    expect(reachEnd(early.round, early.egg.id)).toBeNull();
    expect(reachEnd(late.round, late.egg.id)).toBeNull();
    expect(late.round.answers).toHaveLength(1);
  });
});
