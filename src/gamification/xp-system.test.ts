import { describe, it, expect } from 'vitest';
import { calculateXP, xpForLevel, getLevelFromXP, getXPState } from './xp-system';

describe('calculateXP', () => {
  const base = {
    difficulty: 3 as const,
    isCorrect: true,
    timeTaken: 15,
    timeLimit: 30,
    sessionStreak: 0,
  };

  it('returns 2 XP for wrong answers regardless of other params', () => {
    expect(calculateXP({ ...base, isCorrect: false })).toBe(2);
    expect(calculateXP({ ...base, isCorrect: false, difficulty: 5 })).toBe(2);
    expect(calculateXP({ ...base, isCorrect: false, sessionStreak: 10 })).toBe(2);
  });

  it('applies difficulty multipliers', () => {
    const d1 = calculateXP({ ...base, difficulty: 1, timeTaken: 30 });
    const d3 = calculateXP({ ...base, difficulty: 3, timeTaken: 30 });
    const d5 = calculateXP({ ...base, difficulty: 5, timeTaken: 30 });
    // D1=1x, D3=2x, D5=4x of base 10
    expect(d1).toBeLessThan(d3);
    expect(d3).toBeLessThan(d5);
  });

  it('gives speed bonus for fast answers', () => {
    // Under 25% of time limit → 1.5x speed bonus
    const fast = calculateXP({ ...base, timeTaken: 5, timeLimit: 30 });
    const slow = calculateXP({ ...base, timeTaken: 28, timeLimit: 30 });
    expect(fast).toBeGreaterThan(slow);
  });

  it('applies streak bonus capped at 50%', () => {
    const noStreak = calculateXP({ ...base, sessionStreak: 0, timeTaken: 30 });
    const midStreak = calculateXP({ ...base, sessionStreak: 5, timeTaken: 30 });
    const maxStreak = calculateXP({ ...base, sessionStreak: 10, timeTaken: 30 });
    const overStreak = calculateXP({ ...base, sessionStreak: 20, timeTaken: 30 });
    expect(midStreak).toBeGreaterThan(noStreak);
    expect(maxStreak).toBeGreaterThan(midStreak);
    // 10 * 0.05 = 0.5 (cap), 20 * 0.05 = 1.0 → capped at 0.5
    expect(overStreak).toBe(maxStreak);
  });

  it('applies diminishing returns for repeated topic sessions', () => {
    const first = calculateXP({ ...base, todayTopicSessions: 0, timeTaken: 30 });
    const second = calculateXP({ ...base, todayTopicSessions: 1, timeTaken: 30 });
    const third = calculateXP({ ...base, todayTopicSessions: 2, timeTaken: 30 });
    expect(second).toBeLessThan(first);
    expect(third).toBeLessThan(second);
  });

  it('floors diminishing returns at 25%', () => {
    const manyRepeats = calculateXP({ ...base, todayTopicSessions: 100, timeTaken: 30 });
    const baseXP = calculateXP({ ...base, todayTopicSessions: 0, timeTaken: 30 });
    // Should not go below 25% of base
    expect(manyRepeats).toBeGreaterThanOrEqual(Math.round(baseXP * 0.25));
  });

  it('returns an integer', () => {
    expect(Number.isInteger(calculateXP(base))).toBe(true);
  });

  it('handles null timeLimit without speed bonus', () => {
    const noLimit = calculateXP({ ...base, timeLimit: null, timeTaken: 1 });
    const withLimit = calculateXP({ ...base, timeLimit: 30, timeTaken: 1 });
    // With a fast time and a limit, speed bonus applies → more XP
    expect(withLimit).toBeGreaterThan(noLimit);
  });
});

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('is monotonically increasing', () => {
    for (let i = 2; i <= 50; i++) {
      expect(xpForLevel(i)).toBeGreaterThan(xpForLevel(i - 1));
    }
  });

  it('follows the formula 50 * n^1.5', () => {
    expect(xpForLevel(10)).toBe(Math.floor(50 * Math.pow(10, 1.5)));
    expect(xpForLevel(25)).toBe(Math.floor(50 * Math.pow(25, 1.5)));
  });
});

describe('getLevelFromXP', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevelFromXP(0)).toBe(1);
  });

  it('returns correct level at exact thresholds', () => {
    const level10XP = xpForLevel(10);
    expect(getLevelFromXP(level10XP)).toBe(10);
    // Just below should be level 9
    expect(getLevelFromXP(level10XP - 1)).toBe(9);
  });

  it('caps at level 100', () => {
    expect(getLevelFromXP(999999999)).toBe(100);
  });

  it('round-trips with xpForLevel', () => {
    for (const level of [1, 5, 10, 25, 50, 75, 99]) {
      expect(getLevelFromXP(xpForLevel(level))).toBe(level);
    }
  });
});

describe('getXPState', () => {
  it('returns correct state for a mid-level player', () => {
    const totalXP = xpForLevel(5) + 20;
    const state = getXPState(totalXP);
    expect(state.currentLevel).toBe(5);
    expect(state.xpInCurrentLevel).toBe(20);
    expect(state.xpForNextLevel).toBe(xpForLevel(6) - xpForLevel(5));
    expect(state.totalXP).toBe(totalXP);
  });

  it('xpInCurrentLevel is non-negative', () => {
    for (const xp of [0, 50, 100, 500, 5000]) {
      expect(getXPState(xp).xpInCurrentLevel).toBeGreaterThanOrEqual(0);
    }
  });
});
