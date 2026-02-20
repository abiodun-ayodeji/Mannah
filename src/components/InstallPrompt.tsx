import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { shouldShow, install, dismiss } = useInstallPrompt()

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-lg border border-[#e5e7eb] p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#5b4cff] to-[#8b7aff] flex items-center justify-center flex-shrink-0">
            <Download className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0f1419]">Install Mannah</p>
            <p className="text-xs text-[#6b7280]">Add to home screen for the best experience</p>
          </div>
          <button
            onClick={install}
            className="bg-[#5b4cff] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#5b4cff]/90 transition-colors flex-shrink-0"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            className="text-[#6b7280] hover:text-[#0f1419] transition-colors flex-shrink-0"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
