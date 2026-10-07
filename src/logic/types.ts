export type Category = 'even' | 'odd';
export type Choice = 'left' | 'right';
export type GameMode = 'training' | 'challenge';
export type Outcome = 'correct' | 'wrong-basket' | 'unanswered';

type EggIdentity = Readonly<{
  id: number;
  value: number;
  lane: number;
}>;

export type Egg = EggIdentity & (
  | Readonly<{ status: 'rolling' | 'waiting'; outcome: null }>
  | Readonly<{ status: 'judged'; outcome: Outcome }>
);

export type EggStatus = Egg['status'];

export type AnswerRecord = Readonly<{
  eggId: number;
  value: number;
  correctCategory: Category;
}> & (
  | Readonly<{ choice: Choice; outcome: 'correct' | 'wrong-basket'; mode: GameMode }>
  | Readonly<{ choice: null; outcome: 'unanswered'; mode: 'challenge' }>
);

// Only the functions in round.ts should change these two fields.
export interface Round {
  readonly mode: GameMode;
  activeEgg: Egg | null;
  answers: readonly AnswerRecord[];
}
