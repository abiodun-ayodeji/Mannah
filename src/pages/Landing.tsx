import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Swords, Target, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface LandingProps {
  onGetStarted: () => void
}

interface FeatureItem {
  title: string
  description: string
  icon: LucideIcon
}

const featureItems: FeatureItem[] = [
  { title: 'Adaptive Questions', description: 'Difficulty shifts with your progress in real time.', icon: Sparkles },
  { title: 'Daily Challenges', description: 'Fresh goals every day to keep momentum high.', icon: Target },
  { title: 'Boss Battles', description: 'High-pressure rounds that sharpen exam confidence.', icon: Swords },
  { title: 'Badge Progress', description: 'Visible mastery milestones across all subjects.', icon: Trophy },
]

const realmPreview = [
  { subject: 'Maths', meta: '4/12 topics', tone: 'from-[#2d56d8]/60 to-[#1b2d7d]/60' },
  { subject: 'English', meta: 'Mastery 82%', tone: 'from-[#0d8b78]/62 to-[#134c52]/62' },
]

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="aurora-flow min-h-screen relative overflow-hidden px-4 py-8 md:py-12">
      <div className="aurora-orb aurora-orb-cyan top-[-130px] left-[-120px] h-[380px] w-[380px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-120px] right-[-110px] h-[420px] w-[420px]" />

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <motion.div
          className="aurora-glass rounded-3xl p-6 md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="aurora-pill inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
            <Sparkles className="size-3.5" />
            Modern 11+ Learning
          </span>

          <h1 className="aurora-heading mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
            Launch exam prep with style, speed, and clarity.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#c6dcfb] md:text-base">
            Mannah blends structured practice with game-like momentum, so families can go from
            first session to measurable progress without friction.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {featureItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  className="rounded-2xl border border-white/20 bg-white/[0.04] p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index }}
                >
                  <div className="mb-3 inline-flex rounded-xl border border-white/20 bg-white/10 p-2">
                    <Icon className="size-4 text-[#9dd8ff]" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#b8d0f4]">{item.description}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              onClick={onGetStarted}
              className="aurora-button-primary inline-flex items-center gap-2 px-7 py-3 text-sm font-extrabold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Free
              <ArrowRight className="size-4" />
            </motion.button>
            <span className="text-xs font-semibold text-[#a8c7ef]">No paywall. No ads. No account hassle.</span>
          </div>
        </motion.div>

        <motion.aside
          className="space-y-4"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="aurora-glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#d2e7ff]">
              <span className="aurora-pill">1 Day Streak</span>
              <span className="aurora-pill">142 XP</span>
            </div>
            <div className="mt-4 rounded-2xl border border-white/20 bg-gradient-to-br from-[#3f57cc]/35 to-[#202d75]/35 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#acd2ff]">Daily Quest</p>
              <h3 className="mt-2 text-lg font-black text-white">Continue your momentum</h3>
              <p className="mt-1 text-xs text-[#b6cdf1]">One focused round can unlock your next badge.</p>
              <button
                onClick={onGetStarted}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/25"
              >
                Continue Daily Quest
                <ArrowRight className="size-3.5" />
              </button>
            </div>
            <button
              onClick={onGetStarted}
              className="mt-4 w-full rounded-full border border-[#f2cb7e]/45 bg-gradient-to-r from-[#8a662a]/65 to-[#b88737]/55 px-4 py-2.5 text-sm font-extrabold text-[#ffeec9] transition hover:brightness-110"
            >
              Quick Play · Ignite 10 Questions
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {realmPreview.map((realm) => (
              <div
                key={realm.subject}
                className={`rounded-2xl border border-white/20 bg-gradient-to-br ${realm.tone} p-4`}
              >
                <p className="text-lg font-black text-white">{realm.subject}</p>
                <p className="mt-1 text-xs font-semibold text-[#cae2ff]">{realm.meta}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300"
                    style={{ width: realm.subject === 'Maths' ? '34%' : '82%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="aurora-glass-soft rounded-2xl p-4 text-sm text-[#c3daf8]">
            <p className="font-bold text-white">Designed for busy families</p>
            <p className="mt-1 text-xs leading-relaxed">
              Structured practice sessions, clear progress cues, and actionable next steps.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#e5f3ff]">
              <BookOpen className="size-3.5" />
              All 4 subjects included
            </div>
          </div>
        </motion.aside>
      </section>
    </div>
  )
}
