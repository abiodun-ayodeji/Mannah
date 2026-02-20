import { useId } from 'react'
import { motion } from 'framer-motion'
import type { ThemeMode } from '../../hooks/useThemeMode'

interface ChameleonThemeToggleProps {
  mode: ThemeMode
  onToggle: () => void
}

export default function ChameleonThemeToggle({ mode, onToggle }: ChameleonThemeToggleProps) {
  const gradientId = useId()
  const strokeId = useId()

  const brightSide = mode === 'bright'

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 p-1.5 text-[#d8e9ff] transition hover:bg-white/18"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      aria-label={brightSide ? 'Switch to dark mode' : 'Switch to bright mode'}
      title={brightSide ? 'Switch to dark mode' : 'Switch to bright mode'}
    >
      <svg viewBox="0 0 128 96" className="h-full w-full" role="img" aria-hidden="true">
        <defs>
          <linearGradient
            id={gradientId}
            x1={brightSide ? '100%' : '0%'}
            y1="0%"
            x2={brightSide ? '0%' : '100%'}
            y2="0%"
          >
            <stop offset="0%" stopColor="#97ff73" />
            <stop offset="50%" stopColor="#48c15f" />
            <stop offset="100%" stopColor="#143d2a" />
          </linearGradient>
          <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#baffb7" />
            <stop offset="100%" stopColor="#1a5b3a" />
          </linearGradient>
        </defs>

        <path
          d="M3 72 C26 63, 56 60, 84 66 C101 69, 115 68, 125 62"
          fill="none"
          stroke="#7f5735"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M30 60 C24 74, 33 86, 47 83 C55 81, 58 73, 54 67 C50 61, 43 60, 39 64"
          fill="none"
          stroke={`url(#${strokeId})`}
          strokeWidth="5"
          strokeLinecap="round"
        />

        <ellipse cx="63" cy="44" rx="30" ry="19" fill={`url(#${gradientId})`} />
        <circle cx="89" cy="40" r="11" fill={`url(#${gradientId})`} />
        <circle cx="92.5" cy="37.2" r="2.4" fill="#0e1b14" />

        <path d="M67 58 L78 66 L84 62" fill="none" stroke="#1f5f3d" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 58 L42 66 L37 62" fill="none" stroke="#1f5f3d" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </motion.button>
  )
}
