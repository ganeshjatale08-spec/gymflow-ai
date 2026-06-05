'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Target, Users,
  Zap, BarChart2, CreditCard, Settings, LogOut, X,
  Activity, UserCog, Upload,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { StatusDot } from '@/components/shared/StatusDot'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare, badge: true },
  { href: '/leads',         label: 'Leads',         icon: Target      },
  { href: '/members',       label: 'Members',       icon: Users       },
  { href: '/employees',     label: 'Employees',     icon: UserCog     },
  { href: '/automations',   label: 'Automations',   icon: Zap         },
  { href: '/analytics',     label: 'Analytics',     icon: BarChart2   },
  { href: '/payments',      label: 'Payments',      icon: CreditCard  },
  { href: '/import',        label: 'Import Data',   icon: Upload      },
  { href: '/activity',      label: 'Activity Log',  icon: Activity    },
  { href: '/settings',      label: 'Settings',      icon: Settings    },
]

export function Sidebar() {
  const pathname = usePathname()
  const { gymName, gymLogo, activeNotifications, toggleSidebar } = useUIStore()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col h-screen"
      style={{ background: '#0c0c0f', borderRight: '1px solid #1e1e24' }}>

      {/* Brand header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1e1e24' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(59,130,246,0.3), 0 0 16px rgba(59,130,246,0.15)' }}>
            {gymLogo ? (
              <img src={gymLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text-primary truncate tracking-tight">{gymName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusDot status="active" size="sm" />
              <span className="text-[11px] text-text-muted font-medium">AI Active</span>
            </div>
          </div>
        </div>
        <button onClick={toggleSidebar}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface2 transition-colors lg:hidden flex-shrink-0 ml-1">
          <X className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={() => {
              if (window.innerWidth < 1024) toggleSidebar()
            }}>
              <div className={cn('nav-item group', isActive && 'active')}>
                <Icon className={cn(
                  'w-[15px] h-[15px] flex-shrink-0 transition-colors',
                  isActive ? 'text-blue-soft' : 'text-text-muted group-hover:text-text-secondary'
                )} />
                <span className="flex-1 text-[13px]">{label}</span>
                {badge && activeNotifications > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                    style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    {activeNotifications}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-2.5 py-3" style={{ borderTop: '1px solid #1e1e24' }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors hover:bg-surface2 group">
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-blue-soft"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
            {user?.email ? getInitials(user.email.split('@')[0]) : 'GY'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text-primary truncate tracking-tight">
              {user?.email?.split('@')[0] || 'Gym Owner'}
            </div>
            <div className="text-[11px] text-text-muted">Admin</div>
          </div>
          <button onClick={signOut}
            className="text-text-muted hover:text-red transition-colors opacity-0 group-hover:opacity-100"
            title="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
