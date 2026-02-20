import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { db } from '../db/database';
import type { UserProfile } from '../types/user';
import { DEFAULT_SETTINGS } from '../types/user';

const USER_ID = 'default';

export function useUserProfile() {
  const profile = useLiveQuery(() => db.userProfile.get(USER_ID), []);

  const updateName = async (name: string) => {
    await db.userProfile.update(USER_ID, { name });
  };

  const updateSettings = async (settings: Partial<UserProfile['settings']>) => {
    const current = await db.userProfile.get(USER_ID);
    if (current) {
      await db.userProfile.update(USER_ID, {
        settings: { ...current.settings, ...settings },
      });
    }
  };

  return { profile: profile ?? null, updateName, updateSettings };
}
