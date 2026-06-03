'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCog, Plus, Search, Phone, Mail, Pencil, Trash2,
  Save, X, Camera, User, IndianRupee, Calendar, Shield,
  CheckCircle2, Clock, XCircle, Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Role = 'Manager' | 'Trainer' | 'Receptionist' | 'Accountant' | 'Cleaner' | 'Security' | 'Other'
type Status = 'active' | 'inactive' | 'on-leave'

type Employee = {
  id: string
  name: string
  phone: string
  email: string | null
  role: Role
  status: Status
  salary: number
  joining_date: string
  address: string | null
  emergency_contact: string | null
  avatar_url: string | null
  notes: string | null
}

const ROLES: Role[] = ['Manager', 'Trainer', 'Receptionist', 'Accountant', 'Cleaner', 'Security', 'Other']

const roleColors: Record<Role, string> = {
  Manager:      'bg-blue/10 text-blue-soft border-blue/20',
  Trainer:      'bg-orange/10 text-orange border-orange/20',
  Receptionist: 'bg-green/10 text-green border-green/20',
  Accountant:   'bg-purple/10 text-purple border-purple/20',
  Cleaner:      'bg-text-muted/10 text-text-muted border-border',
  Security:     'bg-red/10 text-red border-red/20',
  Other:        'bg-surface2 text-text-muted border-border',
}

const statusConfig: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  'active':   { label: 'Active',    color: 'text-green bg-green/10 border-green/20',     icon: CheckCircle2 },
  'inactive': { label: 'Inactive',  color: 'text-red bg-red/10 border-red/20',           icon: XCircle      },
  'on-leave': { label: 'On Leave',  color: 'text-orange bg-orange/10 border-orange/20',  icon: Clock        },
}

const inputCls  = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'
const labelCls  = 'block text-xs text-text-muted mb-1.5 font-medium'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

