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
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6" style={{ background: '#5b4cff' }}>
        {/* Floating circles — same as landing page */}
        <div className="pointer-events-none absolute top-16 left-8 h-36 w-36 animate-float rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute right-6 bottom-28 h-52 w-52 animate-float rounded-full bg-white/[0.04]" style={{ animationDelay: '2s' }} />
        <div className="pointer-events-none absolute top-1/4 right-12 h-20 w-20 animate-float rounded-full bg-white/[0.07]" style={{ animationDelay: '4s' }} />
        <div className="pointer-events-none absolute bottom-1/3 left-12 h-14 w-14 animate-float rounded-full bg-white/[0.06]" style={{ animationDelay: '3s' }} />

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Logo */}
          <div className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-2xl ring-1 ring-white/10">
            <span className="text-6xl font-black text-white">M</span>
          </div>

          {/* Brand */}
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white">
            Manna<span style={{ color: '#FCD34D' }}>h</span>
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Adaptive 11+ Practice
          </p>

          {/* Progress bar */}
          <div className="mt-10 w-64">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ background: '#FCD34D' }}
                initial={{ width: '12%' }}
                animate={{ width: ['12%', '55%', '85%'] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            </div>
            <p className="mt-3 text-center text-xs font-medium text-white/40">
              Finding where you left off…
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (appPhase === 'landing') {
    return <Landing onGetStarted={() => setAppPhase('onboarding')} />
  }

  if (appPhase === 'onboarding') {
    return <Onboarding onComplete={() => setAppPhase('app')} onBack={() => setAppPhase('landing')} />
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
