import { GAME_SETTINGS } from '../logic/settings';
import { CHOICE_CATEGORIES } from '../logic/categories';
import type { Choice } from '../logic/types';

export const BOARD = Object.freeze({ width: 960, height: 540, minScale: 0.75 });
export interface Point { readonly x: number; readonly y: number }
export interface Lane { readonly id: number; readonly start: Point; readonly end: Point }

// Coordinates describe the egg's centre, not the wooden lip beneath it.
export const LANES: readonly Lane[] = Object.freeze([
  { id: 1, start: { x: 76, y: 82 }, end: { x: 294, y: 180 } },
  { id: 2, start: { x: 76, y: 155 }, end: { x: 258, y: 239 } },
  { id: 3, start: { x: 884, y: 82 }, end: { x: 666, y: 180 } },
  { id: 4, start: { x: 884, y: 155 }, end: { x: 702, y: 239 } },
]);

if (LANES.length !== GAME_SETTINGS.laneCount
  || new Set(LANES.map(lane => lane.id)).size !== GAME_SETTINGS.laneCount
  || LANES.some(lane => lane.id < 1 || lane.id > GAME_SETTINGS.laneCount)) {
  throw new Error('The visual lanes must match the rule settings.');
}

export function positionOnLane(id: number, progress: number): Point {
  const lane = LANES.find(item => item.id === id);
  if (!lane || !Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new RangeError('Invalid lane or progress.');
  }
  return {
    x: lane.start.x + (lane.end.x - lane.start.x) * progress,
    y: lane.start.y + (lane.end.y - lane.start.y) * progress,
  };
}

export const LAYOUT = Object.freeze({
  rule: { x: 480, y: 38, width: 560, height: 52 },
  wolf: { x: 480, y: 236, size: 360, baseY: 404 },
  // Match the sketch: basket openings sit beneath the outer ends of the lower chutes.
  baskets: { left: { x: 310, y: 338 }, right: { x: 650, y: 338 }, size: 210, labelOffsetY: 22 },
  egg: { size: 100, railOffsetY: 43 },
  feedback: { x: 480, y: 435, width: 800, height: 30 },
  buttons: { leftX: 278, rightX: 682, y: 490, width: 352, height: 76 },
  // Egg centre after a wrong answer: the ground line the wolf stands on (wolf.baseY).
  ground: { y: 404 },
  // Middle of the basket's dark interior (about 21–52 px above centre at size 210).
  basketOpening: { offsetY: 36 },
});

/** Point the egg flies to when it is caught in the chosen basket. */
export function catchTarget(choice: Choice): Point {
  if (!Object.hasOwn(CHOICE_CATEGORIES, choice)) throw new RangeError('Invalid choice.');
  const basket = LAYOUT.baskets[choice];
  return { x: basket.x, y: basket.y - LAYOUT.basketOpening.offsetY };
}

/** Point an egg from `lane` falls to after a wrong answer: straight below the lane end, on ground.y. */
export function crackTarget(lane: number): Point {
  const path = LANES.find(item => item.id === lane);
  if (!path) throw new RangeError('Invalid lane.');
  return { x: path.end.x, y: LAYOUT.ground.y };
}
