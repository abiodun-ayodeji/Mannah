import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/database'
import { migrateLegacyDB } from './db/migrate-legacy'
import { initializeAchievements, checkAndUnlockAchievements } from './gamification/achievement-system'
import type { Achievement } from './types/gamification'
import { useDevAnalytics } from './hooks/useDevAnalytics'
import AppShell from './components/layout/AppShell'
import AchievementToast from './components/gamification/AchievementToast'
import InstallPrompt from './components/InstallPrompt'
import OfflineBanner from './components/OfflineBanner'
import UpdatePrompt from './components/UpdatePrompt'
import Home from './pages/Home'
import SubjectSelect from './pages/SubjectSelect'
import TopicSelect from './pages/TopicSelect'
import QuizPage from './pages/QuizPage'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import DailyChallengePage from './pages/DailyChallenge'
import BossList from './pages/BossList'
import BossBattlePage from './pages/BossBattle'
import AchievementsPage from './pages/Achievements'
import ParentDashboard from './pages/ParentDashboard'
import Onboarding from './pages/Onboarding'
import Landing from './pages/Landing'

export default function App() {
  const [appPhase, setAppPhase] = useState<'loading' | 'landing' | 'onboarding' | 'app'>('loading')
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null)
  const [splashDone, setSplashDone] = useState(false)
  const [migrated, setMigrated] = useState(false)

  useDevAnalytics()

  useEffect(() => {
    migrateLegacyDB().then(() => setMigrated(true))
  }, [])

  const profileResult = useLiveQuery(async () => {
    if (!migrated) return undefined
    const data = await db.userProfile.get('default')
    return { data }
  }, [migrated])

  useEffect(() => {
    if (profileResult === undefined) return
    if (!profileResult.data) {
      setAppPhase('landing')
    } else {
      setAppPhase('app')
    }
  }, [profileResult])

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    initializeAchievements()
  }, [])

  const attemptCount = useLiveQuery(() => db.attempts.count(), [])
  useEffect(() => {
    if (attemptCount != null && attemptCount > 0) {
      checkAndUnlockAchievements().then((newlyUnlocked) => {
        if (newlyUnlocked.length > 0) {
          setAchievementToast(newlyUnlocked[0])
          setTimeout(() => setAchievementToast(null), 4000)
        }
      })
    }
  }, [attemptCount])

  if (appPhase === 'loading' || !splashDone) {
    return (
      <div className="aurora-flow min-h-screen relative overflow-hidden px-6 py-10 flex items-center justify-center">
        <div className="aurora-orb aurora-orb-cyan top-[-110px] left-[-140px] h-[360px] w-[360px]" />
        <div className="aurora-orb aurora-orb-violet bottom-[-120px] right-[-120px] h-[380px] w-[380px]" />
        <motion.div
          className="relative z-10 w-full max-w-xl aurora-glass rounded-3xl p-8 md:p-10 text-center"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="aurora-pill mx-auto w-fit text-xs uppercase tracking-[0.18em]">Adaptive 11+ Practice</p>
          <motion.div
            className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300/80 via-cyan-200/60 to-violet-300/70 text-3xl font-black text-[#0a1e3e]"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            M
          </motion.div>
          <h1 className="aurora-heading mt-5 text-4xl font-black tracking-tight text-white">MANNAH</h1>
          <p className="mt-3 text-sm text-[#c8defb]">
            Preparing your personalized learning arena.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#d8e9ff]">
            <span className="aurora-pill">Syncing profile</span>
            <span className="aurora-pill">Warming engine</span>
            <span className="aurora-pill">Loading goals</span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300"
              initial={{ width: '14%' }}
              animate={{ width: ['14%', '58%', '88%'] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (appPhase === 'landing') {
    return <Landing onGetStarted={() => setAppPhase('onboarding')} />
  }

  if (appPhase === 'onboarding') {
    return <Onboarding onComplete={() => setAppPhase('app')} />
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <UpdatePrompt />
      <OfflineBanner />
      <InstallPrompt />
      <AchievementToast
        achievement={achievementToast}
        onClose={() => setAchievementToast(null)}
      />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/subject/:subjectId" element={<SubjectSelect />} />
          <Route path="/subject/:subjectId/topic/:topicId" element={<TopicSelect />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/daily-challenges" element={<DailyChallengePage />} />
          <Route path="/bosses" element={<BossList />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/parent" element={<ParentDashboard />} />
        </Route>
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/boss-battle" element={<BossBattlePage />} />
      </Routes>
    </>
  )
}
