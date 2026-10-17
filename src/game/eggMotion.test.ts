import { describe, expect, it } from 'vitest';
import { eggPose, feedbackText, gapMs, SHELL_TURNS, travelMs } from './eggMotion';
import { BOARD, LANES, positionOnLane } from './layout';
import { GAME_SETTINGS } from '../logic/settings';

describe('Egg pose along a lane', () => {
  it('follows positionOnLane at the start, middle, and end of every lane', () => {
    for (const lane of LANES) for (const progress of [0, 0.5, 1]) {
      const pose = eggPose(lane.id, progress);
      const position = positionOnLane(lane.id, progress);
      expect(pose.x).toBe(position.x);
      expect(pose.y).toBe(position.y);
    }
  });
  it('turns the shell SHELL_TURNS times: clockwise from the left, anticlockwise from the right', () => {
    expect(SHELL_TURNS).toBeGreaterThan(0);
    for (const lane of LANES) {
      // Positive radians are clockwise on screen. Left-side chutes roll towards the centre.
      const sign = lane.start.x < BOARD.width / 2 ? 1 : -1;
      expect(eggPose(lane.id, 0).shellRotation).toBe(0);
      expect(eggPose(lane.id, 0.5).shellRotation).toBeCloseTo(sign * SHELL_TURNS * Math.PI, 10);
      expect(eggPose(lane.id, 1).shellRotation).toBeCloseTo(sign * SHELL_TURNS * 2 * Math.PI, 10);
    }
    expect(eggPose(1, 1).shellRotation).toBeGreaterThan(0);
    expect(eggPose(2, 1).shellRotation).toBeGreaterThan(0);
    expect(eggPose(3, 1).shellRotation).toBeLessThan(0);
    expect(eggPose(4, 1).shellRotation).toBeLessThan(0);
  });
  it('rejects unknown lanes and invalid progress', () => {
    for (const lane of [0, 5, 1.5, NaN]) expect(() => eggPose(lane, 0)).toThrow(RangeError);
    for (const progress of [-0.1, 1.1, Infinity, NaN]) expect(() => eggPose(1, progress)).toThrow(RangeError);
  });
});

describe('Timing from the game settings', () => {
  it('converts travel and gap seconds to milliseconds', () => {
    expect(travelMs()).toBe(GAME_SETTINGS.travelSeconds * 1000);
    expect(gapMs()).toBe(GAME_SETTINGS.gapSeconds * 1000);
    expect(travelMs()).toBeGreaterThan(0);
  });
});

describe('Feedback line', () => {
  it('names the category in capitals and ends with a full stop', () => {
    expect(feedbackText(0, 'even')).toBe('0 är JÄMNT.');
    expect(feedbackText(7, 'odd')).toBe('7 är UDDA.');
    expect(feedbackText(10, 'even')).toBe('10 är JÄMNT.');
    expect(feedbackText(12, 'even')).toBe('12 är JÄMNT.');
    expect(feedbackText(20, 'even')).toBe('20 är JÄMNT.');
  });
});
