import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { getAllBosses } from '../gamification/boss-battle'
import { SUBJECT_CONFIG } from '../types/subject'

export default function BossList() {
  const navigate = useNavigate()
  const bosses = getAllBosses()

  return (
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-24 md:pb-28">
      {/* Header */}
      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="size-5 text-[#def0ff]" />
        </button>
        <h1 className="text-xl font-extrabold text-[#edf8ff]">Boss Battles</h1>
      </div>

      {/* Dark gradient hero banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#5b4cff]/30 to-[#2a4d9d]/24 p-6 text-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Subtle white blur overlay inside hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="text-3xl mb-2">⚔️</div>
          <h2 className="text-xl font-semibold mb-1">Challenge the Bosses!</h2>
          <p className="text-white/70 text-sm">
            Answer questions to deal damage. Get one wrong and the boss fights back!
          </p>
        </div>
      </motion.div>

      {/* Boss cards */}
      <div className="flex flex-col gap-4">
        {bosses.map((boss, idx) => (
          <motion.button
            key={boss.id}
            onClick={() => navigate(`/boss-battle?boss=${boss.id}`)}
            className="rounded-xl border border-white/20 bg-white/10 p-6 text-left transition-all card-hover hover:border-cyan-200/40 hover:bg-white/15"
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="text-4xl"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: idx * 0.5 }}
              >
                {boss.emoji}
              </motion.span>
              <div className="flex-1">
                <h3 className="font-semibold text-[#edf8ff]">{boss.name}</h3>
                <p className="mt-0.5 text-xs text-[#aac9ea]">{boss.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span>{SUBJECT_CONFIG[boss.subject].icon}</span>
                  <span className="text-[#aac9ea]">{SUBJECT_CONFIG[boss.subject].label}</span>
                  <span className="text-[#aac9ea]">•</span>
                  <span className="font-semibold text-rose-200">❤️ {boss.totalHP} HP</span>
                  <span className="text-[#aac9ea]">•</span>
                  <span className="font-semibold text-cyan-100">+{boss.xpReward} XP</span>
                </div>
              </div>
              <ArrowRight className="size-4 text-[#aac9ea]" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
