export interface GameSettings {
  readonly minValue: number;
  readonly maxValue: number;
  readonly laneCount: number;
  readonly travelSeconds: number;
  readonly gapSeconds: number;
  readonly initialLives: number;
  readonly pointsPerCorrect: number;
  readonly comboBonus: number;
  readonly levelTwoTravelFactor: number;
  readonly correctForLevelTwo: number;
}

export const GAME_SETTINGS: Readonly<GameSettings> = Object.freeze({
  // Design decisions: the first prototype uses 0–20 and four lanes.
  minValue: 0,
  maxValue: 20,
  laneCount: 4,
  // Placeholders, in seconds. Both modes start with the same travel time (task 04).
  travelSeconds: 3,
  gapSeconds: 0.8,
  // Starting values from the design; scoring is implemented in task 06.
  initialLives: 3,
  pointsPerCorrect: 1,
  comboBonus: 0,
  // Placeholders for task 06; no progression is applied by the rule core.
  levelTwoTravelFactor: 0.8,
  correctForLevelTwo: 10,
});

export function validateSettings(settings: GameSettings): void {
  const integerFields = ['minValue', 'maxValue', 'laneCount', 'initialLives',
    'pointsPerCorrect', 'comboBonus', 'correctForLevelTwo'] as const;
  for (const field of integerFields) {
    if (!Number.isSafeInteger(settings[field]) || settings[field] < 0) {
      throw new RangeError(`${field} must be a non-negative safe integer.`);
    }
  }
  // Consecutive integers with min < max always include both categories.
  if (settings.minValue >= settings.maxValue) {
    throw new RangeError('minValue must be less than maxValue.');
  }
  for (const field of ['laneCount', 'initialLives', 'correctForLevelTwo'] as const) {
    if (settings[field] === 0) throw new RangeError(`${field} must be positive.`);
  }
  if (!Number.isFinite(settings.travelSeconds) || settings.travelSeconds <= 0) {
    throw new RangeError('travelSeconds must be positive and finite.');
  }
  if (!Number.isFinite(settings.gapSeconds) || settings.gapSeconds < 0) {
    throw new RangeError('gapSeconds must be non-negative and finite.');
  }
  if (!Number.isFinite(settings.levelTwoTravelFactor)
    || settings.levelTwoTravelFactor <= 0 || settings.levelTwoTravelFactor >= 1) {
    throw new RangeError('levelTwoTravelFactor must be between 0 and 1, exclusively.');
  }
}

validateSettings(GAME_SETTINGS);
