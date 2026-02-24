import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Award, BookOpen, ChevronRight, Flame, Swords,
  Target, TrendingUp, Zap,
} from 'lucide-react'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useUserProfile } from '../hooks/useUserProfile'
import { useStreak } from '../hooks/useStreak'
import { useXP } from '../hooks/useXP'
import { useWeeklyStats } from '../hooks/useWeeklyStats'
import { getTopicStats, getDifficultyForAccuracy } from '../utils/practice-recommendations'
import { db } from '../db/database'

const subjects = Object.values(Subject)

const SUBJECT_CARD_STYLES: Record<Subject, { bg: string; text: string; ring: string }> = {
  [Subject.MATHS]: { bg: '#c4d4ff', text: '#2a4fc7', ring: '#2a4fc7' },
  [Subject.ENGLISH]: { bg: '#b0e8ca', text: '#0a6649', ring: '#0a6649' },
  [Subject.VERBAL_REASONING]: { bg: '#f5bede', text: '#8b1c68', ring: '#8b1c68' },
  [Subject.NON_VERBAL_REASONING]: { bg: '#fce29a', text: '#8a5007', ring: '#8a5007' },
}

const SCORE_CAP = 50

function toQuizLink(subject: Subject, difficulty: number, topic?: string) {
  const params = new URLSearchParams({ subject, count: '10', difficulty: String(difficulty) })
  if (topic) params.set('topic', topic)
  return `/quiz?${params.toString()}`
}

/* ── Stat Chip ─────────────────────────────────────────────── */
function StatChip({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
}) {
  return (
    <div className="home-stat-chip flex items-center gap-2 rounded-xl px-3 py-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `${color}20` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="home-stat-value text-sm font-black leading-tight">{value}</p>
        <p className="home-stat-label text-[11px] font-semibold leading-tight">{label}</p>
      </div>
    </div>
  )
}

