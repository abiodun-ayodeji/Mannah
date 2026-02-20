import { motion } from 'framer-motion'

interface XPBarProps {
  current: number
  max: number
  height?: number
  showLabel?: boolean
}

export default function XPBar({ current, max, height = 6, showLabel = false }: XPBarProps) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0

  return (
    <div className="w-full">
      <div
        className="aurora-progress-track w-full"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 shimmer-bar"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-center text-[10px] font-semibold text-[#aecded]">
          {current} / {max} XP
        </div>
      )}
    </div>
  )
}
