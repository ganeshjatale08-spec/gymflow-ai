'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { IndianRupee, Hash, Calendar } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (payment: { member: string; amount: number; method: string; utr: string; cheque_no: string; collected_by: string; description: string; due_date: string; joining_date?: string }) => void
}

type Plan = { id: string; name: string; price: number; duration: 'monthly'|'quarterly'|'yearly'; features: string[] }

const DURATION_MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, yearly: 12 }
const methods = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque']

const today = () => new Date().toISOString().split('T')[0]

function planEndDate(duration: string): string {
  const d = new Date()
  d.setMonth(d.getMonth() + (DURATION_MONTHS[duration] || 1))
  return d.toISOString().split('T')[0]
}

const DEFAULT_PLANS: Plan[] = [
  { id:'1', name:'Starter', price:1999, duration:'monthly',  features:[] },
  { id:'2', name:'Growth',  price:3999, duration:'monthly',  features:[] },
  { id:'3', name:'Elite',   price:5999, duration:'monthly',  features:[] },
]

export function RecordPaymentModal({ open, onClose, onAdd }: RecordPaymentModalProps) {
  const [plans, setPlans]   = useState<Plan[]>(DEFAULT_PLANS)
  const [form, setForm]     = useState({
    member: '', amount: '', method: 'UPI', utr: '', cheque_no: '',
    collected_by: '', description: '', due_date: today(), joining_date: today(),
  })
  const [saving, setSaving] = useState(false)

  // Load real plans from Settings
  useEffect(() => {
    if (!open) return
    fetch('/api/data/plans').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length > 0) setPlans(d)
    }).catch(()=>{})
    // Reset form with today's dates
    setForm(prev => ({ ...prev, due_date: today(), joining_date: today() }))
  }, [open])

  const isUPI    = form.method === 'UPI'
  const isCheque = form.method === 'Cheque'
  const isCash   = form.method === 'Cash'

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleMethodChange(value: string) {
    setForm(prev => ({ ...prev, method: value, utr: '', cheque_no: '', collected_by: '' }))
  }

  // When Quick Fill plan is selected — auto-fill everything
  function selectPlan(plan: Plan) {
    const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    setForm(prev => ({
      ...prev,
      amount:      String(plan.price),
      description: `${plan.name} Plan — ${month}`,
      due_date:    today(),
      joining_date: today(),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.member.trim())  { toast.error('Member name required'); return }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Valid amount required'); return }
    if (isUPI    && !form.utr.trim())        { toast.error('UTR number required for UPI'); return }
    if (isCheque && !form.cheque_no.trim())  { toast.error('Cheque number required'); return }
    if (isCash   && !form.collected_by.trim()) { toast.error('Collected by name required'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)

    onAdd?.({ ...form, amount: Number(form.amount) })
    toast.success(`Payment recorded — ₹${Number(form.amount).toLocaleString('en-IN')} from ${form.member}`)
    setForm({ member:'', amount:'', method:'UPI', utr:'', cheque_no:'', collected_by:'', description:'', due_date: today(), joining_date: today() })
    onClose()
  }

  const iCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const lCls = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Member name */}
        <div>
          <label className={lCls}>Member Name <span className="text-red">*</span></label>
          <input value={form.member} onChange={e => set('member', e.target.value)}
            placeholder="Member ka naam likhein..." required className={iCls} />
        </div>

        {/* Quick fill plans */}
        <div>
          <label className={lCls}>Plan Select karo (auto-fill hoga)</label>
          <div className="grid grid-cols-1 gap-1.5">
            {plans.map(p => (
              <button key={p.id} type="button" onClick={() => selectPlan(p)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all text-sm ${
                  form.amount === String(p.price)
                    ? 'bg-blue/10 border-blue/30 text-blue-soft'
                    : 'bg-surface2 border-border hover:border-blue/20 text-text-secondary'
                }`}>
                <span className="font-medium">{p.name}</span>
                <div className="text-right">
                  <span className="font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-text-muted ml-1">
                    /{p.duration === 'monthly' ? 'mo' : p.duration === 'quarterly' ? '3mo' : 'yr'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lCls}>Amount (₹) <span className="text-red">*</span></label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input value={form.amount} onChange={e => set('amount', e.target.value)}
                type="number" min="1" placeholder="3999"
                className="w-full bg-surface2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className={lCls}>Payment Method</label>
            <select value={form.method} onChange={e => handleMethodChange(e.target.value)} className={iCls}>
              {methods.map(m => <option key={m} value={m} className="bg-surface">{m}</option>)}
            </select>
          </div>
        </div>

        {/* UTR */}
        <AnimatePresence>
          {isUPI && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
              <div className="p-3 bg-blue/5 border border-blue/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-blue-soft font-medium mb-1.5">
                  <Hash className="w-3 h-3" />UTR Number <span className="text-red">*</span>
                  <span className="text-[10px] text-text-muted font-normal ml-auto">12-digit</span>
                </label>
                <input value={form.utr} onChange={e => set('utr', e.target.value.replace(/\D/g,'').slice(0,12))}
                  placeholder="123456789012" maxLength={12}
                  className="w-full bg-surface2 border border-blue/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/50 font-mono tracking-wider" />
                {form.utr && <p className="text-[11px] text-text-muted mt-1">{form.utr.length}/12 {form.utr.length===12&&<span className="text-green ml-1">✓ Valid</span>}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cheque */}
        <AnimatePresence>
          {isCheque && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
              <div className="p-3 bg-orange/5 border border-orange/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-orange font-medium mb-1.5">
                  <Hash className="w-3 h-3" />Cheque Number <span className="text-red">*</span>
                  <span className="text-[10px] text-text-muted font-normal ml-auto">6-digit</span>
                </label>
                <input value={form.cheque_no} onChange={e => set('cheque_no', e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="123456" maxLength={6}
                  className="w-full bg-surface2 border border-orange/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-orange/40 font-mono tracking-wider" />
                {form.cheque_no && <p className="text-[11px] text-text-muted mt-1">{form.cheque_no.length}/6 {form.cheque_no.length===6&&<span className="text-green ml-1">✓ Valid</span>}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collected By */}
        <AnimatePresence>
          {isCash && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
              <div className="p-3 bg-green/5 border border-green/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-green font-medium mb-1.5">
                  Collected By <span className="text-red">*</span>
                </label>
                <input value={form.collected_by} onChange={e => set('collected_by', e.target.value)}
                  placeholder="e.g. Arun Sharma, Front Desk"
                  className="w-full bg-surface2 border border-green/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-green/40" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        <div>
          <label className={lCls}>Description</label>
          <input value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="e.g. Growth Plan — June 2026" className={iCls} />
        </div>

        {/* Due Date + Joining Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lCls}>
              <Calendar className="w-3 h-3 inline mr-1" />
              Payment Date
            </label>
            <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className={iCls} />
          </div>
          <div>
            <label className={lCls}>
              <Calendar className="w-3 h-3 inline mr-1" />
              Joining Date
            </label>
            <input type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} className={iCls} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Recording...' : 'Record Payment'}
          </button>
        </div>

      </form>
    </Modal>
  )
}
