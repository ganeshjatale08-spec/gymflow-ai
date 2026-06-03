'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, Users, RefreshCw, CreditCard, Target,
  ArrowUpRight, AlertTriangle, ChevronRight, Bot,
  Zap, MessageSquare, IndianRupee, CheckCheck,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { StatusDot } from '@/components/shared/StatusDot'
import { staggerContainer, fadeUp } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { LiveChatPanel } from '@/components/dashboard/LiveChatPanel'

const RevenueChart = dynamic(
  () => import('@/components/charts/RevenueChart').then(m => ({ default: m.RevenueChart })),
  { ssr: false }
)

// ── Data ─────────────────────────────────────────────
const expiringMembers = [
  { name: 'Ananya Singh', plan: 'Starter', daysLeft: 2  },
  { name: 'Vikram Patel', plan: 'Growth',  daysLeft: 5  },
  { name: 'Priya Sharma', plan: 'Elite',   daysLeft: 7  },
  { name: 'Arjun Mehta',  plan: 'Starter', daysLeft: 10 },
]

const pendingPayments = [
  { name: 'Priya Sharma', amount: 5999, overdue: false },
  { name: 'Arjun Mehta',  amount: 1999, overdue: false },
  { name: 'Vikram Patel', amount: 3999, overdue: true  },
  { name: 'Kavya Reddy',  amount: 5999, overdue: false },
]

const recentLeads = [
  { name: 'Kavya Reddy',  score: 78, time: new Date(Date.now() - 300000).toISOString()  },
  { name: 'Rohan Gupta',  score: 62, time: new Date(Date.now() - 1800000).toISOString() },
  { name: 'Meera Pillai', score: 91, time: new Date(Date.now() - 3600000).toISOString() },
]

const activity = [
  { id: 1, text: 'Rahul Kumar renewed Growth plan', tag: '₹3,999', time: new Date(Date.now() - 480000).toISOString(),  color: 'emerald' },
  { id: 2, text: 'Kavya Reddy — Elite plan enquiry', tag: 'New',    time: new Date(Date.now() - 1800000).toISOString(), color: 'blue'    },
  { id: 3, text: 'Reminders sent to 12 members',    tag: 'Auto',   time: new Date(Date.now() - 3600000).toISOString(), color: 'orange'  },
]

const aiAgents = [
  { name: 'Sales',    active: true,  msgs: 18 },
  { name: 'Renewal',  active: true,  msgs: 12 },
  { name: 'Support',  active: true,  msgs: 7  },
  { name: 'Recovery', active: false, msgs: 0  },
]

