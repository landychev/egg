export type InputSource = 'pointer-left' | 'pointer-right' | 'key-left' | 'key-right';

export interface InputLock {
  /** true exactly once per press-down; false until the source has been released. */
  press(source: InputSource): boolean;
  release(source: InputSource): void;
  /** Releases all sources. Used on scene restart and when the window loses focus. */
  reset(): void;
  isHeld(source: InputSource): boolean;
}

// Pointer and key for the same side are separate sources on purpose; the rule
// core already ignores a second answer for the same egg.
const SOURCES: ReadonlySet<InputSource> = new Set<InputSource>(['pointer-left', 'pointer-right', 'key-left', 'key-right']);

// Guards against untyped calls from scene code (e.g. a mistyped key name),
// which would otherwise lock or unlock nothing without any sign of the error.
function checkSource(source: InputSource): void {
  if (!SOURCES.has(source)) throw new RangeError(`Unknown input source: ${String(source)}`);
}

// No timeout and no automatic release: the scene calls reset() on blur and restart.
export function createInputLock(): InputLock {
  const held = new Set<InputSource>();
  return Object.freeze({
    press(source: InputSource): boolean {
      checkSource(source);
      if (held.has(source)) return false;
      held.add(source);
      return true;
    },
    release(source: InputSource): void {
      checkSource(source);
      held.delete(source);
    },
    reset(): void {
      held.clear();
    },
    isHeld(source: InputSource): boolean {
      checkSource(source);
      return held.has(source);
    },
  });
}
