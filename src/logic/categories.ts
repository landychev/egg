import type { Category, Choice } from './types';

export const CHOICE_CATEGORIES: Readonly<Record<Choice, Category>> = Object.freeze({
  left: 'even',
  right: 'odd',
});

export const CATEGORY_WORDS: Readonly<Record<Category, Readonly<{
  uppercase: string;
  lowercase: string;
}>>> = Object.freeze({
  even: Object.freeze({ uppercase: 'JÄMNT', lowercase: 'jämnt' }),
  odd: Object.freeze({ uppercase: 'UDDA', lowercase: 'udda' }),
});

export function categoryForChoice(choice: Choice): Category {
  if (!Object.hasOwn(CHOICE_CATEGORIES, choice)) throw new RangeError('Invalid choice.');
  return CHOICE_CATEGORIES[choice];
}

export function choiceForCategory(category: Category): Choice {
  for (const choice of Object.keys(CHOICE_CATEGORIES) as Choice[]) {
    if (CHOICE_CATEGORIES[choice] === category) return choice;
  }
  throw new RangeError('Invalid category.');
}
