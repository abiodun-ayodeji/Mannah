import { NavLink } from 'react-router-dom'
import { Home, Zap, Swords, Trophy, BarChart3, Medal, Users, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

const LEARN: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/daily-challenges', label: 'Challenges', icon: Zap },
  { to: '/bosses', label: 'Boss Battles', icon: Swords },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
]

const TRACK: NavItem[] = [
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/achievements', label: 'Badges', icon: Medal },
  { to: '/parent', label: 'Parent', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="mb-4">
      <p className="sidebar-section-label">{label}</p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
            >
              <Icon className="size-[18px] flex-shrink-0" strokeWidth={1.9} />
              <span className="truncate text-sm font-semibold">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="app-sidebar hidden lg:flex w-[220px] flex-shrink-0 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5b4cff] text-base font-black text-white shadow-sm">
          M
        </div>
        <span className="text-lg font-black sidebar-logo-text">Mannah</span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <SidebarGroup label="LEARN" items={LEARN} />
        <SidebarGroup label="TRACK" items={TRACK} />
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5">
        <p className="text-[10px] font-semibold sidebar-footer-text">Adaptive 11+ Practice</p>
      </div>
    </aside>
  )
}
