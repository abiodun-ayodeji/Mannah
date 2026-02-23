import { describe, it, expect } from 'vitest';
import { getDifficultyForAccuracy, getMinDifficultyForAccuracy } from './practice-recommendations';

describe('getMinDifficultyForAccuracy', () => {
  it('returns D1 for accuracy below 50%', () => {
    expect(getMinDifficultyForAccuracy(0)).toBe(1);
    expect(getMinDifficultyForAccuracy(0.3)).toBe(1);
    expect(getMinDifficultyForAccuracy(0.49)).toBe(1);
  });

  it('returns D2 for accuracy 50-69%', () => {
    expect(getMinDifficultyForAccuracy(0.5)).toBe(2);
    expect(getMinDifficultyForAccuracy(0.6)).toBe(2);
    expect(getMinDifficultyForAccuracy(0.69)).toBe(2);
  });

  it('returns D3 for accuracy 70-84%', () => {
    expect(getMinDifficultyForAccuracy(0.7)).toBe(3);
    expect(getMinDifficultyForAccuracy(0.8)).toBe(3);
    expect(getMinDifficultyForAccuracy(0.84)).toBe(3);
  });

  it('returns D4 for accuracy 85%+', () => {
    expect(getMinDifficultyForAccuracy(0.85)).toBe(4);
    expect(getMinDifficultyForAccuracy(0.95)).toBe(4);
    expect(getMinDifficultyForAccuracy(1.0)).toBe(4);
  });

  it('is deterministic (no randomness)', () => {
    // Run 20 times — should always return the same value
    const results = Array.from({ length: 20 }, () => getMinDifficultyForAccuracy(0.75));
    expect(new Set(results).size).toBe(1);
  });
});

describe('getDifficultyForAccuracy', () => {
  it('returns D1 or D2 for low accuracy', () => {
    for (let i = 0; i < 50; i++) {
      const d = getDifficultyForAccuracy(0.3);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(2);
    }
  });

  it('returns D2 or D3 for medium accuracy', () => {
    for (let i = 0; i < 50; i++) {
      const d = getDifficultyForAccuracy(0.65);
      expect(d).toBeGreaterThanOrEqual(2);
      expect(d).toBeLessThanOrEqual(3);
    }
  });

  it('returns D3 or D4 for high accuracy', () => {
    for (let i = 0; i < 50; i++) {
      const d = getDifficultyForAccuracy(0.9);
      expect(d).toBeGreaterThanOrEqual(3);
      expect(d).toBeLessThanOrEqual(4);
    }
  });
});
