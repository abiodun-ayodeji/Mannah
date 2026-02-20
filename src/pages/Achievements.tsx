import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { initializeAchievements, ACHIEVEMENT_DEFINITIONS } from '../gamification/achievement-system'
import AchievementOrbs from '../components/gamification/AchievementOrbs'

export default function AchievementsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    initializeAchievements()
  }, [])

  const achievements = useLiveQuery(() => db.achievements.toArray(), [])

  if (!achievements) return null

  // Use definitions + merge any unlocked state from DB
  const enriched = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const dbRecord = achievements.find((a) => a.id === def.id)
    return {
      ...def,
      unlockedAt: dbRecord?.unlockedAt,
    }
  })

  const unlocked = enriched.filter((a) => a.unlockedAt)
  const locked = enriched.filter((a) => !a.unlockedAt)

  const categories = ['volume', 'mastery', 'streak', 'speed', 'exploration', 'special'] as const
  const categoryLabels: Record<string, string> = {
    volume: '📈 Volume',
    mastery: '🎯 Mastery',
    streak: '🔥 Streaks',
    speed: '⚡ Speed',
    exploration: '🗺️ Exploration',
    special: '✨ Special',
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-2">
        <button
          onClick={() => navigate('/')}
          className="size-10 rounded-xl bg-[#f4f5f7] hover:bg-accent flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="size-5 text-[#0f1419]" />
        </button>
        <h1 className="text-xl font-semibold text-[#0f1419]">Achievements</h1>
        <span className="ml-auto bg-[#f4f5f7] text-sm font-semibold px-3 py-1 rounded-full gradient-text">
          {unlocked.length}/{enriched.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#f4f5f7] rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-primary rounded-full shimmer-bar"
          animate={{ width: `${(unlocked.length / enriched.length) * 100}%` }}
        />
      </div>

      {/* Subject Badge Orbs */}
      <AchievementOrbs />

      {categories.map((cat) => {
        const catAchievements = enriched.filter((a) => a.category === cat)
        if (catAchievements.length === 0) return null

        return (
          <div key={cat} className="mb-8">
            <h2 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide mb-3">
              {categoryLabels[cat]}
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {catAchievements.map((a, idx) => (
                <motion.div
                  key={a.id}
                  className={`flex flex-col items-center text-center p-4 rounded-xl transition-all ${
                    a.unlockedAt
                      ? 'bg-white border border-primary/20 shadow-sm hover:shadow-md hover:border-primary/30 pulse-badge'
                      : 'bg-[#f4f5f7] opacity-50'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: a.unlockedAt ? 1 : 0.5, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={a.unlockedAt ? { scale: 1.08 } : undefined}
                >
                  <span className={`text-3xl mb-1.5 ${a.unlockedAt ? '' : 'grayscale'}`}>
                    {a.unlockedAt ? a.icon : '🔒'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#0f1419] leading-tight">
                    {a.name}
                  </span>
                  <span className="text-[9px] text-[#6b7280] mt-0.5">
                    {a.unlockedAt ? `+${a.xpReward} XP` : a.description}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
