import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  show: boolean
  isCorrect: boolean
  xpEarned: number
  explanation: string
  onContinue: () => void
}

export default function FeedbackOverlay({
  show,
  isCorrect,
  xpEarned,
  explanation,
  onContinue,
}: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#02081b]/65 backdrop-blur-sm" onClick={onContinue} />
          <motion.div
            className={`relative w-full max-w-4xl rounded-3xl border p-6 pb-8 shadow-2xl ${
              isCorrect
                ? 'border-emerald-100/40 bg-gradient-to-br from-emerald-300/25 via-emerald-400/15 to-cyan-300/16'
                : 'border-rose-100/45 bg-gradient-to-br from-rose-300/25 via-rose-400/15 to-violet-300/16'
            }`}
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.span
                className="text-4xl"
                animate={isCorrect ? { scale: [1, 1.3, 1] } : { x: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.4 }}
              >
                {isCorrect ? '\u2705' : '\u274C'}
              </motion.span>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {isCorrect ? 'Correct!' : 'Oopsy! Try again!'}
                </h3>
                {isCorrect && (
                  <motion.span
                    className="text-white/90 font-bold text-sm"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.3 }}
                  >
                    +{xpEarned} XP
                  </motion.span>
                )}
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-white/90">{explanation}</p>

            <motion.button
              onClick={onContinue}
              className="w-full rounded-full border border-white/35 bg-white/20 py-3.5 text-lg font-bold text-white transition-colors hover:bg-white/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
