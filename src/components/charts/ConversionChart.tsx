'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { name: 'Converted', value: 34, color: '#22c55e' },
  { name: 'Qualified', value: 28, color: '#3b82f6' },
  { name: 'Contacted', value: 22, color: '#f97316' },
  { name: 'New', value: 16, color: '#475569' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{payload[0].name}</p>
      <p className="text-sm text-text-secondary">{payload[0].value}%</p>
    </div>
  )
}

export function ConversionChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
