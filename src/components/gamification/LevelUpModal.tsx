import { motion, AnimatePresence } from 'framer-motion'
import { getLevelTitle } from '../../types/gamification'

interface LevelUpModalProps {
  show: boolean
  level: number
  onClose: () => void
}

const CONFETTI_COLORS = ['#5b4cff', '#FCD34D', '#10B981', '#EC4899', '#F59E0B']

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            position: 'absolute',
            left: `${10 + ((i * 11) % 80)}%`,
            top: '-10px',
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${((i * 0.17) % 2).toFixed(2)}s`,
            animationDuration: `${(2 + ((i * 0.21) % 2)).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function LevelUpModal({ show, level, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#02081b]/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative mx-4 max-w-sm overflow-hidden rounded-3xl border border-cyan-100/30 aurora-card p-8 text-center shadow-2xl"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ConfettiBurst />
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              {'\u{1F389}'}
            </motion.div>
            <h2 className="text-2xl font-extrabold gradient-text mb-2">Level Up!</h2>
            <motion.div
              className="mb-2 text-5xl font-extrabold text-cyan-100"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            >
              {level}
            </motion.div>
            <p className="mb-6 font-semibold text-[#b5d3f4]">{getLevelTitle(level)}</p>
            <motion.button
              onClick={onClose}
              className="aurora-button-primary px-8 py-3 text-lg font-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
