import { Subject, Topic } from './subject';

export interface XPState {
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'mastery' | 'streak' | 'volume' | 'speed' | 'exploration' | 'special';
  conditionType: string;
  conditionThreshold: number;
  conditionSubject?: Subject;
  conditionTopic?: Topic;
  xpReward: number;
  unlockedAt?: number;
}

export interface StreakState {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Apprentice',
  10: 'Scholar',
  20: 'Thinker',
  30: 'Strategist',
  40: 'Champion',
  50: 'Mastermind',
  60: 'Sage',
  70: 'Prophet',
  80: 'Legend',
  90: 'Grandmaster',
  100: 'Mighty One',
};

export function getLevelTitle(level: number): string {
  const tiers = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const tier of tiers) {
    if (level >= tier) return LEVEL_TITLES[tier];
  }
  return 'Apprentice';
}
