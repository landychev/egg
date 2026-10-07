export interface EggIdCounter {
  readonly next: () => number;
}

// Keep one counter for the entire page session, including round restarts.
export function createEggIdCounter(): EggIdCounter {
  let latest = 0;
  return Object.freeze({
    next(): number {
      if (latest === Number.MAX_SAFE_INTEGER) throw new RangeError('Egg IDs exhausted.');
      latest += 1;
      return latest;
    },
  });
}
