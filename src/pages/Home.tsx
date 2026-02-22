import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Award, BookOpen, Swords, Target, Zap } from 'lucide-react'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useUserProfile } from '../hooks/useUserProfile'
import { getTopicStats, getDifficultyForAccuracy } from '../utils/practice-recommendations'

const subjects = Object.values(Subject)

// Per-subject indigo-tinted gradient cards (vertical stack)
const SUBJECT_CARD_STYLES: Record<Subject, { bg: string; accent: string }> = {
  [Subject.MATHS]: {
    bg: 'bg-gradient-to-r from-[#365fdc]/65 to-[#23367e]/65',
    accent: '#93c5fd',
  },
  [Subject.ENGLISH]: {
    bg: 'bg-gradient-to-r from-[#0c8f79]/65 to-[#124f57]/65',
    accent: '#6ee7b7',
  },
  [Subject.VERBAL_REASONING]: {
    bg: 'bg-gradient-to-r from-[#b4408b]/65 to-[#5e2852]/65',
    accent: '#f9a8d4',
  },
  [Subject.NON_VERBAL_REASONING]: {
    bg: 'bg-gradient-to-r from-[#c17a24]/65 to-[#664218]/65',
    accent: '#fcd34d',
  },
}

function toQuizLink(subject: Subject, difficulty: number, topic?: string) {
  const params = new URLSearchParams({ subject, count: '10', difficulty: String(difficulty) })
  if (topic) params.set('topic', topic)
  return `/quiz?${params.toString()}`
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
      icon: SUBJECT_CONFIG[item.subject].icon,
    }))
  }, [])

  const primaryRecommendation = recommendations?.[0] ?? null

  const fallbackQuickStart = useMemo(() => {
    const options = [Subject.MATHS, Subject.ENGLISH, Subject.VERBAL_REASONING, Subject.NON_VERBAL_REASONING]
    return options[new Date().getDate() % options.length]
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
      navigate(toQuizLink(primaryRecommendation.subject, primaryRecommendation.difficulty, primaryRecommendation.topic))
      return
    }
    track('quick_play', { smart: false, subject: fallbackQuickStart, difficulty: 2, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
    navigate(toQuizLink(fallbackQuickStart, 2))
  }

  const startWeakestQuickPlay = () => {
    if (recommendations && recommendations.length > 0) {
      const target = recommendations[Math.floor(Math.random() * recommendations.length)]
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
    track('quick_play_weakest', { smart: false, subject: fallbackQuickStart, difficulty: 2, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
    navigate(toQuizLink(fallbackQuickStart, 2))
  }

  return (
    <div className="space-y-4 pb-8" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>

      {/* ── Mission card (indigo, like landing page) ── */}
      <motion.section
        className="relative overflow-hidden rounded-3xl p-5 md:p-7"
        style={{ background: '#5b4cff' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* subtle circle decorations (same as landing) */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-36 w-36 rounded-full bg-white/[0.04]" />

        <div className="relative z-10">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80">
            Today&apos;s Mission
          </span>
          <h1 className="mt-3 text-2xl font-black text-white md:text-3xl">
            Welcome back, {profile?.name ?? 'Student'}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/65">
            Keep your streak alive and improve your weakest topic.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* Amber primary CTA — same amber as landing page */}
            <motion.button
              onClick={startPrimaryFlow}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-md"
              style={{ background: '#FCD34D', color: '#1a1036' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap className="size-4" />
              {primaryRecommendation ? `Continue: ${primaryRecommendation.label}` : 'Start 10 Questions'}
            </motion.button>

            <motion.button
              onClick={startWeakestQuickPlay}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Target className="size-4" />
              Quick Play — 10 Questions
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ── Feature cards ── */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { title: 'Daily Challenges', description: 'Fresh goals for today', icon: Target, action: () => navigate('/daily-challenges') },
          { title: 'Boss Battles', description: 'Defeat bosses, win XP', icon: Swords, action: () => navigate('/bosses') },
          { title: 'Achievements', description: 'Track milestones', icon: Award, action: () => navigate('/achievements') },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.button
              key={item.title}
              onClick={item.action}
              className="rounded-2xl border border-white/20 bg-white/[0.07] p-5 text-left min-h-[112px] backdrop-blur-sm"
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.11)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <div className="mb-3 inline-flex rounded-xl bg-[#5b4cff]/30 p-2.5 ring-1 ring-[#5b4cff]/40">
                <Icon className="size-5 text-white" />
              </div>
              <p className="text-sm font-extrabold text-white">{item.title}</p>
              <p className="mt-1 text-xs font-medium text-white/55">{item.description}</p>
            </motion.button>
          )
        })}
      </section>

      {/* ── Subject cards — vertical stack ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Choose a Subject</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            {subjects.length} Realms
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {subjects.map((subject, index) => {
            const config = SUBJECT_CONFIG[subject]
            const style = SUBJECT_CARD_STYLES[subject]
            return (
              <motion.button
                key={subject}
                onClick={() => navigate(`/subject/${subject}`)}
                className={`flex items-center gap-4 rounded-2xl border border-white/15 ${style.bg} p-4 text-left backdrop-blur-sm`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
              >
                <span className="text-3xl leading-none">{config.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{config.label}</p>
                  <p className="mt-0.5 text-xs font-semibold" style={{ color: style.accent }}>
                    {config.topics.length} topics
                  </p>
                </div>
                <ArrowRight className="size-4 flex-shrink-0 text-white/50" />
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* ── Empty state ── */}
      {recommendations === null && (
        <motion.section
          className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BookOpen className="mx-auto size-6 text-white/50" />
          <p className="mt-2 text-sm font-extrabold text-white">No recommendations yet.</p>
          <p className="mt-1 text-xs font-medium text-white/50">
            Complete a few quizzes and we&apos;ll suggest the next best topic.
          </p>
        </motion.section>
      )}
    </div>
  )
}
