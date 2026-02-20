import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { track } from '@vercel/analytics'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Award, BookOpen, Swords, Target, Zap } from 'lucide-react'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useUserProfile } from '../hooks/useUserProfile'
import { getTopicStats, getDifficultyForAccuracy } from '../utils/practice-recommendations'
import AchievementOrbs from '../components/gamification/AchievementOrbs'

const subjects = Object.values(Subject)

const SUBJECT_CARD_GRADIENTS: Record<Subject, string> = {
  [Subject.MATHS]: 'from-[#365fdc]/70 to-[#23367e]/70',
  [Subject.ENGLISH]: 'from-[#0c8f79]/70 to-[#124f57]/70',
  [Subject.VERBAL_REASONING]: 'from-[#b4408b]/72 to-[#5e2852]/72',
  [Subject.NON_VERBAL_REASONING]: 'from-[#c17a24]/72 to-[#664218]/72',
}

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
