import { motion } from 'framer-motion'

interface StreakDisplayProps {
  streak: number
  showBig?: boolean
}

export default function StreakDisplay({ streak, showBig = false }: StreakDisplayProps) {
  if (streak <= 0) return null

  if (showBig) {
    return (
      <div className="aurora-subtle inline-flex flex-col items-center rounded-2xl px-4 py-3 glow-amber">
        <motion.div
          className="text-5xl"
          animate={{ scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          {'\u{1F525}'}
        </motion.div>
        <span className="mt-1 text-2xl font-extrabold text-[#eff8ff]">{streak}</span>
        <span className="text-xs font-semibold text-[#b2d1f2]">day streak</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-amber-200/35 bg-amber-300/18 px-3 py-1 pulse-badge">
      <motion.span
        className="text-lg"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        {'\u{1F525}'}
      </motion.span>
      <span className="text-sm font-bold text-amber-100">{streak}</span>
    </div>
  )
}
