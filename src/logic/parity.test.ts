import { describe, expect, it } from 'vitest';
import { categoryFor } from './parity';

describe('jämnt och udda, 02.4', () => {
  it.each([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20])('%i är jämnt', value => {
    expect(categoryFor(value)).toBe('even');
  });
  it.each([1, 3, 5, 7, 9, 11, 13, 15, 17, 19])('%i är udda', value => {
    expect(categoryFor(value)).toBe('odd');
  });
  it.each([-1, 21])('avvisar %i utanför intervallet', value => {
    expect(() => categoryFor(value)).toThrow('outside');
  });
  it.each([2.5, NaN, Infinity, -Infinity])('avvisar ogiltiga tal: %s', value => {
    expect(() => categoryFor(value)).toThrow('integer');
  });
});
