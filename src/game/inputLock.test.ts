import { describe, expect, it } from 'vitest';
import { createInputLock, type InputSource } from './inputLock';

const SOURCES: readonly InputSource[] = ['pointer-left', 'pointer-right', 'key-left', 'key-right'];

describe('Input lock, one answer per press', () => {
  it('accepts the first press and rejects a repeat while the source is held', () => {
    for (const source of SOURCES) {
      const lock = createInputLock();
      expect(lock.press(source)).toBe(true);
      expect(lock.press(source)).toBe(false);
      expect(lock.press(source)).toBe(false);
    }
  });

  it('accepts a new press after release', () => {
    for (const source of SOURCES) {
      const lock = createInputLock();
      expect(lock.press(source)).toBe(true);
      lock.release(source);
      expect(lock.press(source)).toBe(true);
      expect(lock.press(source)).toBe(false);
    }
  });

  it('treats a release without a press as harmless', () => {
    const lock = createInputLock();
    lock.release('key-left');
    expect(lock.isHeld('key-left')).toBe(false);
    expect(lock.press('key-left')).toBe(true);
  });

  it('keeps the four sources independent of each other', () => {
    for (const first of SOURCES) {
      const lock = createInputLock();
      expect(lock.press(first)).toBe(true);
      for (const other of SOURCES.filter(source => source !== first)) {
        expect(lock.isHeld(other)).toBe(false);
        expect(lock.press(other)).toBe(true);
        lock.release(other);
      }
      // Releasing the others left the first source held.
      expect(lock.isHeld(first)).toBe(true);
      expect(lock.press(first)).toBe(false);
    }
  });

  it('lets pointer and key on the same side both answer', () => {
    const lock = createInputLock();
    expect(lock.press('pointer-left')).toBe(true);
    expect(lock.press('key-left')).toBe(true);
    expect(lock.press('pointer-right')).toBe(true);
    expect(lock.press('key-right')).toBe(true);
  });

  it('releases every source on reset', () => {
    const lock = createInputLock();
    for (const source of SOURCES) lock.press(source);
    lock.reset();
    for (const source of SOURCES) {
      expect(lock.isHeld(source)).toBe(false);
      expect(lock.press(source)).toBe(true);
    }
  });

  it('reflects the held state in isHeld', () => {
    const lock = createInputLock();
    expect(SOURCES.map(source => lock.isHeld(source))).toEqual([false, false, false, false]);
    lock.press('pointer-right');
    lock.press('key-left');
    expect(SOURCES.map(source => lock.isHeld(source))).toEqual([false, true, true, false]);
    lock.release('pointer-right');
    expect(SOURCES.map(source => lock.isHeld(source))).toEqual([false, false, true, false]);
    lock.reset();
    expect(SOURCES.map(source => lock.isHeld(source))).toEqual([false, false, false, false]);
  });

  it('keeps separate locks independent', () => {
    const first = createInputLock();
    const second = createInputLock();
    expect(first.press('key-right')).toBe(true);
    expect(second.isHeld('key-right')).toBe(false);
    expect(second.press('key-right')).toBe(true);
    first.reset();
    expect(second.isHeld('key-right')).toBe(true);
  });

  it('throws RangeError for an unknown source', () => {
    const lock = createInputLock();
    for (const bad of ['', 'left', 'pointer', 'Key-Left', 'key-up', 'pointer-left ']) {
      expect(() => lock.press(bad as InputSource)).toThrow(RangeError);
      expect(() => lock.release(bad as InputSource)).toThrow(RangeError);
      expect(() => lock.isHeld(bad as InputSource)).toThrow(RangeError);
    }
    expect(() => lock.press(undefined as unknown as InputSource)).toThrow(RangeError);
    // A rejected call leaves the known sources untouched.
    expect(SOURCES.map(source => lock.isHeld(source))).toEqual([false, false, false, false]);
  });

  it('cannot be modified from outside', () => {
    const lock = createInputLock();
    expect(Object.isFrozen(lock)).toBe(true);
  });
});
