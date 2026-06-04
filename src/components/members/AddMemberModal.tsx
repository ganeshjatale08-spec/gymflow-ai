'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/Modal'

type Plan = { id: string; name: string; price: number; duration: 'monthly' | 'quarterly' | 'yearly'; features: string[]; popular: boolean }

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (member: { name: string; phone: string; plan_name: string; plan_amount: number; plan_end: string; trainer: string }) => void | Promise<void>
}

const DURATION_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 }
const DURATION_LABEL:  Record<string, string> = { monthly: '/mo', quarterly: '/3mo', yearly: '/yr' }

const DEFAULT_PLANS: Plan[] = [
  { id:'1', name:'Starter', price:1999, duration:'monthly',  features:[], popular:false },
  { id:'2', name:'Growth',  price:3999, duration:'monthly',  features:[], popular:true  },
  { id:'3', name:'Elite',   price:5999, duration:'monthly',  features:[], popular:false },
]

const trainers = ['Arun Sharma', 'Sneha Mehta', 'Rohit Patel', 'Divya Nair', 'No Trainer']

function calcEndDate(duration: string): string {
  const months = DURATION_MONTHS[duration] || 1
  const d      = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const [plans, setPlans]   = useState<Plan[]>(DEFAULT_PLANS)
  const [form, setForm]     = useState({ name: '', phone: '', plan_name: '', plan_amount: 0, plan_end: '', trainer: 'No Trainer' })
  const [saving, setSaving] = useState(false)

  // Load plans from Settings (Supabase)
  useEffect(() => {
    if (!open) return
    fetch('/api/data/plans')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data)
          // Set default to first plan
          const first = data[0]
          setForm(prev => ({
            ...prev,
            plan_name:   first.name,
            plan_amount: first.price,
            plan_end:    calcEndDate(first.duration),
          }))
        } else {
          // Fallback to defaults
          const first = DEFAULT_PLANS[1]
          setForm(prev => ({
            ...prev,
            plan_name:   first.name,
            plan_amount: first.price,
            plan_end:    calcEndDate(first.duration),
          }))
        }
      })
      .catch(() => {})
  }, [open])

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handlePlanChange(planName: string) {
    const plan = plans.find(p => p.name === planName)
    if (plan) {
      setForm(prev => ({
        ...prev,
        plan_name:   plan.name,
        plan_amount: plan.price,
        plan_end:    calcEndDate(plan.duration),  // Auto-calculate end date!
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim())  { toast.error('Name required'); return }
    if (!form.phone.trim()) { toast.error('Phone required'); return }
    if (!form.plan_end)     { toast.error('Plan end date required'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)

    onAdd?.({ ...form })
    toast.success(`Member added: ${form.name}`)
    setForm({ name: '', phone: '', plan_name: '', plan_amount: 0, plan_end: '', trainer: 'No Trainer' })
    onClose()
  }

  const selectedPlan = plans.find(p => p.name === form.plan_name)
  const inputClass   = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const labelClass   = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Add New Member">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Kumar" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" required className={inputClass} />
          </div>
        </div>

        {/* Plan selector */}
        <div>
          <label className={labelClass}>Membership Plan</label>
          <div className="grid grid-cols-1 gap-2">
            {plans.map(p => (
              <button key={p.id} type="button" onClick={() => handlePlanChange(p.name)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                  form.plan_name === p.name
                    ? 'bg-blue/10 border-blue/30'
                    : 'bg-surface2 border-border hover:border-blue/20'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${form.plan_name === p.name ? 'bg-blue border-blue' : 'border-border'}`} />
                  <div>
                    <span className={`text-sm font-semibold ${form.plan_name === p.name ? 'text-blue-soft' : 'text-text-primary'}`}>{p.name}</span>
                    {p.popular && <span className="ml-2 text-[10px] font-semibold text-blue-soft bg-blue/10 border border-blue/20 px-1.5 py-0.5 rounded-full">Popular</span>}
                    <div className="text-[10px] text-text-muted mt-0.5 capitalize">{p.duration} plan</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-text-primary">₹{p.price.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-text-muted">{DURATION_LABEL[p.duration]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Plan end date — auto filled but editable */}
        <div>
          <label className={labelClass}>
            Plan End Date
            {selectedPlan && (
              <span className="ml-2 text-blue-soft">
                (Auto: {DURATION_MONTHS[selectedPlan.duration]} month{DURATION_MONTHS[selectedPlan.duration] > 1 ? 's' : ''})
              </span>
            )}
          </label>
          <input type="date" value={form.plan_end} onChange={e => set('plan_end', e.target.value)} className={inputClass} />
        </div>

        {/* Trainer */}
        <div>
          <label className={labelClass}>Assigned Trainer</label>
          <select value={form.trainer} onChange={e => set('trainer', e.target.value)} className={inputClass}>
            {trainers.map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
          </select>
        </div>

        {/* Summary */}
        {form.plan_name && (
          <div className="bg-blue/5 border border-blue/15 rounded-xl p-3">
            <div className="text-xs text-text-muted mb-0.5">Plan Summary</div>
            <div className="text-sm font-semibold text-text-primary">
              {form.plan_name} — ₹{form.plan_amount.toLocaleString('en-IN')}{DURATION_LABEL[selectedPlan?.duration || 'monthly']}
            </div>
            {form.plan_end && (
              <div className="text-xs text-text-muted mt-0.5">
                Valid until {form.plan_end}
                {selectedPlan && <span className="ml-1 text-blue-soft">({selectedPlan.duration})</span>}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-1">
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
