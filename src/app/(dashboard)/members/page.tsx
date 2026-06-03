'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Calendar, Phone } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { formatINR } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AddMemberModal } from '@/components/members/AddMemberModal'
import { MemberProfileDrawer } from '@/components/members/MemberProfileDrawer'

type MemberRow = {
  id: string; name: string; phone: string
  plan_name: string; plan_amount: number; plan_end: string
  status: string; attendance_count: number; trainer: string | null
  avatar_url: string | null; joining_date: string | null
  email?: string | null
}

const statusStyle: Record<string, string> = {
  active:   'bg-green/15 text-green',
  expired:  'bg-red/15 text-red',
  paused:   'bg-orange/15 text-orange',
  inactive: 'bg-surface3 text-text-muted',
}

export default function MembersPage() {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [members, setMembers]           = useState<MemberRow[]>([])
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)
  const [checkedIds, setCheckedIds]     = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    fetch('/api/data/members')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMembers(data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const allChecked = filtered.length > 0 && filtered.every(m => checkedIds.has(m.id))
  const anyChecked = checkedIds.size > 0

  function toggleCheck(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setCheckedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAll() {
    setCheckedIds(allChecked ? new Set() : new Set(filtered.map(m => m.id)))
  }

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl w-full">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Members</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage active memberships and renewals</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Add Member
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {[
          { label: 'Total Members',  value: members.length,                                          color: 'text-text-primary' },
          { label: 'Active',         value: members.filter(m => m.status === 'active').length,       color: 'text-green'        },
          { label: 'Expiring Soon',  value: members.filter(m => new Date(m.plan_end) < new Date(Date.now() + 7*86400000) && m.status === 'active').length, color: 'text-orange' },
          { label: 'Expired',        value: members.filter(m => m.status === 'expired').length,      color: 'text-red'          },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card">
            <div className={cn('text-2xl font-bold mb-0.5', color)}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap gap-y-2">
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
          </div>
          {['all', 'active', 'expired', 'paused'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <button onClick={toggleAll} className="flex items-center justify-center w-full">
                    <div className={cn('w-4 h-4 rounded border', allChecked ? 'bg-blue border-blue' : 'border-border')} />
                  </button>
                </th>
                <th>Member</th><th>Plan</th><th>Joining Date</th>
                <th>Renewal</th><th>Trainer</th><th>Attendance</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-text-muted text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-text-muted">
                      <Users className="w-10 h-10 opacity-20" />
                      <p className="text-sm">No members yet</p>
                      <button onClick={() => setShowAddModal(true)}
                        className="text-xs text-blue-soft hover:underline">Add your first member</button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(m => (
                <tr key={m.id} className={cn('cursor-pointer', checkedIds.has(m.id) ? 'bg-blue/5' : '')}
                  onClick={() => setSelectedMember(m)}>
                  <td onClick={e => toggleCheck(m.id, e)} className="text-center">
                    <div className={cn('w-4 h-4 rounded border mx-auto', checkedIds.has(m.id) ? 'bg-blue border-blue' : 'border-border opacity-40')} />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border bg-blue/10">
                        {m.avatar_url ? <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-soft">
                              {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary text-sm">{m.name}</div>
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <Phone className="w-3 h-3" />{m.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-text-secondary">{m.plan_name}</div>
                    <div className="text-xs text-text-muted">{formatINR(m.plan_amount)}/mo</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Calendar className="w-3 h-3 text-text-muted" />{m.joining_date || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Calendar className="w-3 h-3" />{m.plan_end}
                    </div>
                    {new Date(m.plan_end) < new Date(Date.now() + 7 * 86400000) && m.status === 'active' && (
                      <div className="text-xs text-orange mt-0.5">Expiring soon</div>
                    )}
                  </td>
                  <td className="text-sm text-text-secondary">{m.trainer || '—'}</td>
                  <td>
                    <div className="text-sm text-text-secondary">{m.attendance_count} sessions</div>
                  </td>
                  <td>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', statusStyle[m.status])}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>

    <AddMemberModal open={showAddModal} onClose={() => setShowAddModal(false)}
      onAdd={async newMember => {
        const body = {
          name: newMember.name, phone: newMember.phone,
          plan_name: newMember.plan_name, plan_amount: newMember.plan_amount,
          plan_end: newMember.plan_end, status: 'active', attendance_count: 0,
          trainer: newMember.trainer !== 'No Trainer' ? newMember.trainer : null,
          joining_date: new Date().toISOString().split('T')[0],
        }
        const res  = await fetch('/api/data/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const saved = await res.json()
        if (saved.id) setMembers(prev => [{ ...saved, avatar_url: null }, ...prev])
      }} />

    <MemberProfileDrawer member={selectedMember} onClose={() => setSelectedMember(null)}
      onUpdate={async updated => {
        await fetch('/api/data/members', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
        setMembers(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
        setSelectedMember(null)
      }} />
    </>
  )
}
