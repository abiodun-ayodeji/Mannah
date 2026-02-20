import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'bright'

const THEME_STORAGE_KEY = 'mannah_theme_mode'

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'bright' ? 'bright' : 'dark'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', mode)
}

export function initializeThemeMode() {
  const mode = getStoredTheme()
  applyTheme(mode)
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme())

  useEffect(() => {
    applyTheme(mode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    }
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((previous) => (previous === 'dark' ? 'bright' : 'dark'))
  }, [])

  return { mode, toggleMode }
}
