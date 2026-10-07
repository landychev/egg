import { describe, expect, it, vi } from 'vitest';
import { randomInteger } from './random';

describe('slumpkälla, 02.7', () => {
  it.each([
    [0, 0, 20, 0], [0.999, 0, 20, 20],
    [0, 1, 4, 1], [0.999, 1, 4, 4], [0.5, 7, 7, 7],
  ])('slump %s i %s–%s ger %s', (sample, min, max, expected) => {
    expect(randomInteger(() => sample, min, max)).toBe(expected);
  });
  it('kan ta värden i bestämd ordning', () => {
    const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.999);
    expect(randomInteger(random, 0, 20)).toBe(0);
    expect(randomInteger(random, 1, 4)).toBe(4);
    expect(random).toHaveBeenCalledTimes(2);
  });
  it.each([-0.1, 1, NaN, Infinity])('avvisar slumpvärde %s', sample => {
    expect(() => randomInteger(() => sample, 0, 20)).toThrow('Random source');
  });
  it.each([[2, 1], [0.5, 4], [0, NaN], [0, Infinity], [0, Number.MAX_SAFE_INTEGER]])(
    'avvisar ogiltigt intervall %s–%s', (min, max) => {
      expect(() => randomInteger(() => 0, min, max)).toThrow('interval');
    },
  );
});
