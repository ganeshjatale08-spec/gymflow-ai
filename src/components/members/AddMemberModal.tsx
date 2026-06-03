'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/Modal'

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (member: { name: string; phone: string; plan_name: string; plan_amount: number; plan_end: string; trainer: string }) => void | Promise<void>
}

const plans = [
  { name: 'Starter', amount: 1999 },
  { name: 'Growth', amount: 3999 },
  { name: 'Elite', amount: 5999 },
]

const trainers = ['Arun Sharma', 'Sneha Mehta', 'Rohit Patel', 'Divya Nair', 'No Trainer']

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', plan_name: 'Growth', plan_amount: 3999, plan_end: '', trainer: 'No Trainer' })
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handlePlanChange(planName: string) {
    const plan = plans.find((p) => p.name === planName)
    if (plan) setForm((prev) => ({ ...prev, plan_name: plan.name, plan_amount: plan.amount }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone are required'); return }
    if (!form.plan_end) { toast.error('Please set a plan end date'); return }

    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)

    onAdd?.({ ...form })
    toast.success(`Member added: ${form.name}`)
    setForm({ name: '', phone: '', plan_name: 'Growth', plan_amount: 3999, plan_end: '', trainer: 'No Trainer' })
    onClose()
  }

  const inputClass = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const labelClass = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Add New Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name <span className="text-red">*</span></label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Rahul Kumar" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone <span className="text-red">*</span></label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Membership Plan</label>
            <select value={form.plan_name} onChange={(e) => handlePlanChange(e.target.value)} className={inputClass}>
              {plans.map((p) => <option key={p.name} value={p.name} className="bg-surface">{p.name} — ₹{p.amount.toLocaleString('en-IN')}/mo</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Plan End Date</label>
            <input type="date" value={form.plan_end} onChange={(e) => set('plan_end', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Assigned Trainer</label>
          <select value={form.trainer} onChange={(e) => set('trainer', e.target.value)} className={inputClass}>
            {trainers.map((t) => <option key={t} value={t} className="bg-surface">{t}</option>)}
          </select>
        </div>

        <div className="bg-surface2 border border-border rounded-lg p-3">
          <div className="text-xs text-text-muted mb-1">Plan Summary</div>
          <div className="text-sm font-semibold text-text-primary">{form.plan_name} — ₹{form.plan_amount.toLocaleString('en-IN')}/month</div>
          {form.plan_end && <div className="text-xs text-text-muted mt-0.5">Valid until {form.plan_end}</div>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
