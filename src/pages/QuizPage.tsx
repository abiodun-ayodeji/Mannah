import { useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Question, Difficulty } from '../types/question'
import type { Topic } from '../types/subject'
import { Subject } from '../types/subject'
import { generateQuizQuestions, getAvailableTopics } from '../engine/question-engine'
import QuizSession from '../components/quiz/QuizSession'

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const subject = (searchParams.get('subject') as Subject) ?? Subject.MATHS
  const topic = searchParams.get('topic') as Topic | null
  const count = parseInt(searchParams.get('count') ?? '10', 10)
  const diff = parseInt(searchParams.get('difficulty') ?? '2', 10) as Difficulty

  const topics = useMemo(() => (topic ? [topic] : getAvailableTopics(subject)), [subject, topic])
  const questions = useMemo<Question[]>(
    () => (topics.length > 0 ? generateQuizQuestions(topics, count, diff) : []),
    [topics, count, diff]
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
