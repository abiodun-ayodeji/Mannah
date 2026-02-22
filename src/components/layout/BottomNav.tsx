import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, BarChart3, Trophy, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/parent', label: 'Parent', icon: Users },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/achievements', label: 'Badges', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-3 z-30 px-4 md:px-8 lg:hidden">
      <div className="pointer-events-auto mx-auto w-full max-w-6xl">
        <div className="aurora-glass-soft rounded-2xl px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition ${
                      isActive ? 'text-white' : 'text-[#a9c6ea] hover:text-[#dff1ff]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          className="absolute inset-0 rounded-xl border border-white/30 bg-white/12"
                          layoutId="active-nav-bg"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <Icon className={`size-[18px] ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
