'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Plus, MessageSquare, Zap, Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { GlowCard } from '@/components/shared/GlowCard'
import { StatusDot } from '@/components/shared/StatusDot'
import { cn } from '@/lib/utils'

const mockAgents = [
  {
    id: '1',
    name: 'Asha — Lead Qualifier',
    description: 'Handles new leads from WhatsApp, qualifies them with smart questions, and books trials.',
    model: 'gpt-4o',
    is_active: true,
    message_count: 1243,
    triggers: ['pricing', 'membership', 'join', 'fees', 'gym'],
    today: 18,
    conversion_rate: 34,
  },
  {
    id: '2',
    name: 'Priya — Follow-up Agent',
    description: 'Automatically follows up with leads who showed interest but did not convert.',
    model: 'gpt-4o',
    is_active: true,
    message_count: 876,
    triggers: ['follow up', 'remind', 'renewal'],
    today: 12,
    conversion_rate: 28,
  },
  {
    id: '3',
    name: 'Ravi — Support Agent',
    description: 'Handles existing member queries — schedules, trainers, diet advice, and complaints.',
    model: 'gpt-4o',
    is_active: true,
    message_count: 534,
    triggers: ['schedule', 'trainer', 'diet', 'help', 'support'],
    today: 7,
    conversion_rate: null,
  },
  {
    id: '4',
    name: 'Kavita — Payment Reminder',
    description: 'Sends payment reminders and handles renewal conversations with existing members.',
    model: 'gpt-4o',
    is_active: false,
    message_count: 298,
    triggers: ['payment', 'due', 'renewal', 'expire'],
    today: 0,
    conversion_rate: 72,
  },
]

export default function AIAgentsPage() {
  const [agents, setAgents] = useState(mockAgents)

  function toggleAgent(id: string) {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: !a.is_active } : a))
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">AI Agents</h1>
          <p className="text-text-muted text-sm mt-0.5">Configure and monitor your AI workforce</p>
        </div>
        <button className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </motion.div>

      {/* Overview stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Agents', value: agents.filter(a => a.is_active).length, color: 'text-green' },
          { label: 'Messages Today', value: agents.reduce((s, a) => s + a.today, 0), color: 'text-blue-soft' },
          { label: 'Total Messages', value: agents.reduce((s, a) => s + a.message_count, 0).toLocaleString(), color: 'text-text-primary' },
          { label: 'Avg Conversion', value: '34%', color: 'text-orange' },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card">
            <div className={`text-2xl font-bold mb-0.5 ${color}`}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <GlowCard key={agent.id} className={cn('p-5', !agent.is_active && 'opacity-60')}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  agent.is_active ? 'bg-blue/15 border border-blue/30' : 'bg-surface2 border border-border'
                )}>
                  <Bot className={cn('w-5 h-5', agent.is_active ? 'text-blue-soft' : 'text-text-muted')} />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusDot status={agent.is_active ? 'active' : 'offline'} size="sm" />
                    <span className="text-xs text-text-muted">{agent.model}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
                  <Edit className="w-3.5 h-3.5 text-text-muted" />
                </button>
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={cn(
                    'text-sm transition-colors',
                    agent.is_active ? 'text-green' : 'text-text-muted'
                  )}
                >
                  {agent.is_active ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{agent.description}</p>

            {/* Triggers */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.triggers.map((t) => (
                <span key={t} className="text-xs bg-surface2 border border-border px-2 py-0.5 rounded-full text-text-muted">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs border-t border-border pt-3">
              <div className="flex items-center gap-1 text-text-secondary">
                <MessageSquare className="w-3 h-3" />
                {agent.message_count.toLocaleString()} messages
              </div>
              <div className="text-text-muted">+{agent.today} today</div>
              {agent.conversion_rate && (
                <div className="flex items-center gap-1 text-green">
                  <Zap className="w-3 h-3" />
                  {agent.conversion_rate}% conversion
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </motion.div>
    </motion.div>
  )
}
