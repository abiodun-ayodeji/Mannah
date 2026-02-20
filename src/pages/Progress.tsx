import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { db } from '../db/database'
import { Subject, SUBJECT_CONFIG } from '../types/subject'
import { useXP } from '../hooks/useXP'
import { useStreak } from '../hooks/useStreak'
import { getLevelTitle } from '../types/gamification'
import XPBar from '../components/gamification/XPBar'
import StreakDisplay from '../components/gamification/StreakDisplay'

export default function Progress() {
  const { xpState } = useXP()
  const streak = useStreak()

  const stats = useLiveQuery(async () => {
    const all = await db.attempts.toArray()
    const total = all.length
    const correct = all.filter((a) => a.isCorrect).length

    const bySubject: Record<string, { total: number; correct: number }> = {}
    for (const a of all) {
      if (!bySubject[a.subject]) bySubject[a.subject] = { total: 0, correct: 0 }
      bySubject[a.subject].total++
      if (a.isCorrect) bySubject[a.subject].correct++
    }

    return { total, correct, bySubject }
  }, [])

  return (
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-8">
      <header className="mt-1">
        <span className="aurora-kicker">Insight Deck</span>
        <h1 className="aurora-page-title mt-3">Your Progress</h1>
        <p className="aurora-page-subtitle">A live view of growth, consistency, and mastery.</p>
      </header>

      <motion.section
        className="aurora-card p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4 md:min-w-[280px]">
            <div className="grid size-16 place-items-center rounded-2xl border border-cyan-200/45 bg-gradient-to-br from-cyan-300/70 to-violet-300/70 text-2xl font-black text-[#08233f] shadow-[0_10px_24px_rgba(100,198,255,0.3)]">
              {xpState?.currentLevel ?? 1}
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">
                {xpState ? getLevelTitle(xpState.currentLevel) : 'Apprentice'}
              </p>
              <p className="text-sm font-semibold text-[#a7c6e8]">
                {xpState?.totalXP ?? 0} total XP
              </p>
            </div>
          </div>

          <div className="flex-1">
            <XPBar
              current={xpState?.xpInCurrentLevel ?? 0}
              max={xpState?.xpForNextLevel ?? 100}
              height={10}
              showLabel
            />
          </div>
        </div>

        {streak && (
          <div className="mt-5">
            <StreakDisplay streak={streak.currentStreak} showBig />
          </div>
        )}
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <h2 className="text-lg font-extrabold text-white">Overall Stats</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="aurora-subtle rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-cyan-100">{stats?.total ?? 0}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8c6e9]">
              Questions
            </p>
          </div>
          <div className="aurora-subtle rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-200">{stats?.correct ?? 0}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8c6e9]">
              Correct
            </p>
          </div>
          <div className="aurora-subtle rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-violet-200">
              {stats && stats.total > 0
                ? `${Math.round((stats.correct / stats.total) * 100)}%`
                : '—'}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8c6e9]">
              Accuracy
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <h2 className="text-lg font-extrabold text-white">By Subject</h2>
        <div className="mt-4 flex flex-col gap-3">
          {Object.values(Subject).map((sub, idx) => {
            const s = stats?.bySubject[sub]
            const pct = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
            const config = SUBJECT_CONFIG[sub]
            return (
              <motion.div
                key={sub}
                className="aurora-subtle rounded-xl p-3.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-xl">
                    {config.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-[#ecf8ff]">{config.label}</p>
                    <p className="text-xs font-semibold text-[#a7c6e8]">
                      {s ? `${s.correct}/${s.total}` : '—'} solved
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#cde4ff]">{pct}%</span>
                </div>
                <div className="aurora-progress-track h-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 shimmer-bar"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${config.color}, #8be1ff)` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>
    </div>
  )
}
