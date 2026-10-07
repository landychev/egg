import { describe, expect, it, vi } from 'vitest';
import { createEgg, createRandomEgg } from './eggs';
import { createEggIdCounter } from './ids';

describe('skapa ägg, 02.9–02.10', () => {
  it('skapar rullande ägg med nya id och utan utfall', () => {
    const ids = createEggIdCounter();
    expect(createEgg(ids, 7, 1)).toEqual({ id: 1, value: 7, lane: 1, status: 'rolling', outcome: null });
    expect(createEgg(ids, 7, 4)).toEqual({ id: 2, value: 7, lane: 4, status: 'rolling', outcome: null });
  });
  it.each([0, 5, 1.5, NaN, Infinity])('avvisar ogiltig ränna %s', lane => {
    expect(() => createEgg(createEggIdCounter(), 7, lane)).toThrow('lane');
  });
  it('avvisar ogiltigt tal före tilldelning av id', () => {
    const ids = createEggIdCounter();
    expect(() => createEgg(ids, 21, 1)).toThrow('interval');
    expect(createEgg(ids, 0, 1).id).toBe(1);
  });
  it.each([
    [0, 0, 0, 1], [0.999, 0.999, 20, 4], [0, 0.999, 0, 4], [0.999, 0, 20, 1],
  ])('slumpar tal och ränna separat (%s, %s)', (numberSample, laneSample, value, lane) => {
    const random = vi.fn().mockReturnValueOnce(numberSample).mockReturnValueOnce(laneSample);
    expect(createRandomEgg(createEggIdCounter(), random)).toMatchObject({ value, lane });
    expect(random).toHaveBeenCalledTimes(2);
  });
  it('kan nå vart och ett av de 21 talen och alla fyra rännor', () => {
    const ids = createEggIdCounter();
    for (let value = 0; value <= 20; value += 1) {
      for (let lane = 1; lane <= 4; lane += 1) {
        const random = vi.fn().mockReturnValueOnce((value + 0.5) / 21)
          .mockReturnValueOnce((lane - 0.5) / 4);
        expect(createRandomEgg(ids, random)).toMatchObject({ value, lane });
      }
    }
  });
  it('håller 1 000 vanligt slumpade ägg inom intervallen', () => {
    const ids = createEggIdCounter();
    for (let index = 0; index < 1000; index += 1) {
      const egg = createRandomEgg(ids);
      expect(Number.isInteger(egg.value)).toBe(true);
      expect(egg.value).toBeGreaterThanOrEqual(0);
      expect(egg.value).toBeLessThanOrEqual(20);
      expect(Number.isInteger(egg.lane)).toBe(true);
      expect(egg.lane).toBeGreaterThanOrEqual(1);
      expect(egg.lane).toBeLessThanOrEqual(4);
      expect(egg.id).toBe(index + 1);
    }
  });
});
