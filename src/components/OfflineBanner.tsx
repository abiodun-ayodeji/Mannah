import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="offline-banner fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-2">
      <WifiOff className="size-3.5" />
      You're offline — quizzes still work!
    </div>
  )
}
