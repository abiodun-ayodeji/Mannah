import { useLiveQuery } from 'dexie-react-hooks'
import { startOfWeek, endOfWeek } from 'date-fns'
import { db } from '../db/database'

export function useWeeklyStats() {
  return useLiveQuery(async () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime()
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).getTime()

    const sessions = await db.sessions
      .where('startTime')
      .between(weekStart, weekEnd, true, true)
      .toArray()

    const totalSessions = sessions.length
    const totalQuestions = sessions.reduce((s, r) => s + r.totalQuestions, 0)
    const totalCorrect = sessions.reduce((s, r) => s + r.correctAnswers, 0)
    const totalXP = sessions.reduce((s, r) => s + r.xpEarned, 0)
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    // Get streak from streakState
    const streakState = await db.streakState.get('main')
    const currentStreak = streakState?.currentStreak ?? 0

    return {
      totalSessions,
      totalQuestions,
      totalCorrect,
      totalXP,
      avgAccuracy,
      currentStreak,
    }
  }, [])
}
