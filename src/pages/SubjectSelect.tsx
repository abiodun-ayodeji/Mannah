import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Rocket, Lock, Check } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Subject, SUBJECT_CONFIG, TOPIC_LABELS } from '../types/subject'
import type { Topic } from '../types/subject'
import { getAvailableTopics } from '../engine/question-engine'

const SUBJECT_COLORS: Record<Subject, { main: string; glow: string; track: string }> = {
  [Subject.MATHS]: { main: '#4f46e5', glow: 'rgba(79,70,229,0.4)', track: '#c7d2fe' },
  [Subject.ENGLISH]: { main: '#10b981', glow: 'rgba(16,185,129,0.4)', track: '#a7f3d0' },
  [Subject.VERBAL_REASONING]: { main: '#ec4899', glow: 'rgba(236,72,153,0.4)', track: '#fecdd3' },
  [Subject.NON_VERBAL_REASONING]: { main: '#f59e0b', glow: 'rgba(245,158,11,0.4)', track: '#fde68a' },
}

type NodeState = 'coming_soon' | 'not_started' | 'in_progress' | 'completed'

interface TopicNode {
  topic: Topic
  label: string
  state: NodeState
  attempts: number
  accuracy: number
  playable: boolean
}

function generateStars(count: number) {
  const stars: { left: string; top: string; size: number; delay: string; dur: string }[] = []
  let seed = 42
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: rand() * 2 + 1,
      delay: `${rand() * 4}s`,
      dur: `${2 + rand() * 3}s`,
    })
  }
  return stars
}

const STARS = generateStars(80)

function getNodePosition(index: number) {
  const columns = [18, 50, 82]
  const row = Math.floor(index / 3)
  const indexInRow = index % 3
  const col = row % 2 === 0 ? indexInRow : 2 - indexInRow

  return {
    x: columns[col],
    y: 210 + row * 170,
  }
}

function getNextTopic(nodes: TopicNode[]) {
  const inProgress = nodes.find((node) => node.playable && node.state === 'in_progress')
  if (inProgress) return inProgress

  const notStarted = nodes.find((node) => node.playable && node.state === 'not_started')
  if (notStarted) return notStarted

  return nodes.find((node) => node.playable) ?? null
}

