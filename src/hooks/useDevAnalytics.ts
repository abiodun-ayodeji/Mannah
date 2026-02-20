import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  trackSessionStart,
  trackHeartbeat,
  trackSessionEnd,
  trackPageNav,
} from '../utils/dev-analytics'

const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Hook that wires up developer-side session analytics.
 * Renders nothing — purely fires Vercel Analytics events.
 *
 * - session_start  → on mount
 * - session_heartbeat → every 5 min while the tab is visible
 * - session_end    → on beforeunload / tab hidden
 * - page_navigation → on route change
 */
export function useDevAnalytics() {
  const location = useLocation()
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Session start + heartbeat + end listeners
  useEffect(() => {
    trackSessionStart()

    // Heartbeat
    heartbeatRef.current = setInterval(trackHeartbeat, HEARTBEAT_INTERVAL)

    // End session on unload
    const onBeforeUnload = () => trackSessionEnd()
    window.addEventListener('beforeunload', onBeforeUnload)

    // End session when tab becomes hidden (mobile)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackSessionEnd()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  // Page navigation tracking
  useEffect(() => {
    trackPageNav(location.pathname)
  }, [location.pathname])
}
