import { motion } from 'framer-motion'

interface TimerBarProps {
  timeLeft: number
  totalTime: number
}

export default function TimerBar({ timeLeft, totalTime }: TimerBarProps) {
  const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100

  const getBarColor = () => {
    if (pct >= 50) return 'bg-gradient-to-r from-emerald-300 to-emerald-400'
    if (pct >= 25) return 'bg-gradient-to-r from-amber-300 to-orange-400'
    return 'bg-gradient-to-r from-rose-300 to-red-400'
  }

  return (
    <div className={`aurora-progress-track h-2 w-full${pct < 25 ? ' glow-danger' : ''}`}>
      <motion.div
        className={`h-full rounded-full shimmer-bar ${getBarColor()}${pct < 25 ? ' timer-danger' : ''}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: 'linear' }}
      />
    </div>
  )
}
