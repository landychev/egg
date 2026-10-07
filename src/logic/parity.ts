import { GAME_SETTINGS } from './settings';
import type { Category } from './types';

export function categoryFor(value: number): Category {
  if (!Number.isInteger(value)) throw new RangeError('Invalid number: expected an integer.');
  if (value < GAME_SETTINGS.minValue || value > GAME_SETTINGS.maxValue) {
    throw new RangeError('Number outside the configured interval.');
  }
  return value % 2 === 0 ? 'even' : 'odd';
}
