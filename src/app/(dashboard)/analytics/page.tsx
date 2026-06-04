'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Users, Target, CreditCard, ArrowUpRight } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Stats = {
  totalMembers: number; activeMembers: number; expiredMembers: number
  totalLeads: number; convertedLeads: number; newLeads: number
  totalRevenue: number; pendingRevenue: number; totalPayments: number
  planBreakdown: { name: string; count: number; revenue: number }[]
  recentPayments: { member: string; amount: number; method: string; paid_at: string }[]
  leadsByStatus: { status: string; count: number }[]
  membersByStatus: { status: string; count: number }[]
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

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

        const m = Array.isArray(members) ? members : []
        const l = Array.isArray(leads)   ? leads   : []
        const p = Array.isArray(payments) ? payments : []

        // Revenue
        const completed = p.filter((x:any) => x.status === 'completed')
        const pending   = p.filter((x:any) => x.status === 'pending')
        const totalRevenue  = completed.reduce((s:number,x:any) => s + (x.amount||0), 0)
        const pendingRevenue = pending.reduce((s:number,x:any) => s + (x.amount||0), 0)

        // Plan breakdown
        const planMap: Record<string, { count:number; revenue:number }> = {}
        m.forEach((mem:any) => {
          const pn = mem.plan_name || 'Unknown'
          if (!planMap[pn]) planMap[pn] = { count:0, revenue:0 }
          planMap[pn].count++
          planMap[pn].revenue += mem.plan_amount || 0
        })
        const planBreakdown = Object.entries(planMap)
          .map(([name, d]) => ({ name, ...d }))
          .sort((a,b) => b.count - a.count)

        // Member status breakdown
        const mStatus: Record<string,number> = {}
        m.forEach((mem:any) => { mStatus[mem.status||'unknown'] = (mStatus[mem.status||'unknown']||0) + 1 })

        // Lead status breakdown
        const lStatus: Record<string,number> = {}
        l.forEach((lead:any) => { lStatus[lead.status||'new'] = (lStatus[lead.status||'new']||0) + 1 })

        setStats({
          totalMembers: m.length,
          activeMembers: m.filter((x:any) => x.status==='active').length,
          expiredMembers: m.filter((x:any) => x.status==='expired').length,
          totalLeads: l.length,
          convertedLeads: l.filter((x:any) => x.status==='converted').length,
          newLeads: l.filter((x:any) => x.status==='new').length,
          totalRevenue, pendingRevenue,
          totalPayments: p.length,
          planBreakdown,
          recentPayments: completed.slice(0,5).map((x:any) => ({ member: x.member, amount: x.amount, method: x.method||'—', paid_at: x.paid_at||'—' })),
          leadsByStatus: Object.entries(lStatus).map(([status,count]) => ({ status, count })),
          membersByStatus: Object.entries(mStatus).map(([status,count]) => ({ status, count })),
        })
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const fmt = (n:number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`

  const statusColors: Record<string,string> = {
    active:'text-green bg-green/10', expired:'text-red bg-red/10', paused:'text-orange bg-orange/10',
    inactive:'text-text-muted bg-surface2', new:'text-text-muted bg-surface2',
    contacted:'text-blue-soft bg-blue/10', qualified:'text-purple bg-purple/10',
    converted:'text-green bg-green/10', lost:'text-red bg-red/10',
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">

      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Analytics</h1>
        <p className="text-text-muted text-sm mt-0.5">Gym performance overview</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-16 text-text-muted">Loading data...</div>
      ) : !stats ? (
        <div className="text-center py-16 text-text-muted">No data available</div>
      ) : (
        <>
          {/* KPI Cards */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:'Total Revenue',  value: fmt(stats.totalRevenue),   sub:`${stats.totalPayments} payments`,          icon:CreditCard,  color:'text-green',      bg:'bg-green/10'      },
              { label:'Active Members', value: stats.activeMembers,       sub:`${stats.totalMembers} total`,              icon:Users,       color:'text-blue-soft',  bg:'bg-blue/10'       },
              { label:'Total Leads',    value: stats.totalLeads,          sub:`${stats.convertedLeads} converted`,        icon:Target,      color:'text-violet-400', bg:'bg-violet-500/10' },
              { label:'Pending Dues',   value: fmt(stats.pendingRevenue), sub:`Collect karein`,                           icon:TrendingUp,  color:'text-orange',     bg:'bg-orange/10'     },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="kpi-card">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', bg)}>
                  <Icon className={cn('w-4 h-4', color)} />
                </div>
                <div className={cn('text-2xl font-bold mb-0.5', color)}>{value}</div>
                <div className="text-sm text-text-secondary">{label}</div>
                <div className="text-xs text-text-muted mt-0.5">{sub}</div>
              </div>
            ))}
          </motion.div>

          {/* Members + Leads breakdown */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Members by status */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Members by Status</h3>
              {stats.membersByStatus.length === 0
                ? <p className="text-text-muted text-sm text-center py-4">No members yet</p>
                : <div className="space-y-3">
                    {stats.membersByStatus.map(({ status, count }) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[status] || 'text-text-muted bg-surface2')}>{status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-surface2 rounded-full">
                            <div className="h-full bg-blue rounded-full" style={{ width: `${(count/stats.totalMembers)*100}%` }} />
                          </div>
                          <span className="text-sm font-bold text-text-primary w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Leads by status */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Leads by Status</h3>
              {stats.leadsByStatus.length === 0
                ? <p className="text-text-muted text-sm text-center py-4">No leads yet</p>
                : <div className="space-y-3">
                    {stats.leadsByStatus.map(({ status, count }) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[status] || 'text-text-muted bg-surface2')}>{status}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-surface2 rounded-full">
                            <div className="h-full bg-purple rounded-full" style={{ width: `${stats.totalLeads > 0 ? (count/stats.totalLeads)*100 : 0}%` }} />
                          </div>
                          <span className="text-sm font-bold text-text-primary w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                    {stats.totalLeads > 0 && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>Conversion Rate</span>
                          <span className="font-semibold text-green">{((stats.convertedLeads/stats.totalLeads)*100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
              }
            </div>
          </motion.div>

          {/* Plan popularity + Recent payments */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Plan breakdown */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Plan Popularity</h3>
              {stats.planBreakdown.length === 0
                ? <p className="text-text-muted text-sm text-center py-4">No plan data yet</p>
                : <div className="space-y-3">
                    {stats.planBreakdown.map(({ name, count, revenue }) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-surface2 border border-border rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{name}</div>
                          <div className="text-xs text-text-muted">{count} members</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green">₹{revenue.toLocaleString('en-IN')}</div>
                          <div className="text-xs text-text-muted">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Recent payments */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Recent Payments</h3>
              {stats.recentPayments.length === 0
                ? <p className="text-text-muted text-sm text-center py-4">No payments yet</p>
                : <div className="space-y-2">
                    {stats.recentPayments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-text-primary">{p.member}</div>
                          <div className="text-xs text-text-muted">{p.method} · {p.paid_at}</div>
                        </div>
                        <span className="text-sm font-bold text-green">₹{p.amount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
