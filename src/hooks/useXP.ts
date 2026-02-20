import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getXPState, getLevelFromXP } from '../gamification/xp-system';
import type { XPState } from '../types/gamification';

export function useXP(): {
  xpState: XPState | null;
  addXP: (amount: number) => Promise<{ levelled: boolean; oldLevel: number; newLevel: number }>;
} {
  const totalXP = useLiveQuery(async () => {
    const attempts = await db.attempts.toArray();
    return attempts.reduce((sum, a) => sum + a.xpEarned, 0);
  }, []);

  const xpState = totalXP != null ? getXPState(totalXP) : null;

  const addXP = async (_amount: number) => {
    const before = totalXP ?? 0;
    const after = before + _amount;
    const oldLevel = getLevelFromXP(before);
    const newLevel = getLevelFromXP(after);
    return { levelled: newLevel > oldLevel, oldLevel, newLevel };
  };

  return { xpState, addXP };
}
