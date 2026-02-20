import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { StreakState } from '../types/gamification';

export function useStreak(): StreakState | null {
  const streak = useLiveQuery(() => db.streakState.get('main'), []);

  // undefined = still loading, null-ish = no record yet
  if (streak === undefined) return null;
  if (!streak) {
    return {
      id: 'main',
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
    };
  }
  return streak;
}
