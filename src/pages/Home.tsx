import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useLiveQuery } from 'dexie-react-hooks'
import { Award, BookOpen, ChevronRight, Swords, Target, Zap } from 'lucide-react'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useUserProfile } from '../hooks/useUserProfile'
import { getTopicStats, getDifficultyForAccuracy } from '../utils/practice-recommendations'
import { db } from '../db/database'

const subjects = Object.values(Subject)

const SUBJECT_CARD_STYLES: Record<Subject, { bg: string; text: string; ring: string }> = {
  [Subject.MATHS]: { bg: '#c4d4ff', text: '#2a4fc7', ring: '#2a4fc7' },
  [Subject.ENGLISH]: { bg: '#b0e8ca', text: '#0a6649', ring: '#0a6649' },
  [Subject.VERBAL_REASONING]: { bg: '#f5bede', text: '#8b1c68', ring: '#8b1c68' },
  [Subject.NON_VERBAL_REASONING]: { bg: '#fce29a', text: '#8a5007', ring: '#8a5007' },
}

// Dark mode: indigo-tinted gradients for subject cards
const SUBJECT_DARK_GRADIENTS: Record<Subject, string> = {
  [Subject.MATHS]: 'from-[#365fdc]/65 to-[#23367e]/65',
  [Subject.ENGLISH]: 'from-[#0c8f79]/65 to-[#124f57]/65',
  [Subject.VERBAL_REASONING]: 'from-[#b4408b]/65 to-[#5e2852]/65',
  [Subject.NON_VERBAL_REASONING]: 'from-[#c17a24]/65 to-[#664218]/65',
}

const SCORE_CAP = 50

function toQuizLink(subject: Subject, difficulty: number, topic?: string) {
  const params = new URLSearchParams({ subject, count: '10', difficulty: String(difficulty) })
  if (topic) params.set('topic', topic)
  return `/quiz?${params.toString()}`
}

// SVG circular progress badge
function SubjectBadge({ subject, score }: { subject: Subject; score: number }) {
  const config = SUBJECT_CONFIG[subject]
  const style = SUBJECT_CARD_STYLES[subject]
  const radius = 26
  const stroke = 4
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.min(score / SCORE_CAP, 1))

  return (
    <div className="home-badge-cell flex flex-col items-center gap-1.5 rounded-2xl p-3">
      <div className="relative flex items-center justify-center">
        <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={32} cy={32} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="home-badge-track" />
          {score > 0 && (
            <circle
              cx={32} cy={32} r={radius} fill="none"
              stroke={style.ring} strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>
        <div
          className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        >
          {config.icon}
        </div>
      </div>
      <span className="home-badge-label text-xs font-bold">{config.label.split(' ')[0]}</span>
      <span className="home-badge-score text-[11px] font-semibold">{score}/{SCORE_CAP}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()

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
    /* Outer: single-column on mobile, two-column on desktop */
    <div className="grid gap-5 pb-8 lg:grid-cols-[1fr_340px]">

      {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Mission card */}
        <motion.div
          className="relative overflow-hidden rounded-3xl p-5 md:p-6"
          style={{ background: '#5b4cff' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-36 rounded-full bg-white/[0.04]" />

          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80">
              Today&apos;s Mission
            </span>
            <h1 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Welcome back, {profile?.name ?? 'Student'}
            </h1>
            <p className="mt-1 text-sm font-medium text-white/65">
              Keep your streak alive and improve your weakest topic.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <motion.button
                onClick={startPrimaryFlow}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-md"
                style={{ background: '#FCD34D', color: '#1a1036' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap className="size-4" />
                {primaryRecommendation ? `Quick ${primaryRecommendation.label} Practice` : 'Start 10 Questions'}
              </motion.button>

              <motion.button
                onClick={startDailyChallenges}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Target className="size-4" />
                Daily Challenges
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Subject grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="home-section-title text-base font-black">Choose a Subject</h2>
            <span className="home-section-label text-xs font-semibold uppercase tracking-widest">
              {subjects.length} Realms
            </span>
          </div>

          {/* 2×2 grid on desktop, vertical stack on mobile */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subjects.map((subject, i) => {
              const config = SUBJECT_CONFIG[subject]
              const style = SUBJECT_CARD_STYLES[subject]
              return (
                <motion.button
                  key={subject}
                  onClick={() => navigate(`/subject/${subject}`)}
                  className="subject-card home-subject-card flex items-center gap-3 rounded-2xl p-4 text-left"
                  style={{ '--subject-bg': style.bg, '--subject-text': style.text } as React.CSSProperties}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <span className="home-subject-icon flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {config.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="home-subject-name font-extrabold" style={{ color: style.text }}>
                      {config.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{config.topics.length} topics</p>
                  </div>
                  <ChevronRight className="size-4 flex-shrink-0" style={{ color: style.text }} />
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Empty state (mobile only – on desktop this sits in right panel) */}
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

      {/* ── RIGHT COLUMN (desktop) / below content (mobile) ──────────────── */}
      <div className="flex flex-col gap-5">

        {/* Subject Badges card */}
        <motion.div
          className="home-panel rounded-2xl p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="home-section-title text-sm font-black">Subject Badges</h2>
            <button
              onClick={() => navigate('/achievements')}
              className="text-xs font-semibold text-[#5b4cff]"
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((subject) => (
              <SubjectBadge
                key={subject}
                subject={subject}
                score={subjectScores?.[subject] ?? 0}
              />
            ))}
          </div>
        </motion.div>

        {/* Activities — individual cards */}
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
