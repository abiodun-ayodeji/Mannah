import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BookOpen, ChevronLeft, Sparkles, Swords, Target, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { db } from '../db/database'
import { DEFAULT_SETTINGS } from '../types/user'
import { initializeAchievements } from '../gamification/achievement-system'

interface OnboardingProps {
  onComplete: () => void
}

interface OnboardingFeature {
  title: string
  description: string
  icon: LucideIcon
}

const features: OnboardingFeature[] = [
  { title: 'Smart Topics', description: 'Practice adapts to what needs work next.', icon: Sparkles },
  { title: 'Daily Targets', description: 'Small goals that build consistent wins.', icon: Target },
  { title: 'Boss Rounds', description: 'Timed challenges for exam pressure.', icon: Swords },
  { title: 'Progress Badges', description: 'Milestones that make growth visible.', icon: Trophy },
  { title: 'Parent View', description: 'Simple snapshots of progress and focus.', icon: BookOpen },
]

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  const handleFinish = async () => {
    await db.userProfile.put({
      id: 'default',
      name: name.trim() || 'Student',
      createdAt: Date.now(),
      settings: DEFAULT_SETTINGS,
    })
    await initializeAchievements()
    onComplete()
  }

  return (
    <div className="aurora-flow min-h-screen relative overflow-hidden px-4 py-8 md:py-12">
      <div className="aurora-orb aurora-orb-cyan top-[-140px] right-[10%] h-[340px] w-[340px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-120px] left-[-100px] h-[360px] w-[360px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b7cff3]">
            <span className="aurora-pill">Onboarding</span>
            <span>Step {step + 1} of 2</span>
          </div>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d7e9ff] transition hover:bg-white/15"
            >
              <ChevronLeft className="size-3.5" />
              Back
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          {[0, 1].map((index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full ${index <= step ? 'bg-cyan-300' : 'bg-white/15'}`}
              style={{ width: index === step ? 84 : 42 }}
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="identity"
              className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"
              {...pageTransition}
            >
              <section className="aurora-glass rounded-3xl p-6 md:p-8">
                <span className="aurora-pill inline-flex text-xs uppercase tracking-[0.16em]">Profile Setup</span>
                <h1 className="aurora-heading mt-5 text-3xl font-black text-white md:text-4xl">
                  What should we call you?
                </h1>
                <p className="mt-3 text-sm text-[#c3d9f7]">
                  Your name personalizes progress, reports, and daily encouragement.
                </p>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  className="mt-7 w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3.5 text-lg font-bold text-white placeholder:text-[#9db9df] outline-none transition focus:border-cyan-300 focus:bg-white/15"
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') setStep(1)
                  }}
                />

                <motion.button
                  onClick={() => setStep(1)}
                  className="aurora-button-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-extrabold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Continue
                  <ArrowRight className="size-4" />
                </motion.button>
              </section>

              <aside className="aurora-glass-soft rounded-3xl p-6 md:p-7">
                <p className="text-xs uppercase tracking-[0.16em] text-[#b1cdf3]">What you unlock</p>
                <h2 className="mt-3 text-xl font-black text-white">A focused learning command center</h2>
                <ul className="mt-4 space-y-3 text-sm text-[#c0d8f8]">
                  <li className="rounded-xl border border-white/15 bg-white/[0.04] p-3">Personalized quick-play recommendations</li>
                  <li className="rounded-xl border border-white/15 bg-white/[0.04] p-3">Subject-by-subject mastery tracking</li>
                  <li className="rounded-xl border border-white/15 bg-white/[0.04] p-3">Achievement progress and streak momentum</li>
                </ul>
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="tour"
              className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
              {...pageTransition}
            >
              <section className="aurora-glass rounded-3xl p-6 md:p-8">
                <span className="aurora-pill inline-flex text-xs uppercase tracking-[0.16em]">Experience Preview</span>
                <h2 className="aurora-heading mt-5 text-3xl font-black text-white">
                  Built to feel fast, clear, and motivating.
                </h2>
                <p className="mt-3 text-sm text-[#bfd7f8]">
                  Every session keeps your next best action visible.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {features.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.title}
                        className="rounded-2xl border border-white/20 bg-white/[0.04] p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="mb-2 inline-flex rounded-lg border border-white/20 bg-white/10 p-2">
                          <Icon className="size-4 text-[#9bd5ff]" />
                        </div>
                        <h3 className="text-sm font-extrabold text-white">{item.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#b9d1f4]">{item.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </section>

              <aside className="aurora-glass-soft rounded-3xl p-6 md:p-7 flex flex-col">
                <p className="text-xs uppercase tracking-[0.16em] text-[#b2cef3]">Ready to launch</p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  {name.trim() || 'Student'}, your journey starts now.
                </h3>
                <p className="mt-3 text-sm text-[#bfd7f7]">
                  We will drop you into your home dashboard with recommendations, quick play, and full subject access.
                </p>

                <motion.button
                  onClick={handleFinish}
                  className="aurora-button-primary mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Learning
                  <ArrowRight className="size-4" />
                </motion.button>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
