import { useState, useEffect, useCallback } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onOfflineReady() {
        // silently ready for offline
      },
    })
    setUpdateSW(() => update)
  }, [])

  const handleUpdate = useCallback(() => {
    updateSW?.(true)
  }, [updateSW])

  const handleDismiss = useCallback(() => {
    setNeedRefresh(false)
  }, [])

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] px-4 pt-2 animate-in slide-in-from-top">
      <div className="max-w-lg mx-auto bg-[#5b4cff] text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
        <span className="text-sm font-semibold flex-1">
          New version available!
        </span>
        <button
          onClick={handleUpdate}
          className="bg-white text-[#5b4cff] font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          Update
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white text-lg leading-none transition-colors"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
