'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatINR } from '@/lib/utils'

const data = [
  { day: '1', revenue: 42000, leads: 8 },
  { day: '5', revenue: 67000, leads: 14 },
  { day: '10', revenue: 89000, leads: 19 },
  { day: '15', revenue: 134000, leads: 28 },
  { day: '20', revenue: 118000, leads: 22 },
  { day: '25', revenue: 156000, leads: 31 },
  { day: '30', revenue: 198000, leads: 41 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted mb-1">Day {label}</p>
      <p className="text-sm text-blue-soft font-medium">{formatINR(payload[0]?.value)}</p>
    </div>
  )
}

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
