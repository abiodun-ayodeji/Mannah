import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { format, subDays, startOfDay } from 'date-fns'
import { useXP } from '../hooks/useXP'
import { useStreak } from '../hooks/useStreak'
import { getLevelTitle } from '../types/gamification'
import { getTopicStats } from '../utils/practice-recommendations'
import { ChevronDown, Heart, MessageSquare, Flame, Target, Zap, TrendingUp } from 'lucide-react'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [showSetPin, setShowSetPin] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const { xpState } = useXP()
  const streak = useStreak()

  const profile = useLiveQuery(() => db.userProfile.get('default'), [])

  const weeklyStats = useLiveQuery(async () => {
    const days: { date: string; total: number; correct: number; xp: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDay(subDays(new Date(), i)).getTime()
      const dayEnd = dayStart + 86400000
      const dayAttempts = await db.attempts
        .where('timestamp')
        .between(dayStart, dayEnd)
        .toArray()
      days.push({
        date: format(subDays(new Date(), i), 'EEE'),
        total: dayAttempts.length,
        correct: dayAttempts.filter((a) => a.isCorrect).length,
        xp: dayAttempts.reduce((s, a) => s + a.xpEarned, 0),
      })
    }
    return days
  }, [])

  const topicAnalysis = useLiveQuery(() => getTopicStats(3), [])

  const handlePinSubmit = () => {
    if (!profile?.parentPin) { setAuthenticated(true); return }
    if (pin === profile.parentPin) { setFailedAttempts(0); setAuthenticated(true); return }
    setFailedAttempts((prev) => prev + 1)
    setPin('')
    setShaking(true)
    setTimeout(() => setShaking(false), 450)
  }

  const handleSetPin = async (newPin: string) => {
    await db.userProfile.update('default', { parentPin: newPin })
    setShowSetPin(false)
  }

  if (!authenticated) {
    return (
      <div className="aurora-flow fixed inset-0 z-40 flex items-center justify-center overflow-hidden px-6">
        <div className="aurora-orb aurora-orb-cyan top-[-180px] right-[-120px] h-[420px] w-[420px]" />
        <div className="aurora-orb aurora-orb-violet bottom-[-180px] left-[-140px] h-[440px] w-[440px]" />
        <motion.div
          className="relative z-10 w-full max-w-md rounded-3xl aurora-card p-7 text-center md:p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-5xl">👨‍👩‍👧‍👦</p>
          <h1 className="aurora-heading mt-4 text-3xl font-black text-white">Parent Dashboard</h1>
          <p className="mt-2 text-sm text-[#b6d3f5]">
            {profile?.parentPin ? 'Enter your 4-digit PIN to view learning insights.' : 'No PIN set yet. Continue to open the dashboard.'}
          </p>
          {profile?.parentPin ? (
            <div className="mt-6 space-y-4">
              <motion.input
                type="password" inputMode="numeric" maxLength={4} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                placeholder="• • • •"
                className="aurora-input mx-auto w-44 text-center text-2xl tracking-[0.5em] font-black"
                animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.35 }}
              />
              {failedAttempts > 0 && failedAttempts < 3 && (
                <p className="text-xs font-bold text-rose-200">Incorrect PIN. {3 - failedAttempts} attempt{3 - failedAttempts !== 1 ? 's' : ''} left before hint.</p>
              )}
              {failedAttempts >= 3 && profile.parentPin && (
                <div className="rounded-xl border border-amber-200/35 bg-amber-200/10 px-3 py-2.5">
                  <p className="text-xs font-bold text-amber-100">Hint: {profile.parentPin[0]} _ _ {profile.parentPin[3]}</p>
                </div>
              )}
              <motion.button onClick={handlePinSubmit} className="aurora-button-primary px-10 py-3 text-sm font-black" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Enter</motion.button>
            </div>
          ) : (
            <motion.button onClick={() => setAuthenticated(true)} className="aurora-button-primary mt-6 px-10 py-3 text-sm font-black" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>View Dashboard</motion.button>
          )}
          <button onClick={() => navigate('/')} className="mt-6 text-sm font-semibold text-[#9dc0e8] transition-colors hover:text-[#d5ebff]">Back to App</button>
        </motion.div>
      </div>
    )
  }

  const maxWeeklyQuestions = Math.max(...(weeklyStats?.map((d) => d.total) ?? [1]))
  const weeklyTotal = weeklyStats?.reduce((s, d) => s + d.total, 0) ?? 0
  const weeklyCorrect = weeklyStats?.reduce((s, d) => s + d.correct, 0) ?? 0
  const weeklyAccuracy = weeklyTotal > 0 ? Math.round((weeklyCorrect / weeklyTotal) * 100) : 0

  // Build insight cards from live data
  const insights: { icon: React.ElementType; accent: string; iconBg: string; title: string; body: string }[] = []

  if (!streak || streak.currentStreak === 0) {
    insights.push({ icon: Flame, accent: '#f97316', iconBg: 'rgba(249,115,22,0.12)', title: 'Build a Streak', body: 'Even 10 minutes a day compounding is what separates strong 11+ performers.' })
  } else {
    insights.push({ icon: Flame, accent: '#f97316', iconBg: 'rgba(249,115,22,0.12)', title: `${streak.currentStreak}-Day Streak 🔥`, body: `Longest streak: ${streak.longestStreak} days. Consistency is a superpower — keep it going!` })
  }

  if (topicAnalysis && topicAnalysis.length > 0 && topicAnalysis[0].accuracy < 0.5) {
    insights.push({ icon: Target, accent: '#ef4444', iconBg: 'rgba(239,68,68,0.1)', title: `Focus: ${TOPIC_LABELS[topicAnalysis[0].topic]}`, body: `Accuracy is below 50%. A few focused sessions here will move the needle fast.` })
  } else if (weeklyAccuracy >= 70) {
    insights.push({ icon: TrendingUp, accent: '#10b981', iconBg: 'rgba(16,185,129,0.1)', title: 'Strong Week!', body: `${weeklyAccuracy}% accuracy across ${weeklyTotal} questions. Excellent momentum.` })
  }

  insights.push({ icon: Zap, accent: '#5b4cff', iconBg: 'rgba(91,76,255,0.1)', title: 'Weekly Target', body: '20+ questions across at least 2 subjects per day builds well-rounded exam readiness.' })

  return (
    <div className="aurora-page mx-auto max-w-3xl space-y-4 pb-24">

      {/* Header */}
      <header className="mt-1">
        <h1 className="aurora-page-title">Parent Dashboard</h1>
        <p className="aurora-page-subtitle">Live snapshot of progress, confidence, and momentum.</p>
      </header>

      {/* Student hero */}
      <motion.section
        className="aurora-card overflow-hidden p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="grid size-14 flex-shrink-0 place-items-center rounded-2xl border border-cyan-200/45 bg-gradient-to-br from-cyan-300/70 to-violet-300/70 text-2xl font-black text-[#08233f]">
            {xpState?.currentLevel ?? 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-white">{profile?.name ?? 'Student'}</p>
            <p className="mt-0.5 text-sm font-semibold text-[#b4d1f2]">{getLevelTitle(xpState?.currentLevel ?? 1)} · {xpState?.totalXP ?? 0} XP</p>
            <p className="mt-0.5 text-sm font-semibold text-[#b4d1f2]">🔥 {streak?.currentStreak ?? 0} day streak · best {streak?.longestStreak ?? 0}</p>
          </div>
        </div>

        {/* XP mini progress */}
        {xpState && (
          <div className="mt-4">
            <div className="aurora-progress-track h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.round((xpState.xpInCurrentLevel / xpState.xpForNextLevel) * 100))}%`, background: 'linear-gradient(90deg, #77d8ff, #8f8bff)' }}
              />
            </div>
            <p className="mt-1.5 text-right text-[10px] font-semibold text-[#a5c4e7]">
              {xpState.xpInCurrentLevel} / {xpState.xpForNextLevel} XP to Level {(xpState.currentLevel ?? 1) + 1}
            </p>
          </div>
        )}
      </motion.section>

      {/* Weekly activity */}
      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">Weekly Activity</h2>
          <div className="flex gap-4 text-xs font-semibold text-[#accbed]">
            <span>{weeklyTotal} questions</span>
            <span>{weeklyTotal > 0 ? `${weeklyAccuracy}% accuracy` : '—'}</span>
          </div>
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {weeklyStats?.map((day) => {
            const barH = maxWeeklyQuestions > 0 ? (day.total / maxWeeklyQuestions) * 100 : 0
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-cyan-100">{day.total || ''}</span>
                <div className="aurora-progress-track relative h-full w-full min-h-2 rounded-lg">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500"
                    style={{ height: `${Math.max(barH, 5)}%`, background: 'linear-gradient(to top, #77d8ff, #8f8bff)' }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-[#a5c4e7]">{day.date}</span>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* Focus areas */}
      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      >
        <h2 className="text-base font-extrabold text-white">Focus Areas</h2>
        <p className="mt-0.5 text-xs font-semibold text-[#a8c7ea]">Topics with the lowest accuracy</p>
        {topicAnalysis && topicAnalysis.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {topicAnalysis.slice(0, 3).map((topic) => {
              const pct = Math.round(topic.accuracy * 100)
              const tone = pct < 50 ? 'linear-gradient(90deg,#fb7185,#ef4444)' : pct < 70 ? 'linear-gradient(90deg,#fbbf24,#f97316)' : 'linear-gradient(90deg,#34d399,#10b981)'
              return (
                <div key={`${topic.subject}:${topic.topic}`} className="aurora-subtle flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <span className="grid size-8 flex-shrink-0 place-items-center rounded-lg border border-white/20 bg-white/10 text-sm">
                    {SUBJECT_CONFIG[topic.subject as Subject].icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#ecf8ff]">{TOPIC_LABELS[topic.topic]}</span>
                  <div className="aurora-progress-track h-2 w-16 flex-shrink-0">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
                  </div>
                  <span className="w-9 flex-shrink-0 text-right text-xs font-black text-[#cde4ff]">{pct}%</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-[#b1cfee] aurora-subtle rounded-xl px-4 py-3">Complete a few sessions to unlock topic insights.</p>
        )}
      </motion.section>

      {/* Insights */}
      <motion.section
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      >
        <h2 className="mb-3 text-base font-extrabold text-white">Insights</h2>
        <div className="flex flex-col gap-3">
          {insights.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="aurora-card-soft flex items-start gap-4 rounded-2xl p-4">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: item.iconBg }}>
                  <Icon className="size-5" style={{ color: item.accent }} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#a8c7ea]">{item.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* PIN */}
      <motion.section
        className="aurora-card-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
      >
        <div>
          <p className="text-sm font-black text-white">Parent PIN</p>
          <p className="text-xs font-semibold text-[#aac9ea]">{profile?.parentPin ? 'PIN is set.' : 'No PIN set yet.'}</p>
        </div>
        <motion.button onClick={() => setShowSetPin((p) => !p)} className="aurora-button-primary px-4 py-2 text-sm font-black" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          {showSetPin ? 'Cancel' : 'Set / Update PIN'}
        </motion.button>
      </motion.section>

      {showSetPin && (
        <motion.section className="aurora-card-soft rounded-2xl p-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <PinSetter onSet={handleSetPin} />
        </motion.section>
      )}

      {/* Help Keep Mannah Free — collapsible */}
      <motion.section
        className="overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        style={{ background: 'linear-gradient(135deg, #1e1880 0%, #3730a3 50%, #5b4cff 100%)' }}
      >
        <button
          onClick={() => setSupportOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <Heart className="size-5 text-rose-300" strokeWidth={2} />
            <div>
              <p className="text-sm font-extrabold text-white">Help Keep Mannah Free</p>
              <p className="text-xs text-white/60">Ad-free and free for every family</p>
            </div>
          </div>
          <motion.div animate={{ rotate: supportOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="size-5 text-white/70" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {supportOpen && (
            <motion.div
              key="support-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 px-5 pb-5">
                <a
                  href="https://buy.stripe.com/bJe28r8bZe254a8e4Pdby00"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 transition-colors hover:bg-white/20"
                >
                  <span className="text-xl">☕</span>
                  <div>
                    <p className="text-sm font-extrabold text-white">Support Mannah</p>
                    <p className="text-xs text-white/60">Buy us a coffee — every bit helps</p>
                  </div>
                </a>
                <a
                  href="https://forms.gle/DF7jd8XH2DewR2NT8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/15"
                >
                  <MessageSquare className="size-5 text-white/80" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-extrabold text-white">Give Feedback</p>
                    <p className="text-xs text-white/60">Tell us what would make this better</p>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

    </div>
  )
}

function PinSetter({ onSet }: { onSet: (pin: string) => void }) {
  const [newPin, setNewPin] = useState('')
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="password" inputMode="numeric" maxLength={4} value={newPin}
        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
        placeholder="4 digits"
        className="aurora-input max-w-[180px] text-center text-lg tracking-[0.2em]"
      />
      <button
        onClick={() => newPin.length === 4 && onSet(newPin)}
        disabled={newPin.length !== 4}
        className="aurora-button-primary px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-55"
      >
        Save PIN
      </button>
    </div>
  )
}
