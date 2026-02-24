import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'framer-motion'
import { db } from '../db/database'
import { Subject, SUBJECT_CONFIG } from '../types/subject'
import { useXP } from '../hooks/useXP'
import { useStreak } from '../hooks/useStreak'
import { useWeeklyStats } from '../hooks/useWeeklyStats'
import { getLevelTitle } from '../types/gamification'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

const SUBJECT_COLORS: Record<Subject, string> = {
  [Subject.MATHS]: '#2a4fc7',
  [Subject.ENGLISH]: '#0a6649',
  [Subject.VERBAL_REASONING]: '#8b1c68',
  [Subject.NON_VERBAL_REASONING]: '#8a5007',
}

/* ── Stat Tile ─────────────────────────────────────────────── */
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
    <div className="pg-stat-tile flex flex-col items-center gap-2 rounded-2xl p-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: accentBg }}
      >
        {icon}
      </span>
      <span className="pg-stat-value text-xl font-black leading-none">{value}</span>
      <span className="pg-stat-label text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}

/* ── Accuracy Pill ─────────────────────────────────────────── */
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

/* ── Main Progress Page ────────────────────────────────────── */
export default function Progress() {
  const { xpState } = useXP()
  const streak = useStreak()
  const weekly = useWeeklyStats()

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

  const accuracy =
    stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0

  return (
    <div className="aurora-page mx-auto max-w-3xl pb-24">

      {/* ── Header ── */}
      <motion.header {...fadeUp}>
        <span className="aurora-kicker">Insight Deck</span>
        <h1 className="aurora-page-title mt-3">Your Progress</h1>
        <p className="aurora-page-subtitle">A live view of growth, consistency, and mastery.</p>
      </motion.header>

      {/* ── Hero: Level + XP ── */}
      <motion.section
        className="pg-hero mt-5 overflow-hidden rounded-3xl p-5 md:p-7"
        {...fadeUp}
        transition={{ delay: 0.04 }}
      >
        <div className="flex items-center gap-4">
          <div className="pg-hero-avatar grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl text-2xl font-black">
            {xpState?.currentLevel ?? 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="pg-hero-name text-xl font-black">
              {xpState ? getLevelTitle(xpState.currentLevel) : 'Apprentice'}
            </p>
            <p className="pg-hero-sub mt-0.5 text-sm font-semibold">
              Level {xpState?.currentLevel ?? 1}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="pg-hero-xp-pill inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold">
              <Zap className="size-3" />
              {xpState?.totalXP ?? 0} XP
            </span>
          </div>
        </div>

        {/* XP progress bar */}
        {xpState && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-semibold pg-hero-next mb-1.5">
              <span>Level {xpState.currentLevel}</span>
              <span>{xpState.xpInCurrentLevel}/{xpState.xpForNextLevel} XP</span>
              <span>Level {xpState.currentLevel + 1}</span>
            </div>
            <div className="pg-hero-track h-2.5 w-full overflow-hidden rounded-full">
              <motion.div
                className="pg-hero-fill h-full rounded-full"
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

      {/* ── Summary Stats ── */}
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
          value={stats?.total ?? 0}
          label="Questions"
          accentBg="rgba(34,211,238,0.12)"
        />
        <StatTile
          icon={<Target className="size-5 text-violet-400" />}
          value={accuracy > 0 ? `${accuracy}%` : '-'}
          label="Accuracy"
          accentBg="rgba(139,92,246,0.12)"
        />
      </motion.div>

      {/* ── Two columns: Overall + Weekly ── */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">

        {/* Overall Stats */}
        <motion.section
          className="aurora-card-soft p-5"
          {...fadeUp}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 pg-section-icon" />
            <h2 className="pg-section-title text-base font-extrabold">All-Time Stats</h2>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black">{stats?.total ?? 0}</span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">Attempted</span>
            </div>
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black" style={{ color: 'rgb(110, 231, 183)' }}>{stats?.correct ?? 0}</span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">Correct</span>
            </div>
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black" style={{ color: 'rgb(196, 181, 253)' }}>
                {accuracy > 0 ? `${accuracy}%` : '-'}
              </span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">Accuracy</span>
            </div>
          </div>
        </motion.section>

        {/* This Week */}
        <motion.section
          className="aurora-card-soft p-5"
          {...fadeUp}
          transition={{ delay: 0.16 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 pg-section-icon" />
            <h2 className="pg-section-title text-base font-extrabold">This Week</h2>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black">{weekly?.totalQuestions ?? 0}</span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">Questions</span>
            </div>
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black" style={{ color: 'rgb(110, 231, 183)' }}>{weekly?.avgAccuracy ?? 0}%</span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">Accuracy</span>
            </div>
            <div className="pg-mini-stat flex flex-col items-center rounded-xl p-3">
              <span className="pg-mini-value text-2xl font-black" style={{ color: 'rgb(103, 232, 249)' }}>{weekly?.totalXP ?? 0}</span>
              <span className="pg-mini-label text-[10px] font-bold uppercase tracking-wide">XP Earned</span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Subject Breakdown ── */}
      <motion.section
        className="mt-5 aurora-card-soft p-5 md:p-6"
        {...fadeUp}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 pg-section-icon" />
          <h2 className="pg-section-title text-base font-extrabold">By Subject</h2>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {Object.values(Subject).map((sub, idx) => {
            const s = stats?.bySubject[sub]
            const pct = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
            const config = SUBJECT_CONFIG[sub]
            const color = SUBJECT_COLORS[sub]

            return (
              <motion.div
                key={sub}
                className="aurora-subtle rounded-xl p-4"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 + idx * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <span className="pg-subject-icon grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-lg">
                    {config.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="pg-subject-name truncate text-sm font-extrabold">{config.label}</p>
                      <AccuracyPill pct={pct} />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="pg-bar-track h-2 flex-1 overflow-hidden rounded-full">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + idx * 0.05 }}
                        />
                      </div>
                      <span className="pg-subject-count flex-shrink-0 text-xs font-semibold">
                        {s ? `${s.correct}/${s.total}` : '0/0'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty state */}
        {stats && stats.total === 0 && (
          <div className="aurora-subtle mt-4 flex flex-col items-center gap-2 rounded-xl px-4 py-8 text-center">
            <BookOpen className="size-6 opacity-40 pg-section-icon" />
            <p className="text-sm font-bold pg-section-title">No attempts yet</p>
            <p className="text-xs pg-section-meta">Complete some quizzes to see your breakdown here.</p>
          </div>
        )}
      </motion.section>
    </div>
  )
}
