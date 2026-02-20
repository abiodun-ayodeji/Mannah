import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Question } from '../../types/question'
import type { AttemptRecord, SessionRecord } from '../../types/progress'
import { calculateXP } from '../../gamification/xp-system'
import { recordActivity } from '../../gamification/streak-system'
import { db } from '../../db/database'
import { uniqueId } from '../../utils/random'
import { useTimer } from '../../hooks/useTimer'
import { useXP } from '../../hooks/useXP'
import { useSound } from '../../hooks/useSound'
import { useReadAloud } from '../../hooks/useReadAloud'
import { useUserProfile } from '../../hooks/useUserProfile'
import QuestionCard from './QuestionCard'
import MultipleChoice from './MultipleChoice'
import FeedbackOverlay from '../gamification/FeedbackOverlay'
import LevelUpModal from '../gamification/LevelUpModal'
import TimerBar from '../gamification/TimerBar'
import QuizResults from './QuizResults'

interface QuizSessionProps {
  questions: Question[]
  onFinish: () => void
  sessionType?: SessionRecord['type']
}

export default function QuizSession({ questions, onFinish, sessionType = 'practice' }: QuizSessionProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [attempts, setAttempts] = useState<AttemptRecord[]>([])
  const [totalXPEarned, setTotalXPEarned] = useState(0)
  const [sessionStreak, setSessionStreak] = useState(0)
  const [lastXP, setLastXP] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [sessionId] = useState(() => uniqueId())
  const startTimeRef = useRef<number | null>(null)

  const { addXP } = useXP()
  const { play } = useSound()
  const { speak, stop: stopSpeech } = useReadAloud()
  const { profile } = useUserProfile()
  const readAloudEnabled = profile?.settings?.readAloudEnabled ?? false
  const question = questions[currentIdx]
  const timer = useTimer(question?.timeLimit ?? null)

  // Save session record when quiz finishes
  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    if (!isFinished || attempts.length === 0) return

    const correctCount = attempts.filter((a) => a.isCorrect).length
    const subjects = [...new Set(attempts.map((a) => a.subject))]
    const topics = [...new Set(attempts.map((a) => a.topic))]

    const record: SessionRecord = {
      id: sessionId,
      userId: 'default',
      type: sessionType,
      subject: subjects.length === 1 ? subjects[0] : 'mixed',
      topics,
      startTime: startTimeRef.current ?? Date.now(),
      endTime: Date.now(),
      totalQuestions: attempts.length,
      correctAnswers: correctCount,
      accuracy: attempts.length > 0 ? correctCount / attempts.length : 0,
      xpEarned: totalXPEarned,
      difficulty: questions[0]?.difficulty ?? 2,
    }

    db.sessions.put(record)
  }, [isFinished])

  useEffect(() => {
    if (question?.timeLimit) {
      timer.start()
    }
    // Auto-read question aloud when it changes
    if (readAloudEnabled && question) {
      const text = question.prompt + (question.passage ? '. ' + question.passage : '')
      speak(text)
    }
    return () => { stopSpeech() }
  }, [currentIdx])

  const handleSelect = useCallback(
    async (optionId: string) => {
      if (selectedAnswer !== null) return

      stopSpeech()
      timer.stop()
      const timeTaken = timer.getElapsed()
      setSelectedAnswer(optionId)

      // correctAnswer may be an option ID (spelling, grammar, NVR) or an answer label (maths, verbal).
      // Determine which pattern this question uses and find the correct option.
      const rawCorrect = typeof question.correctAnswer === 'string'
        ? question.correctAnswer
        : question.correctAnswer[0]

      // First try matching correctAnswer as an option ID
      let correctOpt = question.options?.find((o) => o.id === rawCorrect)
      // If no match, it's a label-based answer — find the option whose label matches
      if (!correctOpt) {
        correctOpt = question.options?.find((o) => o.label === rawCorrect)
      }
      const correctId = correctOpt?.id ?? rawCorrect

      setCorrectAnswer(correctId)
      const isCorrect = optionId === correctId

      const newStreak = isCorrect ? sessionStreak + 1 : 0
      setSessionStreak(newStreak)

      const xp = calculateXP({
        difficulty: question.difficulty,
        isCorrect,
        timeTaken,
        timeLimit: question.timeLimit,
        sessionStreak: isCorrect ? sessionStreak : 0,
      })

      // Play sound
      play(isCorrect ? 'correct' : 'wrong')

      setLastXP(xp)
      setTotalXPEarned((prev) => prev + xp)

      const userLabel = question.options?.find((o) => o.id === optionId)?.label ?? optionId

      const attempt: AttemptRecord = {
        id: uniqueId(),
        questionId: question.id,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        isCorrect,
        userAnswer: userLabel,
        timeTaken,
        xpEarned: xp,
        timestamp: Date.now(),
        sessionId,
      }

      await db.attempts.add(attempt)
      setAttempts((prev) => [...prev, attempt])
      await recordActivity()

      const levelResult = await addXP(xp)
      if (levelResult.levelled) {
        setNewLevel(levelResult.newLevel)
        play('levelUp')
      }

      setShowFeedback(true)
    },
    [selectedAnswer, question, sessionStreak, timer, addXP, sessionId, play, stopSpeech]
  )

  const advance = useCallback(() => {
    setShowLevelUp(false)
    setNewLevel(1)
    setSelectedAnswer(null)
    setCorrectAnswer(null)

    if (currentIdx + 1 >= questions.length) {
      setIsFinished(true)
    } else {
      setCurrentIdx((prev) => prev + 1)
    }
  }, [currentIdx, questions.length])

  const handleContinue = useCallback(() => {
    setShowFeedback(false)

    // Check for level up after closing feedback
    if (newLevel > 1) {
      setShowLevelUp(true)
      return
    }

    advance()
  }, [newLevel, advance])

  const handleRetry = useCallback(() => {
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setCorrectAnswer(null)
    setShowFeedback(false)
    setShowLevelUp(false)
    setAttempts([])
    setTotalXPEarned(0)
    setSessionStreak(0)
    setIsFinished(false)
  }, [])

  if (isFinished) {
    return (
      <QuizResults
        attempts={attempts}
        totalXP={totalXPEarned}
        onRetry={handleRetry}
      />
    )
  }

  if (!question) return null

  // Progress bar
  const progress = ((currentIdx + 1) / questions.length) * 100

  return (
    <div className="aurora-flow relative min-h-screen overflow-x-hidden">
      <div className="aurora-orb aurora-orb-cyan top-[-200px] right-[-120px] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-180px] left-[-150px] h-[430px] w-[430px]" />

      <div className="relative z-10 flex h-screen flex-col overflow-y-auto">
        <div className="sticky top-0 z-20 px-4 pb-2 pt-4 md:px-6">
          <div className="mx-auto w-full max-w-4xl rounded-2xl aurora-glass px-4 py-3">
            <div className="mb-2 flex items-center gap-3">
              <motion.button
                onClick={onFinish}
                className="grid size-9 place-items-center rounded-full border border-white/25 bg-white/10 text-[#d6e9ff] transition hover:bg-white/20"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
              >
                <X size={20} strokeWidth={2.5} />
              </motion.button>
              <div className="aurora-progress-track h-2 flex-1">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 shimmer-bar"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </div>
              <span className="text-xs font-bold text-[#cce1fb]">
                {currentIdx + 1}/{questions.length}
              </span>
            </div>
            {question.timeLimit && (
              <TimerBar timeLeft={timer.timeLeft} totalTime={timer.totalTime} />
            )}
          </div>
        </div>

        <div className="flex-1 px-4 pb-8 pt-2 md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={currentIdx + 1}
                totalQuestions={questions.length}
              >
                {question.answerFormat === 'multiple_choice' && question.options && (
                  <MultipleChoice
                    options={question.options}
                    selectedId={selectedAnswer}
                    correctId={correctAnswer}
                    disabled={selectedAnswer !== null}
                    onSelect={handleSelect}
                  />
                )}
              </QuestionCard>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Feedback overlay */}
      <FeedbackOverlay
        show={showFeedback}
        isCorrect={attempts[attempts.length - 1]?.isCorrect ?? false}
        xpEarned={lastXP}
        explanation={question.explanation}
        onContinue={handleContinue}
      />

      {/* Level up modal */}
      <LevelUpModal
        show={showLevelUp}
        level={newLevel}
        onClose={advance}
      />
    </div>
  )
}
