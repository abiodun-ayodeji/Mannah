import type { Difficulty } from '../types/question';
import type { XPState } from '../types/gamification';

const BASE_XP = 10;
const DIFF_MULTIPLIERS: Record<Difficulty, number> = { 1: 1, 2: 1.5, 3: 2, 4: 3, 5: 4 };

export function calculateXP(params: {
  difficulty: Difficulty;
  isCorrect: boolean;
  timeTaken: number;
  timeLimit: number | null;
  sessionStreak: number;
}): number {
  if (!params.isCorrect) return 2;

  let xp = BASE_XP;
  xp *= DIFF_MULTIPLIERS[params.difficulty];

  if (params.timeLimit && params.timeLimit > 0) {
    const ratio = params.timeTaken / params.timeLimit;
    if (ratio < 0.25) xp *= 1.5;
    else if (ratio < 0.5) xp *= 1.3;
    else if (ratio < 0.75) xp *= 1.1;
  }

  const streakBonus = Math.min(params.sessionStreak * 0.05, 0.5);
  xp *= 1 + streakBonus;

  return Math.round(xp);
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
    if (level >= 100) break;
  }
  return level;
}

export function getXPState(totalXP: number): XPState {
  const currentLevel = getLevelFromXP(totalXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  return {
    totalXP,
    currentLevel,
    xpInCurrentLevel: totalXP - currentLevelXP,
    xpForNextLevel: nextLevelXP - currentLevelXP,
  };
}
