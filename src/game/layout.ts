import { GAME_SETTINGS } from '../logic/settings';

export const BOARD = Object.freeze({ width: 960, height: 540, minScale: 0.75 });
export interface Point { readonly x: number; readonly y: number }
export interface Lane { readonly id: number; readonly start: Point; readonly end: Point }

// Coordinates describe the egg's centre, not the wooden lip beneath it.
export const LANES: readonly Lane[] = Object.freeze([
  { id: 1, start: { x: 76, y: 136 }, end: { x: 310, y: 210 } },
  { id: 2, start: { x: 76, y: 252 }, end: { x: 310, y: 308 } },
  { id: 3, start: { x: 884, y: 136 }, end: { x: 650, y: 210 } },
  { id: 4, start: { x: 884, y: 252 }, end: { x: 650, y: 308 } },
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
  rule: { x: 480, y: 38, width: 640, height: 52 },
  wolf: { x: 480, y: 278, size: 300 },
  baskets: { left: { x: 310, y: 348 }, right: { x: 650, y: 348 }, size: 240, labelOffsetY: 25 },
  egg: { size: 100, railOffsetY: 43 },
  feedback: { x: 480, y: 435, width: 800, height: 30 },
  buttons: { leftX: 278, rightX: 682, y: 490, width: 352, height: 76 },
});
