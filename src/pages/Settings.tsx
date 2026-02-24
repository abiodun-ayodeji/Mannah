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

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } }

/* ── Toggle Row ────────────────────────────────────────────── */
function ToggleRow({
  icon,
  iconColor,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="st-toggle-row flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${iconColor}15` }}
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
    </label>
  )
}

/* ── Daily Goal Selector ───────────────────────────────────── */
function DailyGoalSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const options = [10, 20, 30, 50]
  return (
    <div className="st-goal-row flex items-center gap-3 rounded-xl px-4 py-3">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
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
            className={`st-goal-chip rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              opt === value ? 'st-goal-chip-active' : ''
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
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

  return (
    <div className="aurora-page mx-auto max-w-3xl pb-24">

      {/* ── Header ── */}
      <motion.header {...fadeUp}>
        <h1 className="aurora-page-title mt-1">Settings</h1>
        <p className="aurora-page-subtitle">Tune your daily routine, sound, and practice pace.</p>
      </motion.header>

      {/* ── Profile Section ── */}
      <motion.section
        className="st-section mt-5 rounded-2xl p-5"
        {...fadeUp}
        transition={{ delay: 0.04 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="size-4 st-section-icon" />
          <h2 className="st-section-title text-base font-extrabold">Profile</h2>
        </div>
        <div className="st-input-group rounded-xl px-4 py-3">
          <label className="st-field-label text-[10px] font-bold uppercase tracking-wider">Student Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateName(e.target.value)}
            className="aurora-input mt-1"
            placeholder="Enter student name"
          />
        </div>
      </motion.section>

      {/* ── Preferences ── */}
      <motion.section
        className="st-section mt-5 rounded-2xl p-5"
        {...fadeUp}
        transition={{ delay: 0.08 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="size-4 st-section-icon" />
          <h2 className="st-section-title text-base font-extrabold">Preferences</h2>
        </div>

        <div className="flex flex-col gap-2">
          <ToggleRow
            icon={<Volume2 className="size-4 text-[#F59E0B]" />}
            iconColor="#F59E0B"
            label="Sound Effects"
            checked={profile.settings.soundEnabled}
            onChange={(v) => updateSettings({ soundEnabled: v })}
          />

          <ToggleRow
            icon={<Mic className="size-4 text-[#10B981]" />}
            iconColor="#10B981"
            label="Read Questions Aloud"
            description="Uses your device voice"
            checked={profile.settings.readAloudEnabled ?? false}
            onChange={(v) => updateSettings({ readAloudEnabled: v })}
          />

          <ToggleRow
            icon={<Sparkles className="size-4 text-[#8B5CF6]" />}
            iconColor="#8B5CF6"
            label="Animations"
            checked={profile.settings.animationsEnabled}
            onChange={(v) => updateSettings({ animationsEnabled: v })}
          />

          <ToggleRow
            icon={<Clock className="size-4 text-[#3B82F6]" />}
            iconColor="#3B82F6"
            label="Timer"
            description="Show countdown during quizzes"
            checked={profile.settings.timerEnabled}
            onChange={(v) => updateSettings({ timerEnabled: v })}
          />

          <DailyGoalSelector
            value={profile.settings.dailyGoalQuestions}
            onChange={(v) => updateSettings({ dailyGoalQuestions: v })}
          />
        </div>
      </motion.section>

      {/* ── Danger Zone ── */}
      <motion.section
        className="st-danger mt-5 rounded-2xl p-5"
        {...fadeUp}
        transition={{ delay: 0.12 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-rose-400" />
          <h2 className="st-danger-title text-base font-extrabold">Danger Zone</h2>
        </div>

        <AnimatePresence mode="wait">
          {!showReset ? (
            <motion.button
              key="trigger"
              onClick={() => setShowReset(true)}
              className="st-danger-trigger flex items-center gap-2 rounded-xl px-4 py-3 text-left w-full"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Trash2 className="size-4 flex-shrink-0 text-rose-400" />
              <div>
                <p className="st-danger-label text-sm font-bold">Reset all progress</p>
                <p className="st-danger-desc text-xs font-semibold">Delete all XP, streaks, and quiz history</p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              className="st-danger-confirm flex flex-col gap-3 rounded-xl px-4 py-4"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="st-danger-confirm-text text-sm font-semibold">
                This will permanently delete all progress, XP, and streaks. This action cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={handleReset}
                  className="st-danger-btn rounded-xl px-4 py-2.5 text-sm font-black"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Yes, reset everything
                </motion.button>
                <motion.button
                  onClick={() => setShowReset(false)}
                  className="aurora-button-secondary rounded-xl px-4 py-2.5 text-sm font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
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
