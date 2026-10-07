import type { EggIdCounter } from './ids';
import { categoryFor } from './parity';
import { randomInteger, type RandomSource } from './random';
import { GAME_SETTINGS } from './settings';
import type { Egg } from './types';

export function createEgg(ids: EggIdCounter, value: number, lane: number): Egg {
  categoryFor(value);
  if (!Number.isInteger(lane) || lane < 1 || lane > GAME_SETTINGS.laneCount) {
    throw new RangeError('Invalid lane.');
  }
  return Object.freeze({ id: ids.next(), value, lane, status: 'rolling', outcome: null });
}

export function createRandomEgg(ids: EggIdCounter, random: RandomSource = Math.random): Egg {
  const value = randomInteger(random, GAME_SETTINGS.minValue, GAME_SETTINGS.maxValue);
  const lane = randomInteger(random, 1, GAME_SETTINGS.laneCount);
  return createEgg(ids, value, lane);
}
