import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { getDailyChallenges, type DailyChallenge as DailyChallengeType } from '../gamification/daily-challenge'
import { SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

export default function DailyChallengePage() {
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')
  const challenges = getDailyChallenges(today)

  // Check which challenges have been completed today
  const completedChallenges = useLiveQuery(async () => {
    const todayStart = new Date(today).getTime()
    const todayAttempts = await db.attempts
      .where('timestamp')
      .aboveOrEqual(todayStart)
      .toArray()

    // A challenge is "completed" if enough questions for that topic were answered today
    const topicCounts: Record<string, number> = {}
    for (const a of todayAttempts) {
      topicCounts[a.topic] = (topicCounts[a.topic] || 0) + 1
    }

    return challenges.map((c) => ({
      ...c,
      completed: (topicCounts[c.topic] ?? 0) >= c.questionCount,
    }))
  }, [today])

  const allCompleted = completedChallenges?.every((c) => c.completed)

  const startChallenge = (challenge: DailyChallengeType) => {
    const params = new URLSearchParams({
      subject: challenge.subject,
      topic: challenge.topic,
      count: String(challenge.questionCount),
      difficulty: String(challenge.difficulty),
    })
    navigate(`/quiz?${params}`)
  }

  return (
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-8">
      {/* Header */}
      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="size-5 text-[#def0ff]" />
        </button>
        <h1 className="text-xl font-extrabold text-[#edf8ff]">Daily Challenges</h1>
      </div>

      {/* Amber gradient hero banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-amber-200/35 bg-gradient-to-br from-amber-300/28 to-orange-300/22 p-6 text-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Subtle white blur overlay inside hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="text-3xl mb-2">🎯</div>
          <h2 className="text-xl font-semibold mb-1">Today's Challenges</h2>
          <p className="text-white/80 text-sm">
            Complete all 3 for a bonus 100 XP!
          </p>
          {allCompleted && (
            <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center font-semibold">
              🎉 All challenges complete! +100 XP Bonus!
            </div>
          )}
        </div>
      </motion.div>

      {/* Challenge cards */}
      <div className="flex flex-col gap-4">
        {(completedChallenges ?? challenges.map((c) => ({ ...c, completed: false }))).map(
          (challenge, idx) => (
            <motion.div
              key={challenge.id}
              className={`rounded-xl border p-6 transition-all card-hover ${
                challenge.completed
                  ? 'border-emerald-200/45 bg-emerald-300/12'
                  : 'border-white/20 bg-white/10 hover:border-cyan-200/40 hover:bg-white/15'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{challenge.emoji}</span>
                <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#ecf8ff]">{challenge.title}</h3>
                    {challenge.completed && <span className="text-emerald-200 text-lg">✓</span>}
                  </div>
                  <p className="text-xs text-[#aac9ea] mb-2">{challenge.description}</p>
                  <div className="flex items-center gap-2 text-xs text-[#aac9ea]">
                    <span>{SUBJECT_CONFIG[challenge.subject].icon}</span>
                    <span>{TOPIC_LABELS[challenge.topic]}</span>
                    <span>•</span>
                    <span>{challenge.questionCount} questions</span>
                    <span>•</span>
                    <span className="text-cyan-100 font-semibold">+{challenge.xpBonus} XP</span>
                  </div>
                </div>
              </div>
              {!challenge.completed && (
                <motion.button
                  onClick={() => startChallenge(challenge)}
                  className="aurora-button-primary mt-3 w-full py-2.5 text-sm font-black"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Challenge
                </motion.button>
              )}
            </motion.div>
          )
        )}
      </div>
    </div>
  )
}
