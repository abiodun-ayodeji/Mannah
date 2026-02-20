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
  if (notification.type === 'streak_risk') {
    return <Flame className="size-3.5 text-amber-300" />
  }
  if (notification.type === 'achievement_unlocked') {
    return <Award className="size-3.5 text-cyan-200" />
  }
  return <Users className="size-3.5 text-violet-200" />
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
    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <motion.header
      className="sticky top-3 z-30 px-4 md:px-8"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-3 rounded-2xl aurora-glass px-4 py-3 md:px-5 md:py-4">
          <div className="grid size-12 place-items-center rounded-xl border border-cyan-200/45 bg-gradient-to-br from-cyan-300/70 to-violet-300/65 text-lg font-black text-[#08223f]">
            {xpState ? xpState.currentLevel : 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-extrabold text-white">
                Level {xpState ? xpState.currentLevel : 1}
              </h3>
              <span className="aurora-pill text-[10px] font-semibold">
                {xpState ? getLevelTitle(xpState.currentLevel) : 'Apprentice'}
              </span>
            </div>
            <div className="mt-2">
              <XPBar
                current={xpState?.xpInCurrentLevel ?? 0}
                max={xpState?.xpForNextLevel ?? 100}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
            {streak && streak.currentStreak > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-200/15 px-2.5 py-1 text-xs font-extrabold text-amber-100">
                <Flame className="size-3.5 text-amber-300" />
                {streak.currentStreak}
              </div>
            )}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={xpState?.totalXP ?? 0}
                className="rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-[10px] font-bold text-[#d8e9ff] md:px-2.5 md:text-[11px]"
                initial={{ scale: 1.12, opacity: 0.72 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 20 }}
              >
                {xpState ? `${xpState.totalXP} XP` : '0 XP'}
              </motion.div>
            </AnimatePresence>

            <div className="relative" ref={notificationsRef}>
              <motion.button
                onClick={() => setShowNotifications((open) => !open)}
                className="relative grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-[#d8e9ff] transition hover:bg-white/20"
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
                    className="absolute right-0 top-[calc(100%+0.55rem)] z-40 w-[min(92vw,360px)] rounded-2xl aurora-card-soft p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-black text-white">Notifications</p>
                      <button
                        onClick={() => void markAllRead()}
                        className="text-[11px] font-bold text-[#c5dcf8] transition hover:text-[#ebf8ff]"
                      >
                        Mark all read
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-xs font-semibold text-[#c6ddf9]">
                        No updates yet.
                      </p>
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => void handleNotificationClick(notification)}
                            className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                              notification.readAt
                                ? 'border-white/15 bg-white/8'
                                : 'border-white/25 bg-white/15'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5">{getNotificationIcon(notification)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-extrabold text-[#eef9ff]">{notification.title}</p>
                                <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#c6ddf9]">
                                  {notification.message}
                                </p>
                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-semibold text-[#a8c7ea]">
                                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                  </span>
                                  {notification.actionLabel && (
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-200">
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
            <ChameleonThemeToggle mode={mode} onToggle={toggleMode} />
          </div>
        </div>
      </div>
    </motion.header>
  )
}
