'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, CreditCard, Users, Target, MessageSquare, UserCog } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

type LogEntry = {
  id: string; type: string; title: string; detail: string; time: string; user: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  payment: { icon: CreditCard,    color: 'text-green',      bg: 'bg-green/10 border-green/20',           label: 'Payment'  },
  member:  { icon: Users,         color: 'text-blue-soft',  bg: 'bg-blue/10 border-blue/20',             label: 'Member'   },
  lead:    { icon: Target,        color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Lead'     },
  message: { icon: MessageSquare, color: 'text-orange',     bg: 'bg-orange/10 border-orange/20',         label: 'Message'  },
  employee:{ icon: UserCog,       color: 'text-purple',     bg: 'bg-purple/10 border-purple/20',         label: 'Employee' },
}

export default function ActivityPage() {
  const [logs, setLogs]       = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const [mRes, lRes, pRes] = await Promise.all([
          fetch('/api/data/members'),
          fetch('/api/data/leads'),
          fetch('/api/data/payments'),
        ])
        const [members, leads, payments] = await Promise.all([
          mRes.json(), lRes.json(), pRes.json()
        ])

        const entries: LogEntry[] = []

        // Members
        if (Array.isArray(members)) {
          members.forEach((m: any) => {
            entries.push({
              id:     `m-${m.id}`,
              type:   'member',
              title:  'Member Added',
              detail: `${m.name} — ${m.plan_name || 'No plan'} (${m.status})`,
              time:   m.created_at,
              user:   'Admin',
            })
          })
        }

        // Leads
        if (Array.isArray(leads)) {
          leads.forEach((l: any) => {
            entries.push({
              id:     `l-${l.id}`,
              type:   'lead',
              title:  l.status === 'converted' ? 'Lead Converted 🎉' : 'New Lead',
              detail: `${l.name || l.phone} — via ${l.source || 'WhatsApp'} (${l.status})`,
              time:   l.created_at,
              user:   l.source === 'whatsapp' ? 'AI' : 'Admin',
            })
          })
        }

        // Payments
        if (Array.isArray(payments)) {
          payments.forEach((p: any) => {
            entries.push({
              id:     `p-${p.id}`,
              type:   'payment',
              title:  p.status === 'completed' ? 'Payment Received' : `Payment ${p.status}`,
              detail: `${p.member} — ₹${p.amount?.toLocaleString('en-IN')} via ${p.method || 'N/A'}`,
              time:   p.created_at,
              user:   'Admin',
            })
          })
        }

        // Sort by time desc
        entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setLogs(entries)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || l.type === filter
    return matchSearch && matchFilter
  })

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-4xl">

      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Activity Log</h1>
          <p className="text-text-muted text-sm mt-0.5">All actions — members, leads, payments</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface2 border border-border px-3 py-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5" />
          {logs.length} events
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..."
            className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'payment', 'member', 'lead'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
              {f === 'all' ? `All (${logs.length})` : typeConfig[f]?.label || f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading activity...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
            <Activity className="w-10 h-10 opacity-20" />
            <p className="text-sm">{search || filter !== 'all' ? 'No results found' : 'No activity yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(log => {
              const cfg  = typeConfig[log.type] || typeConfig.member
              const Icon = cfg.icon
              return (
                <motion.div key={log.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-surface2 transition-colors">
                  <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
                    <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{log.title}</p>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{log.detail}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-text-muted whitespace-nowrap">{timeAgo(log.time)}</p>
                        <p className="text-[10px] text-text-dim mt-0.5">by {log.user}</p>
                      </div>
                    </div>
                  </div>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 mt-1', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

    </motion.div>
  )
}
