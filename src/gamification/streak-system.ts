import { format, differenceInCalendarDays, parseISO } from 'date-fns';
import { db } from '../db/database';
import type { StreakState } from '../types/gamification';

const STREAK_ID = 'main';

export async function getStreakState(): Promise<StreakState> {
  const existing = await db.streakState.get(STREAK_ID);
  if (existing) return existing;
  const initial: StreakState = {
    id: STREAK_ID,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
  };
  await db.streakState.put(initial);
  return initial;
}

export async function recordActivity(): Promise<{ streak: StreakState; isNewDay: boolean }> {
  const state = await getStreakState();
  const today = format(new Date(), 'yyyy-MM-dd');

  if (state.lastActiveDate === today) {
    return { streak: state, isNewDay: false };
  }

  let newStreak = 1;
  if (state.lastActiveDate) {
    const lastDate = parseISO(state.lastActiveDate);
    const daysDiff = differenceInCalendarDays(new Date(), lastDate);
    if (daysDiff === 1) {
      newStreak = state.currentStreak + 1;
    }
  }

  const updated: StreakState = {
    ...state,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActiveDate: today,
  };
  await db.streakState.put(updated);
  return { streak: updated, isNewDay: true };
}