// ── Employee Form Modal ───────────────────────────────
function EmployeeModal({
  open, onClose, onSave, initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (emp: Omit<Employee, 'id'>) => void
  initial?: Employee | null
}) {
  const [form, setForm] = useState<Omit<Employee, 'id'>>({
    name: '', phone: '', email: null, role: 'Trainer', status: 'active',
    salary: 0, joining_date: new Date().toISOString().split('T')[0],
    address: null, emergency_contact: null, avatar_url: null, notes: null,
  })
  const [saving, setSaving] = useState(false)
  const fileRef = useState<HTMLInputElement | null>(null)

  useEffect(() => {
    if (initial) {
      const { id, ...rest } = initial
      setForm(rest)
    } else {
      setForm({ name: '', phone: '', email: null, role: 'Trainer', status: 'active', salary: 0, joining_date: new Date().toISOString().split('T')[0], address: null, emergency_contact: null, avatar_url: null, notes: null })
    }
  }, [initial, open])

  function set(field: keyof typeof form, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => set('avatar_url', reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    if (!form.phone.trim()) { toast.error('Phone required'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)
    onSave(form)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-base font-semibold text-text-primary">
                {initial ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">

              {/* Photo */}
              <div className="flex items-center gap-4">
                <label className="relative group cursor-pointer flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-surface2 flex items-center justify-center overflow-hidden hover:border-blue/40 transition-colors group">
                    {form.avatar_url
                      ? <img src={form.avatar_url} alt="preview" className="w-full h-full object-cover" />
                      : <div className="flex flex-col items-center gap-1">
                          <User className="w-5 h-5 text-text-muted" />
                          <span className="text-[10px] text-text-muted">Photo</span>
                        </div>}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
                <div className="text-xs text-text-muted space-y-1">
                  <p>Click to upload photo</p>
                  <p>JPG, PNG · Max 2MB</p>
                  {form.avatar_url && (
                    <button onClick={() => set('avatar_url', null)} className="text-red/70 hover:text-red text-xs transition-colors">Remove</button>
                  )}
                </div>
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Arun Sharma" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email</label>
                <input value={form.email || ''} onChange={e => set('email', e.target.value || null)} type="email" placeholder="arun@gym.com" className={inputCls} />
              </div>

              {/* Role + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Role *</label>
                  <select value={form.role} onChange={e => set('role', e.target.value as Role)} className={inputCls}>
                    {ROLES.map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as Status)} className={inputCls}>
                    <option value="active"   className="bg-surface">Active</option>
                    <option value="inactive" className="bg-surface">Inactive</option>
                    <option value="on-leave" className="bg-surface">On Leave</option>
                  </select>
                </div>
              </div>

              {/* Salary + Joining Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Monthly Salary (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input type="number" min="0" value={form.salary || ''} onChange={e => set('salary', Number(e.target.value))}
                      placeholder="15000" className="w-full bg-surface2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Joining Date</label>
                  <input type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelCls}>Address</label>
                <input value={form.address || ''} onChange={e => set('address', e.target.value || null)} placeholder="Full address" className={inputCls} />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className={labelCls}>Emergency Contact</label>
                <input value={form.emergency_contact || ''} onChange={e => set('emergency_contact', e.target.value || null)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value || null)} rows={2}
                  placeholder="Any additional info..." className={cn(inputCls, 'resize-none')} />
              </div>

            </div>

            <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : (initial ? 'Update' : 'Add Employee')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Employee | null>(null)
  const [selected, setSelected]   = useState<Employee | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/data/employees')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setEmployees(data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search)
    const matchRole   = roleFilter === 'all' || e.role === roleFilter
    return matchSearch && matchRole
  })

  function openAdd()           { setEditing(null); setShowModal(true) }
  function openEdit(e: Employee) { setEditing(e);    setShowModal(true) }

  async function handleSave(form: Omit<Employee, 'id'>) {
    if (editing) {
      const res  = await fetch('/api/data/employees', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      const saved = await res.json()
      if (saved.id) setEmployees(prev => prev.map(e => e.id === editing.id ? saved : e))
      toast.success('Employee updated')
    } else {
      const res  = await fetch('/api/data/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const saved = await res.json()
      if (saved.id) setEmployees(prev => [saved, ...prev])
      toast.success('Employee added')
    }
    setEditing(null)
  }

  async function deleteEmployee(id: string) {
    await fetch('/api/data/employees', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setEmployees(prev => prev.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(null)
    toast.success('Employee removed')
  }

  const stats = [
    { label: 'Total Staff',   value: employees.length,                                        color: 'text-text-primary' },
    { label: 'Active',        value: employees.filter(e => e.status === 'active').length,     color: 'text-green'        },
    { label: 'On Leave',      value: employees.filter(e => e.status === 'on-leave').length,   color: 'text-orange'       },
    { label: 'Total Payroll', value: `₹${employees.filter(e => e.status === 'active').reduce((s, e) => s + e.salary, 0).toLocaleString('en-IN')}`, color: 'text-blue-soft' },
  ]

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Employees</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage gym staff, roles, and payroll</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Add Employee
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="kpi-card">
            <div className={cn('text-2xl font-bold mb-0.5', color)}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
            className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setRoleFilter('all')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              roleFilter === 'all' ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
            All
          </button>
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                roleFilter === r ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Employee Cards Grid */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-16 text-center">
            <UserCog className="w-12 h-12 text-text-muted opacity-20 mx-auto mb-3" />
            <p className="text-sm text-text-muted font-medium">No employees yet</p>
            <p className="text-xs text-text-muted mt-1">Click "Add Employee" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(emp => {
              const sc   = statusConfig[emp.status]
              const StatusIcon = sc.icon
              return (
                <motion.div key={emp.id} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
                  className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group cursor-pointer hover:border-blue/20 transition-all"
                  onClick={() => setSelected(selected?.id === emp.id ? null : emp)}>
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-blue/10 flex-shrink-0">
                        {emp.avatar_url
                          ? <img src={emp.avatar_url} alt={emp.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-soft">
                              {getInitials(emp.name)}
                            </div>}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{emp.name}</h3>
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', roleColors[emp.role])}>
                          {emp.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(emp)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-text-muted hover:text-blue-soft transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteEmployee(emp.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{emp.phone}</span>
                    </div>
                    {emp.email && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Joined {emp.joining_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', sc.color)}>
                      <StatusIcon className="w-3 h-3" />{sc.label}
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      ₹{emp.salary.toLocaleString('en-IN')}<span className="text-xs text-text-muted font-normal">/mo</span>
                    </span>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selected?.id === emp.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          {emp.address && (
                            <div className="flex items-start gap-2 text-xs text-text-muted">
                              <Briefcase className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>{emp.address}</span>
                            </div>
                          )}
                          {emp.emergency_contact && (
                            <div className="flex items-center gap-2 text-xs text-text-muted">
                              <Shield className="w-3 h-3 flex-shrink-0" />
                              <span>Emergency: {emp.emergency_contact}</span>
                            </div>
                          )}
                          {emp.notes && (
                            <p className="text-xs text-text-muted bg-surface2 rounded-lg px-2.5 py-2 border border-border">
                              {emp.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

    </motion.div>

    <EmployeeModal
      open={showModal}
      onClose={() => { setShowModal(false); setEditing(null) }}
      onSave={handleSave}
      initial={editing}
    />
    </>
  )
}
