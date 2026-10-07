export type RandomSource = () => number;

export function randomInteger(random: RandomSource, min: number, max: number): number {
  const width = max - min + 1;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)
    || min > max || !Number.isSafeInteger(width)) {
    throw new RangeError('Invalid inclusive integer interval.');
  }
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Random source must return a number from 0 (inclusive) to 1 (exclusive).');
  }
  return Math.floor(sample * width) + min;
}
