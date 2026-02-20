import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { db } from '../db/database'
import { DEFAULT_SETTINGS } from '../types/user'
import { initializeAchievements } from '../gamification/achievement-system'

interface OnboardingProps {
  onComplete: () => void
  onBack?: () => void
}

export default function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [name, setName] = useState('')

  const handleFinish = async () => {
    const trimmed = name.trim()
    if (!trimmed) return

    await db.userProfile.put({
      id: 'default',
      name: trimmed,
      createdAt: Date.now(),
      settings: DEFAULT_SETTINGS,
    })
    await initializeAchievements()
    onComplete()
  }

  return (
    <div className="aurora-flow min-h-screen relative overflow-hidden px-4 py-8 md:py-12 flex items-center justify-center">
      <div className="aurora-orb aurora-orb-cyan top-[-140px] right-[10%] h-[340px] w-[340px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-120px] left-[-100px] h-[360px] w-[360px]" />

      <section className="relative z-10 mx-auto w-full max-w-xl">
        <motion.div
          className="aurora-glass rounded-3xl p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="aurora-pill text-xs uppercase tracking-[0.16em]">Step 2 of 2</span>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d7e9ff] transition hover:bg-white/15"
              >
                <ChevronLeft className="size-3.5" />
                Back
              </button>
            )}
          </div>

          <h1 className="aurora-heading mt-5 text-3xl font-black text-white md:text-4xl">What should we call you?</h1>
          <p className="mt-3 text-sm text-[#c3d9f7]">Your name personalizes progress and encouragement.</p>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            className="aurora-input mt-6 text-lg font-bold"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleFinish()
              }
            }}
          />

          <motion.button
            onClick={() => void handleFinish()}
            disabled={!name.trim()}
            className="aurora-button-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-55"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Learning
            <ArrowRight className="size-4" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}
