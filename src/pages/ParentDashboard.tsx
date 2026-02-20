import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { format, subDays, startOfDay } from 'date-fns'
import { useXP } from '../hooks/useXP'
import { useStreak } from '../hooks/useStreak'
import { getLevelTitle } from '../types/gamification'
import { getTopicStats } from '../utils/practice-recommendations'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [showSetPin, setShowSetPin] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
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
    if (!profile?.parentPin) {
      setAuthenticated(true)
      return
    }
    if (pin === profile.parentPin) {
      setFailedAttempts(0)
      setAuthenticated(true)
      return
    }
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
            {profile?.parentPin
              ? 'Enter your 4-digit PIN to view learning insights.'
              : 'No PIN set yet. Continue to open the dashboard.'}
          </p>

          {profile?.parentPin ? (
            <div className="mt-6 space-y-4">
              <motion.input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                placeholder="• • • •"
                className="aurora-input mx-auto w-44 text-center text-2xl tracking-[0.5em] font-black"
                animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.35 }}
              />

              {failedAttempts > 0 && failedAttempts < 3 && (
                <p className="text-xs font-bold text-rose-200">
                  Incorrect PIN. {3 - failedAttempts} attempt{3 - failedAttempts !== 1 ? 's' : ''}{' '}
                  left before hint.
                </p>
              )}

              {failedAttempts >= 3 && profile.parentPin && (
                <div className="rounded-xl border border-amber-200/35 bg-amber-200/10 px-3 py-2.5">
                  <p className="text-xs font-bold text-amber-100">
                    Hint: {profile.parentPin[0]} _ _ {profile.parentPin[3]}
                  </p>
                </div>
              )}

              <motion.button
                onClick={handlePinSubmit}
                className="aurora-button-primary px-10 py-3 text-sm font-black"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Enter
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => setAuthenticated(true)}
              className="aurora-button-primary mt-6 px-10 py-3 text-sm font-black"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View Dashboard
            </motion.button>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-sm font-semibold text-[#9dc0e8] transition-colors hover:text-[#d5ebff]"
          >
            Back to App
          </button>
        </motion.div>
      </div>
    )
  }

  const maxWeeklyQuestions = Math.max(...(weeklyStats?.map((day) => day.total) ?? [1]))
  const weeklyTotal = weeklyStats?.reduce((sum, day) => sum + day.total, 0) ?? 0
  const weeklyCorrect = weeklyStats?.reduce((sum, day) => sum + day.correct, 0) ?? 0
  const weeklyAccuracy = weeklyTotal > 0 ? Math.round((weeklyCorrect / weeklyTotal) * 100) : 0

  return (
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-24">
      <header className="mt-1">
        <h1 className="aurora-page-title">Parent Dashboard</h1>
        <p className="aurora-page-subtitle">
          Snapshot of streaks, topic confidence, and study momentum.
        </p>
      </header>

      <motion.section
        className="aurora-card-soft flex flex-wrap items-center justify-between gap-3 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="text-sm font-black text-white">Parent PIN</p>
          <p className="text-xs font-semibold text-[#aac9ea]">
            {profile?.parentPin ? 'PIN is set for dashboard access.' : 'No PIN set yet.'}
          </p>
        </div>
        <motion.button
          onClick={() => setShowSetPin((prev) => !prev)}
          className="aurora-button-primary px-4 py-2 text-sm font-black"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {showSetPin ? 'Cancel PIN' : 'Set/Update PIN'}
        </motion.button>
      </motion.section>

      {showSetPin && (
        <motion.section
          className="aurora-card-soft p-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PinSetter onSet={handleSetPin} />
        </motion.section>
      )}

      <motion.section
        className="aurora-card p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl border border-cyan-200/45 bg-gradient-to-br from-cyan-300/70 to-violet-300/70 text-2xl font-black text-[#08233f]">
            {xpState?.currentLevel ?? 1}
          </div>
          <div className="min-w-[210px] flex-1">
            <p className="text-xl font-black text-white">{profile?.name ?? 'Student'}</p>
            <p className="mt-0.5 text-sm font-semibold text-[#b4d1f2]">
              {getLevelTitle(xpState?.currentLevel ?? 1)} · {xpState?.totalXP ?? 0} XP
            </p>
            <p className="mt-1 text-sm font-semibold text-[#b4d1f2]">
              🔥 {streak?.currentStreak ?? 0} day streak · best {streak?.longestStreak ?? 0}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <h2 className="text-lg font-extrabold text-white">Weekly Activity</h2>
        <div className="mt-4 flex h-36 items-end gap-2">
          {weeklyStats?.map((day) => {
            const barHeight = maxWeeklyQuestions > 0 ? (day.total / maxWeeklyQuestions) * 100 : 0
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-cyan-100">{day.total}</span>
                <div className="aurora-progress-track relative h-full min-h-3 w-full rounded-xl">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-xl bg-gradient-to-t from-[#77d8ff] to-[#8f8bff] transition-all duration-500"
                    style={{ height: `${Math.max(barHeight, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#a5c4e7]">{day.date}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#accbed]">
          <span>Total: {weeklyTotal} questions</span>
          <span>Accuracy: {weeklyTotal > 0 ? `${weeklyAccuracy}%` : '—'}</span>
        </div>
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <h2 className="text-lg font-extrabold text-white">Focus Areas</h2>
        <p className="mt-1 text-xs font-semibold text-[#a8c7ea]">
          Topics with the lowest current accuracy.
        </p>

        {topicAnalysis && topicAnalysis.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2.5">
            {topicAnalysis.slice(0, 3).map((topic) => {
              const pct = Math.round(topic.accuracy * 100)
              const tone =
                pct < 50
                  ? 'linear-gradient(90deg, #fb7185, #ef4444)'
                  : pct < 70
                    ? 'linear-gradient(90deg, #fbbf24, #f97316)'
                    : 'linear-gradient(90deg, #34d399, #10b981)'
              return (
                <div
                  key={`${topic.subject}:${topic.topic}`}
                  className="aurora-subtle flex items-center gap-3 rounded-xl px-3 py-3"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/20 bg-white/10 text-base">
                    {SUBJECT_CONFIG[topic.subject as Subject].icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#ecf8ff]">
                    {TOPIC_LABELS[topic.topic]}
                  </span>
                  <div className="aurora-progress-track h-2 w-20">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
                  </div>
                  <span className="w-10 text-right text-xs font-black text-[#cde4ff]">{pct}%</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl aurora-subtle px-4 py-3 text-sm font-semibold text-[#b1cfee]">
            Not enough data yet. Complete a few practice sessions first.
          </p>
        )}
      </motion.section>

      <motion.section
        className="aurora-card p-5 text-center md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
      >
        <h3 className="text-base font-black text-white md:text-lg">Help Keep Mannah Free</h3>
        <p className="mt-2 text-sm font-semibold text-[#bed8f5]">
          Your support keeps Mannah ad-free and free for every family.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <a
            href="https://buy.stripe.com/bJe28r8bZe254a8e4Pdby00"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black"
          >
            ☕ Support Mannah
          </a>
          <a
            href="https://forms.gle/DF7jd8XH2DewR2NT8"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-button-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
          >
            Give Feedback
          </a>
        </div>
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-extrabold text-white">Recommendations</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-[#c7def7]">
          {(!streak || streak.currentStreak === 0) && (
            <p>• Build consistency with a short daily session, even just 10 minutes.</p>
          )}
          {topicAnalysis && topicAnalysis.length > 0 && topicAnalysis[0].accuracy < 0.5 && (
            <p>
              • Prioritise <span className="font-black text-white">{TOPIC_LABELS[topicAnalysis[0].topic]}</span>{' '}
              next, current accuracy is below 50%.
            </p>
          )}
          <p>• Aim for 20+ questions per day spread across at least two subjects.</p>
          <p>• Use boss battles weekly to practice under pressure and gain bonus XP.</p>
        </div>
      </motion.section>
    </div>
  )
}

function PinSetter({ onSet }: { onSet: (pin: string) => void }) {
  const [newPin, setNewPin] = useState('')

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={newPin}
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
