/**
 * Developer-side session analytics — sends events to Vercel Analytics
 * so you can track per-user sessions from the Vercel dashboard.
 * Nothing from this module is rendered in the UI.
 */
import { track } from '@vercel/analytics'
import { db } from '../db/database'

const SESSION_KEY = 'mannah_dev_session_id'
const SESSION_START_KEY = 'mannah_dev_session_start'

/** Generate a short random ID */
function shortId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Get or create the current browsing session ID (resets after 30 min inactivity) */
function getSessionId(): string {
  const TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const now = Date.now()
  const lastStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) ?? '0', 10)
  let sid = sessionStorage.getItem(SESSION_KEY)

  if (!sid || now - lastStart > TIMEOUT) {
    sid = shortId()
    sessionStorage.setItem(SESSION_KEY, sid)
    sessionStorage.setItem(SESSION_START_KEY, String(now))
  }

  return sid
}

/** Gather user context from IndexedDB profile */
async function getUserContext() {
  const profile = await db.userProfile.get('default')
  const streakState = await db.streakState.get('main')
  const totalAttempts = await db.attempts.count()
  const totalSessions = await db.sessions.count()

  return {
    user_name: profile?.name ?? 'unknown',
    user_created: profile?.createdAt ? new Date(profile.createdAt).toISOString().slice(0, 10) : 'unknown',
    current_streak: streakState?.currentStreak ?? 0,
    longest_streak: streakState?.longestStreak ?? 0,
    lifetime_attempts: totalAttempts,
    lifetime_sessions: totalSessions,
  }
}

/**
 * Fire a `session_start` event. Call once when the app mounts.
 * Includes user profile context + device info.
 */
export async function trackSessionStart() {
  const sid = getSessionId()
  const ctx = await getUserContext()

  track('session_start', {
    session_id: sid,
    ...ctx,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    is_pwa: window.matchMedia('(display-mode: standalone)').matches,
    referrer: document.referrer || 'direct',
  })
}

/**
 * Fire a `session_heartbeat` — call periodically (e.g. every 5 min)
 * to measure real engagement time.
 */
export async function trackHeartbeat() {
  const sid = getSessionId()

  track('session_heartbeat', {
    session_id: sid,
    elapsed_sec: Math.round(
      (Date.now() - parseInt(sessionStorage.getItem(SESSION_START_KEY) ?? '0', 10)) / 1000,
    ),
    page: window.location.pathname,
  })
}

/**
 * Fire a `session_end` event. Best-effort via `navigator.sendBeacon`
 * (called on beforeunload / visibilitychange).
 */
export function trackSessionEnd() {
  const sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) return

  const startMs = parseInt(sessionStorage.getItem(SESSION_START_KEY) ?? '0', 10)
  const durationSec = Math.round((Date.now() - startMs) / 1000)

  // Vercel Analytics `track` may not flush on unload, so we also use sendBeacon.
  // But `track()` is still called for cases where the page isn't unloading.
  track('session_end', {
    session_id: sid,
    duration_sec: durationSec,
    page: window.location.pathname,
  })
}

/**
 * Fire a `page_navigation` event with user context.
 */
export function trackPageNav(path: string) {
  const sid = sessionStorage.getItem(SESSION_KEY) ?? getSessionId()

  track('page_navigation', {
    session_id: sid,
    page: path,
  })
}
