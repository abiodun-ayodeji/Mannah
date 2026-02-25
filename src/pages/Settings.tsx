import { motion, AnimatePresence } from 'framer-motion'
import { useUserProfile } from '../hooks/useUserProfile'
import { db } from '../db/database'
import { useState } from 'react'
import {
  AlertTriangle,
  Clock,
  Mic,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  User,
  Volume2,
} from 'lucide-react'

const expo = [0.16, 1, 0.3, 1] as const

/* ── Toggle Row ────────────────────────────────────────────── */
function ToggleRow({
  icon,
  iconColor,
  label,
  description,
  checked,
  onChange,
  delay = 0,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
  delay?: number
}) {
  return (
    <motion.label
      className="st-toggle-row flex items-center gap-3 rounded-xl px-4 py-3.5 cursor-pointer focus-within:ring-2 focus-within:ring-[#5b4cff]/40 focus-within:ring-offset-1"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: expo }}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${iconColor}18` }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="st-toggle-label text-sm font-bold">{label}</p>
        {description && (
          <p className="st-toggle-desc text-xs font-semibold mt-0.5">{description}</p>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle-switch"
      />
    </motion.label>
  )
}

/* ── Daily Goal Selector ───────────────────────────────────── */
function DailyGoalSelector({
  value,
  onChange,
  delay = 0,
}: {
  value: number
  onChange: (v: number) => void
  delay?: number
}) {
  const options = [10, 20, 30, 50]
  return (
    <motion.div
      className="st-goal-row flex items-center gap-3 rounded-xl px-4 py-3.5"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: expo }}
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(91, 76, 255, 0.12)' }}
      >
        <Target className="size-4 text-[#5b4cff]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="st-toggle-label text-sm font-bold">Daily Goal</p>
        <p className="st-toggle-desc text-xs font-semibold mt-0.5">Questions per day</p>
      </div>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`st-goal-chip rounded-lg px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4cff]/50 focus-visible:ring-offset-1 ${
              opt === value ? 'st-goal-chip-active' : ''
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Main Settings Page ────────────────────────────────────── */
export default function Settings() {
  const { profile, updateName, updateSettings } = useUserProfile()
  const [showReset, setShowReset] = useState(false)

  if (!profile) return null

  const handleReset = async () => {
    await db.attempts.clear()
    await db.sessions.clear()
    await db.dailyStats.clear()
    await db.topicMastery.clear()
    await db.streakState.clear()
    setShowReset(false)
  }

  const initial = (profile.name?.[0] ?? 'S').toUpperCase()

  return (
    <div className="aurora-page mx-auto max-w-3xl pb-24">

      {/* ── Header with avatar ── */}
      <motion.header
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: expo }}
      >
        <div className="st-header-avatar flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-black">
          {initial}
        </div>
        <div>
          <h1 className="aurora-page-title mt-0">Settings</h1>
          <p className="aurora-page-subtitle mt-0.5">Tune your daily routine, sound, and practice pace.</p>
        </div>
      </motion.header>

      {/* ── Profile Section ── */}
      <motion.section
        className="st-section mt-6 rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4, ease: expo }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="st-section-icon-wrap flex h-8 w-8 items-center justify-center rounded-lg">
            <User className="size-4 st-section-icon" />
          </span>
          <h2 className="st-section-title text-base font-extrabold">Profile</h2>
        </div>
        <div className="st-input-group rounded-xl px-4 py-3">
          <label className="st-field-label text-[10px] font-bold uppercase tracking-wider">Student Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateName(e.target.value)}
            className="aurora-input mt-1 focus-visible:ring-2 focus-visible:ring-[#5b4cff]/40"
            placeholder="Enter student name"
          />
        </div>
      </motion.section>

      {/* ── Preferences ── */}
      <motion.section
        className="st-section mt-4 rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: expo }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className="st-section-icon-wrap flex h-8 w-8 items-center justify-center rounded-lg">
            <Sliders className="size-4 st-section-icon" />
          </span>
          <h2 className="st-section-title text-base font-extrabold">Preferences</h2>
        </div>

        <div className="flex flex-col gap-2">
          <ToggleRow
            icon={<Volume2 className="size-4 text-[#F59E0B]" />}
            iconColor="#F59E0B"
            label="Sound Effects"
            checked={profile.settings.soundEnabled}
            onChange={(v) => updateSettings({ soundEnabled: v })}
            delay={0.14}
          />

          <ToggleRow
            icon={<Mic className="size-4 text-[#10B981]" />}
            iconColor="#10B981"
            label="Read Questions Aloud"
            description="Uses your device voice"
            checked={profile.settings.readAloudEnabled ?? false}
            onChange={(v) => updateSettings({ readAloudEnabled: v })}
            delay={0.18}
          />

          <ToggleRow
            icon={<Sparkles className="size-4 text-[#8B5CF6]" />}
            iconColor="#8B5CF6"
            label="Animations"
            checked={profile.settings.animationsEnabled}
            onChange={(v) => updateSettings({ animationsEnabled: v })}
            delay={0.22}
          />

          <ToggleRow
            icon={<Clock className="size-4 text-[#3B82F6]" />}
            iconColor="#3B82F6"
            label="Timer"
            description="Show countdown during quizzes"
            checked={profile.settings.timerEnabled}
            onChange={(v) => updateSettings({ timerEnabled: v })}
            delay={0.26}
          />

          <DailyGoalSelector
            value={profile.settings.dailyGoalQuestions}
            onChange={(v) => updateSettings({ dailyGoalQuestions: v })}
            delay={0.3}
          />
        </div>
      </motion.section>

      {/* ── Danger Zone ── */}
      <motion.section
        className="st-danger mt-4 rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4, ease: expo }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <span className="st-danger-icon-wrap flex h-8 w-8 items-center justify-center rounded-lg">
            <AlertTriangle className="size-4 text-rose-400" />
          </span>
          <h2 className="st-danger-title text-base font-extrabold">Danger Zone</h2>
        </div>

        <AnimatePresence mode="wait">
          {!showReset ? (
            <motion.button
              key="trigger"
              onClick={() => setShowReset(true)}
              className="st-danger-trigger flex items-center gap-3 rounded-xl px-4 py-3.5 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:ring-offset-1"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: expo }}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <Trash2 className="size-4 text-rose-400" />
              </span>
              <div>
                <p className="st-danger-label text-sm font-bold">Reset all progress</p>
                <p className="st-danger-desc text-xs font-semibold mt-0.5">Delete all XP, streaks, and quiz history</p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              className="st-danger-confirm flex flex-col gap-3 rounded-xl px-4 py-4"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: expo }}
            >
              <p className="st-danger-confirm-text text-sm font-semibold">
                This will permanently delete all progress, XP, and streaks. This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={handleReset}
                  className="st-danger-btn rounded-xl px-5 py-2.5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'tween', duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
                >
                  Yes, reset everything
                </motion.button>
                <motion.button
                  onClick={() => setShowReset(false)}
                  className="aurora-button-secondary rounded-xl px-5 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4cff]/40 focus-visible:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'tween', duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  )
}
