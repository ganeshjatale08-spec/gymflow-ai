'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Search, CheckCircle, Clock, XCircle, IndianRupee, Download, ChevronDown, Receipt, Pencil, Save, X, FileText, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { formatINR } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal'
import { InvoiceModal } from '@/components/payments/InvoiceModal'

type Payment = {
  id: string; member: string; amount: number; status: string
  method: string | null; upi_ref: string | null; cheque_no?: string | null
  description: string; due_date: string; paid_at: string | null
}

const statusStyle: Record<string, { icon: React.ElementType; cls: string }> = {
  completed: { icon: CheckCircle, cls: 'text-green'      },
  pending:   { icon: Clock,       cls: 'text-orange'     },
  failed:    { icon: XCircle,     cls: 'text-red'        },
  refunded:  { icon: XCircle,     cls: 'text-text-muted' },
}

const DATE_FILTERS = ['All', 'Today', 'This Week', 'This Month'] as const
type DateFilter = typeof DATE_FILTERS[number]

function inRange(dateStr: string | null, range: DateFilter) {
  if (range === 'All' || !dateStr) return true
  const d = new Date(dateStr), now = new Date()
  if (range === 'Today') return d.toDateString() === now.toDateString()
  if (range === 'This Week') { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); return d >= s }
  if (range === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  return true
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function PaymentsPage() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [payments, setPayments]     = useState<Payment[]>([])
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null)
  const [loadingPay, setLoadingPay] = useState(true)

  useEffect(() => {
    fetch('/api/data/payments')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPayments(data) })
      .finally(() => setLoadingPay(false))
  }, [])
  const [showExport, setShowExport] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editForm, setEditForm]     = useState<Partial<Payment>>({})

  const filtered = useMemo(() => payments.filter(p => {
    const matchSearch = !search || p.member.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchDate   = inRange(p.paid_at || p.due_date, dateFilter)
    return matchSearch && matchStatus && matchDate
  }), [payments, search, statusFilter, dateFilter])

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const totalPending   = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  function exportCSV() {
    const lines = ['Member,Amount,Description,Method,Due Date,Paid At,Status',
      ...filtered.map(p => `"${p.member}",${p.amount},"${p.description}",${p.method||''},${p.due_date},${p.paid_at||''},${p.status}`)]
    download(lines.join('\n'), 'payments.csv', 'text/csv')
    toast.success('CSV exported'); setShowExport(false)
  }

  function exportExcel() {
    const html = `<html><head><meta charset="utf-8"/></head><body><table>
      <tr><th>Member</th><th>Amount</th><th>Description</th><th>Method</th><th>Due Date</th><th>Status</th></tr>
      ${filtered.map(p => `<tr><td>${p.member}</td><td>${p.amount}</td><td>${p.description}</td><td>${p.method||''}</td><td>${p.due_date}</td><td>${p.status}</td></tr>`).join('')}
    </table></body></html>`
    download(html, 'payments.xls', 'application/vnd.ms-excel')
    toast.success('Excel exported'); setShowExport(false)
  }

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Payments</h1>
          <p className="text-text-muted text-sm mt-0.5">Track fees, UPI transactions, and dues</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowExport(v => !v)}
              className="flex items-center gap-2 border border-border text-text-secondary hover:bg-surface2 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />Export<ChevronDown className="w-3 h-3" />
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden min-w-[150px]">
                  <button onClick={exportCSV} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface2 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-text-muted" />Export CSV
                  </button>
                  <button onClick={exportExcel} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface2 transition-colors">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-text-muted" />Export Excel
                  </button>
                </div>
              </>
            )}
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Record Payment
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card"><div className="text-2xl font-bold text-green mb-0.5">{formatINR(totalCollected)}</div><div className="text-sm text-text-secondary">Collected</div></div>
        <div className="kpi-card"><div className="text-2xl font-bold text-orange mb-0.5">{formatINR(totalPending)}</div><div className="text-sm text-text-secondary">Pending</div></div>
        <div className="kpi-card"><div className="text-2xl font-bold text-text-primary mb-0.5">{payments.filter(p => p.status === 'completed').length}</div><div className="text-sm text-text-secondary">Successful</div></div>
        <div className="kpi-card"><div className="text-2xl font-bold text-red mb-0.5">{payments.filter(p => p.status === 'failed').length}</div><div className="text-sm text-text-secondary">Failed</div></div>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..."
                className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all','completed','pending','failed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                    statusFilter === s ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Period:</span>
            {DATE_FILTERS.map(d => (
              <button key={d} onClick={() => setDateFilter(d)}
                className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  dateFilter === d ? 'bg-green/15 text-green border border-green/25' : 'text-text-muted hover:bg-surface2')}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Member</th><th>Amount</th><th>Description</th>
                <th>Method</th><th>Due Date</th><th>Paid At</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingPay ? (
                <tr><td colSpan={8} className="text-center py-16 text-text-muted text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-text-muted">
                      <CreditCard className="w-10 h-10 opacity-20" />
                      <p className="text-sm">No payments yet</p>
                      <button onClick={() => setShowAddModal(true)} className="text-xs text-blue-soft hover:underline">
                        Record first payment
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const sc   = statusStyle[p.status] || statusStyle.failed
                const Icon = sc.icon
                if (editingId === p.id) return (
                  <tr key={p.id} className="bg-blue/5">
                    <td><input value={editForm.member||''} onChange={e => setEditForm(f=>({...f,member:e.target.value}))}
                      className="w-full bg-surface2 border border-border rounded px-2 py-1 text-xs outline-none" /></td>
                    <td><input type="number" value={editForm.amount||''} onChange={e => setEditForm(f=>({...f,amount:Number(e.target.value)}))}
                      className="w-24 bg-surface2 border border-border rounded px-2 py-1 text-xs outline-none" /></td>
                    <td><input value={editForm.description||''} onChange={e => setEditForm(f=>({...f,description:e.target.value}))}
                      className="w-full bg-surface2 border border-border rounded px-2 py-1 text-xs outline-none" /></td>
                    <td><select value={editForm.method||''} onChange={e => setEditForm(f=>({...f,method:e.target.value}))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs">
                      {['UPI','Cash','Card','Net Banking','Cheque'].map(m => <option key={m}>{m}</option>)}
                    </select></td>
                    <td><input type="date" value={editForm.due_date||''} onChange={e => setEditForm(f=>({...f,due_date:e.target.value}))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs" /></td>
                    <td><input type="date" value={editForm.paid_at||''} onChange={e => setEditForm(f=>({...f,paid_at:e.target.value}))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs" /></td>
                    <td><select value={editForm.status||''} onChange={e => setEditForm(f=>({...f,status:e.target.value}))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs">
                      {['completed','pending','failed','refunded'].map(s => <option key={s}>{s}</option>)}
                    </select></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setPayments(prev => prev.map(x => x.id === editingId ? {...x,...editForm} as Payment : x)); toast.success('Updated'); setEditingId(null) }}
                          className="w-7 h-7 flex items-center justify-center bg-green/10 border border-green/20 text-green rounded-lg">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-7 h-7 flex items-center justify-center bg-surface2 border border-border text-text-muted rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
                return (
                  <tr key={p.id} className="hover:bg-surface2 transition-colors">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center text-xs font-bold text-blue-soft flex-shrink-0">
                          {p.member.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary text-sm">{p.member}</span>
                      </div>
                    </td>
                    <td><div className="flex items-center gap-1 text-sm font-semibold text-text-primary"><IndianRupee className="w-3 h-3" />{p.amount.toLocaleString('en-IN')}</div></td>
                    <td className="text-sm text-text-secondary max-w-[180px] truncate">{p.description}</td>
                    <td><span className="text-xs bg-surface2 px-2 py-0.5 rounded text-text-muted">{p.method||'—'}</span></td>
                    <td className="text-sm text-text-secondary">{p.due_date}</td>
                    <td className="text-sm text-text-secondary">{p.paid_at||'—'}</td>
                    <td><div className={cn('flex items-center gap-1.5 text-xs font-medium',sc.cls)}><Icon className="w-3.5 h-3.5" /><span className="capitalize">{p.status}</span></div></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(p.id); setEditForm({...p}) }}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-blue-soft bg-surface2 hover:bg-blue/10 border border-border hover:border-blue/20 px-2 py-1 rounded-lg transition-all">
                          <Pencil className="w-3 h-3" />Edit
                        </button>
                        <button onClick={() => setInvoicePayment(p)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-green bg-surface2 hover:bg-green/10 border border-border hover:border-green/20 px-2 py-1 rounded-lg transition-all">
                          <Receipt className="w-3 h-3" />Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>

    <RecordPaymentModal open={showAddModal} onClose={() => setShowAddModal(false)}
      onAdd={async newPayment => {
        const body = { member_name: newPayment.member, amount: newPayment.amount, status: 'completed', method: newPayment.method, utr_ref: newPayment.utr||null, cheque_no: newPayment.cheque_no||null, description: newPayment.description, due_date: newPayment.due_date||new Date().toISOString().split('T')[0], paid_at: new Date().toISOString().split('T')[0] }
        const res   = await fetch('/api/data/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const saved = await res.json()
        if (saved.id) setPayments(prev => [{ id: saved.id, member: saved.member_name, amount: saved.amount, status: saved.status, method: saved.method, upi_ref: saved.utr_ref, description: saved.description || '', due_date: saved.due_date, paid_at: saved.paid_at }, ...prev])
      }} />

    <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />
    </>
  )
}
