'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, CheckCircle, Menu, Users, Target, CreditCard, X, HelpCircle, Pause } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { StatusDot } from '@/components/shared/StatusDot'
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel'
import { HelpPanel } from '@/components/dashboard/HelpPanel'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

const SEARCH_DATA = [
  { type: 'member', label: 'Rahul Kumar',  sub: '+91 98765 43210 · Growth', href: '/members' },
  { type: 'member', label: 'Priya Sharma', sub: '+91 87654 32109 · Elite',  href: '/members' },
  { type: 'member', label: 'Ananya Singh', sub: '+91 76543 21098 · Starter',href: '/members' },
  { type: 'lead',   label: 'Kavya Reddy',  sub: 'WhatsApp lead · Score 78', href: '/leads'   },
  { type: 'lead',   label: 'Rohan Gupta',  sub: 'WhatsApp lead · Score 62', href: '/leads'   },
  { type: 'payment',label: 'Rahul Kumar',  sub: '₹3,999 · Growth · Paid',  href: '/payments' },
]

const typeIcon: Record<string, React.ElementType> = {
  member: Users, lead: Target, payment: CreditCard,
}

const typeStyle: Record<string, { bg: string; text: string; border: string }> = {
  member:  { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.2)'  },
  lead:    { bg: 'rgba(168,85,247,0.1)',  text: '#c084fc', border: 'rgba(168,85,247,0.2)'  },
  payment: { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', border: 'rgba(34,197,94,0.2)'   },
}

export function TopBar() {
  const { aiGlobalStatus, syncStatus, activeNotifications, setAIStatus, toggleSidebar, setNotifications } = useUIStore()
  const [query, setQuery]           = useState('')
  const [focused, setFocused]       = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [helpOpen, setHelpOpen]     = useState(false)
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
      <div className="h-[52px] flex items-center px-4 gap-3 flex-shrink-0 relative z-20"
        style={{ background: '#0c0c0f', borderBottom: '1px solid #1e1e24' }}>

        {/* Hamburger — mobile */}
        <button onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors lg:hidden flex-shrink-0">
          <Menu className="w-[15px] h-[15px] text-text-secondary" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-[360px] relative">
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-150',
            focused
              ? 'border border-blue/40 bg-surface2'
              : 'border border-border bg-surface2 hover:border-border-strong'
          )}>
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search…"
              className="bg-transparent text-[13px] text-text-primary placeholder-text-muted outline-none flex-1 min-w-0 font-medium"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-secondary flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="text-[10px] text-text-dim border border-border rounded px-1.5 py-0.5 font-mono hidden sm:block flex-shrink-0 leading-none">
                ⌘K
              </kbd>
            )}
          </div>

          <AnimatePresence>
            {focused && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-2xl overflow-hidden z-50"
                style={{ background: '#0f0f12', border: '1px solid #242429' }}>
                {(['member','lead','payment'] as const).map(type => {
                  const group = results.filter(r => r.type === type)
                  if (!group.length) return null
                  const Icon  = typeIcon[type]
                  const style = typeStyle[type]
                  return (
                    <div key={type}>
                      <div className="px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e24' }}>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#52525b' }}>{type}s</span>
                      </div>
                      {group.map((item, i) => (
                        <button key={i} onMouseDown={() => handleSelect(item.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface2 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: style.text }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-text-primary truncate tracking-tight">{item.label}</div>
                            <div className="text-[11px] text-text-muted truncate">{item.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
                <div className="px-3 py-2" style={{ borderTop: '1px solid #1e1e24' }}>
                  <p className="text-[10px] text-text-muted font-mono">↵ select · Esc close</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Sync status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <CheckCircle className="w-3 h-3 text-green" />
            <span className="text-[11px] font-medium text-text-muted hidden md:block">Live</span>
          </div>

          {/* AI toggle */}
          <button
            onClick={() => setAIStatus(aiGlobalStatus === 'active' ? 'paused' : 'active')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={aiGlobalStatus === 'active'
              ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }
              : { background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' }}>
            {aiGlobalStatus === 'active'
              ? <StatusDot status="active" size="sm" />
              : <Pause className="w-3 h-3" />}
            <span className="hidden sm:block">AI {aiGlobalStatus === 'active' ? 'On' : 'Off'}</span>
          </button>

          {/* Help */}
          <button onClick={() => setHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
            <HelpCircle className="w-[15px] h-[15px] text-text-muted" />
          </button>

          {/* Notifications */}
          <button onClick={() => setNotifsOpen(true)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
            <Bell className="w-[15px] h-[15px] text-text-muted" />
            {activeNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none"
                style={{ background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}>
                {activeNotifications > 9 ? '9+' : activeNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      <NotificationsPanel open={notifsOpen} onClose={() => setNotifsOpen(false)} onUnreadChange={setNotifications} />
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
