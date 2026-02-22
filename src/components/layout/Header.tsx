import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Flame, Bell, Award, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useXP } from '../../hooks/useXP'
import { useStreak } from '../../hooks/useStreak'
import { useThemeMode } from '../../hooks/useThemeMode'
import { useNotifications } from '../../hooks/useNotifications'
import { getLevelTitle } from '../../types/gamification'
import type { AppNotification } from '../../types/notification'
import { notifyStreakRiskIfNeeded, notifyWeeklySummaryIfNeeded } from '../../notifications/notification-system'
import XPBar from '../gamification/XPBar'
import ChameleonThemeToggle from './ChameleonThemeToggle'

function getNotificationIcon(notification: AppNotification) {
  if (notification.type === 'streak_risk') return <Flame className="size-3.5 text-amber-400" />
  if (notification.type === 'achievement_unlocked') return <Award className="size-3.5 text-[#5b4cff]" />
  return <Users className="size-3.5 text-violet-400" />
}

export default function Header() {
  const navigate = useNavigate()
  const { xpState } = useXP()
  const streak = useStreak()
  const { mode, toggleMode } = useThemeMode()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void notifyStreakRiskIfNeeded()
    void notifyWeeklySummaryIfNeeded()
  }, [streak?.currentStreak, streak?.lastActiveDate])

  useEffect(() => {
    if (!showNotifications) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current) return
      if (!notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [showNotifications])

  const handleNotificationClick = async (notification: AppNotification) => {
    await markRead(notification.id)
    setShowNotifications(false)
    if (notification.link) navigate(notification.link)
  }

  const level = xpState?.currentLevel ?? 1
  const xpCurrent = xpState?.xpInCurrentLevel ?? 0
  const xpMax = xpState?.xpForNextLevel ?? 100

  return (
    <header className="topbar z-30 flex-shrink-0">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
        {/* Level badge */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#5b4cff] text-base font-black text-white shadow-sm">
          {level}
        </div>

        {/* Level info */}
        <div className="min-w-0">
          <p className="topbar-level-name text-sm font-extrabold leading-none">
            Level {level}
          </p>
          <p className="topbar-level-title mt-0.5 text-xs font-semibold">
            {getLevelTitle(level)}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          {streak && streak.currentStreak > 0 && (
            <div className="topbar-badge flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold">
              <Flame className="size-3.5 text-amber-400" />
              <span>{streak.currentStreak}</span>
            </div>
          )}

          {/* XP count */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={xpState?.totalXP ?? 0}
              className="topbar-badge flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
              initial={{ scale: 1.12, opacity: 0.72 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 20 }}
            >
              <span>{xpState ? `${xpState.totalXP} XP` : '0 XP'}</span>
            </motion.div>
          </AnimatePresence>

          {/* Notification bell */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              onClick={() => setShowNotifications((open) => !open)}
              className="topbar-icon-btn relative flex h-9 w-9 items-center justify-center rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-rose-400 px-1 text-[10px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="topbar-dropdown absolute right-0 top-[calc(100%+0.55rem)] z-40 w-[min(92vw,360px)] rounded-2xl p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="topbar-dropdown-title text-sm font-black">Notifications</p>
                    <button
                      onClick={() => void markAllRead()}
                      className="topbar-dropdown-action text-[11px] font-bold transition"
                    >
                      Mark all read
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="topbar-dropdown-empty rounded-xl px-3 py-3 text-xs font-semibold">
                      No updates yet.
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => void handleNotificationClick(notification)}
                          className={`topbar-notification-item w-full rounded-xl px-3 py-2.5 text-left transition ${
                            notification.readAt ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">{getNotificationIcon(notification)}</span>
                            <div className="min-w-0 flex-1">
                              <p className="topbar-notif-title text-xs font-extrabold">{notification.title}</p>
                              <p className="topbar-notif-body mt-0.5 text-[11px] font-semibold leading-snug">
                                {notification.message}
                              </p>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="topbar-notif-time text-[10px] font-semibold">
                                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                </span>
                                {notification.actionLabel && (
                                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#5b4cff]">
                                    {notification.actionLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar placeholder */}
          <div className="topbar-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold">
            S
          </div>

          {/* Theme toggle */}
          <ChameleonThemeToggle mode={mode} onToggle={toggleMode} />
        </div>
      </div>

      {/* XP progress bar row */}
      <div className="px-4 pb-2 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <XPBar current={xpCurrent} max={xpMax} height={6} />
          </div>
          <span className="topbar-xp-label flex-shrink-0 text-[11px] font-semibold">
            {xpCurrent} / {xpMax} XP to level {level + 1}
          </span>
        </div>
      </div>
    </header>
  )
}
