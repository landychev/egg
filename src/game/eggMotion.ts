import { CATEGORY_WORDS } from '../logic/categories';
import { GAME_SETTINGS } from '../logic/settings';
import type { Category } from '../logic/types';
import { LANES, positionOnLane } from './layout';

export interface EggPose { readonly x: number; readonly y: number; readonly shellRotation: number }

/**
 * Shell turns over one full trip. Livelier than true rolling (about 0.7 turns
 * for a 100 px egg on these 200–240 px lanes) so the motion reads at a glance.
 */
export const SHELL_TURNS = 2.5;

/** Position via positionOnLane and shell rotation in radians; the number never rotates. */
export function eggPose(lane: number, progress: number): EggPose {
  // positionOnLane validates both the lane and the progress.
  const { x, y } = positionOnLane(lane, progress);
  const path = LANES.find(item => item.id === lane);
  if (!path) throw new RangeError('Invalid lane or progress.');
  // Rolling right is clockwise, which is a positive angle in screen coordinates.
  const direction = Math.sign(path.end.x - path.start.x);
  // Adding 0 turns -0 into 0 at the start of leftward lanes.
  const shellRotation = direction * progress * SHELL_TURNS * 2 * Math.PI + 0;
  return { x, y, shellRotation };
}

// Read at call time so later setting changes (task 06) take effect.
export function travelMs(): number { return GAME_SETTINGS.travelSeconds * 1000; }
export function gapMs(): number { return GAME_SETTINGS.gapSeconds * 1000; }

/** Feedback line, for example "12 är JÄMNT.". */
export function feedbackText(value: number, category: Category): string {
  return `${value} är ${CATEGORY_WORDS[category].uppercase}.`;
}
