'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, RefreshCw, CreditCard, Target,
  ArrowUpRight, AlertTriangle, ChevronRight, Bot,
  Zap, MessageSquare, IndianRupee,
} from 'lucide-react'
import Link from 'next/link'
import { staggerContainer, fadeUp } from '@/lib/constants'
import { LiveChatPanel } from '@/components/dashboard/LiveChatPanel'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Stats = {
  revenue: number; members: number; renewals: number
  pending: number; leads: number; expiring: { name:string; plan:string; daysLeft:number }[]
  recentLeads: { name:string; phone:string; time:string }[]
  recentPayments: { member:string; amount:number; method:string|null; paid_at:string|null }[]
}

function KpiCard({ label, value, sub, icon: Icon, iconColor, iconBg, href }: {
  label: string; value: string | number; sub: string; icon: any
  iconColor: string; iconBg: string; href: string
}) {
  return (
    <Link href={href}>
      <motion.div variants={fadeUp} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
        className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden group cursor-pointer hover:border-white/[0.13] transition-all duration-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="flex items-center justify-between mb-3">
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{value}</div>
        <div className="text-xs font-medium text-white/40">{label}</div>
        <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>
        <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-3.5 h-3.5 text-white/25" />
        </div>
      </motion.div>
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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

        const today = new Date()
        const week  = new Date(today.getTime() + 7 * 86400000)

        const activeMembers = Array.isArray(members) ? members.filter((m:any) => m.status === 'active') : []
        const expiring = activeMembers
          .filter((m:any) => m.plan_end && new Date(m.plan_end) <= week && new Date(m.plan_end) >= today)
          .map((m:any) => ({
            name: m.name,
            plan: m.plan_name || '—',
            daysLeft: Math.ceil((new Date(m.plan_end).getTime() - today.getTime()) / 86400000),
          }))
          .sort((a:any, b:any) => a.daysLeft - b.daysLeft)
          .slice(0, 4)

        const completedPay = Array.isArray(payments) ? payments.filter((p:any) => p.status === 'completed') : []
        const pendingPay   = Array.isArray(payments) ? payments.filter((p:any) => p.status === 'pending')   : []

        const revenue = completedPay.reduce((s:number, p:any) => s + (p.amount || 0), 0)
        const pending = pendingPay.reduce((s:number, p:any)   => s + (p.amount || 0), 0)

        const recentLeads = Array.isArray(leads)
          ? leads.slice(0, 4).map((l:any) => ({ name: l.name||l.phone, phone: l.phone, time: l.created_at }))
          : []

        const recentPayments = Array.isArray(payments)
          ? payments.filter((p:any) => p.status === 'completed').slice(0, 4)
          : []

        setStats({
          revenue, pending,
          members: activeMembers.length,
          renewals: expiring.length,
          leads: Array.isArray(leads) ? leads.length : 0,
          expiring, recentLeads, recentPayments,
        })
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fmt = (n: number) => n >= 100000
    ? `₹${(n/100000).toFixed(1)}L`
    : n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`

  return (
    <div className="flex gap-4 items-start max-w-[1600px]">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex-1 min-w-0 space-y-4">

        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/35 mt-0.5">Welcome back. Here's what's happening in your gym today.</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <KpiCard label="Revenue"  value={loading ? '...' : fmt(stats?.revenue||0)} sub="Collected"     icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-400/10" href="/payments" />
          <KpiCard label="Members"  value={loading ? '...' : stats?.members||0}      sub="Active now"    icon={Users}      iconColor="text-blue-400"    iconBg="bg-blue-400/10"    href="/members"  />
          <KpiCard label="Renewals" value={loading ? '...' : stats?.renewals||0}     sub="Due this week" icon={RefreshCw}  iconColor="text-orange-400"  iconBg="bg-orange-400/10"  href="/members"  />
          <KpiCard label="Payments" value={loading ? '...' : fmt(stats?.pending||0)} sub="Pending dues"  icon={CreditCard} iconColor="text-rose-400"    iconBg="bg-rose-400/10"    href="/payments" />
          <KpiCard label="Leads"    value={loading ? '...' : stats?.leads||0}        sub="Total leads"   icon={Target}     iconColor="text-violet-400"  iconBg="bg-violet-400/10"  href="/leads"    />
        </div>

        {/* 4 Widgets */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Pending Payments */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-rose-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-3 h-3 text-rose-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">Pending Payments</span>
              </div>
              <Link href="/payments" className="text-[10px] text-white/25 hover:text-white/50">All →</Link>
            </div>
            {loading ? <div className="text-white/20 text-xs">Loading...</div> : stats?.pending === 0 ? (
              <div className="text-center py-4 text-white/20 text-xs">No pending payments</div>
            ) : (
              <>
                <div className="text-xl font-bold text-rose-400 mb-1">{fmt(stats?.pending||0)}</div>
                <div className="text-[11px] text-white/30">Collect karein</div>
              </>
            )}
          </div>

          {/* Recent Leads */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-violet-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">Recent Leads</span>
              </div>
              <Link href="/leads" className="text-[10px] text-white/25 hover:text-white/50">All →</Link>
            </div>
            {loading ? <div className="text-white/20 text-xs">Loading...</div>
            : !stats?.recentLeads?.length ? <div className="text-center py-3 text-white/20 text-xs">No leads yet</div>
            : (
              <div className="space-y-2">
                {stats.recentLeads.map((l, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/60 truncate max-w-[110px]">{l.name}</span>
                    <span className="text-[10px] text-white/25">{timeAgo(l.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-blue-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">Recent Payments</span>
            </div>
            {loading ? <div className="text-white/20 text-xs">Loading...</div>
            : !stats?.recentPayments?.length ? <div className="text-center py-3 text-white/20 text-xs">No payments yet</div>
            : (
              <div className="space-y-2">
                {stats.recentPayments.map((p:any, i:number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/60 truncate max-w-[90px]">{p.member}</span>
                    <span className="text-[11px] font-semibold text-emerald-400">₹{p.amount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Status */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-emerald-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">AI Agents</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </div>
              <span className="text-xs text-white/50">Active — waiting for messages</span>
            </div>
            <Link href="/automations" className="text-[10px] text-white/25 hover:text-white/50 mt-3 block">Manage →</Link>
          </div>

        </motion.div>

        {/* Renewals Due */}
        <motion.div variants={fadeUp} className="bg-[#0d0d0d] border border-orange-500/[0.15] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Renewals Due</h3>
              {stats?.renewals ? <span className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">{stats.renewals} this week</span> : null}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/automations" className="text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg hover:bg-emerald-400/15 transition-colors">
                <Zap className="w-3 h-3 inline mr-1" />Send Reminder
              </Link>
              <Link href="/members" className="text-[11px] text-white/25 hover:text-white/60">All →</Link>
            </div>
          </div>

          {loading ? (
            <div className="text-white/20 text-sm text-center py-4">Loading...</div>
          ) : !stats?.expiring?.length ? (
            <div className="text-center py-6 text-white/20 text-xs">No upcoming renewals this week</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.expiring.map((m, i) => (
                <div key={i} className={cn('flex items-center gap-3 px-3.5 py-3 rounded-xl border',
                  m.daysLeft <= 2 ? 'bg-rose-500/[0.07] border-rose-500/[0.2]' : 'bg-white/[0.03] border-white/[0.07]')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    m.daysLeft <= 2 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-orange-500/15 text-orange-400 border border-orange-500/25')}>
                    {m.name.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/80 truncate">{m.name}</div>
                    <div className="text-[11px] text-white/30">{m.plan}</div>
                    <div className={cn('text-[11px] font-bold', m.daysLeft <= 2 ? 'text-rose-400' : 'text-orange-400')}>
                      {m.daysLeft}d left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>

      {/* Right: Live Chat */}
      <div className="hidden xl:block w-72 flex-shrink-0 sticky top-0 h-[calc(100vh-56px-3rem)]">
        <LiveChatPanel />
      </div>
    </div>
  )
}
