import { describe, expect, it } from 'vitest';
import { BOARD, LANES, LAYOUT, positionOnLane } from './layout';
import { STYLE } from './visualStyle';
import { GAME_SETTINGS } from '../logic/settings';

describe('Playable space for the future egg paths', () => {
  it('covers every rule lane once', () => {
    expect(LANES.map(lane => lane.id).sort()).toEqual(Array.from({ length: GAME_SETTINGS.laneCount }, (_, i) => i + 1));
  });
  it('keeps the whole egg clear of edges, rule, and controls along every lane', () => {
    for (const lane of LANES) for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const p = positionOnLane(lane.id, progress);
      const radius = LAYOUT.egg.size / 2;
      expect(p.x - radius).toBeGreaterThan(0);
      expect(p.x + radius).toBeLessThan(BOARD.width);
      expect(p.y - radius).toBeGreaterThan(LAYOUT.rule.y + LAYOUT.rule.height / 2);
      expect(p.y + radius).toBeLessThan(LAYOUT.buttons.y - LAYOUT.buttons.height / 2);
    }
  });
  it('ends lower and nearer the centre on both sides', () => {
    for (const lane of LANES) {
      const start = positionOnLane(lane.id, 0);
      const end = positionOnLane(lane.id, 1);
      expect(end.y).toBeGreaterThan(start.y);
      expect(Math.abs(end.x - BOARD.width / 2)).toBeLessThan(Math.abs(start.x - BOARD.width / 2));
    }
  });
  it('rejects unknown lanes and invalid progress before drawing', () => {
    for (const lane of [0, 5, 1.5, NaN]) expect(() => positionOnLane(lane, 0)).toThrow(RangeError);
    for (const progress of [-0.1, 1.1, Infinity, NaN]) expect(() => positionOnLane(1, progress)).toThrow(RangeError);
  });
  it('meets readable text and touch-area targets at minimum supported scale', () => {
    expect(STYLE.text.egg * BOARD.minScale).toBeGreaterThanOrEqual(32);
    expect(Math.min(STYLE.text.rule, STYLE.text.category) * BOARD.minScale).toBeGreaterThanOrEqual(20);
    expect(LAYOUT.buttons.width * BOARD.minScale).toBeGreaterThanOrEqual(140);
    expect(LAYOUT.buttons.height * BOARD.minScale).toBeGreaterThanOrEqual(56);
    expect(LAYOUT.buttons.rightX - LAYOUT.buttons.leftX).toBeGreaterThan(LAYOUT.buttons.width);
  });
});
