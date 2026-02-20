import { differenceInCalendarDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import { db } from '../db/database'
import type { Achievement } from '../types/gamification'
import type { AppNotification } from '../types/notification'

async function putIfMissing(notification: AppNotification) {
  const existing = await db.notifications.get(notification.id)
  if (existing) return
  await db.notifications.put(notification)
}

export async function notifyAchievementUnlocked(achievement: Achievement) {
  await putIfMissing({
    id: `achievement-${achievement.id}`,
    type: 'achievement_unlocked',
    title: 'Achievement unlocked',
    message: `${achievement.icon} ${achievement.name} earned (+${achievement.xpReward} XP).`,
    createdAt: achievement.unlockedAt ?? Date.now(),
    link: '/achievements',
    actionLabel: 'View badges',
  })
}

export async function notifyStreakRiskIfNeeded() {
  const streak = await db.streakState.get('main')
  if (!streak || streak.currentStreak <= 0 || !streak.lastActiveDate) return

  const today = new Date()
  const todayLabel = format(today, 'yyyy-MM-dd')
  if (streak.lastActiveDate === todayLabel) return

  const daysSinceLastActive = differenceInCalendarDays(today, parseISO(streak.lastActiveDate))
  if (daysSinceLastActive !== 1) return

  await putIfMissing({
    id: `streak-risk-${todayLabel}`,
    type: 'streak_risk',
    title: 'Streak at risk',
    message: `You have a ${streak.currentStreak}-day streak. Do a quick session today to keep it alive.`,
    createdAt: Date.now(),
    link: '/',
    actionLabel: 'Start now',
  })
}

export async function notifyWeeklySummaryIfNeeded() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const since = subDays(now, 7).getTime()
  const recentAttempts = await db.attempts.where('timestamp').aboveOrEqual(since).count()
  if (recentAttempts === 0) return

  await putIfMissing({
    id: `weekly-summary-${weekKey}`,
    type: 'weekly_summary_ready',
    title: 'Weekly summary ready',
    message: 'See progress trends, focus topics, and next steps in Parent Dashboard.',
    createdAt: Date.now(),
    link: '/parent',
    actionLabel: 'View summary',
  })
}

export async function markNotificationRead(id: string) {
  const existing = await db.notifications.get(id)
  if (!existing || existing.readAt) return
  await db.notifications.update(id, { readAt: Date.now() })
}

export async function markAllNotificationsRead() {
  const unread = await db.notifications.filter((notification) => !notification.readAt).toArray()
  if (unread.length === 0) return
  await Promise.all(
    unread.map((notification) => db.notifications.update(notification.id, { readAt: Date.now() }))
  )
}
