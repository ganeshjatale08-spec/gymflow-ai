'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, RefreshCw, CheckCircle, PauseCircle, Menu, Users, Target, CreditCard, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { StatusDot } from '@/components/shared/StatusDot'
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

// ── Mock search data ──────────────────────────────────
const SEARCH_DATA = [
  { type: 'member', label: 'Rahul Kumar',  sub: '+91 98765 43210 · Growth', href: '/members' },
  { type: 'member', label: 'Priya Sharma', sub: '+91 87654 32109 · Elite',  href: '/members' },
  { type: 'member', label: 'Ananya Singh', sub: '+91 76543 21098 · Starter',href: '/members' },
  { type: 'member', label: 'Kavya Reddy',  sub: '+91 54321 09876 · Elite',  href: '/members' },
  { type: 'member', label: 'Arjun Mehta',  sub: '+91 43210 98765 · Starter',href: '/members' },
  { type: 'lead',   label: 'Kavya Reddy',  sub: 'WhatsApp lead · Score 78', href: '/leads'   },
  { type: 'lead',   label: 'Rohan Gupta',  sub: 'WhatsApp lead · Score 62', href: '/leads'   },
  { type: 'lead',   label: 'Meera Pillai', sub: 'Referral lead · Score 91', href: '/leads'   },
  { type: 'payment',label: 'Rahul Kumar',  sub: '₹3,999 · Growth · Paid',  href: '/payments' },
  { type: 'payment',label: 'Priya Sharma', sub: '₹5,999 · Elite · Pending', href: '/payments'},
  { type: 'payment',label: 'Vikram Patel', sub: '₹3,999 · Growth · Overdue',href: '/payments'},
]

const typeIcon: Record<string, React.ElementType> = {
  member:  Users,
  lead:    Target,
  payment: CreditCard,
}

const typeColor: Record<string, string> = {
  member:  'text-blue-soft bg-blue/10 border-blue/20',
  lead:    'text-violet-400 bg-violet-500/10 border-violet-500/20',
  payment: 'text-green bg-green/10 border-green/20',
}

export function TopBar() {
  const { aiGlobalStatus, syncStatus, activeNotifications, setAIStatus, toggleSidebar, setNotifications } = useUIStore()
  const [query, setQuery]         = useState('')
  const [focused, setFocused]     = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()

  const results = query.trim().length >= 1
    ? SEARCH_DATA.filter(d =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        d.sub.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  function handleSelect(href: string) {
    setQuery(''); setFocused(false)
    router.push(href)
  }

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setFocused(true)
      }
      if (e.key === 'Escape') { setFocused(false); setQuery('') }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="h-14 bg-surface border-b border-border flex items-center px-4 gap-3 flex-shrink-0 relative z-20">

        {/* Hamburger */}
        <button onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors lg:hidden flex-shrink-0">
          <Menu className="w-4 h-4 text-text-secondary" />
        </button>

        {/* Global Search */}
        <div className="flex-1 max-w-sm relative">
          <div className={cn('flex items-center gap-2 bg-surface2 border rounded-lg px-3 py-1.5 transition-all',
            focused ? 'border-blue/40' : 'border-border')}>
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search members, leads, payments..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1 min-w-0"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-secondary flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {!query && (
              <span className="text-xs text-text-dim border border-border rounded px-1 py-0.5 font-mono hidden sm:block flex-shrink-0">⌘K</span>
            )}
          </div>

          {/* Search results dropdown */}
          <AnimatePresence>
            {focused && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {['member','lead','payment'].map(type => {
                  const group = results.filter(r => r.type === type)
                  if (!group.length) return null
                  const Icon = typeIcon[type]
                  return (
                    <div key={type}>
                      <div className="px-3 py-1.5 bg-surface2 border-b border-border">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider capitalize">{type}s</span>
                      </div>
                      {group.map((item, i) => (
                        <button key={i} onMouseDown={() => handleSelect(item.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface2 transition-colors text-left">
                          <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0', typeColor[type])}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{item.label}</div>
                            <div className="text-xs text-text-muted truncate">{item.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
                <div className="px-3 py-2 border-t border-border">
                  <p className="text-[10px] text-text-muted">↵ to select · Esc to close</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5">
            {syncStatus === 'syncing'
              ? <RefreshCw className="w-3.5 h-3.5 text-blue-soft animate-spin" />
              : <CheckCircle className="w-3.5 h-3.5 text-green" />}
            <span className="text-xs text-text-muted hidden md:block">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Live'}
            </span>
          </div>

          <button onClick={() => setAIStatus(aiGlobalStatus === 'active' ? 'paused' : 'active')}
            className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
              aiGlobalStatus === 'active' ? 'bg-green/10 border-green/30 text-green hover:bg-green/20' : 'bg-orange/10 border-orange/30 text-orange hover:bg-orange/20')}>
            {aiGlobalStatus === 'active' ? <StatusDot status="active" size="sm" /> : <PauseCircle className="w-3 h-3" />}
            <span className="hidden sm:block">AI {aiGlobalStatus === 'active' ? 'Active' : 'Paused'}</span>
          </button>

          <button onClick={() => setNotifsOpen(true)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
            <Bell className="w-4 h-4 text-text-secondary" />
            {activeNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue rounded-full flex items-center justify-center text-[9px] text-white font-bold leading-none animate-pulse">
                {activeNotifications > 9 ? '9+' : activeNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      <NotificationsPanel open={notifsOpen} onClose={() => setNotifsOpen(false)} onUnreadChange={setNotifications} />
    </>
  )
}
