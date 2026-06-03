'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Calendar, Phone, MessageSquare, RefreshCw, X, CheckSquare, Square } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { formatINR } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AddMemberModal } from '@/components/members/AddMemberModal'
import { MemberProfileDrawer } from '@/components/members/MemberProfileDrawer'

const mockMembers = [
  { id: '1', name: 'Rahul Kumar',  phone: '+91 98765 43210', plan_name: 'Growth',  plan_amount: 3999, plan_end: '2026-07-15', status: 'active',  attendance_count: 24, trainer: 'Arun S.',  avatar_url: null as string | null, joining_date: '2025-01-10' },
  { id: '2', name: 'Priya Sharma', phone: '+91 87654 32109', plan_name: 'Elite',   plan_amount: 5999, plan_end: '2026-06-30', status: 'active',  attendance_count: 18, trainer: 'Sneha M.', avatar_url: null as string | null, joining_date: '2025-03-22' },
  { id: '3', name: 'Ananya Singh', phone: '+91 76543 21098', plan_name: 'Starter', plan_amount: 1999, plan_end: '2026-06-10', status: 'active',  attendance_count: 7,  trainer: null,        avatar_url: null as string | null, joining_date: '2026-05-01' },
  { id: '4', name: 'Vikram Patel', phone: '+91 65432 10987', plan_name: 'Growth',  plan_amount: 3999, plan_end: '2026-05-28', status: 'expired', attendance_count: 31, trainer: 'Arun S.',  avatar_url: null as string | null, joining_date: '2024-11-15' },
  { id: '5', name: 'Kavya Reddy',  phone: '+91 54321 09876', plan_name: 'Elite',   plan_amount: 5999, plan_end: '2026-08-01', status: 'active',  attendance_count: 42, trainer: 'Sneha M.', avatar_url: null as string | null, joining_date: '2024-09-05' },
  { id: '6', name: 'Arjun Mehta',  phone: '+91 43210 98765', plan_name: 'Starter', plan_amount: 1999, plan_end: '2026-06-20', status: 'paused',  attendance_count: 3,  trainer: null,        avatar_url: null as string | null, joining_date: '2026-04-18' },
]

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
  const [members, setMembers]           = useState<MemberRow[]>(mockMembers)
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)

  // Bulk selection
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const filtered = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  const allChecked = filtered.length > 0 && filtered.every(m => checkedIds.has(m.id))
  const anyChecked = checkedIds.size > 0

  function toggleCheck(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(filtered.map(m => m.id)))
    }
  }

  function clearSelection() { setCheckedIds(new Set()) }

  const selectedMembers = members.filter(m => checkedIds.has(m.id))

  async function bulkSendMessage() {
    toast.success(`WhatsApp message sent to ${checkedIds.size} members`)
    clearSelection()
  }

  async function bulkRenew() {
    const newEnd = new Date()
    newEnd.setMonth(newEnd.getMonth() + 1)
    const newEndStr = newEnd.toISOString().split('T')[0]
    setMembers(prev => prev.map(m =>
      checkedIds.has(m.id) ? { ...m, status: 'active', plan_end: newEndStr } : m
    ))
    toast.success(`${checkedIds.size} memberships renewed for 1 month`)
    clearSelection()
  }

  const stats = [
    { label: 'Active Members', value: '847', sub: '+12 this month' },
    { label: 'Expiring Soon',  value: '23',  sub: 'Next 7 days', warn: true },
    { label: 'Revenue MTD',    value: '₹2,34,500', sub: 'Membership fees' },
    { label: 'Avg Attendance', value: '18',  sub: 'Sessions/month' },
  ]

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
        {stats.map(({ label, value, sub, warn }) => (
          <div key={label} className="kpi-card">
            <div className={cn('text-2xl font-bold mb-0.5', warn ? 'text-orange' : 'text-text-primary')}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
            <div className="text-xs text-text-muted mt-1">{sub}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap gap-y-2">
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
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

        {/* ── Bulk Action Bar ── */}
        <AnimatePresence>
          {anyChecked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-blue/5 border-b border-blue/15 flex-wrap gap-y-2">
                <span className="text-sm font-semibold text-blue-soft">
                  {checkedIds.size} member{checkedIds.size > 1 ? 's' : ''} selected
                </span>

                <div className="flex items-center gap-2 ml-2">
                  {/* Send WhatsApp */}
                  <button onClick={bulkSendMessage}
                    className="flex items-center gap-1.5 text-xs font-medium bg-green/10 border border-green/25 text-green px-3 py-1.5 rounded-lg hover:bg-green/15 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Send WhatsApp
                  </button>

                  {/* Renew */}
                  <button onClick={bulkRenew}
                    className="flex items-center gap-1.5 text-xs font-medium bg-blue/10 border border-blue/25 text-blue-soft px-3 py-1.5 rounded-lg hover:bg-blue/15 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew 1 Month
                  </button>
                </div>

                <button onClick={clearSelection} className="ml-auto text-text-muted hover:text-text-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <button onClick={toggleAll} className="flex items-center justify-center w-full">
                    {allChecked
                      ? <CheckSquare className="w-4 h-4 text-blue-soft" />
                      : <Square className="w-4 h-4 text-text-muted" />}
                  </button>
                </th>
                <th>Member</th>
                <th>Plan</th>
                <th>Joining Date</th>
                <th>Renewal</th>
                <th>Trainer</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}
                  className={cn('cursor-pointer transition-colors', checkedIds.has(m.id) ? 'bg-blue/5' : '')}
                  onClick={() => setSelectedMember(m)}
                >
                  {/* Checkbox */}
                  <td onClick={e => toggleCheck(m.id, e)} className="text-center">
                    {checkedIds.has(m.id)
                      ? <CheckSquare className="w-4 h-4 text-blue-soft mx-auto" />
                      : <Square className="w-4 h-4 text-text-muted mx-auto opacity-40 hover:opacity-100 transition-opacity" />}
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border bg-blue/10">
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-soft">
                              {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>}
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
                      <Calendar className="w-3 h-3 text-text-muted" />{m.joining_date}
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
                    <div className="w-16 h-1 bg-surface3 rounded-full mt-1">
                      <div className="h-full bg-blue rounded-full" style={{ width: `${Math.min((m.attendance_count / 30) * 100, 100)}%` }} />
                    </div>
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
      onAdd={newMember => {
        setMembers(prev => [{
          id: String(Date.now()), name: newMember.name, phone: newMember.phone,
          plan_name: newMember.plan_name, plan_amount: newMember.plan_amount,
          plan_end: newMember.plan_end, status: 'active', attendance_count: 0,
          trainer: newMember.trainer !== 'No Trainer' ? newMember.trainer : null,
          avatar_url: null, joining_date: new Date().toISOString().split('T')[0],
        }, ...prev])
      }} />

    <MemberProfileDrawer member={selectedMember} onClose={() => setSelectedMember(null)}
      onUpdate={updated => {
        setMembers(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
        setSelectedMember(null)
      }} />
    </>
  )
}
