import { describe, expect, it } from 'vitest';
import { GAME_SETTINGS, validateSettings, type GameSettings } from './settings';

describe('spelvärden, 02.3', () => {
  it('godtar prototypens värden och låser dem under körning', () => {
    expect(() => validateSettings(GAME_SETTINGS)).not.toThrow();
    expect(Object.isFrozen(GAME_SETTINGS)).toBe(true);
    expect(GAME_SETTINGS).toMatchObject({ minValue: 0, maxValue: 20, laneCount: 4,
      initialLives: 3, pointsPerCorrect: 1, comboBonus: 0 });
  });
  it.each<Partial<GameSettings>>([
    { minValue: 30 }, { minValue: 20 }, { minValue: -1 }, { minValue: 0.5 },
    { maxValue: NaN }, { maxValue: Infinity }, { maxValue: Number.MAX_SAFE_INTEGER + 1 },
    { laneCount: 0 }, { laneCount: 1.5 }, { initialLives: 0 }, { initialLives: -1 },
    { pointsPerCorrect: -1 }, { comboBonus: 0.5 }, { correctForLevelTwo: 0 },
    { travelSeconds: 0 }, { travelSeconds: NaN }, { travelSeconds: Infinity },
    { gapSeconds: -1 }, { gapSeconds: Infinity },
    { levelTwoTravelFactor: 0 }, { levelTwoTravelFactor: 1 }, { levelTwoTravelFactor: NaN },
  ])('avvisar felaktig inställning %j', override => {
    expect(() => validateSettings({ ...GAME_SETTINGS, ...override })).toThrow(RangeError);
  });
});
