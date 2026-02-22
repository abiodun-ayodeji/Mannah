import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Award, BookOpen, ChevronRight, Swords, Target, Zap } from 'lucide-react'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useUserProfile } from '../hooks/useUserProfile'
import { useThemeMode } from '../hooks/useThemeMode'
import { getTopicStats, getDifficultyForAccuracy } from '../utils/practice-recommendations'
import AchievementOrbs from '../components/gamification/AchievementOrbs'
import { db } from '../db/database'

const subjects = Object.values(Subject)

const SUBJECT_CARD_GRADIENTS: Record<Subject, string> = {
  [Subject.MATHS]: 'from-[#365fdc]/70 to-[#23367e]/70',
  [Subject.ENGLISH]: 'from-[#0c8f79]/70 to-[#124f57]/70',
  [Subject.VERBAL_REASONING]: 'from-[#b4408b]/72 to-[#5e2852]/72',
  [Subject.NON_VERBAL_REASONING]: 'from-[#c17a24]/72 to-[#664218]/72',
}

const SUBJECT_LIGHT_COLORS: Record<Subject, { card: string; text: string; ring: string }> = {
  [Subject.MATHS]: { card: 'lm-subject-maths', text: '#3b5fd4', ring: '#3b5fd4' },
  [Subject.ENGLISH]: { card: 'lm-subject-english', text: '#0d7a5f', ring: '#0d7a5f' },
  [Subject.VERBAL_REASONING]: { card: 'lm-subject-verbal', text: '#a0307a', ring: '#a0307a' },
  [Subject.NON_VERBAL_REASONING]: { card: 'lm-subject-nvr', text: '#b06b10', ring: '#b06b10' },
}

const SCORE_CAP = 50

function toQuizLink(subject: Subject, difficulty: number, topic?: string) {
  const params = new URLSearchParams({
    subject,
    count: '10',
    difficulty: String(difficulty),
  })
  if (topic) {
    params.set('topic', topic)
  }
  return `/quiz?${params.toString()}`
}

