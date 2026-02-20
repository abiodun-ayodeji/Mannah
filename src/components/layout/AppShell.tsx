import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function AppShell() {
  return (
    <div className="aurora-flow relative min-h-screen overflow-hidden">
      <div className="aurora-orb aurora-orb-cyan top-[-180px] right-[10%] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-150px] left-[-150px] h-[420px] w-[420px]" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-5 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
