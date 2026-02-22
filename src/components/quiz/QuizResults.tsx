import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { track } from '@vercel/analytics'
import type { AttemptRecord } from '../../types/progress'
import FeedbackPrompt, { shouldShowFeedback } from '../FeedbackPrompt'

interface QuizResultsProps {
  attempts: AttemptRecord[]
  totalXP: number
  onRetry: () => void
}

/* Inline confetti burst -- 15 pieces with random placement */
function ConfettiBurst() {
  const colors = ['#5b4cff', '#FCD34D', '#10B981', '#EC4899', '#F59E0B']
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + ((i * 17) % 80)}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${((i * 0.13) % 1.5).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function QuizResults({ attempts, totalXP, onRetry }: QuizResultsProps) {
  const navigate = useNavigate()
  const correct = attempts.filter((a) => a.isCorrect).length
  const total = attempts.length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const [showFeedback] = useState(() => shouldShowFeedback())

  const weakestTopic = useMemo(() => {
    if (attempts.length === 0) return null

    const byTopic = new Map<string, { subject: string; topic: string; total: number; correct: number; difficulty: number }>()
    for (const attempt of attempts) {
      const key = `${attempt.subject}:${attempt.topic}`
      const existing = byTopic.get(key)
      if (existing) {
        existing.total += 1
        if (attempt.isCorrect) existing.correct += 1
        existing.difficulty = Math.max(existing.difficulty, attempt.difficulty)
      } else {
        byTopic.set(key, {
          subject: attempt.subject,
          topic: attempt.topic,
          total: 1,
          correct: attempt.isCorrect ? 1 : 0,
          difficulty: attempt.difficulty,
        })
      }
    }

    const ranked = Array.from(byTopic.values())
      .map((entry) => ({
        ...entry,
        accuracy: entry.total > 0 ? entry.correct / entry.total : 0,
      }))
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy
        return b.total - a.total
      })

    return ranked[0] ?? null
  }, [attempts])

  const focusUrl = useMemo(() => {
    if (!weakestTopic) return null
    const params = new URLSearchParams({
      subject: weakestTopic.subject,
      topic: weakestTopic.topic,
      count: '10',
      difficulty: String(Math.min(Math.max(weakestTopic.difficulty, 1), 5)),
    })
    return `/quiz?${params.toString()}`
  }, [weakestTopic])

  /* Animated counter: counts from 0 to `correct` over ~1 second */
  const [displayCount, setDisplayCount] = useState(0)
  useEffect(() => {
    if (correct === 0) return
    let current = 0
    const stepTime = Math.max(Math.floor(1000 / correct), 30)
    const interval = setInterval(() => {
      current++
      setDisplayCount(current)
      if (current >= correct) clearInterval(interval)
    }, stepTime)
    return () => clearInterval(interval)
  }, [correct])

  useEffect(() => {
    const sid = sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown'
    track('quiz_completed', {
      session_id: sid,
      subject: attempts[0]?.subject ?? 'unknown',
      topic: attempts[0]?.topic ?? 'unknown',
      accuracy: pct,
      total_questions: total,
      correct_answers: correct,
      xp_earned: totalXP,
    })
  }, [attempts, correct, pct, total, totalXP])

  const emoji = pct >= 90 ? '\u{1F31F}' : pct >= 70 ? '\u{1F60A}' : pct >= 50 ? '\u{1F4AA}' : '\u{1F4DA}'
  const message = pct >= 90
    ? 'Outstanding!'
    : pct >= 70
    ? 'Great work!'
    : pct >= 50
    ? 'Good effort!'
    : 'Keep practising!'

  return (
    <div className="quiz-shell aurora-flow relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div className="aurora-orb aurora-orb-cyan top-[-190px] right-[-120px] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-170px] left-[-140px] h-[430px] w-[430px]" />

      {/* Confetti burst for scores >= 70% */}
      {pct >= 70 && <ConfettiBurst />}

      <motion.div
        className="relative z-10 w-full max-w-sm rounded-3xl border border-cyan-100/25 aurora-card p-8 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <motion.div
          className="text-6xl mb-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {emoji}
        </motion.div>

        <h2 className="mb-1 text-2xl font-black gradient-text">{message}</h2>

        {/* Circular SVG progress ring */}
        <div className="relative w-36 h-36 mx-auto my-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle
              cx="50" cy="50" r="42"
              fill="none" stroke="rgba(201, 228, 255, 0.2)" strokeWidth="8"
            />
            {/* Progress arc */}
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - pct / 100) }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[#ebf7ff]">{displayCount}/{total}</span>
            <span className="text-xs font-semibold text-[#aac9ea]">{pct}%</span>
          </div>
        </div>

        <motion.div
          className="mb-6 rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm font-bold text-cyan-100">+{totalXP} XP earned!</span>
        </motion.div>

        {showFeedback && (
          <FeedbackPrompt
            context={{
              subject: attempts[0]?.subject ?? 'unknown',
              topic: attempts[0]?.topic ?? 'unknown',
              accuracy: pct,
            }}
            formUrl="https://forms.gle/DF7jd8XH2DewR2NT8"
          />
        )}

        <div className="flex flex-col gap-3">
          {focusUrl && pct < 100 && (
            <motion.button
              onClick={() => navigate(focusUrl)}
              className="aurora-button-primary w-full py-3.5 text-lg font-black"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Next Focus Session
            </motion.button>
          )}

          <motion.button
            onClick={onRetry}
            className="aurora-button-secondary w-full py-3.5 text-lg font-bold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Retry Same Quiz
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            className="w-full rounded-full border border-white/30 bg-white/10 py-3.5 text-base font-bold text-[#d6e9ff] transition hover:bg-white/18"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Back Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