// SVG circular progress badge for light mode
function SubjectBadge({
  subject,
  score,
  cap,
}: {
  subject: Subject
  score: number
  cap: number
}) {
  const config = SUBJECT_CONFIG[subject]
  const colors = SUBJECT_LIGHT_COLORS[subject]
  const radius = 28
  const stroke = 4
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(score / cap, 1)
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="lm-badge-wrap">
      <div className="lm-badge-ring">
        <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={36} cy={36} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          {score > 0 && (
            <circle
              cx={36}
              cy={36}
              r={radius}
              fill="none"
              stroke={colors.ring}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          )}
        </svg>
        <div
          className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        >
          {config.icon}
        </div>
      </div>
      <span className="text-xs font-bold text-gray-800">{config.label.split(' ')[0]}</span>
      <span className="text-[11px] font-semibold text-gray-500">
        {score}/{cap}
      </span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { mode } = useThemeMode()

  const recommendations = useLiveQuery(async () => {
    const stats = await getTopicStats(3)
    if (stats.length === 0) return null

    return stats.slice(0, 3).map((item) => ({
      topic: item.topic,
      subject: item.subject,
      accuracy: Math.round(item.accuracy * 100),
      difficulty: getDifficultyForAccuracy(item.accuracy),
      label: TOPIC_LABELS[item.topic] ?? item.topic,
      icon: SUBJECT_CONFIG[item.subject].icon,
    }))
  }, [])

  // Per-subject correct answer counts for the badge rings
  const subjectScores = useLiveQuery(async () => {
    const scores: Record<string, number> = {}
    for (const subject of subjects) {
      const correct = await db.attempts
        .where('subject')
        .equals(subject)
        .filter((a) => (a as { isCorrect: boolean }).isCorrect)
        .count()
      scores[subject] = Math.min(correct, SCORE_CAP)
    }
    return scores
  }, [])

  const primaryRecommendation = recommendations?.[0] ?? null

  const fallbackQuickStart = useMemo(() => {
    const options = [Subject.MATHS, Subject.ENGLISH, Subject.VERBAL_REASONING, Subject.NON_VERBAL_REASONING]
    const idx = new Date().getDate() % options.length
    return options[idx]
  }, [])

  const startPrimaryFlow = () => {
    if (primaryRecommendation) {
      track('quick_play', {
        smart: true,
        subject: primaryRecommendation.subject,
        topic: primaryRecommendation.topic,
        difficulty: primaryRecommendation.difficulty,
        session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown',
      })
      navigate(
        toQuizLink(
          primaryRecommendation.subject,
          primaryRecommendation.difficulty,
          primaryRecommendation.topic
        )
      )
      return
    }
    track('quick_play', {
      smart: false,
      subject: fallbackQuickStart,
      difficulty: 2,
      session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown',
    })
    navigate(toQuizLink(fallbackQuickStart, 2))
  }

  const startWeakestQuickPlay = () => {
    if (recommendations && recommendations.length > 0) {
      const weakestSet = recommendations.slice(0, 3)
      const target = weakestSet[Math.floor(Math.random() * weakestSet.length)]
      track('quick_play_weakest', {
        smart: true,
        subject: target.subject,
        topic: target.topic,
        difficulty: target.difficulty,
        session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown',
      })
      navigate(toQuizLink(target.subject, target.difficulty, target.topic))
      return
    }
    track('quick_play_weakest', {
      smart: false,
      subject: fallbackQuickStart,
      difficulty: 2,
      session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown',
    })
    navigate(toQuizLink(fallbackQuickStart, 2))
  }

  // ── LIGHT MODE LAYOUT ──────────────────────────────────────────────────
  if (mode === 'bright') {
    return (
      <div className="space-y-5 pb-8" style={{ color: '#0f1419' }}>
        {/* Mission card */}
        <motion.div
          className="lm-mission-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80">
            Today&apos;s Mission
          </span>
          <h1 className="mt-2 text-2xl font-black text-white">
            Welcome back, {profile?.name ?? 'Student'}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Keep your streak alive and improve your weakest topic.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <motion.button
              onClick={startPrimaryFlow}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#5b4cff] shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap className="size-4" />
              {primaryRecommendation ? `Continue: ${primaryRecommendation.label}` : 'Start 10 Questions'}
            </motion.button>
            <motion.button
              onClick={startWeakestQuickPlay}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-extrabold text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Target className="size-4" />
              Quick Play
            </motion.button>
          </div>
        </motion.div>

        {/* Feature cards */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { title: 'Daily Challenges', icon: Target, action: () => navigate('/daily-challenges') },
            { title: 'Boss Battles', icon: Swords, action: () => navigate('/bosses') },
            { title: 'Achievements', icon: Award, action: () => navigate('/achievements') },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.title}
                onClick={item.action}
                className="lm-feature-card text-left"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <div className="inline-flex rounded-lg bg-[#5b4cff]/10 p-2">
                  <Icon className="size-4 text-[#5b4cff]" />
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight">{item.title}</p>
              </motion.button>
            )
          })}
        </section>

        {/* Subject badges */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Subject Badges</h2>
            <button
              onClick={() => navigate('/achievements')}
              className="text-xs font-semibold text-[#5b4cff]"
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {subjects.map((subject) => (
              <SubjectBadge
                key={subject}
                subject={subject}
                score={subjectScores?.[subject] ?? 0}
                cap={SCORE_CAP}
              />
            ))}
          </div>
        </section>

        {/* Subject list */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900">Choose a Subject</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5b4cff]">
              {subjects.length} Realms
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {subjects.map((subject, i) => {
              const config = SUBJECT_CONFIG[subject]
              const colors = SUBJECT_LIGHT_COLORS[subject]
              return (
                <motion.button
                  key={subject}
                  onClick={() => navigate(`/subject/${subject}`)}
                  className={`lm-subject-card ${colors.card}`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <div className="lm-subject-icon">{config.icon}</div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-extrabold leading-tight" style={{ color: colors.text }}>
                      {config.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{config.topics.length} topics</p>
                  </div>
                  <ChevronRight className="size-4 flex-shrink-0" style={{ color: colors.text }} />
                </motion.button>
              )
            })}
          </div>
        </section>

        {recommendations === null && (
          <motion.div
            className="rounded-2xl bg-white p-5 text-center ring-1 ring-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="mx-auto size-5 text-[#5b4cff]" />
            <p className="mt-2 text-sm font-bold text-gray-800">No recommendations yet.</p>
            <p className="mt-1 text-xs text-gray-500">
              Complete a few quizzes and we&apos;ll suggest the next best topic.
            </p>
          </motion.div>
        )}
      </div>
    )
  }

  // ── DARK MODE LAYOUT (unchanged) ────────────────────────────────────────
  return (
    <div className="aurora-page space-y-5 pb-8">
      <motion.section
        className="relative overflow-hidden rounded-3xl aurora-card p-5 md:p-7"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-violet-300/18 blur-3xl" />

        <div className="relative z-10">
          <span className="aurora-kicker">Today&apos;s Mission</span>
          <h1 className="aurora-page-title mt-3">Welcome back, {profile?.name ?? 'Student'}</h1>
          <p className="aurora-page-subtitle">
            One clear next step: keep your streak alive and improve your weakest topic.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <motion.button
              onClick={startPrimaryFlow}
              className="aurora-button-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-black"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="size-4" />
              {primaryRecommendation ? `Continue: ${primaryRecommendation.label}` : 'Start 10 Questions'}
            </motion.button>

            <motion.button
              onClick={startWeakestQuickPlay}
              className="aurora-button-secondary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-black"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Target className="size-4" />
              Quick Play - 10 Questions
            </motion.button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: 'Daily Challenges',
            description: 'Fresh goals for today',
            icon: Target,
            action: () => navigate('/daily-challenges'),
          },
          {
            title: 'Boss Battles',
            description: 'Defeat bosses and win bonus XP',
            icon: Swords,
            action: () => navigate('/bosses'),
          },
          {
            title: 'Achievements',
            description: 'Track milestones',
            icon: Award,
            action: () => navigate('/achievements'),
          },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.title}
              onClick={item.action}
              className="aurora-card-soft rounded-2xl p-5 md:p-6 text-left min-h-[128px]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <div className="mb-4 inline-flex rounded-xl border border-white/25 bg-white/10 p-2.5">
                <Icon className="size-5 text-[#def2ff]" />
              </div>
              <p className="text-base font-extrabold text-white md:text-lg">{item.title}</p>
              <p className="mt-1.5 text-sm text-[#c6ddf9]">{item.description}</p>
            </motion.button>
          )
        })}
      </section>

      <AchievementOrbs />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="aurora-heading text-xl font-black text-white">Choose a Subject</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8c6ea]">
            {subjects.length} Realms
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {subjects.map((subject, index) => {
            const config = SUBJECT_CONFIG[subject]
            return (
              <motion.button
                key={subject}
                onClick={() => navigate(`/subject/${subject}`)}
                className={`rounded-2xl border border-white/20 bg-gradient-to-br ${SUBJECT_CARD_GRADIENTS[subject]} p-4 text-left`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl leading-none">{config.icon}</span>
                  <ArrowRight className="size-4 text-[#d8e9ff]" />
                </div>
                <p className="text-sm font-black text-white">{config.label}</p>
                <p className="mt-1 text-xs font-semibold text-[#cae0fa]">{config.topics.length} topics</p>
              </motion.button>
            )
          })}
        </div>
      </section>

      {recommendations === null && (
        <motion.section
          className="aurora-card-soft rounded-2xl p-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BookOpen className="mx-auto size-6 text-cyan-200" />
          <p className="mt-2 text-sm font-extrabold text-white">No recommendations yet.</p>
          <p className="mt-1 text-xs text-[#b8d1f3]">
            Complete a few quizzes and we will suggest the next best topic automatically.
          </p>
        </motion.section>
      )}
    </div>
  )
}
