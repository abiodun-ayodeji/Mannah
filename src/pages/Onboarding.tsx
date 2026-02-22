import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react'
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] px-6">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-[#5b4cff]/[0.04]" />
        <div className="absolute -right-12 -bottom-12 h-56 w-56 rounded-full bg-[#FCD34D]/[0.06]" />
      </div>

      {/* Back button */}
      {onBack && (
        <div className="absolute top-6 left-5 z-10">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Step badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5b4cff]/10 px-4 py-1.5 text-xs font-bold text-[#5b4cff]">
            <Sparkles className="h-3.5 w-3.5" />
            Step 1 of 1
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-7 shadow-xl shadow-[#5b4cff]/[0.06] ring-1 ring-gray-100">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              What should we call you?
            </h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Pick a name you&apos;d like to see on your learning dashboard.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Star Learner…"
              autoFocus
              autoComplete="off"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-base font-semibold text-gray-900 placeholder:text-gray-400/50 transition-all focus:border-[#5b4cff] focus:bg-white focus:ring-2 focus:ring-[#5b4cff]/20 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && void handleFinish()}
            />

            <motion.button
              type="button"
              onClick={() => void handleFinish()}
              disabled={!name.trim()}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-[#5b4cff] px-6 py-3.5 text-base font-extrabold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          You can always change this later in Settings.
        </p>
      </motion.div>
    </div>
  )
}