/* ── Subject Card with Progress ────────────────────────────── */
function SubjectCard({
  subject,
  score,
  index,
}: {
  subject: Subject
  score: number
  index: number
}) {
  const navigate = useNavigate()
  const config = SUBJECT_CONFIG[subject]
  const style = SUBJECT_CARD_STYLES[subject]
  const progress = Math.min(score / SCORE_CAP, 1)

  return (
    <motion.button
      onClick={() => navigate(`/subject/${subject}`)}
      className="home-subject-card flex flex-col items-start gap-3 rounded-2xl p-4 text-left"
      style={{ '--subject-bg': style.bg, '--subject-text': style.text } as React.CSSProperties}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
    >
      <div className="flex w-full items-start justify-between">
        <span className="home-subject-icon flex h-12 w-12 items-center justify-center rounded-xl text-2xl">
          {config.icon}
        </span>
        <ChevronRight className="mt-1 size-4 flex-shrink-0 opacity-50" style={{ color: style.text }} />
      </div>
      <div className="w-full">
        <p className="home-subject-name text-sm font-extrabold" style={{ color: style.text }}>
          {config.label}
        </p>
        <p className="home-subject-topics mt-0.5 text-xs">{config.topics.length} topics</p>
      </div>
      {/* Mini progress bar */}
      <div className="w-full">
        <div className="home-progress-track h-1.5 w-full overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full"
            style={{ background: style.ring }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          />
        </div>
        <p className="home-progress-label mt-1 text-[10px] font-bold">
          {score}/{SCORE_CAP} correct
        </p>
      </div>
    </motion.button>
  )
}

/* ── Weekly Progress Card ──────────────────────────────────── */
function WeeklyProgressCard() {
  const weekly = useWeeklyStats()

  return (
    <motion.div
      className="home-panel rounded-2xl p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="size-4 text-[#5b4cff]" />
        <h2 className="home-section-title text-sm font-black">This Week</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="home-weekly-stat flex flex-col items-center rounded-xl p-3">
          <span className="home-weekly-value text-lg font-black">{weekly?.totalQuestions ?? 0}</span>
          <span className="home-weekly-label text-[10px] font-bold uppercase tracking-wide">Questions</span>
        </div>
        <div className="home-weekly-stat flex flex-col items-center rounded-xl p-3">
          <span className="home-weekly-value text-lg font-black">{weekly?.avgAccuracy ?? 0}%</span>
          <span className="home-weekly-label text-[10px] font-bold uppercase tracking-wide">Accuracy</span>
        </div>
        <div className="home-weekly-stat flex flex-col items-center rounded-xl p-3">
          <span className="home-weekly-value text-lg font-black">{weekly?.totalXP ?? 0}</span>
          <span className="home-weekly-label text-[10px] font-bold uppercase tracking-wide">XP Earned</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main Home Page ────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const streak = useStreak()
  const { xpState } = useXP()
  const weekly = useWeeklyStats()

  const recommendations = useLiveQuery(async () => {
    const stats = await getTopicStats(3)
    if (stats.length === 0) return null
    return stats.slice(0, 3).map((item) => ({
      topic: item.topic,
      subject: item.subject,
      accuracy: Math.round(item.accuracy * 100),
      difficulty: getDifficultyForAccuracy(item.accuracy),
      label: TOPIC_LABELS[item.topic] ?? item.topic,
    }))
  }, [])

  const subjectScores = useLiveQuery(async () => {
    const scores: Record<string, number> = {}
    for (const subject of subjects) {
      const correct = await db.attempts
        .where('subject').equals(subject)
        .filter((a) => (a as { isCorrect: boolean }).isCorrect)
        .count()
      scores[subject] = Math.min(correct, SCORE_CAP)
    }
    return scores
  }, [])

  const primaryRecommendation = recommendations?.[0] ?? null

  const fallbackQuickStart = useMemo(() => {
    const options = [Subject.MATHS, Subject.ENGLISH, Subject.VERBAL_REASONING, Subject.NON_VERBAL_REASONING]
    return options[new Date().getDate() % options.length]
  }, [])

  const startPrimaryFlow = () => {
    if (primaryRecommendation) {
      track('quick_play', { smart: true, subject: primaryRecommendation.subject, topic: primaryRecommendation.topic, difficulty: primaryRecommendation.difficulty, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
      navigate(toQuizLink(primaryRecommendation.subject, primaryRecommendation.difficulty, primaryRecommendation.topic))
      return
    }
    track('quick_play', { smart: false, subject: fallbackQuickStart, difficulty: 2, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
    navigate(toQuizLink(fallbackQuickStart, 2))
  }

  const startDailyChallenges = () => navigate('/daily-challenges')

  return (
    <div className="grid gap-5 pb-8 lg:grid-cols-[1fr_340px]">

      {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Greeting + Stat Chips */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="home-section-title text-2xl font-black md:text-3xl">
            Welcome back, {profile?.name ?? 'Student'}
          </h1>
          <p className="home-section-label mt-1 text-sm font-medium">
            Keep your streak alive and improve your weakest topic.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatChip
              icon={<Flame className="size-4" style={{ color: '#F59E0B' }} />}
              value={streak?.currentStreak ?? 0}
              label="Day streak"
              color="#F59E0B"
            />
            <StatChip
              icon={<Zap className="size-4" style={{ color: '#5b4cff' }} />}
              value={xpState?.totalXP ?? 0}
              label="Total XP"
              color="#5b4cff"
            />
            <StatChip
              icon={<BookOpen className="size-4" style={{ color: '#10B981' }} />}
              value={weekly?.totalQuestions ?? 0}
              label="This week"
              color="#10B981"
            />
          </div>
        </motion.section>

        {/* Quick Action Buttons */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
        >
          <motion.button
            onClick={startPrimaryFlow}
            className="home-cta-primary inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap className="size-5" />
            {primaryRecommendation ? `Practice ${primaryRecommendation.label}` : 'Start Smart Practice'}
          </motion.button>

          <motion.button
            onClick={startDailyChallenges}
            className="home-cta-secondary inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Target className="size-5" />
            Daily Challenges
          </motion.button>
        </motion.div>

        {/* Recommendation Nudge */}
        {primaryRecommendation && (
          <motion.div
            className="home-nudge flex items-center gap-2 rounded-xl px-4 py-2.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <TrendingUp className="size-4 flex-shrink-0 text-[#F59E0B]" />
            <p className="home-nudge-text text-xs font-semibold">
              Suggested: <span className="font-bold">{primaryRecommendation.label}</span> ({primaryRecommendation.accuracy}% accuracy) - keep practising to improve!
            </p>
          </motion.div>
        )}

        {/* Subject Grid (2x2) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="home-section-title text-base font-black">Choose a Subject</h2>
            <span className="home-section-label text-xs font-semibold uppercase tracking-widest">
              {subjects.length} Realms
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject}
                subject={subject}
                score={subjectScores?.[subject] ?? 0}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* Empty state (mobile only) */}
        {recommendations === null && (
          <motion.div
            className="home-empty-card rounded-2xl p-5 text-center lg:hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="mx-auto size-5 opacity-40" />
            <p className="mt-2 text-sm font-bold home-section-title">No recommendations yet.</p>
            <p className="mt-1 text-xs home-section-label">Complete a few quizzes and we&apos;ll suggest the next best topic.</p>
          </motion.div>
        )}
      </div>

      {/* ── RIGHT COLUMN (desktop) / below content (mobile) ──────── */}
      <div className="flex flex-col gap-5">

        {/* Weekly Progress */}
        <WeeklyProgressCard />

        {/* Activities */}
        <div className="flex flex-col gap-3">
          <h2 className="home-section-title text-sm font-black px-0.5">Activities</h2>
          {[
            {
              label: 'Daily Challenges',
              description: 'Fresh goals to keep your streak going',
              icon: Target,
              to: '/daily-challenges',
              accent: '#F59E0B',
              iconBg: 'rgba(245,158,11,0.12)',
            },
            {
              label: 'Boss Battles',
              description: 'Defeat bosses and earn bonus XP',
              icon: Swords,
              to: '/bosses',
              accent: '#EF4444',
              iconBg: 'rgba(239,68,68,0.1)',
            },
            {
              label: 'Achievements',
              description: 'Milestones you\'ve earned so far',
              icon: Award,
              to: '/achievements',
              accent: '#5b4cff',
              iconBg: 'rgba(91,76,255,0.1)',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="activity-card flex items-center gap-4 rounded-2xl p-4 text-left"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + 0.05 * i }}
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: item.iconBg }}
                >
                  <Icon className="size-5" style={{ color: item.accent }} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="activity-title text-sm font-extrabold">{item.label}</p>
                  <p className="activity-desc mt-0.5 text-xs leading-relaxed">{item.description}</p>
                </div>
                <ChevronRight className="activity-chevron size-4 flex-shrink-0" style={{ color: item.accent }} />
              </motion.button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
