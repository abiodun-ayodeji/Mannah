import { motion } from 'framer-motion'
import { useUserProfile } from '../hooks/useUserProfile'
import { db } from '../db/database'
import { useState } from 'react'

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
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-8">
      <header className="mt-1">
        <span className="aurora-kicker">Control Room</span>
        <h1 className="aurora-page-title mt-3">Settings</h1>
        <p className="aurora-page-subtitle">Tune your daily routine, sound, and practice pace.</p>
      </header>

      <motion.section
        className="aurora-card p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-extrabold text-white">Profile</h2>
        <div className="mt-4">
          <label className="aurora-field-label">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateName(e.target.value)}
            className="aurora-input"
            placeholder="Student name"
          />
        </div>
      </motion.section>

      <motion.section
        className="aurora-card-soft p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <h2 className="text-lg font-extrabold text-white">Preferences</h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="aurora-subtle flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-sm font-bold text-[#eaf6ff]">Sound Effects</span>
            <input
              type="checkbox"
              checked={profile.settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <label className="aurora-subtle flex items-center justify-between rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#eaf6ff]">Read Questions Aloud</p>
              <p className="text-xs font-semibold text-[#9dbee5]">Uses your device voice</p>
            </div>
            <input
              type="checkbox"
              checked={profile.settings.readAloudEnabled ?? false}
              onChange={(e) => updateSettings({ readAloudEnabled: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <label className="aurora-subtle flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-sm font-bold text-[#eaf6ff]">Animations</span>
            <input
              type="checkbox"
              checked={profile.settings.animationsEnabled}
              onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <label className="aurora-subtle flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-sm font-bold text-[#eaf6ff]">Timer</span>
            <input
              type="checkbox"
              checked={profile.settings.timerEnabled}
              onChange={(e) => updateSettings({ timerEnabled: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <div className="aurora-subtle rounded-xl px-4 py-3">
            <label className="aurora-field-label">Daily Goal (questions)</label>
            <select
              value={profile.settings.dailyGoalQuestions}
              onChange={(e) =>
                updateSettings({ dailyGoalQuestions: parseInt(e.target.value, 10) })
              }
              className="aurora-select"
            >
              <option value="10">10 questions</option>
              <option value="20">20 questions</option>
              <option value="30">30 questions</option>
              <option value="50">50 questions</option>
            </select>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="aurora-danger-zone rounded-2xl p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <h2 className="text-lg font-extrabold text-rose-100">Danger Zone</h2>
        {!showReset ? (
          <motion.button
            onClick={() => setShowReset(true)}
            className="mt-2 text-sm font-bold text-rose-200 underline underline-offset-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reset all progress
          </motion.button>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-rose-100/90">
              This will delete all progress, XP, and streaks. You cannot undo this.
            </p>
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={handleReset}
                className="rounded-full border border-rose-100/45 bg-gradient-to-r from-rose-200 to-red-300 px-4 py-2 text-sm font-black text-[#4f1022]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Yes, reset everything
              </motion.button>
              <motion.button
                onClick={() => setShowReset(false)}
                className="aurora-button-secondary px-4 py-2 text-sm font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </motion.section>
    </div>
  )
}
