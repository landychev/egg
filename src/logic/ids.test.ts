import { describe, expect, it } from 'vitest';
import { createEggIdCounter } from './ids';

describe('äggets id, 02.8', () => {
  it('ger id 1–100 utan dubbletter', () => {
    const ids = createEggIdCounter();
    expect(Array.from({ length: 100 }, () => ids.next()))
      .toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
  });
  it('låter separata räknare vara oberoende', () => {
    const first = createEggIdCounter();
    const second = createEggIdCounter();
    expect(first.next()).toBe(1);
    expect(first.next()).toBe(2);
    expect(second.next()).toBe(1);
    expect(first.next()).toBe(3);
  });
});
