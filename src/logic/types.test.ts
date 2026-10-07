import { expectTypeOf, it } from 'vitest';
import type { AnswerRecord, Category, Choice, Egg, EggStatus, GameMode, Outcome } from './types';

it('begränsar grundbegreppen och skiljer obehandlat från utan svar, 02.2', () => {
  expectTypeOf<Category>().toEqualTypeOf<'even' | 'odd'>();
  expectTypeOf<Choice>().toEqualTypeOf<'left' | 'right'>();
  expectTypeOf<GameMode>().toEqualTypeOf<'training' | 'challenge'>();
  expectTypeOf<Outcome>().toEqualTypeOf<'correct' | 'wrong-basket' | 'unanswered'>();
  expectTypeOf<EggStatus>().toEqualTypeOf<'rolling' | 'waiting' | 'judged'>();
  expectTypeOf<Extract<Egg, { status: 'judged' }>['outcome']>().toEqualTypeOf<Outcome>();
  expectTypeOf<Exclude<Egg, { status: 'judged' }>['outcome']>().toEqualTypeOf<null>();
  expectTypeOf<Extract<AnswerRecord, { outcome: 'unanswered' }>['choice']>().toEqualTypeOf<null>();
  expectTypeOf<Extract<AnswerRecord, { outcome: 'unanswered' }>['mode']>().toEqualTypeOf<'challenge'>();
  expectTypeOf<Exclude<AnswerRecord, { outcome: 'unanswered' }>['choice']>().toEqualTypeOf<Choice>();
});
