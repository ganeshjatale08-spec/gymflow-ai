'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Phone, Mail, MessageSquare, Calendar, LayoutGrid, List } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types'
import { AddLeadModal } from '@/components/leads/AddLeadModal'
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer'

// ── Extended lead type ────────────────────────────────
type ExtLead = {
  id: string
  name: string
  phone: string
  email: string | null
  status: LeadStatus
  score: number
  source: string
  interest: string | null
  created_at: string
  last_message: string | null
  plan_interest: string | null
  trial_date: string | null
  assigned_agent: string | null
}

const statusColors: Record<LeadStatus, string> = {
  new:       'bg-text-muted/20 text-text-muted',
  contacted: 'bg-blue/15      text-blue-soft',
  qualified: 'bg-purple/15    text-purple',
  converted: 'bg-green/15     text-green',
  lost:      'bg-red/15       text-red',
}

const scoreColor = (s: number) => s >= 70 ? 'text-green' : s >= 40 ? 'text-orange' : 'text-text-muted'


const mockLeads: ExtLead[] = [
  {
    id: '1', name: 'Priya Sharma',  phone: '+91 98765 43210', email: 'priya@email.com',
    status: 'qualified', score: 78, source: 'whatsapp', interest: 'Weight loss',
    last_message: 'Haan ji pricing bata do',
    plan_interest: 'Growth', trial_date: '2026-06-05', assigned_agent: 'Asha',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2', name: 'Rahul Kumar',   phone: '+91 87654 32109', email: null,
    status: 'converted', score: 95, source: 'whatsapp', interest: 'Muscle gain',
    last_message: 'Membership le li, thanks!',
    plan_interest: 'Elite', trial_date: '2026-05-28', assigned_agent: 'Asha',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3', name: 'Ananya Singh',  phone: '+91 76543 21098', email: 'ananya@gmail.com',
    status: 'contacted', score: 45, source: 'whatsapp', interest: 'General fitness',
    last_message: 'Kal aaunga dekhne',
    plan_interest: 'Starter', trial_date: '2026-06-08', assigned_agent: 'Priya',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4', name: 'Vikram Patel',  phone: '+91 65432 10987', email: null,
    status: 'new', score: 20, source: 'referral', interest: 'Yoga',
    last_message: 'Yoga classes hain kya?',
    plan_interest: null, trial_date: null, assigned_agent: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '5', name: 'Kavya Reddy',   phone: '+91 54321 09876', email: 'kavya@email.com',
    status: 'qualified', score: 65, source: 'whatsapp', interest: 'Zumba',
    last_message: 'Saturday ka time batao',
    plan_interest: 'Growth', trial_date: '2026-06-10', assigned_agent: 'Asha',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '6', name: 'Arjun Mehta',   phone: '+91 43210 98765', email: null,
    status: 'lost', score: 15, source: 'walk-in',  interest: 'Weight training',
    last_message: 'Reply nahi kiya',
    plan_interest: 'Starter', trial_date: null, assigned_agent: 'Priya',
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },
]

