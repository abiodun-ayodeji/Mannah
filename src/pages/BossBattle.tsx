import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { track } from '@vercel/analytics'
import { getBossById } from '../gamification/boss-battle'
import { generateQuizQuestions } from '../engine/question-engine'
import { calculateXP } from '../gamification/xp-system'
import { recordActivity } from '../gamification/streak-system'
import { db } from '../db/database'
import { uniqueId } from '../utils/random'
import { useTimer } from '../hooks/useTimer'
import { useSound } from '../hooks/useSound'
import type { Question } from '../types/question'
import type { AttemptRecord, SessionRecord } from '../types/progress'
import QuestionCard from '../components/quiz/QuestionCard'
import MultipleChoice from '../components/quiz/MultipleChoice'

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

export default function BossBattlePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bossId = searchParams.get('boss')
  const boss = bossId ? getBossById(bossId) : null
  const { play } = useSound()

  const [phase, setPhase] = useState<'intro' | 'battle' | 'victory' | 'defeat'>('intro')
  const [questions, setQuestions] = useState<Question[]>(() =>
    boss ? generateQuizQuestions(boss.topics, boss.questionCount, boss.difficulty) : []
  )
  const [currentIdx, setCurrentIdx] = useState(0)
  const [bossHP, setBossHP] = useState(boss?.totalHP ?? 100)
  const [playerHP, setPlayerHP] = useState(100)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [showDamage, setShowDamage] = useState<'boss' | 'player' | null>(null)
  const [totalXP, setTotalXP] = useState(0)
  const [sessionId] = useState(() => `boss-${uniqueId()}`)
  const startTimeRef = useRef<number | null>(null)

  const timer = useTimer(30)

  useEffect(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
  }, [])

  // Save session record when boss battle ends
  useEffect(() => {
    if ((phase !== 'victory' && phase !== 'defeat') || !boss) return

    db.attempts.where('sessionId').equals(sessionId).toArray().then((sessionAttempts) => {
      if (sessionAttempts.length === 0) return

      const correctCount = sessionAttempts.filter((a) => a.isCorrect).length
      const record: SessionRecord = {
        id: sessionId,
        userId: 'default',
        type: 'boss_battle',
        subject: boss.subject,
        topics: boss.topics,
        startTime: startTimeRef.current ?? Date.now(),
        endTime: Date.now(),
        totalQuestions: sessionAttempts.length,
        correctAnswers: correctCount,
        accuracy: sessionAttempts.length > 0 ? correctCount / sessionAttempts.length : 0,
        xpEarned: totalXP + (phase === 'victory' ? boss.xpReward : 0),
        difficulty: boss.difficulty,
      }
      db.sessions.put(record)
    })
  }, [phase, boss, sessionId, totalXP])

  useEffect(() => {
    if (phase === 'intro') {
      play('bossIntro')
    }
  }, [phase, play])

  const startBattle = () => {
    setPhase('battle')
    timer.start()
  }

  const handleSelect = useCallback(async (optionId: string) => {
    if (selectedAnswer !== null || !boss) return

    timer.stop()
    const timeTaken = timer.getElapsed()
    setSelectedAnswer(optionId)

    const question = questions[currentIdx]

    // correctAnswer may be an option ID or an answer label -- handle both patterns
    const rawCorrect = typeof question.correctAnswer === 'string'
      ? question.correctAnswer
      : question.correctAnswer[0]

    // First try matching as option ID, then fall back to label match
    let correctOpt = question.options?.find((o) => o.id === rawCorrect)
    if (!correctOpt) {
      correctOpt = question.options?.find((o) => o.label === rawCorrect)
    }
    const correctId = correctOpt?.id ?? rawCorrect
    setCorrectAnswer(correctId)

    const isCorrect = optionId === correctId

    if (isCorrect) {
      play('correct')
      const newHP = Math.max(0, bossHP - boss.damagePerCorrect)
      setBossHP(newHP)
      setShowDamage('boss')

      if (newHP <= 0) {
        track('boss_battle_victory', { boss: boss.name, xp_earned: totalXP + boss.xpReward, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
        setTimeout(() => setPhase('victory'), 1000)
      }
    } else {
      play('wrong')
      const newPlayerHP = Math.max(0, playerHP - 15)
      setPlayerHP(newPlayerHP)
      setShowDamage('player')

      if (newPlayerHP <= 0) {
        track('boss_battle_defeat', { boss: boss.name, xp_earned: totalXP, session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
        setTimeout(() => setPhase('defeat'), 1000)
      }
    }

    const xp = calculateXP({
      difficulty: question.difficulty,
      isCorrect,
      timeTaken,
      timeLimit: 30,
      sessionStreak: 0,
    })
    setTotalXP((prev) => prev + xp)

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
    await recordActivity()

    // Move to next question after delay
    setTimeout(() => {
      setShowDamage(null)
      setSelectedAnswer(null)
      setCorrectAnswer(null)
      if (bossHP - (isCorrect ? boss.damagePerCorrect : 0) > 0 && playerHP - (isCorrect ? 0 : 15) > 0) {
        if (currentIdx + 1 < questions.length) {
          setCurrentIdx((prev) => prev + 1)
          timer.start()
        } else {
          // Ran out of questions -- boss survives
          track('boss_battle_defeat', { boss: boss.name, xp_earned: totalXP, reason: 'out_of_questions', session_id: sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown' })
          setPhase('defeat')
        }
      }
    }, 1500)
  }, [selectedAnswer, boss, bossHP, playerHP, currentIdx, questions, timer, play, sessionId, totalXP])

  if (!boss) {
    return (
      <div className="aurora-flow flex min-h-screen items-center justify-center">
        <p className="rounded-2xl aurora-card px-6 py-4 text-sm font-bold text-[#d2e8ff]">Boss not found</p>
      </div>
    )
  }

  // INTRO SCREEN
  if (phase === 'intro') {
    return (
      <div className="aurora-flow relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
        {/* Decorative gradient overlays (no backdrop-blur, just bg blurs) */}
        <div className="aurora-orb aurora-orb-cyan top-[-170px] right-[-130px] h-[420px] w-[420px]" />
        <div className="aurora-orb aurora-orb-violet bottom-[-180px] left-[-140px] h-[430px] w-[430px]" />

        <motion.div
          className="text-8xl mb-6 drop-shadow-[0_0_40px_rgba(99,102,241,0.6)] relative z-10"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {boss.emoji}
        </motion.div>
        <motion.h1
          className="text-3xl font-semibold text-white mb-2 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {boss.name}
        </motion.h1>
        <motion.p
          className="text-white/60 text-sm mb-8 max-w-xs relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {boss.description}
        </motion.p>
        <div className="mb-8 flex gap-4 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-xs text-white/75 relative z-10">
          <span>❤️ {boss.totalHP} HP</span>
          <span>❓ {boss.questionCount} Questions</span>
          <span>⭐ +{boss.xpReward} XP</span>
        </div>
        <motion.button
          onClick={startBattle}
          className="rounded-full border border-rose-100/45 bg-gradient-to-r from-rose-200 to-red-300 px-10 py-4 text-lg font-extrabold text-[#4f1022] relative z-10"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ⚔️ Fight!
        </motion.button>
        <button
          onClick={() => navigate(-1)}
          className="text-white/40 mt-4 text-sm hover:text-white/60 transition-colors relative z-10"
        >
          <ChevronLeft className="size-4 inline mr-1" />
          Back
        </button>
      </div>
    )
  }

  // VICTORY SCREEN
  if (phase === 'victory') {
    return (
      <div className="aurora-flow relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
        {/* Confetti burst */}
        <ConfettiBurst />

        {/* Decorative gradient overlays */}
        <div className="aurora-orb aurora-orb-cyan top-[-150px] right-[-130px] h-[420px] w-[420px]" />
        <div className="aurora-orb aurora-orb-violet bottom-[-180px] left-[-140px] h-[430px] w-[430px]" />

        <motion.div
          className="text-6xl mb-6 relative z-10"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
          transition={{ duration: 1 }}
        >
          🏆
        </motion.div>
        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-cyan-100/25 aurora-card px-8 py-8">
          <h1 className="mb-2 text-3xl font-semibold gradient-text">Victory!</h1>
          <p className="mb-4 text-[#bfd9f7]">You conquered {boss.name} like David toppled Goliath!</p>
          <div className="mb-6 inline-block rounded-xl border border-cyan-100/25 bg-cyan-200/10 px-6 py-3">
            <span className="text-lg font-semibold text-cyan-100">+{totalXP + boss.xpReward} XP</span>
          </div>
          <div>
            <motion.button
              onClick={() => navigate('/')}
              className="aurora-button-primary w-full px-8 py-3.5 text-base font-black"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Session Complete — Go Home
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // DEFEAT SCREEN
  if (phase === 'defeat') {
    return (
      <div className="aurora-flow relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
        {/* Decorative gradient overlay */}
        <div className="aurora-orb aurora-orb-violet top-[-150px] right-[-140px] h-[420px] w-[420px]" />
        <div className="aurora-orb aurora-orb-cyan bottom-[-180px] left-[-120px] h-[430px] w-[430px]" />

        <motion.div
          className="text-6xl mb-6 relative z-10"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {boss.emoji}
        </motion.div>
        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-cyan-100/25 aurora-card px-8 py-8">
          <h1 className="mb-2 text-3xl font-semibold text-white">Oopsy!</h1>
          <p className="mb-2 text-[#bfd9f7]">Nice try! {boss.name} got the better of you this time...</p>
          <p className="mb-6 text-sm text-[#bfd9f7]">Even Moses took 40 years, rise up and try again!</p>
          <div className="mb-6 inline-block rounded-xl border border-cyan-100/25 bg-cyan-200/10 px-6 py-3">
            <span className="text-sm font-semibold text-cyan-100">+{totalXP} XP earned</span>
          </div>
          <div className="flex gap-3 justify-center">
            <motion.button
              onClick={() => {
                setPhase('intro')
                setCurrentIdx(0)
                setBossHP(boss.totalHP)
                setPlayerHP(100)
                setTotalXP(0)
                const qs = generateQuizQuestions(boss.topics, boss.questionCount, boss.difficulty)
                setQuestions(qs)
              }}
              className="aurora-button-primary px-8 py-3.5 text-base font-black"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Retry
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="aurora-button-secondary px-8 py-3.5 text-base font-bold"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Go Home
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // BATTLE SCREEN
  const question = questions[currentIdx]
  if (!question) return null

  const bossHPPct = (bossHP / boss.totalHP) * 100
  const playerHPPct = playerHP

  return (
    <div className="aurora-flow relative min-h-screen overflow-hidden">
      <div className="aurora-orb aurora-orb-cyan top-[-180px] right-[-120px] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-170px] left-[-140px] h-[430px] w-[430px]" />

      {/* Boss and Player HP bars */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="sticky top-0 z-20 px-4 pt-4 md:px-6">
          <div className="mx-auto w-full max-w-4xl rounded-2xl aurora-glass px-4 py-3">
            <div className="relative mb-2 flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={showDamage === 'boss' ? { x: [0, -5, 5, -5, 0], scale: [1, 0.8, 1] } : {}}
              >
                {boss.emoji}
              </motion.span>
              {/* Floating damage on boss */}
              <AnimatePresence>
                {showDamage === 'boss' && (
                  <motion.span
                    className="float-damage absolute left-6 -top-3 text-danger text-sm font-bold"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    -{boss.damagePerCorrect}
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex-1">
                <div className="mb-0.5 text-xs font-semibold text-[#e7f4ff]">{boss.name}</div>
                <div className="aurora-progress-track h-2 glow-danger">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-300 to-red-400 shimmer-bar"
                    animate={{ width: `${bossHPPct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-100">
                {bossHP}/{boss.totalHP}
              </span>
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-2xl">🦸</span>
              {/* Floating damage on player */}
              <AnimatePresence>
                {showDamage === 'player' && (
                  <motion.span
                    className="float-damage absolute left-6 -top-3 text-danger text-sm font-bold"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    -15
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex-1">
                <div className="mb-0.5 text-xs font-semibold text-[#e7f4ff]">You</div>
                <div className="aurora-progress-track h-2 glow-success">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 shimmer-bar"
                    animate={{ width: `${playerHPPct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-100">{playerHP}/100</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 px-4 pb-8 pt-4 md:px-6">
          <div className="mx-auto w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={currentIdx + 1}
                totalQuestions={questions.length}
              >
                {question.options && (
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
    </div>
  )
}
