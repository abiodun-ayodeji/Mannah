import { useMemo, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Question, Difficulty } from '../types/question'
import type { Topic } from '../types/subject'
import { Subject } from '../types/subject'
import { generateQuizQuestions, getAvailableTopics } from '../engine/question-engine'
import { getMinDifficultyForAccuracy } from '../utils/practice-recommendations'
import { db } from '../db/database'
import QuizSession from '../components/quiz/QuizSession'

const MIN_ATTEMPTS_FOR_BUMP = 5

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const subject = (searchParams.get('subject') as Subject) ?? Subject.MATHS
  const topic = searchParams.get('topic') as Topic | null
  const count = parseInt(searchParams.get('count') ?? '10', 10)
  const diff = parseInt(searchParams.get('difficulty') ?? '2', 10) as Difficulty

  // For single-topic sessions, compute the child's all-time accuracy on that topic.
  // Once they have enough attempts and a high enough accuracy, we raise the minimum
  // difficulty so they cannot keep farming an easy level indefinitely.
  const topicAccuracy = useLiveQuery(async () => {
    if (!topic) return null
    const attempts = await db.attempts.where('topic').equals(topic).toArray()
    if (attempts.length < MIN_ATTEMPTS_FOR_BUMP) return null
    return attempts.filter((a) => a.isCorrect).length / attempts.length
  }, [topic])

  const effectiveDiff = useMemo<Difficulty>(() => {
    if (topicAccuracy == null) return diff
    const minDiff = getMinDifficultyForAccuracy(topicAccuracy)
    return Math.max(diff, minDiff) as Difficulty
  }, [diff, topicAccuracy])

  const topics = useMemo(() => (topic ? [topic] : getAvailableTopics(subject)), [subject, topic])
  const questions = useMemo<Question[]>(
    () => (topics.length > 0 ? generateQuizQuestions(topics, count, effectiveDiff) : []),
    [topics, count, effectiveDiff]
  )

  useEffect(() => {
    if (topics.length === 0) {
      navigate('/')
    }
  }, [topics, navigate])

  if (questions.length === 0) {
    return (
      <div className="quiz-shell aurora-flow relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="aurora-orb aurora-orb-cyan top-[-140px] right-[-120px] h-[380px] w-[380px]" />
        <div className="aurora-orb aurora-orb-violet bottom-[-160px] left-[-130px] h-[400px] w-[400px]" />
        <div className="relative z-10 w-full max-w-sm rounded-3xl aurora-card p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-cyan-100/35 border-t-cyan-100" />
          <p className="text-sm font-bold text-[#d3e8ff]">Loading questions...</p>
        </div>
      </div>
    )
  }

  return <QuizSession questions={questions} onFinish={() => navigate('/')} />
}