export default function LeadsPage() {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [leads, setLeads]             = useState<ExtLead[]>(mockLeads)
  const [viewMode, setViewMode]       = useState<'table' | 'kanban'>('table')
  const [selectedLead, setSelectedLead] = useState<ExtLead | null>(null)

  const statusFilters = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost']

  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = [
    { label: 'Total Leads', value: 247,   change: '+23 today' },
    { label: 'Qualified',   value: 89,    change: '36% rate'  },
    { label: 'Converted',   value: 34,    change: '14% rate'  },
    { label: 'Avg Score',   value: 58,    change: 'out of 100'},
  ]

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Leads</h1>
          <p className="text-text-muted text-sm mt-0.5">WhatsApp leads — track, qualify, convert</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface2 border border-border rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('table')}
              className={cn('w-7 h-7 flex items-center justify-center rounded transition-colors',
                viewMode === 'table' ? 'bg-blue/15 text-blue-soft' : 'text-text-muted hover:text-text-secondary')}>
              <List className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('kanban')}
              className={cn('w-7 h-7 flex items-center justify-center rounded transition-colors',
                viewMode === 'kanban' ? 'bg-blue/15 text-blue-soft' : 'text-text-muted hover:text-text-secondary')}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Add Lead
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, change }) => (
          <div key={label} className="kpi-card">
            <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
            <div className="text-xs text-text-muted mt-1">{change}</div>
          </div>
        ))}
      </motion.div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <motion.div variants={fadeUp} className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {(['new','contacted','qualified','converted','lost'] as LeadStatus[]).map(stage => {
              const stageLeads = leads.filter(l => l.status === stage &&
                (!search || l.name.toLowerCase().includes(search.toLowerCase())))
              const stageColors: Record<string, string> = {
                new: 'border-text-muted/30', contacted: 'border-blue/30',
                qualified: 'border-purple/30', converted: 'border-green/30', lost: 'border-red/30',
              }
              const stageBadge: Record<string, string> = {
                new: 'bg-text-muted/20 text-text-muted', contacted: 'bg-blue/15 text-blue-soft',
                qualified: 'bg-purple/15 text-purple', converted: 'bg-green/15 text-green', lost: 'bg-red/15 text-red',
              }
              return (
                <div key={stage} className="w-60 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', stageBadge[stage])}>
                      {stage}
                    </span>
                    <span className="text-xs text-text-muted">{stageLeads.length}</span>
                  </div>
                  <div className={cn('min-h-[200px] rounded-xl border-2 border-dashed p-2 space-y-2', stageColors[stage])}>
                    {stageLeads.map(lead => (
                      <motion.div key={lead.id} whileHover={{ y: -1 }}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-surface border border-border rounded-xl p-3 cursor-pointer hover:border-blue/30 hover:bg-surface2 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-soft flex-shrink-0">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary truncate">{lead.name}</div>
                            <div className="text-[10px] text-text-muted">{lead.phone}</div>
                          </div>
                          <span className={cn('text-[10px] font-bold flex-shrink-0',
                            lead.score >= 75 ? 'text-green' : lead.score >= 50 ? 'text-orange' : 'text-text-muted')}>
                            {lead.score}
                          </span>
                        </div>
                        {lead.plan_interest && (
                          <div className="text-[10px] text-text-muted bg-surface2 px-1.5 py-0.5 rounded inline-block">
                            {lead.plan_interest}
                          </div>
                        )}
                        {lead.last_message && (
                          <p className="text-[10px] text-text-muted mt-1.5 line-clamp-2 leading-relaxed">{lead.last_message}</p>
                        )}
                        <div className="text-[10px] text-text-muted mt-1.5">{timeAgo(lead.created_at)}</div>
                      </motion.div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-6 text-text-muted text-xs">No leads</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap gap-y-2">
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..." className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  statusFilter === s ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:text-text-secondary hover:bg-surface2')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Last Message</th>
                <th>Score</th>
                <th>Plan</th>
                <th>Trial Date</th>
                <th>Status</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="cursor-pointer hover:bg-surface2 transition-colors"
                  onClick={() => setSelectedLead(lead)}>

                  {/* Name */}
                  <td>
                    <div className="font-medium text-text-primary text-sm">{lead.name || 'Unknown'}</div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Phone className="w-2.5 h-2.5" />{lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Mail className="w-2.5 h-2.5" />{lead.email}
                      </div>
                    )}
                  </td>

                  {/* Last Message */}
                  <td>
                    {lead.last_message ? (
                      <div className="flex items-start gap-1.5 max-w-[160px]">
                        <MessageSquare className="w-3 h-3 text-text-muted flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{lead.last_message}</span>
                      </div>
                    ) : <span className="text-xs text-text-muted">—</span>}
                  </td>

                  {/* Score */}
                  <td>
                    <div className={cn('text-sm font-bold', scoreColor(lead.score))}>{lead.score}</div>
                    <div className="w-12 h-1 bg-surface3 rounded-full mt-1">
                      <div className={cn('h-full rounded-full', lead.score >= 70 ? 'bg-green' : lead.score >= 40 ? 'bg-orange' : 'bg-text-muted')}
                        style={{ width: `${lead.score}%` }} />
                    </div>
                  </td>

                  {/* Plan */}
                  <td>
                    {lead.plan_interest
                      ? <span className="text-xs font-medium text-text-secondary">{lead.plan_interest}</span>
                      : <span className="text-xs text-text-muted">—</span>}
                    {lead.interest && (
                      <div className="text-xs text-text-muted mt-0.5 truncate max-w-[90px]">{lead.interest}</div>
                    )}
                  </td>

                  {/* Trial Date */}
                  <td>
                    {lead.trial_date ? (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Calendar className="w-3 h-3 text-text-muted" />
                        {lead.trial_date}
                      </div>
                    ) : <span className="text-xs text-text-muted">Not set</span>}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', statusColors[lead.status])}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Added */}
                  <td className="text-xs text-text-muted whitespace-nowrap">{timeAgo(lead.created_at)}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      )} {/* end table view */}

    </motion.div>

    <AddLeadModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      onAdd={(newLead) => {
        setLeads(prev => [{
          id:             String(Date.now()),
          name:           newLead.name || newLead.phone,
          phone:          newLead.phone,
          email:          newLead.email || null,
          status:         newLead.status,
          score:          10,
          source:         newLead.source,
          interest:       newLead.interest || null,
          last_message:   null,
          plan_interest:  null,
          trial_date:     null,
          assigned_agent: null,
          created_at:     new Date().toISOString(),
        }, ...prev])
      }}
    />

    <LeadDetailDrawer
      lead={selectedLead}
      onClose={() => setSelectedLead(null)}
      onUpdate={updated => {
        setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
        setSelectedLead(null)
      }}
    />
    </>
  )
}
