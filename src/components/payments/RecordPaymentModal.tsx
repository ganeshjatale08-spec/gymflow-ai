'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { IndianRupee, Hash, Calendar, X, Save, Check } from 'lucide-react'

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (payment: {
    member: string; amount: number; method: string; utr: string
    cheque_no: string; collected_by: string; description: string
    due_date: string; joining_date?: string; plan_end_date?: string
  }) => void
}

type Plan = { id: string; name: string; price: number; duration: 'monthly'|'quarterly'|'yearly'; features: string[] }

const DURATION_MONTHS: Record<string, number> = { monthly:1, quarterly:3, yearly:12 }
const DURATION_LABEL:  Record<string, string>  = { monthly:'/mo', quarterly:'/3mo', yearly:'/yr' }
const methods = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque']

const todayStr = () => new Date().toISOString().split('T')[0]

function addMonths(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

const DEFAULT_PLANS: Plan[] = [
  { id:'1', name:'Starter', price:1999, duration:'monthly',  features:[] },
  { id:'2', name:'Growth',  price:3999, duration:'monthly',  features:[] },
  { id:'3', name:'Elite',   price:5999, duration:'monthly',  features:[] },
]

export function RecordPaymentModal({ open, onClose, onAdd }: RecordPaymentModalProps) {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS)
  const [form, setForm]   = useState({
    member:'', amount:'', method:'UPI', utr:'', cheque_no:'', collected_by:'',
    description:'', due_date: todayStr(), joining_date: todayStr(), plan_end_date:'',
  })
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [saving, setSaving]   = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/data/plans').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length > 0) setPlans(d)
    }).catch(()=>{})
    setForm({ member:'', amount:'', method:'UPI', utr:'', cheque_no:'', collected_by:'', description:'', due_date: todayStr(), joining_date: todayStr(), plan_end_date:'' })
    setSelectedPlan(null)
  }, [open])

  const isUPI    = form.method === 'UPI'
  const isCheque = form.method === 'Cheque'
  const isCash   = form.method === 'Cash'

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handlePlanSelect(plan: Plan) {
    const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    const endDate = addMonths(DURATION_MONTHS[plan.duration] || 1)
    setSelectedPlan(plan)
    setForm(prev => ({
      ...prev,
      amount:        String(plan.price),
      description:   `${plan.name} Plan — ${month}`,
      plan_end_date: endDate,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.member.trim())  { toast.error('Member name required'); return }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Valid amount required'); return }
    if (isUPI    && !form.utr.trim())          { toast.error('UTR required for UPI'); return }
    if (isCheque && !form.cheque_no.trim())    { toast.error('Cheque number required'); return }
    if (isCash   && !form.collected_by.trim()) { toast.error('Collected by required'); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)
    onAdd?.({ ...form, amount: Number(form.amount) })
    toast.success(`✅ ₹${Number(form.amount).toLocaleString('en-IN')} — ${form.member}`)
    onClose()
  }

  const iCls = 'w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-blue/50 transition-colors'
  const lCls = 'block text-[11px] text-white/40 mb-1 font-medium uppercase tracking-wide'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity:0, y: 40 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y: 40 }} transition={{ type:'spring', stiffness:300, damping:30 }}
            className="relative w-full sm:max-w-lg bg-[#0f0f0f] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-white">Record Payment</h2>
                <p className="text-xs text-white/35 mt-0.5">Payment details fill karein</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Scrollable body */}
            <div ref={scrollRef} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* Member */}
              <div>
                <label className={lCls}>Member Name *</label>
                <input value={form.member} onChange={e=>set('member',e.target.value)}
                  placeholder="Member ka naam..." required className={iCls} />
              </div>

              {/* Plan cards */}
              <div>
                <label className={lCls}>Plan Select karo</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {plans.map(p => (
                    <button key={p.id} type="button" onClick={() => handlePlanSelect(p)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        selectedPlan?.id === p.id
                          ? 'bg-blue/15 border-blue/40'
                          : 'bg-white/[0.04] border-white/[0.07] hover:border-white/15'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPlan?.id === p.id ? 'bg-blue border-blue' : 'border-white/20'}`}>
                          {selectedPlan?.id === p.id && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">{p.name}</span>
                          <span className="text-xs text-white/40 ml-2 capitalize">{p.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-white/40">{DURATION_LABEL[p.duration]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lCls}>Amount ₹ *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input value={form.amount} onChange={e=>set('amount',e.target.value)}
                      type="number" min="1" placeholder="3999"
                      className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-blue/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className={lCls}>Method</label>
                  <select value={form.method} onChange={e=>{setForm(p=>({...p,method:e.target.value,utr:'',cheque_no:'',collected_by:''}))}} className={iCls}>
                    {methods.map(m=><option key={m} value={m} className="bg-[#0f0f0f]">{m}</option>)}
                  </select>
                </div>
              </div>

              {/* UTR */}
              <AnimatePresence>
                {isUPI && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                    <div className="p-3 bg-blue/[0.08] border border-blue/20 rounded-xl">
                      <label className="text-xs text-blue-soft font-medium mb-1.5 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />UTR Number * <span className="text-white/30 font-normal ml-auto text-[10px]">12 digits</span>
                      </label>
                      <input value={form.utr} onChange={e=>set('utr',e.target.value.replace(/\D/g,'').slice(0,12))}
                        placeholder="123456789012" maxLength={12}
                        className="w-full bg-white/[0.05] border border-blue/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-blue/50 font-mono tracking-wider" />
                      {form.utr && <p className="text-[10px] text-white/30 mt-1">{form.utr.length}/12{form.utr.length===12&&<span className="text-green ml-1">✓</span>}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cheque */}
              <AnimatePresence>
                {isCheque && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                    <div className="p-3 bg-orange/[0.08] border border-orange/20 rounded-xl">
                      <label className="text-xs text-orange font-medium mb-1.5 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" />Cheque Number * <span className="text-white/30 font-normal ml-auto text-[10px]">6 digits</span>
                      </label>
                      <input value={form.cheque_no} onChange={e=>set('cheque_no',e.target.value.replace(/\D/g,'').slice(0,6))}
                        placeholder="123456" maxLength={6}
                        className="w-full bg-white/[0.05] border border-orange/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none font-mono tracking-wider" />
                      {form.cheque_no && <p className="text-[10px] text-white/30 mt-1">{form.cheque_no.length}/6{form.cheque_no.length===6&&<span className="text-green ml-1">✓</span>}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collected By */}
              <AnimatePresence>
                {isCash && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                    <div className="p-3 bg-green/[0.08] border border-green/20 rounded-xl">
                      <label className="text-xs text-green font-medium mb-1.5">Collected By *</label>
                      <input value={form.collected_by} onChange={e=>set('collected_by',e.target.value)}
                        placeholder="Kisne cash liya... (e.g. Arun Sharma)"
                        className="w-full bg-white/[0.05] border border-green/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <div>
                <label className={lCls}>Description</label>
                <input value={form.description} onChange={e=>set('description',e.target.value)}
                  placeholder="e.g. Growth Plan — June 2026" className={iCls} />
              </div>

              {/* Dates — 3 in a row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={lCls}>
                    <Calendar className="w-3 h-3 inline mr-1" />Payment Date
                  </label>
                  <input type="date" value={form.due_date} onChange={e=>set('due_date',e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className={lCls}>
                    <Calendar className="w-3 h-3 inline mr-1" />Joining Date
                  </label>
                  <input type="date" value={form.joining_date} onChange={e=>set('joining_date',e.target.value)} className={iCls} />
                </div>
                <div>
                  <label className={lCls}>
                    <Calendar className="w-3 h-3 inline mr-1" />Last Date
                  </label>
                  <input type="date" value={form.plan_end_date} onChange={e=>set('plan_end_date',e.target.value)}
                    placeholder="Auto" className={iCls} />
                  {form.plan_end_date && selectedPlan && (
                    <p className="text-[10px] text-white/30 mt-0.5">{selectedPlan.duration}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Fixed Save button at bottom */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0 bg-[#0f0f0f]">
              <button onClick={handleSubmit} disabled={saving}
                className="w-full py-3 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue/20">
                {saving
                  ? <><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Saving...</>
                  : <><Save className="w-4 h-4" />Save Payment</>}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
