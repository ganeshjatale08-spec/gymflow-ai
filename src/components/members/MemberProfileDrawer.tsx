'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Pencil, Save, Phone, Mail, Calendar, CreditCard,
  Dumbbell, Activity, CheckCircle2, Clock, XCircle, Camera, User,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatINR } from '@/lib/utils'

type Member = {
  id: string
  name: string
  phone: string
  plan_name: string
  plan_amount: number
  plan_end: string
  status: string
  attendance_count: number
  trainer: string | null
  email?: string | null
  avatar_url?: string | null
  joining_date?: string | null
}

interface Props {
  member: Member | null
  onClose: () => void
  onUpdate?: (updated: Member) => void
}

const plans    = [{ name: 'Starter', amount: 1999 }, { name: 'Growth', amount: 3999 }, { name: 'Elite', amount: 5999 }]
const trainers = ['Arun Sharma', 'Sneha Mehta', 'Rohit Patel', 'Divya Nair', 'No Trainer']
const statuses = ['active', 'paused', 'expired', 'inactive']

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active:   { label: 'Active',   color: 'text-green  bg-green/10  border-green/20',  icon: CheckCircle2 },
  paused:   { label: 'Paused',   color: 'text-orange bg-orange/10 border-orange/20', icon: Clock        },
  expired:  { label: 'Expired',  color: 'text-red    bg-red/10    border-red/20',    icon: XCircle      },
  inactive: { label: 'Inactive', color: 'text-text-muted bg-surface2 border-border', icon: XCircle      },
}

const inputCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'
const labelCls = 'block text-xs text-text-muted mb-1.5'

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function MemberProfileDrawer({ member, onClose, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState<Member | null>(null)
  const [saving, setSaving]   = useState(false)
  const fileRef               = useRef<HTMLInputElement>(null)

  function startEdit() {
    setForm({ ...member! })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
  }

  function setField(field: keyof Member, value: string | number | null) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function handlePlanChange(planName: string) {
    const plan = plans.find(p => p.name === planName)
    if (plan && form) setForm({ ...form, plan_name: plan.name, plan_amount: plan.amount })
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo size must be under 3MB'); return }
    const reader = new FileReader()
    reader.onload = () => setField('avatar_url', reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    if (!form) return
    if (!form.name.trim())  { toast.error('Name is required');  return }
    if (!form.phone.trim()) { toast.error('Phone is required'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)

    onUpdate?.(form)
    toast.success('Member profile updated')
    setEditing(false)
    setForm(null)
  }

  const data = editing ? form! : member
  if (!data) return null

  const sc = statusConfig[data.status] || statusConfig.inactive
  const StatusIcon = sc.icon

  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop */}
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => { cancelEdit(); onClose() }}
          />

          {/* Drawer */}
          <motion.div key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-base font-semibold text-text-primary">
                {editing ? 'Edit Member' : 'Member Profile'}
              </h2>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg hover:bg-blue/15 transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                <button onClick={() => { cancelEdit(); onClose() }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {!editing ? (
                /* ── View Mode ── */
                <div className="p-5 space-y-6">

                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-blue/10 flex items-center justify-center">
                        {data.avatar_url ? (
                          <img src={data.avatar_url} alt={data.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-blue-soft">{getInitials(data.name)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{data.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn('flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border', sc.color)}>
                          <StatusIcon className="w-3 h-3" />{sc.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Contact</h4>
                    <div className="flex items-center gap-3 p-3 bg-surface2 border border-border rounded-xl">
                      <Phone className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="text-sm text-text-primary">{data.phone}</span>
                    </div>
                    {data.email && (
                      <div className="flex items-center gap-3 p-3 bg-surface2 border border-border rounded-xl">
                        <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <span className="text-sm text-text-primary">{data.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Membership */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Membership</h4>
                    <div className="p-4 bg-blue/5 border border-blue/15 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Plan</span>
                        <span className="text-sm font-semibold text-text-primary">{data.plan_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Amount</span>
                        <span className="text-sm font-bold text-blue-soft">{formatINR(data.plan_amount)}/mo</span>
                      </div>
                      {data.joining_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Joined</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-sm text-text-primary">{data.joining_date}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Expiry</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          <span className={cn('text-sm font-medium',
                            new Date(data.plan_end) < new Date(Date.now() + 7 * 86400000) && data.status === 'active'
                              ? 'text-orange' : 'text-text-primary')}>
                            {data.plan_end}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-surface2 border border-border rounded-xl text-center">
                        <div className="text-2xl font-bold text-text-primary mb-0.5">{data.attendance_count}</div>
                        <div className="text-xs text-text-muted flex items-center justify-center gap-1">
                          <Activity className="w-3 h-3" /> Sessions
                        </div>
                      </div>
                      <div className="p-4 bg-surface2 border border-border rounded-xl text-center">
                        <div className="text-sm font-bold text-text-primary mb-0.5 truncate">{data.trainer || '—'}</div>
                        <div className="text-xs text-text-muted flex items-center justify-center gap-1">
                          <Dumbbell className="w-3 h-3" /> Trainer
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* ── Edit Mode ── */
                <div className="p-5 space-y-4">

                  {/* Photo upload */}
                  <div>
                    <label className={labelCls}>Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="relative group flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-surface2 flex items-center justify-center cursor-pointer hover:border-blue/40 transition-colors"
                          onClick={() => fileRef.current?.click()}>
                          {form!.avatar_url ? (
                            <img src={form!.avatar_url} alt="preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <User className="w-6 h-6 text-text-muted" />
                              <span className="text-[10px] text-text-muted">Upload</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </div>
                      <div className="text-xs text-text-muted space-y-1">
                        <p>Click photo to upload</p>
                        <p>JPG, PNG supported</p>
                        <p>Max size: 3MB</p>
                        {form!.avatar_url && (
                          <button onClick={() => setField('avatar_url', null)}
                            className="text-red hover:text-red/80 transition-colors text-xs">
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input value={form!.name} onChange={e => setField('name', e.target.value)} className={inputCls} placeholder="Member name" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Phone *</label>
                      <input value={form!.phone} onChange={e => setField('phone', e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input value={form!.email || ''} onChange={e => setField('email', e.target.value)} type="email" className={inputCls} placeholder="email@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form!.status} onChange={e => setField('status', e.target.value)} className={inputCls}>
                      {statuses.map(s => <option key={s} value={s} className="bg-surface capitalize">{s}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Membership Plan</label>
                      <select value={form!.plan_name} onChange={e => handlePlanChange(e.target.value)} className={inputCls}>
                        {plans.map(p => (
                          <option key={p.name} value={p.name} className="bg-surface">
                            {p.name} — ₹{p.amount.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Joining Date</label>
                      <input type="date" value={form!.joining_date || ''} onChange={e => setField('joining_date', e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Plan Expiry</label>
                    <input type="date" value={form!.plan_end} onChange={e => setField('plan_end', e.target.value)} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Assigned Trainer</label>
                    <select value={form!.trainer || 'No Trainer'} onChange={e => setField('trainer', e.target.value === 'No Trainer' ? null : e.target.value)} className={inputCls}>
                      {trainers.map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Attendance Sessions</label>
                    <input type="number" min="0" value={form!.attendance_count} onChange={e => setField('attendance_count', Number(e.target.value))} className={inputCls} />
                  </div>

                  <div className="p-3 bg-blue/5 border border-blue/15 rounded-xl">
                    <div className="text-xs text-text-muted mb-1">Plan Summary</div>
                    <div className="text-sm font-bold text-text-primary">{form!.plan_name} — {formatINR(form!.plan_amount)}/month</div>
                    {form!.plan_end && <div className="text-xs text-text-muted mt-0.5">Valid until {form!.plan_end}</div>}
                  </div>

                </div>
              )}
            </div>

            {/* Footer — edit mode */}
            {editing && (
              <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
                <button onClick={cancelEdit}
                  className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" />Save Changes</>
                  )}
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
