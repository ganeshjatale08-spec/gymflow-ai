'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, MessageSquare, Target, Users,
  Zap, BarChart2, CreditCard, Settings, LogOut, ChevronRight, X, Activity, Download,
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
  { href: '/automations',   label: 'Automations',   icon: Zap         },
  { href: '/analytics',     label: 'Analytics',     icon: BarChart2   },
  { href: '/payments',      label: 'Payments',      icon: CreditCard  },
  { href: '/activity',      label: 'Activity Log',  icon: Activity    },
  { href: '/settings',      label: 'Settings',      icon: Settings    },
]

export function Sidebar() {
  const pathname = usePathname()
  const { gymName, gymLogo, activeNotifications, toggleSidebar } = useUIStore()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen">

      {/* Logo + close button */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden">
            {gymLogo ? (
              <img src={gymLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">{gymName}</div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="active" size="sm" />
              <span className="text-xs text-text-muted">AI Active</span>
            </div>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors lg:hidden flex-shrink-0 ml-2"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={() => {
              // Close sidebar on mobile after nav
              if (window.innerWidth < 1024) toggleSidebar()
            }}>
              <div className={cn('nav-item group', isActive && 'active')}>
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-soft' : 'text-text-muted group-hover:text-text-secondary')} />
                <span className="flex-1 text-sm">{label}</span>
                {badge && activeNotifications > 0 && (
                  <span className="bg-blue text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {activeNotifications}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-blue-soft opacity-60" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface2 transition-colors">
          <div className="w-7 h-7 bg-blue/20 border border-blue/30 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-blue-soft font-semibold">
            {user?.email ? getInitials(user.email.split('@')[0]) : 'GY'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">
              {user?.email?.split('@')[0] || 'Gym Owner'}
            </div>
            <div className="text-xs text-text-muted">Owner</div>
          </div>
          <button onClick={signOut} className="text-text-muted hover:text-red transition-colors" title="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
