'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/Modal'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types'

interface AddLeadModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (lead: {
    name: string; phone: string; email: string; source: string
    interest: string; status: LeadStatus; plan_interest: string
    trial_date: string; assigned_agent: string
  }) => void
}

const sources  = ['whatsapp', 'referral', 'walk-in', 'instagram', 'other']
const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']
const plans    = ['Starter', 'Growth', 'Elite', 'Not decided']
const agents   = ['Asha', 'Priya', 'Ravi', 'Unassigned']

export function AddLeadModal({ open, onClose, onAdd }: AddLeadModalProps) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'whatsapp', interest: '',
    status: 'new' as LeadStatus, plan_interest: 'Not decided',
    trial_date: '', assigned_agent: 'Unassigned',
  })
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.phone.trim()) { toast.error('Phone number is required'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)

    onAdd?.(form)
    toast.success(`Lead added: ${form.name || form.phone}`)
    setForm({ name: '', phone: '', email: '', source: 'whatsapp', interest: '', status: 'new', plan_interest: 'Not decided', trial_date: '', assigned_agent: 'Unassigned' })
    onClose()
  }

  const inputClass = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const labelClass = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Add New Lead" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Kumar" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone <span className="text-red">*</span></label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" required className={inputClass} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="rahul@email.com" className={inputClass} />
        </div>

        {/* Source + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Source</label>
            <select value={form.source} onChange={e => set('source', e.target.value)} className={inputClass}>
              {sources.map(s => <option key={s} value={s} className="bg-surface capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value as LeadStatus)} className={inputClass}>
              {statuses.map(s => <option key={s} value={s} className="bg-surface capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        {/* Interest + Plan */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Interest / Goal</label>
            <input value={form.interest} onChange={e => set('interest', e.target.value)} placeholder="e.g. Weight loss, Yoga..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Interested Plan</label>
            <select value={form.plan_interest} onChange={e => set('plan_interest', e.target.value)} className={inputClass}>
              {plans.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
            </select>
          </div>
        </div>

        {/* Trial Date + Assigned Agent */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Trial Date</label>
            <input type="date" value={form.trial_date} onChange={e => set('trial_date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Assigned Agent</label>
            <select value={form.assigned_agent} onChange={e => set('assigned_agent', e.target.value)} className={inputClass}>
              {agents.map(a => <option key={a} value={a} className="bg-surface">{a}</option>)}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Adding...' : 'Add Lead'}
          </button>
        </div>

      </form>
    </Modal>
  )
}
