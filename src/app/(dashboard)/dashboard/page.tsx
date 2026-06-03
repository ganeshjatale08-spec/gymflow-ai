'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, Users, RefreshCw, CreditCard, Target,
  ArrowUpRight, AlertTriangle, ChevronRight, Bot,
  Zap, MessageSquare, IndianRupee,
} from 'lucide-react'
import Link from 'next/link'
import { staggerContainer, fadeUp } from '@/lib/constants'
import { LiveChatPanel } from '@/components/dashboard/LiveChatPanel'

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
          <KpiCard label="Revenue"  value="₹0"  sub="This month"    icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-400/10" href="/analytics" />
          <KpiCard label="Members"  value="0"    sub="Active now"    icon={Users}      iconColor="text-blue-400"    iconBg="bg-blue-400/10"    href="/members"  />
          <KpiCard label="Renewals" value="0"    sub="Due this week" icon={RefreshCw}  iconColor="text-orange-400"  iconBg="bg-orange-400/10"  href="/members"  />
          <KpiCard label="Payments" value="₹0"  sub="Pending dues"  icon={CreditCard} iconColor="text-rose-400"    iconBg="bg-rose-400/10"    href="/payments" />
          <KpiCard label="Leads"    value="0"    sub="Total leads"   icon={Target}     iconColor="text-violet-400"  iconBg="bg-violet-400/10"  href="/leads"    />
        </div>

        {/* 4 Widgets */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Pending Payments */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-rose-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-3 h-3 text-rose-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">Pending Payments</span>
            </div>
            <div className="text-center py-4 text-white/20 text-xs">No pending payments</div>
            <Link href="/payments" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">View →</Link>
          </div>

          {/* Recent Leads */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-violet-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-3 h-3 text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">Recent Leads</span>
            </div>
            <div className="text-center py-4 text-white/20 text-xs">No leads yet</div>
            <Link href="/leads" className="text-[10px] text-white/25 hover:text-white/50 transition-colors">View →</Link>
          </div>

          {/* Recent Activity */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-blue-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">Recent Activity</span>
            </div>
            <div className="text-center py-4 text-white/20 text-xs">No activity yet</div>
          </div>

          {/* AI Agents */}
          <div className="relative bg-[#0d0d0d] border border-white/[0.07] rounded-2xl p-4 overflow-hidden hover:border-emerald-500/20 transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-white/70">AI Agents</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative"><div className="w-2 h-2 rounded-full bg-emerald-400" /><div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" /></div>
              <span className="text-xs text-white/50">Active — waiting for messages</span>
            </div>
            <Link href="/automations" className="text-[10px] text-white/25 hover:text-white/50 transition-colors mt-2 block">Manage →</Link>
          </div>

        </motion.div>

        {/* Renewals Due */}
        <motion.div variants={fadeUp} className="bg-[#0d0d0d] border border-orange-500/[0.15] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Renewals Due</h3>
            </div>
            <Link href="/members" className="text-[11px] text-white/25 hover:text-white/60 transition-colors">All →</Link>
          </div>
          <div className="text-center py-6 text-white/20 text-xs">No upcoming renewals</div>
        </motion.div>

      </motion.div>

      {/* Right: Live Chat Panel */}
      <div className="hidden xl:block w-72 flex-shrink-0 sticky top-0 h-[calc(100vh-56px-3rem)]">
        <LiveChatPanel />
      </div>

    </div>
  )
}
