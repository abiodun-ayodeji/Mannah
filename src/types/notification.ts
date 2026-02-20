export type AppNotificationType = 'streak_risk' | 'achievement_unlocked' | 'weekly_summary_ready'

export interface AppNotification {
  id: string
  type: AppNotificationType
  title: string
  message: string
  createdAt: number
  readAt?: number
  link?: string
  actionLabel?: string
}
