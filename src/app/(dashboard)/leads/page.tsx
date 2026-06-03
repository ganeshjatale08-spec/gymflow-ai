'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Phone, Mail, MessageSquare, Calendar, LayoutGrid, List, Target } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types'
import { AddLeadModal } from '@/components/leads/AddLeadModal'
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer'

type ExtLead = {
  id: string; name: string; phone: string; email: string | null
  status: LeadStatus; score: number; source: string; interest: string | null
  created_at: string; last_message: string | null; plan_interest: string | null
  trial_date: string | null; assigned_agent: string | null
}

const statusColors: Record<LeadStatus, string> = {
  new:       'bg-text-muted/20 text-text-muted',
  contacted: 'bg-blue/15 text-blue-soft',
  qualified: 'bg-purple/15 text-purple',
  converted: 'bg-green/15 text-green',
  lost:      'bg-red/15 text-red',
}

const scoreColor = (s: number) => s >= 70 ? 'text-green' : s >= 40 ? 'text-orange' : 'text-text-muted'

export default function LeadsPage() {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [leads, setLeads]               = useState<ExtLead[]>([])
  const [viewMode, setViewMode]         = useState<'table' | 'kanban'>('table')
  const [selectedLead, setSelectedLead] = useState<ExtLead | null>(null)

  const statusFilters = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost']

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Leads</h1>
          <p className="text-text-muted text-sm mt-0.5">WhatsApp leads — track, qualify, convert</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface2 border border-border rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('table')}
              className={cn('w-7 h-7 flex items-center justify-center rounded transition-colors',
                viewMode === 'table' ? 'bg-blue/15 text-blue-soft' : 'text-text-muted')}>
              <List className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('kanban')}
              className={cn('w-7 h-7 flex items-center justify-center rounded transition-colors',
                viewMode === 'kanban' ? 'bg-blue/15 text-blue-soft' : 'text-text-muted')}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Add Lead
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: leads.length },
          { label: 'Qualified',   value: leads.filter(l => l.status === 'qualified').length },
          { label: 'Converted',   value: leads.filter(l => l.status === 'converted').length },
          { label: 'Avg Score',   value: leads.length ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0 },
        ].map(({ label, value }) => (
          <div key={label} className="kpi-card">
            <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Kanban */}
      {viewMode === 'kanban' && (
        <motion.div variants={fadeUp} className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {(['new','contacted','qualified','converted','lost'] as LeadStatus[]).map(stage => {
              const stageLeads = leads.filter(l => l.status === stage && (!search || l.name.toLowerCase().includes(search.toLowerCase())))
              const stageBadge: Record<string, string> = {
                new: 'bg-text-muted/20 text-text-muted', contacted: 'bg-blue/15 text-blue-soft',
                qualified: 'bg-purple/15 text-purple', converted: 'bg-green/15 text-green', lost: 'bg-red/15 text-red',
              }
              return (
                <div key={stage} className="w-60 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', stageBadge[stage])}>{stage}</span>
                    <span className="text-xs text-text-muted">{stageLeads.length}</span>
                  </div>
                  <div className="min-h-[200px] rounded-xl border-2 border-dashed border-border/40 p-2 space-y-2">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-6 text-text-muted text-xs">No leads</div>
                    ) : stageLeads.map(lead => (
                      <motion.div key={lead.id} whileHover={{ y: -1 }} onClick={() => setSelectedLead(lead)}
                        className="bg-surface border border-border rounded-xl p-3 cursor-pointer hover:border-blue/30 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-soft flex-shrink-0">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary truncate">{lead.name}</div>
                            <div className="text-[10px] text-text-muted">{lead.phone}</div>
                          </div>
                          <span className={cn('text-[10px] font-bold', scoreColor(lead.score))}>{lead.score}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Table */}
      {viewMode === 'table' && (
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap gap-y-2">
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  statusFilter === s ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Name</th><th>Last Message</th><th>Score</th>
                <th>Plan</th><th>Trial Date</th><th>Status</th><th>Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-text-muted">
                      <Target className="w-10 h-10 opacity-20" />
                      <p className="text-sm">No leads yet</p>
                      <button onClick={() => setShowAddModal(true)} className="text-xs text-blue-soft hover:underline">
                        Add your first lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="cursor-pointer hover:bg-surface2 transition-colors"
                  onClick={() => setSelectedLead(lead)}>
                  <td>
                    <div className="font-medium text-text-primary text-sm">{lead.name || 'Unknown'}</div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Phone className="w-2.5 h-2.5" />{lead.phone}
                    </div>
                  </td>
                  <td>
                    {lead.last_message ? (
                      <div className="flex items-start gap-1.5 max-w-[160px]">
                        <MessageSquare className="w-3 h-3 text-text-muted flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-text-secondary line-clamp-2">{lead.last_message}</span>
                      </div>
                    ) : <span className="text-xs text-text-muted">—</span>}
                  </td>
                  <td>
                    <div className={cn('text-sm font-bold', scoreColor(lead.score))}>{lead.score}</div>
                    <div className="w-12 h-1 bg-surface3 rounded-full mt-1">
                      <div className={cn('h-full rounded-full', lead.score >= 70 ? 'bg-green' : lead.score >= 40 ? 'bg-orange' : 'bg-text-muted')}
                        style={{ width: `${lead.score}%` }} />
                    </div>
                  </td>
                  <td><span className="text-sm text-text-secondary">{lead.plan_interest || '—'}</span></td>
                  <td>
                    {lead.trial_date ? (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Calendar className="w-3 h-3 text-text-muted" />{lead.trial_date}
                      </div>
                    ) : <span className="text-xs text-text-muted">Not set</span>}
                  </td>
                  <td>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', statusColors[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="text-xs text-text-muted">{timeAgo(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      )}
    </motion.div>

    <AddLeadModal open={showAddModal} onClose={() => setShowAddModal(false)}
      onAdd={newLead => {
        setLeads(prev => [{
          id: String(Date.now()), name: newLead.name || newLead.phone, phone: newLead.phone,
          email: newLead.email || null, status: newLead.status, score: 10,
          source: newLead.source, interest: newLead.interest || null,
          last_message: null, plan_interest: null, trial_date: null, assigned_agent: null,
          created_at: new Date().toISOString(),
        }, ...prev])
      }} />

    <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)}
      onUpdate={updated => {
        setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
        setSelectedLead(null)
      }} />
    </>
  )
}
