import { describe, expect, it } from 'vitest';
import { BOARD, LANES, LAYOUT, positionOnLane } from './layout';
import { STYLE } from './visualStyle';
import { GAME_SETTINGS } from '../logic/settings';
import { catchTarget, crackTarget } from './layout';
import type { Choice } from '../logic/types';

describe('Playable space for the future egg paths', () => {
  it('covers every rule lane once', () => {
    expect(LANES.map(lane => lane.id).sort()).toEqual(Array.from({ length: GAME_SETTINGS.laneCount }, (_, i) => i + 1));
  });
  it('keeps the whole egg clear of edges, rule, and controls along every lane', () => {
    for (const lane of LANES) for (const progress of Array.from({ length: 21 }, (_, index) => index / 20)) {
      const p = positionOnLane(lane.id, progress);
      const radius = LAYOUT.egg.size / 2;
      expect(p.x - radius).toBeGreaterThan(0);
      expect(p.y - radius).toBeGreaterThan(0);
      expect(p.x + radius).toBeLessThan(BOARD.width);
      const overlapsRule = p.x + radius > LAYOUT.rule.x - LAYOUT.rule.width / 2
        && p.x - radius < LAYOUT.rule.x + LAYOUT.rule.width / 2
        && p.y - radius < LAYOUT.rule.y + LAYOUT.rule.height / 2;
      expect(overlapsRule).toBe(false);
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

describe('Targets for caught and cracked eggs', () => {
  const inside = (p: { x: number; y: number }): boolean => p.x > 0 && p.x < BOARD.width && p.y > 0 && p.y < BOARD.height;

  it('catches inside the chosen basket opening, below every lane end, so the catch always moves down', () => {
    for (const choice of ['left', 'right'] as const) {
      const target = catchTarget(choice);
      const basket = LAYOUT.baskets[choice];
      expect(inside(target)).toBe(true);
      expect(target.x).toBe(basket.x);
      expect(target.y).toBeLessThan(basket.y);
      expect(target.y).toBeGreaterThan(basket.y - LAYOUT.baskets.size / 2);
      for (const lane of LANES) expect(target.y).toBeGreaterThan(lane.end.y);
    }
  });
  it('cracks straight below each lane end, on the ground and above the feedback line', () => {
    for (const lane of LANES) {
      const target = crackTarget(lane.id);
      expect(inside(target)).toBe(true);
      expect(target.x).toBe(lane.end.x);
      expect(target.y).toBe(LAYOUT.ground.y);
      expect(target.y).toBeGreaterThan(lane.end.y);
      expect(target.y).toBeLessThan(LAYOUT.feedback.y);
    }
    expect(Math.abs(LAYOUT.ground.y - LAYOUT.wolf.baseY)).toBeLessThanOrEqual(LAYOUT.egg.size / 2);
  });
  it('rejects unknown lanes and invalid choices', () => {
    for (const lane of [0, 5, 1.5, NaN]) expect(() => crackTarget(lane)).toThrow(RangeError);
    for (const choice of ['up', 'size', '', 'toString']) expect(() => catchTarget(choice as Choice)).toThrow(RangeError);
  });
});