// ── KPI card ─────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconColor, iconBg, badge, badgeColor, href }: {
  label: string; value: number; sub: string; icon: any
  iconColor: string; iconBg: string; badge?: string; badgeColor?: string; href: string
}) {
  return (
    <Link href={href}>
      <motion.div variants={fadeUp} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
        className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden group cursor-pointer hover:border-white/[0.13] transition-all duration-200">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          {badge && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeColor}`}>{badge}</span>}
        </div>
        <div className="text-xl font-bold text-white tracking-tight leading-none mb-1">
          <AnimatedCounter target={value} prefix={label === 'Revenue' || label === 'Payments' ? '₹' : ''} currency={label === 'Revenue' || label === 'Payments'} />
        </div>
        <div className="text-[11px] font-medium text-white/40">{label}</div>
        <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>
      </motion.div>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────
export default function DashboardPage() {
  const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex gap-4 items-start max-w-[1600px]">

      {/* ── Left: main content ── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex-1 min-w-0 space-y-4 min-w-0">

        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/35 mt-0.5">Welcome back. Here's what's happening in your gym today.</p>
        </motion.div>

        {/* ── 5 KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <KpiCard label="Revenue"  value={234500} sub="This month"    icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-400/10" badge="+18%"     badgeColor="text-emerald-400 bg-emerald-400/10 border-emerald-400/20" href="/analytics" />
          <KpiCard label="Members"  value={847}    sub="Active now"    icon={Users}      iconColor="text-blue-400"    iconBg="bg-blue-400/10"    badge="+12"       badgeColor="text-blue-400 bg-blue-400/10 border-blue-400/20"           href="/members"  />
          <KpiCard label="Renewals" value={23}     sub="Due this week" icon={RefreshCw}  iconColor="text-orange-400"  iconBg="bg-orange-400/10"  badge="due"       badgeColor="text-orange-400 bg-orange-400/10 border-orange-400/20"     href="/members"  />
          <KpiCard label="Payments" value={19960}  sub="Pending dues"  icon={CreditCard} iconColor="text-rose-400"    iconBg="bg-rose-400/10"    badge="8 pending" badgeColor="text-rose-400 bg-rose-400/10 border-rose-400/20"           href="/payments" />
          <KpiCard label="Leads"    value={247}    sub="Total leads"   icon={Target}     iconColor="text-violet-400"  iconBg="bg-violet-400/10"  badge="+23"       badgeColor="text-violet-400 bg-violet-400/10 border-violet-400/20"     href="/leads"    />
        </div>

        {/* ── 4 Small Widgets Row ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Pending Payments */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden group hover:border-rose-500/20 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-3 h-3 text-rose-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">Pending Payments</span>
              </div>
              <Link href="/payments" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">All →</Link>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-rose-400 tracking-tight">₹{totalPending.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-white/30 mt-0.5">{pendingPayments.length} members pending</div>
            </div>

            <div className="space-y-1.5">
              {pendingPayments.slice(0, 3).map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${p.overdue ? 'bg-rose-400' : 'bg-white/20'}`} />
                    <span className={`text-[11px] truncate max-w-[90px] ${p.overdue ? 'text-rose-400' : 'text-white/45'}`}>{p.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/40">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-violet-500/20 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">Recent Leads</span>
              </div>
              <Link href="/leads" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">All →</Link>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-violet-400 tracking-tight">247</div>
              <div className="text-[11px] text-white/30 mt-0.5">+23 new this week · 34% conv.</div>
            </div>

            <div className="space-y-1.5">
              {recentLeads.map((l) => (
                <div key={l.name} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/45 truncate max-w-[110px]">{l.name}</span>
                  <span className={`text-[11px] font-bold ${l.score >= 75 ? 'text-emerald-400' : l.score >= 50 ? 'text-orange-400' : 'text-white/30'}`}>
                    {l.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-blue-500/20 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">Recent Activity</span>
              </div>
              <StatusDot status="active" size="sm" />
            </div>

            <div className="space-y-2.5">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2">
                  <div className={`w-1 h-1 rounded-full flex-shrink-0 mt-1.5 ${
                    a.color === 'emerald' ? 'bg-emerald-400' :
                    a.color === 'blue'    ? 'bg-blue-400'    : 'bg-orange-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/50 leading-snug truncate">{a.text}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1 py-0.5 rounded border ${
                        a.color === 'emerald' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                        a.color === 'blue'    ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'          :
                                               'text-orange-400 bg-orange-400/10 border-orange-400/20'
                      }`}>{a.tag}</span>
                      <span className="text-[10px] text-white/20">{timeAgo(a.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agent Status */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-emerald-500/20 transition-all duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-white/70">AI Agents</span>
              </div>
              <Link href="/ai-agents" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">Manage →</Link>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">3 <span className="text-sm font-medium text-white/30">/ 4</span></div>
              <div className="text-[11px] text-white/30 mt-0.5">agents active · 37 msgs today</div>
            </div>

            <div className="space-y-2">
              {aiAgents.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <div className="relative flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.active ? 'bg-emerald-400' : 'bg-white/15'}`} />
                    {a.active && <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />}
                  </div>
                  <span className={`text-[11px] flex-1 ${a.active ? 'text-white/55' : 'text-white/20'}`}>{a.name} Agent</span>
                  {a.active && <span className="text-[10px] font-semibold text-emerald-400">+{a.msgs}</span>}
                </div>
              ))}
            </div>
          </div>

        </motion.div>

        {/* ── Renewals Due (bottom) ── */}
        <motion.div variants={fadeUp} className="bg-[#0d0d0d] border border-orange-500/[0.18] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Renewals Due</h3>
                <p className="text-[11px] text-white/30 mt-0.5">23 memberships expiring within 10 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl hover:bg-emerald-500/15 transition-colors"
              >
                <Zap className="w-3 h-3" />
                Send Reminders
              </motion.button>
              <Link href="/members" className="text-xs text-white/30 hover:text-white/60 transition-colors">View all →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {expiringMembers.map((m) => (
              <motion.div
                key={m.name}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer overflow-hidden ${
                  m.daysLeft <= 3
                    ? 'bg-rose-500/[0.07] border-rose-500/[0.2]'
                    : 'bg-white/[0.03] border-white/[0.07]'
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-px ${m.daysLeft <= 3 ? 'bg-rose-500/30' : 'bg-white/[0.06]'}`} />
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  m.daysLeft <= 3
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                }`}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white/80 truncate">{m.name}</div>
                  <div className="text-[11px] text-white/30">{m.plan}</div>
                  <div className={`text-[11px] font-bold mt-0.5 ${m.daysLeft <= 3 ? 'text-rose-400' : 'text-orange-400'}`}>
                    {m.daysLeft} days left
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Revenue Chart (bottom) ── */}
        <motion.div variants={fadeUp} className="bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
              <p className="text-xs text-white/30 mt-0.5">Daily collection this month</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />+18%
              </span>
              <Link href="/analytics" className="text-xs text-white/30 hover:text-white/60 transition-colors">Analytics →</Link>
            </div>
          </div>
          <RevenueChart />
        </motion.div>

      </motion.div>

      {/* ── Right: Live Chat Panel — hidden on mobile ── */}
      <div className="hidden xl:block w-72 flex-shrink-0 sticky top-0 h-[calc(100vh-56px-3rem)]">
        <LiveChatPanel />
      </div>

    </div>
  )
}
