import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/database'
import { Subject, SUBJECT_CONFIG } from '../../types/subject'

const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const SUBJECT_ORB_COLORS: Record<Subject, { track: string; fill: string; glow: string }> = {
  [Subject.MATHS]:                { track: '#5b7fc9', fill: '#7fb1ff', glow: 'rgba(127,177,255,0.35)' },
  [Subject.ENGLISH]:              { track: '#429c8a', fill: '#67d6be', glow: 'rgba(103,214,190,0.35)' },
  [Subject.VERBAL_REASONING]:     { track: '#b85d93', fill: '#ff8ac8', glow: 'rgba(255,138,200,0.35)' },
  [Subject.NON_VERBAL_REASONING]: { track: '#b8864a', fill: '#ffd088', glow: 'rgba(255,208,136,0.35)' },
}

const BADGE_IDS: Record<Subject, string> = {
  [Subject.MATHS]: 'maths_fan',
  [Subject.ENGLISH]: 'bookworm',
  [Subject.VERBAL_REASONING]: 'word_warrior_badge',
  [Subject.NON_VERBAL_REASONING]: 'pattern_pro',
}

const SHORT_LABELS: Record<Subject, string> = {
  [Subject.MATHS]: 'Maths',
  [Subject.ENGLISH]: 'English',
  [Subject.VERBAL_REASONING]: 'Verbal',
  [Subject.NON_VERBAL_REASONING]: 'NVR',
}

export default function AchievementOrbs() {
  const navigate = useNavigate()

  const orbData = useLiveQuery(async () => {
    const attempts = await db.attempts.toArray()
    const achievements = await db.achievements.toArray()

    return Object.values(Subject).map((subject) => {
      const count = attempts.filter((attempt) => attempt.subject === subject).length
      const fill = Math.min(count / 50, 1)
      const unlocked = achievements.find((achievement) => achievement.id === BADGE_IDS[subject])?.unlockedAt != null
      return { subject, fill, unlocked, count }
    })
  }, [])

  if (!orbData) return null

  const hasAnyActivity = orbData.some((item) => item.count > 0)

  return (
    <div className="aurora-glass-soft rounded-3xl p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg border border-white/20 bg-white/10 text-sm text-[#d3e7ff]">
          🏅
        </div>
        <h2 className="aurora-heading text-lg font-black text-white">Subject Badges</h2>
        <button
          onClick={() => navigate('/achievements')}
          className="ml-auto rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#c8def9] transition hover:bg-white/15"
        >
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {orbData.map((orb, index) => {
          const colors = SUBJECT_ORB_COLORS[orb.subject]
          const icon = SUBJECT_CONFIG[orb.subject].icon
          const offset = CIRCUMFERENCE - orb.fill * CIRCUMFERENCE
          const isActive = orb.count > 0
          const isComplete = orb.unlocked

          return (
            <motion.div
              key={orb.subject}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.78 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className={`relative ${isComplete ? 'orb-complete' : ''}`}>
                <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={RADIUS}
                    fill="none"
                    stroke={isActive ? colors.track : '#415273'}
                    strokeWidth="5"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={RADIUS}
                    fill="none"
                    stroke={isActive ? colors.fill : '#607297'}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 + index * 0.06 }}
                  />
                </svg>

                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full text-xl"
                  style={{
                    background: isActive
                      ? `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                      : undefined,
                  }}
                >
                  <span style={{ filter: isActive ? undefined : 'grayscale(1)' }}>{icon}</span>
                  {isComplete && <span className="absolute -top-0.5 -right-0.5 text-xs">⭐</span>}
                </div>
              </div>

              <span className={`text-[11px] font-semibold ${isActive ? 'text-white' : 'text-[#8ea6cb]'}`}>
                {SHORT_LABELS[orb.subject]}
              </span>
              <span className="text-[10px] text-[#a5bee1]">{Math.min(orb.count, 50)}/50</span>
            </motion.div>
          )
        })}
      </div>

      {!hasAnyActivity && (
        <p className="mt-4 text-center text-xs font-semibold text-[#9db7dd]">
          Complete quizzes to light up your badges.
        </p>
      )}
    </div>
  )
}
