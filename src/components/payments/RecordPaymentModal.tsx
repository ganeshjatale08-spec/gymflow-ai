'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { IndianRupee, Hash } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (payment: { member: string; amount: number; method: string; utr: string; cheque_no: string; description: string; due_date: string }) => void
}

const members = ['Rahul Kumar', 'Priya Sharma', 'Ananya Singh', 'Vikram Patel', 'Kavya Reddy', 'Arjun Mehta']
const methods = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque']
const plans = [
  { name: 'Starter Plan', amount: 1999 },
  { name: 'Growth Plan',  amount: 3999 },
  { name: 'Elite Plan',   amount: 5999 },
]

export function RecordPaymentModal({ open, onClose, onAdd }: RecordPaymentModalProps) {
  const [form, setForm] = useState({ member: '', amount: '', method: 'UPI', utr: '', cheque_no: '', collected_by: '', description: '', due_date: '' })
  const [saving, setSaving] = useState(false)

  const isUPI    = form.method === 'UPI'
  const isCheque = form.method === 'Cheque'
  const isCash   = form.method === 'Cash'

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleMethodChange(value: string) {
    setForm(prev => ({ ...prev, method: value, utr: '', cheque_no: '', collected_by: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.member) { toast.error('Please select a member'); return }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return }
    if (isUPI    && !form.utr.trim())        { toast.error('UTR number required for UPI payment'); return }
    if (isCheque && !form.cheque_no.trim())  { toast.error('Cheque number required'); return }
    if (isCash   && !form.collected_by.trim()) { toast.error('Please enter who collected the cash'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)

    onAdd?.({ ...form, amount: Number(form.amount) })
    toast.success(`Payment recorded — ₹${Number(form.amount).toLocaleString('en-IN')} from ${form.member}`)
    setForm({ member: '', amount: '', method: 'UPI', utr: '', cheque_no: '', collected_by: '', description: '', due_date: '' })
    onClose()
  }

  const inputClass = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const labelClass = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className={labelClass}>Member <span className="text-red">*</span></label>
          <select value={form.member} onChange={e => set('member', e.target.value)} required className={inputClass}>
            <option value="" className="bg-surface">Select member...</option>
            {members.map(m => <option key={m} value={m} className="bg-surface">{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Amount (₹) <span className="text-red">*</span></label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input value={form.amount} onChange={e => set('amount', e.target.value)}
                type="number" min="1" placeholder="3999"
                className="w-full bg-surface2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Payment Method</label>
            <select value={form.method} onChange={e => handleMethodChange(e.target.value)} className={inputClass}>
              {methods.map(m => <option key={m} value={m} className="bg-surface">{m}</option>)}
            </select>
          </div>
        </div>

        {/* UTR field — only for UPI */}
        <AnimatePresence>
          {isUPI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-blue/5 border border-blue/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-blue-soft font-medium mb-1.5">
                  <Hash className="w-3 h-3" />
                  UTR Number <span className="text-red">*</span>
                  <span className="text-[10px] text-text-muted font-normal ml-auto">12-digit transaction ID</span>
                </label>
                <input
                  value={form.utr}
                  onChange={e => set('utr', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="e.g. 123456789012"
                  maxLength={12}
                  className="w-full bg-surface2 border border-blue/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/50 transition-colors font-mono tracking-wider"
                />
                {form.utr && (
                  <p className="text-[11px] text-text-muted mt-1.5">
                    {form.utr.length}/12 digits
                    {form.utr.length === 12 && <span className="text-green ml-2">✓ Valid UTR</span>}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cheque No — only for Cheque */}
        <AnimatePresence>
          {isCheque && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-orange/5 border border-orange/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-orange font-medium mb-1.5">
                  <Hash className="w-3 h-3" />
                  Cheque Number <span className="text-red">*</span>
                  <span className="text-[10px] text-text-muted font-normal ml-auto">6-digit cheque no.</span>
                </label>
                <input
                  value={form.cheque_no}
                  onChange={e => set('cheque_no', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  className="w-full bg-surface2 border border-orange/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-orange/40 transition-colors font-mono tracking-wider"
                />
                {form.cheque_no && (
                  <p className="text-[11px] text-text-muted mt-1.5">
                    {form.cheque_no.length}/6 digits
                    {form.cheque_no.length === 6 && <span className="text-green ml-2">✓ Valid cheque no.</span>}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collected By — only for Cash */}
        <AnimatePresence>
          {isCash && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-green/5 border border-green/15 rounded-xl">
                <label className="flex items-center gap-1.5 text-xs text-green font-medium mb-1.5">
                  <Hash className="w-3 h-3" />
                  Collected By <span className="text-red">*</span>
                  <span className="text-[10px] text-text-muted font-normal ml-auto">Name of person who received cash</span>
                </label>
                <input
                  value={form.collected_by}
                  onChange={e => set('collected_by', e.target.value)}
                  placeholder="e.g. Arun Sharma, Front Desk"
                  className="w-full bg-surface2 border border-green/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-green/40 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className={labelClass}>Quick Fill</label>
          <div className="flex gap-2 flex-wrap">
            {plans.map(p => (
              <button key={p.name} type="button"
                onClick={() => setForm(prev => ({ ...prev, amount: String(p.amount), description: `${p.name} — ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}` }))}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface2 border border-border text-text-muted hover:border-blue/30 hover:text-text-secondary transition-colors">
                {p.name} ₹{p.amount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="e.g. Growth Plan — June 2026" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Due Date</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Recording...' : 'Record Payment'}
          </button>
        </div>

      </form>
    </Modal>
  )
}
