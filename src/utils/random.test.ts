import { describe, it, expect } from 'vitest';
import { createRng, shuffle, pick, pickN, randomInt } from './random';

describe('createRng', () => {
  it('produces deterministic output for same seed', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const values1 = Array.from({ length: 10 }, () => rng1());
    const values2 = Array.from({ length: 10 }, () => rng2());
    expect(values1).toEqual(values2);
  });

  it('produces different output for different seeds', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const v1 = rng1();
    const v2 = rng2();
    expect(v1).not.toEqual(v2);
  });

  it('produces values in [0, 1)', () => {
    const rng = createRng(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('returns same order for same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const result1 = shuffle(arr, createRng(99));
    const result2 = shuffle(arr, createRng(99));
    expect(result1).toEqual(result2);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr, createRng(7));
    expect(arr).toEqual(copy);
  });

  it('contains all original elements', () => {
    const arr = [10, 20, 30, 40, 50];
    const result = shuffle(arr, createRng(42));
    expect(result.sort((a, b) => a - b)).toEqual(arr.sort((a, b) => a - b));
  });
});

describe('pick', () => {
  it('returns deterministic result for same seed', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    expect(pick(arr, createRng(10))).toBe(pick(arr, createRng(10)));
  });

  it('returns an element from the array', () => {
    const arr = ['x', 'y', 'z'];
    const rng = createRng(5);
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(pick(arr, rng));
    }
  });
});

describe('pickN', () => {
  it('returns exactly n elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(pickN(arr, 3, createRng(42))).toHaveLength(3);
  });

  it('returns no duplicates', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickN(arr, 4, createRng(7));
    expect(new Set(result).size).toBe(result.length);
  });
});

describe('randomInt', () => {
  it('returns values within the specified range', () => {
    const rng = createRng(42);
    for (let i = 0; i < 200; i++) {
      const v = randomInt(5, 10, rng);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('is deterministic for same seed', () => {
    expect(randomInt(1, 100, createRng(8))).toBe(randomInt(1, 100, createRng(8)));
  });

  it('returns integer values', () => {
    const rng = createRng(55);
    for (let i = 0; i < 100; i++) {
      const v = randomInt(0, 1000, rng);
      expect(v).toBe(Math.floor(v));
    }
  });
});
