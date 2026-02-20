import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SESSION_COUNT_KEY = 'mannah_session_count'
const INSTALL_DISMISSED_KEY = 'mannah_install_dismissed'
const SESSIONS_BEFORE_PROMPT = 3

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if previously dismissed
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true') return

    // Increment session count
    const count = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? '0', 10) + 1
    localStorage.setItem(SESSION_COUNT_KEY, String(count))

    // Only show after N sessions
    if (count < SESSIONS_BEFORE_PROMPT) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShouldShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShouldShow(false)
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setShouldShow(false)
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
  }

  return { shouldShow, install, dismiss }
}
