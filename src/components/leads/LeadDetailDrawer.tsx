'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Mail, MessageSquare, Calendar, Bot, Target, Pencil, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn, timeAgo } from '@/lib/utils'
import type { LeadStatus } from '@/types'

type Lead = {
  id: string; name: string; phone: string; email: string | null
  status: LeadStatus; score: number; interest: string | null
  last_message: string | null; plan_interest: string | null
  trial_date: string | null; assigned_agent: string | null
  created_at: string
}

const statusColors: Record<LeadStatus, string> = {
  new:       'bg-text-muted/20 text-text-muted',
  contacted: 'bg-blue/15 text-blue-soft',
  qualified: 'bg-purple/15 text-purple',
  converted: 'bg-green/15 text-green',
  lost:      'bg-red/15 text-red',
}

const scoreColor = (s: number) => s >= 75 ? 'text-green' : s >= 50 ? 'text-orange' : 'text-text-muted'

const mockConversation = [
  { role: 'user',      text: 'Hello gym ke baare mein jaanna tha',             time: new Date(Date.now() - 7200000).toISOString() },
  { role: 'assistant', text: 'Namaste! 🙏 Kaunsa plan dekhna chahenge?\n• Starter ₹1,999\n• Growth ₹3,999\n• Elite ₹5,999', time: new Date(Date.now() - 7100000).toISOString() },
  { role: 'user',      text: 'Growth plan ke baare mein batao',                time: new Date(Date.now() - 3600000).toISOString() },
  { role: 'assistant', text: 'Growth Plan includes unlimited access, 2 PT sessions/week & diet consultation. Trial visit book karein? ✅', time: new Date(Date.now() - 3500000).toISOString() },
]

interface Props {
  lead: Lead | null
  onClose: () => void
  onUpdate?: (updated: Lead) => void
}

const inputCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'

export function LeadDetailDrawer({ lead, onClose, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState<Lead | null>(null)
  const [saving, setSaving]   = useState(false)

  function startEdit() { setForm({ ...lead! }); setEditing(true) }
  function cancelEdit() { setEditing(false); setForm(null) }

  function set(field: keyof Lead, value: string | null) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    onUpdate?.(form)
    toast.success('Lead updated')
    setEditing(false)
    setForm(null)
  }

  const data = editing ? form! : lead
  if (!data) return null

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={() => { cancelEdit(); onClose() }} />

          <motion.div key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-base font-semibold text-text-primary">{editing ? 'Edit Lead' : 'Lead Details'}</h2>
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

            <div className="flex-1 overflow-y-auto">
              {!editing ? (
                <div className="p-5 space-y-5">

                  {/* Profile */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-xl font-bold text-violet-400 flex-shrink-0">
                      {data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">{data.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize border', statusColors[data.status])}>
                          {data.status}
                        </span>
                        <span className={cn('text-sm font-bold', scoreColor(data.score))}>Score: {data.score}</span>
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

                  {/* Lead Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lead Info</h4>
                    <div className="p-4 bg-violet-500/5 border border-violet-500/15 rounded-xl space-y-2.5">
                      {[
                        { label: 'Interest',       value: data.interest       },
                        { label: 'Interested Plan', value: data.plan_interest  },
                        { label: 'Trial Date',      value: data.trial_date     },
                        { label: 'Assigned Agent',  value: data.assigned_agent },
                      ].map(({ label, value }) => value ? (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">{label}</span>
                          <span className="text-sm font-medium text-text-primary">{value}</span>
                        </div>
                      ) : null)}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Added</span>
                        <span className="text-sm text-text-primary">{timeAgo(data.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last Message */}
                  {data.last_message && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Last Message</h4>
                      <div className="flex items-start gap-2 p-3 bg-surface2 border border-border rounded-xl">
                        <MessageSquare className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-text-secondary">{data.last_message}</p>
                      </div>
                    </div>
                  )}

                  {/* Conversation History */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Conversation History</h4>
                    <div className="space-y-2">
                      {mockConversation.map((msg, i) => (
                        <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-start' : 'justify-end')}>
                          <div className={cn(
                            'max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap',
                            msg.role === 'user'
                              ? 'bg-surface2 border border-border text-text-secondary rounded-tl-sm'
                              : 'bg-blue/10 border border-blue/20 text-text-primary rounded-tr-sm'
                          )}>
                            {msg.text}
                            <div className="text-[9px] text-text-muted mt-1 text-right">{timeAgo(msg.time)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1.5">Name</label>
                      <input value={form!.name} onChange={e => set('name', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1.5">Phone</label>
                      <input value={form!.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Email</label>
                    <input value={form!.email || ''} onChange={e => set('email', e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1.5">Status</label>
                      <select value={form!.status} onChange={e => set('status', e.target.value as LeadStatus)} className={inputCls}>
                        {(['new','contacted','qualified','converted','lost'] as LeadStatus[]).map(s =>
                          <option key={s} value={s} className="bg-surface capitalize">{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1.5">Interested Plan</label>
                      <select value={form!.plan_interest || ''} onChange={e => set('plan_interest', e.target.value)} className={inputCls}>
                        {['', 'Starter', 'Growth', 'Elite', 'Not decided'].map(p =>
                          <option key={p} value={p} className="bg-surface">{p || '—'}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Interest / Goal</label>
                    <input value={form!.interest || ''} onChange={e => set('interest', e.target.value)} placeholder="Weight loss, Yoga..." className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Trial Date</label>
                    <input type="date" value={form!.trial_date || ''} onChange={e => set('trial_date', e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
                <button onClick={cancelEdit} className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
