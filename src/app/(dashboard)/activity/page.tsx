'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, Filter, CreditCard, Users, Target, Zap, MessageSquare, Settings, Bot } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

type LogType = 'payment' | 'member' | 'lead' | 'message' | 'system' | 'ai'

type LogEntry = {
  id: string
  type: LogType
  title: string
  detail: string
  user: string
  time: string
}

const logs: LogEntry[] = [
  { id:'1',  type:'payment', title:'Payment Recorded',      detail:'Rahul Kumar — ₹3,999 Growth Plan (UPI)',       user:'Admin',  time: new Date(Date.now()-5*60000).toISOString()      },
  { id:'2',  type:'lead',    title:'New Lead Added',         detail:'Kavya Reddy — WhatsApp — Score 78',            user:'AI',     time: new Date(Date.now()-12*60000).toISOString()     },
  { id:'3',  type:'member',  title:'Member Profile Updated', detail:'Priya Sharma — Plan changed to Elite',         user:'Admin',  time: new Date(Date.now()-28*60000).toISOString()     },
  { id:'4',  type:'ai',      title:'AI Qualified Lead',      detail:'Rohan Gupta moved to Qualified stage',         user:'Asha',   time: new Date(Date.now()-45*60000).toISOString()     },
  { id:'5',  type:'message', title:'Bulk Message Sent',      detail:'12 members — Renewal reminder via WhatsApp',   user:'Admin',  time: new Date(Date.now()-90*60000).toISOString()     },
  { id:'6',  type:'member',  title:'New Member Added',       detail:'Arjun Mehta — Starter Plan — Joined today',   user:'Admin',  time: new Date(Date.now()-2*3600000).toISOString()    },
  { id:'7',  type:'payment', title:'Payment Reminder Sent',  detail:'8 overdue members notified via WhatsApp',      user:'System', time: new Date(Date.now()-3*3600000).toISOString()    },
  { id:'8',  type:'lead',    title:'Lead Converted',         detail:'Rahul Kumar → Growth membership ₹3,999/mo',   user:'AI',     time: new Date(Date.now()-5*3600000).toISOString()    },
  { id:'9',  type:'system',  title:'Settings Updated',       detail:'Gym name updated to "Iron Pulse Gym"',         user:'Admin',  time: new Date(Date.now()-8*3600000).toISOString()    },
  { id:'10', type:'ai',      title:'AI Daily Summary',       detail:'18 conversations · 4 trials booked · 34% conv',user:'System', time: new Date(Date.now()-12*3600000).toISOString()   },
  { id:'11', type:'member',  title:'Membership Renewed',     detail:'Vikram Patel — Growth Plan renewed 1 month',   user:'Admin',  time: new Date(Date.now()-24*3600000).toISOString()   },
  { id:'12', type:'payment', title:'Payment Received',       detail:'Kavya Reddy — ₹5,999 Elite Plan (Cash)',       user:'Admin',  time: new Date(Date.now()-2*86400000).toISOString()   },
]

const typeConfig: Record<LogType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  payment: { icon: CreditCard,    color: 'text-green',      bg: 'bg-green/10 border-green/20',           label: 'Payment'  },
  member:  { icon: Users,         color: 'text-blue-soft',  bg: 'bg-blue/10 border-blue/20',             label: 'Member'   },
  lead:    { icon: Target,        color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Lead'     },
  message: { icon: MessageSquare, color: 'text-orange',     bg: 'bg-orange/10 border-orange/20',         label: 'Message'  },
  system:  { icon: Settings,      color: 'text-text-muted', bg: 'bg-surface2 border-border',             label: 'System'   },
  ai:      { icon: Bot,           color: 'text-purple',     bg: 'bg-purple/10 border-purple/20',         label: 'AI'       },
}

export default function ActivityPage() {
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all')

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || l.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-4xl">

      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Activity Log</h1>
          <p className="text-text-muted text-sm mt-0.5">Full history of all actions in your gym app</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface2 border border-border px-3 py-1.5 rounded-lg">
          <Activity className="w-3.5 h-3.5" />
          {logs.length} total events
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..."
            className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'payment', 'member', 'lead', 'message', 'ai', 'system'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                typeFilter === t ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
              {t === 'all' ? 'All' : typeConfig[t as LogType]?.label || t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Log list */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">No activity found</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((log, i) => {
              const cfg  = typeConfig[log.type]
              const Icon = cfg.icon
              return (
                <motion.div key={log.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
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
