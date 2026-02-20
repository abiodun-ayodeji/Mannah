import { motion, AnimatePresence } from 'framer-motion'
import type { Achievement } from '../../types/gamification'

interface AchievementToastProps {
  achievement: Achievement | null
  onClose: () => void
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-4 left-4 right-4 z-50 flex justify-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <motion.button
            onClick={onClose}
            className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border-2 border-amber-400 max-w-sm w-full glow-amber"
            whileTap={{ scale: 0.97 }}
          >
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {achievement.icon}
            </motion.span>
            <div className="text-left">
              <div className="text-xs text-amber-600 font-extrabold uppercase tracking-wide">
                Achievement Unlocked!
              </div>
              <div className="font-bold text-[#0f1419]">{achievement.name}</div>
              <div className="text-xs text-[#6b7280]">{achievement.description}</div>
            </div>
            <motion.div
              className="ml-auto text-sm font-bold text-[#5b4cff]"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              +{achievement.xpReward}
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
