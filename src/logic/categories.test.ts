import { describe, expect, it } from 'vitest';
import { CATEGORY_WORDS, categoryForChoice, choiceForCategory } from './categories';
import type { Category, Choice } from './types';

describe('knappar och kategoriord, 02.5–02.6', () => {
  it('kopplar vänster till jämnt och höger till udda', () => {
    expect(categoryForChoice('left')).toBe('even');
    expect(categoryForChoice('right')).toBe('odd');
    expect(choiceForCategory('even')).toBe('left');
    expect(choiceForCategory('odd')).toBe('right');
  });
  it.each<Choice>(['left', 'right'])('översätter %s fram och tillbaka', choice => {
    expect(choiceForCategory(categoryForChoice(choice))).toBe(choice);
  });
  it('har båda svenska formerna för varje kategori', () => {
    expect(CATEGORY_WORDS).toEqual({
      even: { uppercase: 'JÄMNT', lowercase: 'jämnt' },
      odd: { uppercase: 'UDDA', lowercase: 'udda' },
    });
  });
  it('avvisar ogiltiga uppslag även vid anrop utanför TypeScript', () => {
    expect(() => categoryForChoice('middle' as Choice)).toThrow('choice');
    expect(() => categoryForChoice('toString' as Choice)).toThrow('choice');
    expect(() => choiceForCategory('prime' as Category)).toThrow('category');
  });
});
