import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="aurora-flow flex h-screen overflow-hidden">
      {/* Desktop aurora orbs — constrained to the right content area */}
      <div className="aurora-orb aurora-orb-cyan pointer-events-none absolute top-[-180px] right-[10%] h-[420px] w-[420px]" />
      <div className="aurora-orb aurora-orb-violet pointer-events-none absolute bottom-[-150px] left-[220px] h-[420px] w-[420px]" />

      {/* Left sidebar — desktop only */}
      <Sidebar />

      {/* Right area: top bar + scrollable content */}
      <div className="relative z-10 flex flex-1 min-w-0 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-5 lg:pb-8 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
