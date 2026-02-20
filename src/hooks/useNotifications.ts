import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { markAllNotificationsRead, markNotificationRead } from '../notifications/notification-system'

export function useNotifications() {
  const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().limit(30).toArray(), [])

  const unreadCount = (notifications ?? []).filter((notification) => !notification.readAt).length

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id)
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead()
  }, [])

  return {
    notifications: notifications ?? [],
    unreadCount,
    markRead,
    markAllRead,
  }
}
