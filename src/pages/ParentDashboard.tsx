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
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronDown,
  Flame,
  Heart,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────── */
/*  Tiny helpers                                                         */
/* ────────────────────────────────────────────────────────────────────── */

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

function StatTile({
  icon,
  value,
  label,
  accentBg,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  accentBg: string
}) {
  return (
    <div className="pd-stat-tile flex flex-col items-center gap-2 rounded-2xl p-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: accentBg }}
      >
        {icon}
      </span>
      <span className="pd-stat-value text-xl font-black leading-none">{value}</span>
      <span className="pd-stat-label text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}

function AccuracyPill({ pct }: { pct: number }) {
  const cls =
    pct < 50
      ? 'bg-rose-500/15 text-rose-400'
      : pct < 70
        ? 'bg-amber-500/15 text-amber-400'
        : 'bg-emerald-500/15 text-emerald-400'
  return (
    <span className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-black ${cls}`}>
      {pct}%
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/*  PIN Gate Screen                                                      */
/* ────────────────────────────────────────────────────────────────────── */

function PinGate({
  profile,
  onAuthenticate,
  onBack,
}: {
  profile: { parentPin?: string } | undefined
  onAuthenticate: () => void
  onBack: () => void
}) {
  const [pin, setPin] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)

  const handleSubmit = () => {
    if (!profile?.parentPin) { onAuthenticate(); return }
    if (pin === profile.parentPin) { onAuthenticate(); return }
    setFailedAttempts((p) => p + 1)
    setPin('')
    setShaking(true)
    setTimeout(() => setShaking(false), 450)
  }

  return (
    <div className="aurora-flow fixed inset-0 z-40 flex items-center justify-center overflow-hidden px-6">
      <div className="aurora-orb aurora-orb-cyan top-[-180px] right-[-120px] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-180px] left-[-140px] h-[440px] w-[440px]" />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-3xl aurora-card p-8 text-center"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-violet-400/30 backdrop-blur">
          <Lock className="size-7 text-cyan-200" strokeWidth={2} />
        </div>

        <h1 className="mt-5 text-2xl font-black text-white">Parent Dashboard</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#b6d3f5]">
          {profile?.parentPin
            ? 'Enter your 4-digit PIN to view learning insights.'
            : 'No PIN set yet. Continue to open the dashboard.'}
        </p>

        {profile?.parentPin ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <motion.input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="----"
              className="aurora-input w-40 text-center text-2xl tracking-[0.5em] font-black"
              animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.35 }}
            />
            {failedAttempts > 0 && failedAttempts < 3 && (
              <p className="text-xs font-bold text-rose-300">
                Incorrect PIN. {3 - failedAttempts} attempt{3 - failedAttempts !== 1 ? 's' : ''} left.
              </p>
            )}
            {failedAttempts >= 3 && profile.parentPin && (
              <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-2">
                <p className="text-xs font-bold text-amber-200">
                  Hint: {profile.parentPin[0]} _ _ {profile.parentPin[3]}
                </p>
              </div>
            )}
            <motion.button
              onClick={handleSubmit}
              className="aurora-button-primary w-full max-w-[200px] py-3 text-sm font-black"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Unlock
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={onAuthenticate}
            className="aurora-button-primary mt-6 w-full max-w-[200px] py-3 text-sm font-black"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            View Dashboard
          </motion.button>
        )}

        <button
          onClick={onBack}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#9dc0e8] transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Back to App
        </button>
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/*  PIN Setter                                                           */
/* ────────────────────────────────────────────────────────────────────── */

function PinSetter({ onSet }: { onSet: (pin: string) => void }) {
  const [newPin, setNewPin] = useState('')
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        <Lock className="size-4 flex-shrink-0 text-[#accbed]" />
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
          placeholder="New 4-digit PIN"
          className="aurora-input max-w-[160px] text-center text-base tracking-[0.15em]"
        />
      </div>
      <button
        onClick={() => newPin.length === 4 && onSet(newPin)}
        disabled={newPin.length !== 4}
        className="aurora-button-primary px-5 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save PIN
      </button>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Main Dashboard                                                       */
/* ────────────────────────────────────────────────────────────────────── */

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [showSetPin, setShowSetPin] = useState(false)
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

  const handleSetPin = async (newPin: string) => {
    await db.userProfile.update('default', { parentPin: newPin })
    setShowSetPin(false)
  }

  /* ── PIN Gate ── */
  if (!authenticated) {
    return (
      <PinGate
        profile={profile}
        onAuthenticate={() => setAuthenticated(true)}
        onBack={() => navigate('/')}
      />
    )
  }

  /* ── Data derivations ── */
  const maxBar = Math.max(...(weeklyStats?.map((d) => d.total) ?? [1]))
  const weeklyTotal = weeklyStats?.reduce((s, d) => s + d.total, 0) ?? 0
  const weeklyCorrect = weeklyStats?.reduce((s, d) => s + d.correct, 0) ?? 0
  const weeklyAccuracy = weeklyTotal > 0 ? Math.round((weeklyCorrect / weeklyTotal) * 100) : 0
  const weeklyXP = weeklyStats?.reduce((s, d) => s + d.xp, 0) ?? 0

  /* Build insight cards */
  const insights: { icon: React.ElementType; accent: string; iconBg: string; title: string; body: string }[] = []

  if (!streak || streak.currentStreak === 0) {
    insights.push({ icon: Flame, accent: '#f97316', iconBg: 'rgba(249,115,22,0.12)', title: 'Build a Streak', body: 'Even 10 minutes a day compounding is what separates strong 11+ performers.' })
  } else {
    insights.push({ icon: Flame, accent: '#f97316', iconBg: 'rgba(249,115,22,0.12)', title: `${streak.currentStreak}-Day Streak`, body: `Longest streak: ${streak.longestStreak} days. Consistency is a superpower - keep it going!` })
  }

  if (topicAnalysis && topicAnalysis.length > 0 && topicAnalysis[0].accuracy < 0.5) {
    insights.push({ icon: Target, accent: '#ef4444', iconBg: 'rgba(239,68,68,0.1)', title: `Focus: ${TOPIC_LABELS[topicAnalysis[0].topic]}`, body: 'Accuracy is below 50%. A few focused sessions here will move the needle fast.' })
  } else if (weeklyAccuracy >= 70) {
    insights.push({ icon: TrendingUp, accent: '#10b981', iconBg: 'rgba(16,185,129,0.1)', title: 'Strong Week!', body: `${weeklyAccuracy}% accuracy across ${weeklyTotal} questions. Excellent momentum.` })
  }

  return (
    <div className="aurora-page mx-auto max-w-3xl pb-24">

      {/* ── Header ── */}
      <motion.header className="flex items-start justify-between gap-3" {...fadeUp}>
        <div>
          <h1 className="aurora-page-title">Parent Dashboard</h1>
          <p className="aurora-page-subtitle">
            Live snapshot of {profile?.name ? `${profile.name}'s` : "your child's"} progress.
          </p>
        </div>
        <motion.button
          onClick={() => setShowSetPin((p) => !p)}
          className="pd-pin-button flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Lock className="size-3.5" />
          {showSetPin ? 'Cancel' : profile?.parentPin ? 'Change PIN' : 'Set PIN'}
        </motion.button>
      </motion.header>

      {/* PIN setter */}
      <AnimatePresence>
        {showSetPin && (
          <motion.section
            className="aurora-card-soft mt-4 rounded-2xl p-4"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PinSetter onSet={handleSetPin} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Student Hero Card ── */}
      <motion.section
        className="pd-hero mt-5 overflow-hidden rounded-3xl p-5 md:p-7"
        {...fadeUp}
        transition={{ delay: 0.04 }}
      >
        <div className="flex items-center gap-4">
          <div className="pd-hero-avatar grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl text-2xl font-black">
            {xpState?.currentLevel ?? 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="pd-hero-name text-xl font-black">{profile?.name ?? 'Student'}</p>
            <p className="pd-hero-sub mt-0.5 text-sm font-semibold">
              {getLevelTitle(xpState?.currentLevel ?? 1)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="pd-hero-xp-pill inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold">
              <Zap className="size-3" />
              {xpState?.totalXP ?? 0} XP
            </span>
            {xpState && (
              <span className="pd-hero-next text-[10px] font-semibold">
                {xpState.xpInCurrentLevel}/{xpState.xpForNextLevel} to Lvl {(xpState.currentLevel ?? 1) + 1}
              </span>
            )}
          </div>
        </div>

        {/* XP progress bar */}
        {xpState && (
          <div className="mt-4">
            <div className="pd-hero-track h-2 w-full overflow-hidden rounded-full">
              <motion.div
                className="pd-hero-fill h-full rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((xpState.xpInCurrentLevel / xpState.xpForNextLevel) * 100, 100)}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </motion.section>

      {/* ── Summary Stats Row ── */}
      <motion.div
        className="mt-5 grid grid-cols-4 gap-2 sm:gap-3"
        {...fadeUp}
        transition={{ delay: 0.08 }}
      >
        <StatTile
          icon={<Flame className="size-5 text-orange-400" />}
          value={streak?.currentStreak ?? 0}
          label="Streak"
          accentBg="rgba(249,115,22,0.12)"
        />
        <StatTile
          icon={<Star className="size-5 text-amber-400" />}
          value={streak?.longestStreak ?? 0}
          label="Best"
          accentBg="rgba(245,158,11,0.12)"
        />
        <StatTile
          icon={<BookOpen className="size-5 text-cyan-400" />}
          value={weeklyTotal}
          label="This week"
          accentBg="rgba(34,211,238,0.12)"
        />
        <StatTile
          icon={<Sparkles className="size-5 text-violet-400" />}
          value={weeklyXP}
          label="XP earned"
          accentBg="rgba(139,92,246,0.12)"
        />
      </motion.div>

      {/* ── Weekly Activity Chart ── */}
      <motion.section
        className="aurora-card-soft mt-5 p-5 md:p-6"
        {...fadeUp}
        transition={{ delay: 0.12 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 pd-section-icon" />
            <h2 className="pd-section-title text-base font-extrabold">Weekly Activity</h2>
          </div>
          <div className="flex gap-3 text-xs font-semibold pd-section-meta">
            <span>{weeklyTotal} questions</span>
            <span>{weeklyTotal > 0 ? `${weeklyAccuracy}% accuracy` : '-'}</span>
          </div>
        </div>

        <div className="mt-5 flex h-32 items-end gap-2">
          {weeklyStats?.map((day, i) => {
            const barH = maxBar > 0 ? (day.total / maxBar) * 100 : 0
            const isToday = i === (weeklyStats?.length ?? 0) - 1
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="pd-bar-count text-[10px] font-bold">{day.total || ''}</span>
                <div className="pd-bar-track relative h-full w-full rounded-lg">
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 rounded-lg ${isToday ? 'pd-bar-fill-today' : 'pd-bar-fill'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(barH, 4)}%` }}
                    transition={{ duration: 0.5, delay: 0.05 * i }}
                  />
                </div>
                <span className={`text-[10px] font-semibold ${isToday ? 'pd-day-today' : 'pd-day-label'}`}>
                  {day.date}
                </span>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* ── Two-Column: Focus Areas + Insights ── */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">

        {/* Focus Areas */}
        <motion.section
          className="aurora-card-soft p-5"
          {...fadeUp}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-center gap-2">
            <Target className="size-4 pd-section-icon" />
            <h2 className="pd-section-title text-base font-extrabold">Focus Areas</h2>
          </div>
          <p className="mt-1 text-xs font-semibold pd-section-meta">Lowest accuracy topics</p>

          {topicAnalysis && topicAnalysis.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {topicAnalysis.slice(0, 3).map((topic) => {
                const pct = Math.round(topic.accuracy * 100)
                return (
                  <div
                    key={`${topic.subject}:${topic.topic}`}
                    className="aurora-subtle flex items-center gap-3 rounded-xl px-3 py-3"
                  >
                    <span className="pd-topic-icon grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-sm">
                      {SUBJECT_CONFIG[topic.subject as Subject].icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="pd-topic-name block truncate text-sm font-bold">
                        {TOPIC_LABELS[topic.topic]}
                      </span>
                      <span className="pd-topic-subject text-[10px] font-semibold">
                        {SUBJECT_CONFIG[topic.subject as Subject].label}
                      </span>
                    </div>
                    <AccuracyPill pct={pct} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="aurora-subtle mt-4 flex flex-col items-center gap-2 rounded-xl px-4 py-6 text-center">
              <BookOpen className="size-5 opacity-40 pd-section-meta" />
              <p className="text-sm font-bold pd-section-title">No data yet</p>
              <p className="text-xs pd-section-meta">Complete a few sessions to unlock topic insights.</p>
            </div>
          )}
        </motion.section>

        {/* Insights */}
        <motion.section
          className="flex flex-col gap-3"
          {...fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 px-0.5">
            <Sparkles className="size-4 pd-section-icon" />
            <h2 className="pd-section-title text-base font-extrabold">Insights</h2>
          </div>

          {insights.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="aurora-card-soft flex items-start gap-4 rounded-2xl p-4">
                <div
                  className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: item.iconBg }}
                >
                  <Icon className="size-5" style={{ color: item.accent }} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="pd-insight-title text-sm font-extrabold">{item.title}</p>
                  <p className="pd-insight-body mt-1 text-xs leading-relaxed">{item.body}</p>
                </div>
              </div>
            )
          })}

          {/* Fill empty space if only 1 insight */}
          {insights.length < 2 && (
            <div className="aurora-card-soft flex items-start gap-4 rounded-2xl p-4">
              <div className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                <BookOpen className="size-5 text-cyan-400" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="pd-insight-title text-sm font-extrabold">Keep Practising</p>
                <p className="pd-insight-body mt-1 text-xs leading-relaxed">
                  More practice sessions will unlock deeper insights and personalised recommendations.
                </p>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Help us Improve Mannah ── */}
      <motion.section
        className="parent-support-banner mt-5 overflow-hidden rounded-2xl"
        {...fadeUp}
        transition={{ delay: 0.26 }}
        style={{ background: 'linear-gradient(135deg, #1e1880 0%, #3730a3 50%, #5b4cff 100%)' }}
      >
        <button
          onClick={() => setSupportOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <Heart className="size-5 text-rose-300" strokeWidth={2} />
            <div>
              <p className="text-sm font-extrabold text-white">Help us Improve Mannah</p>
              <p className="text-xs text-white/60">Share ideas, report bugs, help us build</p>
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
                  href="https://github.com/abiodun-ayodeji/Mannah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 transition-colors hover:bg-white/20"
                >
                  <Star className="size-5 text-amber-300" />
                  <div>
                    <p className="text-sm font-extrabold text-white">Contribute on GitHub</p>
                    <p className="text-xs text-white/60">Report bugs, suggest features, or contribute code</p>
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
                    <p className="text-sm font-extrabold text-white">Send Feedback</p>
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