export default function SubjectSelect() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()

  const validSubject = useMemo(
    () =>
      subjectId && (Object.values(Subject) as string[]).includes(subjectId)
        ? (subjectId as Subject)
        : null,
    [subjectId]
  )

  useEffect(() => {
    if (!validSubject) {
      navigate('/')
    }
  }, [validSubject, navigate])

  const subject = validSubject ?? Subject.MATHS
  const config = SUBJECT_CONFIG[subject]
  const colors = SUBJECT_COLORS[subject]
  const playableTopics = useMemo(() => new Set(getAvailableTopics(subject)), [subject])

  const topicStats = useLiveQuery(async () => {
    const attempts = await db.attempts.where('subject').equals(subject).toArray()
    const map: Record<string, { count: number; correct: number }> = {}
    for (const attempt of attempts) {
      if (!attempt.topic) continue
      if (!map[attempt.topic]) map[attempt.topic] = { count: 0, correct: 0 }
      map[attempt.topic].count += 1
      if (attempt.isCorrect) map[attempt.topic].correct += 1
    }
    return map
  }, [subject])

  const nodes = useMemo<TopicNode[]>(() => {
    return config.topics.map((topic) => {
      const stats = topicStats?.[topic] ?? { count: 0, correct: 0 }
      const playable = playableTopics.has(topic)
      const accuracy = stats.count > 0 ? stats.correct / stats.count : 0

      let state: NodeState = 'not_started'
      if (!playable) {
        state = 'coming_soon'
      } else if (stats.count > 0) {
        state = stats.count >= 5 && accuracy >= 0.7 ? 'completed' : 'in_progress'
      }

      return {
        topic,
        label: TOPIC_LABELS[topic] ?? topic,
        state,
        attempts: stats.count,
        accuracy,
        playable,
      }
    })
  }, [config.topics, topicStats, playableTopics])

  const playableCount = nodes.filter((node) => node.playable).length
  const completedCount = nodes.filter((node) => node.state === 'completed').length
  const nextTopic = getNextTopic(nodes)
  const frontierIndex =
    nextTopic !== null ? nodes.findIndex((node) => node.topic === nextTopic.topic) : -1

  const totalRows = Math.ceil(nodes.length / 3)
  const totalHeight = 220 + totalRows * 170

  const startQuiz = (topic: Topic) => {
    if (!playableTopics.has(topic)) return
    const params = new URLSearchParams({
      subject,
      count: '10',
      difficulty: '2',
      topic,
    })
    navigate(`/quiz?${params}`)
  }

  const startAllQuiz = () => {
    const params = new URLSearchParams({
      subject,
      count: '10',
      difficulty: '2',
    })
    navigate(`/quiz?${params}`)
  }

  if (!validSubject) return null

  if (!topicStats) {
    return (
      <div className="space-bg -mx-4 -mt-4 flex min-h-screen items-center justify-center md:-mx-8">
        <div className="rocket-float text-4xl">🚀</div>
      </div>
    )
  }

  return (
    <div className="space-bg -mx-4 -mt-4 relative min-h-screen overflow-hidden md:-mx-8">
      {STARS.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            ['--dur' as string]: star.dur,
          }}
        />
      ))}

      <div className="relative z-10 px-4 pb-4 pt-6 md:px-8">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-5 text-white" />
          </button>
          <span className="text-3xl">{config.icon}</span>
          <h1 className="text-xl font-bold text-white">{config.label}</h1>
          <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            {completedCount}/{playableCount} mastered
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <motion.button
            onClick={() => nextTopic && startQuiz(nextTopic.topic)}
            disabled={!nextTopic}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/18 py-3.5 text-sm font-bold text-white transition-all shadow-md backdrop-blur-sm disabled:opacity-55"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Rocket className="size-4" />
            Continue Constellation
          </motion.button>
          <motion.button
            onClick={startAllQuiz}
            className="flex-1 rounded-full py-3.5 text-sm font-bold text-white shadow-md transition-all"
            style={{ background: colors.main }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Practice All Available Topics
          </motion.button>
        </div>
      </div>

      <div className="relative px-4 md:px-8" style={{ height: totalHeight }}>
        <svg
          className="absolute inset-0 w-full"
          style={{ height: totalHeight }}
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {nodes.map((node, i) => {
            if (i === 0) return null
            const prev = getNodePosition(i - 1)
            const curr = getNodePosition(i)
            const prevNode = nodes[i - 1]
            const lineColor =
              prevNode.state === 'completed'
                ? colors.main
                : prevNode.playable
                  ? 'rgba(255,255,255,0.22)'
                  : 'rgba(255,255,255,0.12)'
            return (
              <line
                key={`line-${node.topic}`}
                x1={`${prev.x}%`}
                y1={prev.y}
                x2={`${curr.x}%`}
                y2={curr.y}
                stroke={lineColor}
                strokeWidth="0.45"
                strokeDasharray="2 2"
                className={prevNode.state === 'completed' ? 'constellation-line' : ''}
              />
            )
          })}
        </svg>

        {nodes.map((node, i) => {
          const pos = getNodePosition(i)
          const isFrontier = i === frontierIndex

          return (
            <motion.div
              key={node.topic}
              className="absolute flex flex-col items-center"
              style={{
                left: `${pos.x}%`,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 22 }}
            >
              {isFrontier && node.playable && (
                <motion.div
                  className="rocket-float absolute -top-10 z-10 text-2xl"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  🚀
                </motion.div>
              )}

              <motion.button
                onClick={() => startQuiz(node.topic)}
                disabled={!node.playable}
                className="relative flex items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-80"
                style={{
                  width: 64,
                  height: 64,
                  ['--glow' as string]: colors.glow,
                }}
                whileHover={node.playable ? { scale: 1.12 } : undefined}
                whileTap={node.playable ? { scale: 0.93 } : undefined}
              >
                <svg width="64" height="64" viewBox="0 0 64 64" className="absolute -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={
                      !node.playable
                        ? 'rgba(255,255,255,0.24)'
                        : node.state === 'completed'
                          ? '#10b981'
                          : colors.track
                    }
                    strokeWidth="3"
                  />
                  {node.playable && node.state !== 'not_started' && (
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={node.state === 'completed' ? '#10b981' : colors.main}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 28}
                      initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 28 * (1 - (node.state === 'completed' ? 1 : node.accuracy)),
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                    />
                  )}
                </svg>

                <div
                  className={`relative flex size-12 items-center justify-center rounded-full text-lg font-bold transition-all ${
                    !node.playable
                      ? 'border border-dashed border-white/25 bg-white/8'
                      : node.state === 'not_started'
                        ? 'border border-white/25 bg-white/10'
                        : node.state === 'completed'
                          ? 'node-glow border-2 border-emerald-400 bg-emerald-500/20'
                          : 'node-glow border-2'
                  }`}
                  style={
                    node.state === 'in_progress'
                      ? { background: `${colors.main}20`, borderColor: colors.main }
                      : node.state === 'completed'
                        ? { ['--glow' as string]: 'rgba(16,185,129,0.4)' }
                        : undefined
                  }
                >
                  {!node.playable ? (
                    <Lock className="size-4 text-white/60" />
                  ) : node.state === 'not_started' ? (
                    <span className="text-xs font-black text-white">GO</span>
                  ) : node.state === 'completed' ? (
                    <Check className="size-5 text-emerald-400" strokeWidth={3} />
                  ) : (
                    <span className="text-sm text-white">{Math.round(node.accuracy * 100)}%</span>
                  )}

                  {node.state === 'completed' && (
                    <span className="absolute -right-1 -top-1 text-xs">⭐</span>
                  )}
                </div>
              </motion.button>

              <span
                className={`mt-2 max-w-[90px] text-center text-[11px] font-semibold leading-tight ${
                  node.playable ? 'text-white' : 'text-white/60'
                }`}
              >
                {node.label}
              </span>

              <span className="mt-0.5 text-[9px] text-white/60">
                {!node.playable
                  ? 'Coming soon'
                  : node.attempts > 0
                    ? `${node.attempts} attempt${node.attempts !== 1 ? 's' : ''}`
                    : 'New'}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="h-24" />
    </div>
  )
}
