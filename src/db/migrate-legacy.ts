import Dexie from 'dexie'
import { db } from './database'

const LEGACY_DB_NAME = 'AdejobaDB'
const MIGRATION_KEY = 'mannah_migration_done'

/**
 * Migrate data from the old AdejobaDB to MannahDB.
 * Runs once on app boot — checks if AdejobaDB exists,
 * copies all user data to MannahDB, then deletes the old DB.
 */
export async function migrateLegacyDB(): Promise<void> {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) return

  // Check if old DB exists
  const exists = await legacyDBExists()
  if (!exists) {
    localStorage.setItem(MIGRATION_KEY, '1')
    return
  }

  try {
    // Open the legacy database with the same schema
    const legacyDB = new Dexie(LEGACY_DB_NAME)
    legacyDB.version(1).stores({
      questions: 'id, subject, topic, difficulty, [subject+topic], [subject+difficulty]',
      attempts: 'id, questionId, subject, topic, timestamp, sessionId, [subject+topic]',
      topicMastery: '[subject+topic], subject, masteryLevel, rating',
      dailyStats: 'date',
      sessions: 'id, type, startTime',
      achievements: 'id, category, unlockedAt',
      userProfile: 'id',
      streakState: 'id',
    })

    await legacyDB.open()

    // Tables to migrate (skip questions — they're generated fresh)
    const tablesToMigrate = [
      'userProfile',
      'attempts',
      'topicMastery',
      'dailyStats',
      'sessions',
      'achievements',
      'streakState',
    ] as const

    for (const tableName of tablesToMigrate) {
      const legacyTable = legacyDB.table(tableName)
      const rows = await legacyTable.toArray()
      if (rows.length > 0) {
        // Only import if MannahDB table is empty (don't overwrite newer data)
        const existingCount = await (db as any)[tableName].count()
        if (existingCount === 0) {
          await (db as any)[tableName].bulkPut(rows)
        }
      }
    }

    // Close and delete legacy DB
    legacyDB.close()
    await Dexie.delete(LEGACY_DB_NAME)

    // Migrate localStorage keys
    migrateLocalStorageKeys()

    localStorage.setItem(MIGRATION_KEY, '1')
    console.log('[Mannah] Legacy data migrated successfully from AdejobaDB')
  } catch (err) {
    // Don't block app startup if migration fails
    console.warn('[Mannah] Legacy migration failed (non-critical):', err)
    localStorage.setItem(MIGRATION_KEY, '1')
  }
}

/** Check if AdejobaDB exists in IndexedDB */
async function legacyDBExists(): Promise<boolean> {
  try {
    // Modern browsers support indexedDB.databases()
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases()
      return dbs.some((d) => d.name === LEGACY_DB_NAME)
    }
  } catch {
    // Fallback: try to open it and check if it has data
  }

  // Fallback for browsers without indexedDB.databases()
  try {
    const testDB = new Dexie(LEGACY_DB_NAME)
    testDB.version(1).stores({ userProfile: 'id' })
    await testDB.open()
    const count = await testDB.table('userProfile').count()
    testDB.close()
    if (count === 0) {
      // Empty DB — was just created by our check, delete it
      await Dexie.delete(LEGACY_DB_NAME)
      return false
    }
    return true
  } catch {
    return false
  }
}

/** Copy adejoba_* localStorage keys to mannah_* equivalents */
function migrateLocalStorageKeys() {
  const keysToMigrate = [
    ['adejoba_feedback_count', 'mannah_feedback_count'],
    ['adejoba_dev_session_id', 'mannah_dev_session_id'],
    ['adejoba_session_count', 'mannah_session_count'],
    ['adejoba_install_dismissed', 'mannah_install_dismissed'],
  ]

  for (const [oldKey, newKey] of keysToMigrate) {
    const value = localStorage.getItem(oldKey)
    if (value != null && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, value)
      localStorage.removeItem(oldKey)
    }
  }
}
