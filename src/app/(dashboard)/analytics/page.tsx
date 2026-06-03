'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Users, MessageSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

const {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} = require('recharts')

// ── Data ─────────────────────────────────────────────
const monthlyComparison = [
  { month: 'Jan', revenue: 185000, leads: 38, conversions: 12, members: 810 },
  { month: 'Feb', revenue: 192000, leads: 42, conversions: 15, members: 820 },
  { month: 'Mar', revenue: 201000, leads: 51, conversions: 18, members: 831 },
  { month: 'Apr', revenue: 195000, leads: 45, conversions: 14, members: 826 },
  { month: 'May', revenue: 218000, leads: 58, conversions: 21, members: 840 },
  { month: 'Jun', revenue: 234500, leads: 65, conversions: 23, members: 847 },
]

const planData = [
  { name: 'Growth',  value: 42, color: '#3b82f6', revenue: 167916 },
  { name: 'Elite',   value: 31, color: '#a855f7', revenue: 185969 },
  { name: 'Starter', value: 27, color: '#22c55e', revenue:  53973 },
]


const kpis = [
  { label: 'Total Leads (30d)',  value: '247',   change: '+28%', positive: true  },
  { label: 'Conversion Rate',   value: '16.6%',  change: '+3.2%', positive: true },
  { label: 'Avg Response Time', value: '< 1s',   change: 'AI-powered', positive: true },
  { label: 'Revenue Attributed',value: '₹1.2L',  change: '+41%', positive: true  },
]

const periods = ['3 Months', '6 Months', '12 Months']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-xs text-text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name === 'Revenue'
            ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6 Months')
  const [revenueMetric, setRevenueMetric] = useState<'revenue' | 'leads' | 'conversions'>('revenue')

  const shown = period === '3 Months' ? monthlyComparison.slice(-3) : monthlyComparison

  const metricConfig = {
    revenue:     { label: 'Revenue',     color: '#3b82f6', format: (v: number) => `₹${(v/1000).toFixed(0)}k` },
    leads:       { label: 'Leads',       color: '#a855f7', format: (v: number) => `${v}` },
    conversions: { label: 'Conversions', color: '#22c55e', format: (v: number) => `${v}` },
  }

  const current = monthlyComparison[monthlyComparison.length - 1]
  const prev    = monthlyComparison[monthlyComparison.length - 2]
  const revGrowth = (((current.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1)

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Analytics</h1>
          <p className="text-text-muted text-sm mt-0.5">Performance insights — last 6 months</p>
        </div>
        <div className="flex items-center gap-1 bg-surface2 border border-border rounded-lg p-1">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors',
                period === p ? 'bg-blue/15 text-blue-soft' : 'text-text-muted hover:text-text-secondary')}>
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, change, positive }) => (
          <div key={label} className="kpi-card">
            <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
            <div className={cn('flex items-center gap-0.5 text-xs mt-1', positive ? 'text-green' : 'text-red')}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Monthly Comparison Chart ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Monthly Comparison</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {period} · Revenue growth: <span className={Number(revGrowth) >= 0 ? 'text-green' : 'text-red'}>
                {Number(revGrowth) >= 0 ? '+' : ''}{revGrowth}%
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface2 border border-border rounded-lg p-1">
            {(['revenue','leads','conversions'] as const).map(m => (
              <button key={m} onClick={() => setRevenueMetric(m)}
                className={cn('px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors',
                  revenueMetric === m ? 'bg-blue/15 text-blue-soft' : 'text-text-muted hover:text-text-secondary')}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={shown} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={metricConfig[revenueMetric].format} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={revenueMetric} name={metricConfig[revenueMetric].label}
              fill={metricConfig[revenueMetric].color} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Plan Popularity + Members Growth ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Plan Popularity */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Plan Popularity</h3>
          <p className="text-xs text-text-muted mb-4">Member distribution by plan</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  dataKey="value" paddingAngle={3}>
                  {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {planData.map(p => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-sm text-text-secondary font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">{p.value}%</span>
                  </div>
                  <div className="h-1.5 bg-surface2 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.color }} />
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">Revenue: ₹{p.revenue.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Members Growth */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Members Growth</h3>
          <p className="text-xs text-text-muted mb-4">Total active members over time</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={shown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="members" name="Members" stroke="#22c55e"
                strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── AI Performance ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">AI Performance</h3>
        <div className="space-y-3">
          {[
            { label: 'Messages Handled by AI', value: 1243, max: 1500, color: 'bg-blue'   },
            { label: 'Leads Qualified by AI',  value: 89,   max: 247,  color: 'bg-purple' },
            { label: 'Trials Booked via AI',   value: 34,   max: 89,   color: 'bg-green'  },
            { label: 'Renewals via Automation',value: 67,   max: 100,  color: 'bg-orange' },
          ].map(({ label, value, max, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-muted">{value} / {max}</span>
              </div>
              <div className="h-2 bg-surface2 rounded-full">
                <motion.div className={`h-full ${color} rounded-full`}
                  initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  )
}
