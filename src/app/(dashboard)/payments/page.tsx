'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Plus, Search, CheckCircle, Clock, XCircle,
  IndianRupee, FileText, Download, FileSpreadsheet,
  ChevronDown, Receipt, Pencil, Save, X,
} from 'lucide-react'
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

const mockPayments: Payment[] = [
  { id: '1', member: 'Rahul Kumar',  amount: 3999, status: 'completed', method: 'UPI',  upi_ref: 'TXN123456789', description: 'Growth Plan — June 2026',   due_date: '2026-06-01', paid_at: '2026-06-01' },
  { id: '2', member: 'Priya Sharma', amount: 5999, status: 'pending',   method: null,   upi_ref: null,            description: 'Elite Plan — June 2026',    due_date: '2026-06-05', paid_at: null          },
  { id: '3', member: 'Ananya Singh', amount: 1999, status: 'completed', method: 'Cash', upi_ref: null,            description: 'Starter Plan — June 2026',  due_date: '2026-06-01', paid_at: '2026-06-02' },
  { id: '4', member: 'Vikram Patel', amount: 3999, status: 'failed',    method: 'UPI',  upi_ref: 'TXN_FAILED_001',description: 'Growth Plan — May 2026',    due_date: '2026-05-28', paid_at: null          },
  { id: '5', member: 'Kavya Reddy',  amount: 5999, status: 'completed', method: 'Card', upi_ref: null,            description: 'Elite Plan — June 2026',    due_date: '2026-06-08', paid_at: '2026-06-07' },
  { id: '6', member: 'Arjun Mehta',  amount: 1999, status: 'pending',   method: null,   upi_ref: null,            description: 'Starter Plan — June 2026',  due_date: '2026-06-10', paid_at: null          },
]

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
  if (range === 'Today') {
    return d.toDateString() === now.toDateString()
  }
  if (range === 'This Week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay())
    start.setHours(0,0,0,0)
    return d >= start
  }
  if (range === 'This Month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  return true
}

// ── Export helpers ────────────────────────────────────
function exportCSV(rows: Payment[]) {
  const headers = ['ID', 'Member', 'Amount', 'Status', 'Method', 'UTR/Ref', 'Description', 'Due Date', 'Paid At']
  const lines   = [
    headers.join(','),
    ...rows.map(p => [
      p.id, `"${p.member}"`, p.amount, p.status,
      p.method || '', p.upi_ref || '', `"${p.description}"`, p.due_date, p.paid_at || '',
    ].join(',')),
  ]
  download(lines.join('\n'), 'payments.csv', 'text/csv')
  toast.success('CSV exported')
}

function exportExcel(rows: Payment[]) {
  const headers = ['ID', 'Member', 'Amount (₹)', 'Status', 'Method', 'UTR / Ref', 'Description', 'Due Date', 'Paid At']
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8"/></head>
    <body><table>
      <tr>${headers.map(h => `<th><b>${h}</b></th>`).join('')}</tr>
      ${rows.map(p => `<tr>
        <td>${p.id}</td><td>${p.member}</td><td>${p.amount}</td><td>${p.status}</td>
        <td>${p.method || ''}</td><td>${p.upi_ref || ''}</td><td>${p.description}</td>
        <td>${p.due_date}</td><td>${p.paid_at || ''}</td>
      </tr>`).join('')}
    </table></body></html>`
  download(html, 'payments.xls', 'application/vnd.ms-excel')
  toast.success('Excel exported')
}

function exportPDF(rows: Payment[]) {
  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
      h2  { margin-bottom: 8px; }
      p   { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th  { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
      td  { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
      .green  { color: #16a34a; } .orange { color: #d97706; } .red { color: #dc2626; }
    </style></head>
    <body>
      <h2>Payment Report</h2>
      <p>Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} — ${rows.length} records</p>
      <table>
        <thead><tr><th>Member</th><th>Amount</th><th>Description</th><th>Method</th><th>Due Date</th><th>Paid At</th><th>Status</th></tr></thead>
        <tbody>${rows.map(p => `
          <tr>
            <td>${p.member}</td>
            <td>₹${p.amount.toLocaleString('en-IN')}</td>
            <td>${p.description}</td>
            <td>${p.method || '—'}</td>
            <td>${p.due_date}</td>
            <td>${p.paid_at || '—'}</td>
            <td class="${p.status === 'completed' ? 'green' : p.status === 'pending' ? 'orange' : 'red'}">${p.status}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
  toast.success('PDF ready — use Save as PDF in print dialog')
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Page ─────────────────────────────────────────────
export default function PaymentsPage() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [payments, setPayments]         = useState<Payment[]>(mockPayments)
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editForm, setEditForm]         = useState<Partial<Payment>>({})

  function startEdit(p: Payment) {
    setEditingId(p.id)
    setEditForm({ ...p })
  }

  function cancelEdit() { setEditingId(null); setEditForm({}) }

  function saveEdit() {
    setPayments(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } as Payment : p))
    toast.success('Payment updated')
    cancelEdit()
  }

  const filtered = useMemo(() => payments.filter(p => {
    const matchSearch = !search ||
      p.member.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchDate   = inRange(p.paid_at || p.due_date, dateFilter)
    return matchSearch && matchStatus && matchDate
  }), [payments, search, statusFilter, dateFilter])

  const totalCollected = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const totalPending   = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const totalFailed    = payments.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0)

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Payments</h1>
          <p className="text-text-muted text-sm mt-0.5">Track fees, UPI transactions, and dues</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <button onClick={() => setShowExport(v => !v)}
              className="flex items-center gap-2 border border-border text-text-secondary hover:bg-surface2 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
                  {[
                    { label: 'Export CSV',   icon: FileText,        action: () => { exportCSV(filtered);   setShowExport(false) } },
                    { label: 'Export Excel', icon: FileSpreadsheet, action: () => { exportExcel(filtered); setShowExport(false) } },
                    { label: 'Export PDF',   icon: FileText,        action: () => { exportPDF(filtered);   setShowExport(false) } },
                  ].map(({ label, icon: Icon, action }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface2 hover:text-text-primary transition-colors text-left">
                      <Icon className="w-3.5 h-3.5 text-text-muted" />
                      {label}
                    </button>
                  ))}
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

      {/* KPI cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card">
          <div className="text-2xl font-bold text-green mb-0.5">{formatINR(totalCollected)}</div>
          <div className="text-sm text-text-secondary">Collected</div>
          <div className="text-xs text-text-muted mt-0.5">{payments.filter(p => p.status === 'completed').length} payments</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-orange mb-0.5">{formatINR(totalPending)}</div>
          <div className="text-sm text-text-secondary">Pending</div>
          <div className="text-xs text-text-muted mt-0.5">{payments.filter(p => p.status === 'pending').length} members</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-red mb-0.5">{formatINR(totalFailed)}</div>
          <div className="text-sm text-text-secondary">Failed</div>
          <div className="text-xs text-text-muted mt-0.5">{payments.filter(p => p.status === 'failed').length} transactions</div>
        </div>
        <div className="kpi-card">
          <div className="text-2xl font-bold text-text-primary mb-0.5">{formatINR(totalCollected + totalPending)}</div>
          <div className="text-sm text-text-secondary">Total Billed</div>
          <div className="text-xs text-text-muted mt-0.5">{payments.length} records</div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-border space-y-3">
          {/* Row 1: search + status filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..."
                className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'completed', 'pending', 'failed'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                    statusFilter === s ? 'bg-blue/15 text-blue-soft border border-blue/30' : 'text-text-muted hover:bg-surface2')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Date filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Period:</span>
            <div className="flex gap-1.5">
              {DATE_FILTERS.map(d => (
                <button key={d} onClick={() => setDateFilter(d)}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                    dateFilter === d ? 'bg-green/15 text-green border border-green/25' : 'text-text-muted hover:bg-surface2')}>
                  {d}
                </button>
              ))}
            </div>
            {filtered.length !== payments.length && (
              <span className="text-xs text-text-muted ml-2">{filtered.length} of {payments.length} records</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Method</th>
                <th>Due Date</th>
                <th>Paid At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sc   = statusStyle[p.status] || statusStyle.failed
                const Icon = sc.icon
                const isEditing = editingId === p.id

                if (isEditing) return (
                  <tr key={p.id} className="bg-blue/5">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center text-xs font-bold text-blue-soft flex-shrink-0">
                          {(editForm.member || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                        </div>
                        <input value={editForm.member || ''} onChange={e => setEditForm(f => ({ ...f, member: e.target.value }))}
                          className="flex-1 bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-blue/40" />
                      </div>
                    </td>
                    <td><input type="number" value={editForm.amount || ''} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="w-24 bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-blue/40" /></td>
                    <td><input value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none focus:border-blue/40" /></td>
                    <td>
                      <select value={editForm.method || ''} onChange={e => setEditForm(f => ({ ...f, method: e.target.value }))}
                        className="bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none">
                        {['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque'].map(m => <option key={m} value={m} className="bg-surface">{m}</option>)}
                      </select>
                    </td>
                    <td><input type="date" value={editForm.due_date || ''} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none" /></td>
                    <td><input type="date" value={editForm.paid_at || ''} onChange={e => setEditForm(f => ({ ...f, paid_at: e.target.value }))}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none" /></td>
                    <td>
                      <select value={editForm.status || ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                        className="bg-surface2 border border-border rounded px-2 py-1 text-xs text-text-primary outline-none">
                        {['completed', 'pending', 'failed', 'refunded'].map(s => <option key={s} value={s} className="bg-surface capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={saveEdit} className="w-7 h-7 flex items-center justify-center bg-green/10 border border-green/20 text-green rounded-lg hover:bg-green/20 transition-colors">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center bg-surface2 border border-border text-text-muted rounded-lg hover:bg-red/10 hover:text-red transition-colors">
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
                          {p.member.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary text-sm">{p.member}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                        <IndianRupee className="w-3 h-3" />
                        {p.amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="text-sm text-text-secondary max-w-[180px] truncate">{p.description}</td>
                    <td>
                      <span className="text-xs bg-surface2 px-2 py-0.5 rounded text-text-muted">{p.method || '—'}</span>
                      {p.upi_ref && <div className="text-xs text-text-dim mt-0.5 font-mono">{p.upi_ref}</div>}
                    </td>
                    <td className="text-sm text-text-secondary">{p.due_date}</td>
                    <td className="text-sm text-text-secondary">{p.paid_at || <span className="text-text-muted">—</span>}</td>
                    <td>
                      <div className={cn('flex items-center gap-1.5 text-xs font-medium', sc.cls)}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="capitalize">{p.status}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(p)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-blue-soft bg-surface2 hover:bg-blue/10 border border-border hover:border-blue/20 px-2 py-1 rounded-lg transition-all">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setInvoicePayment(p)}
                          className="flex items-center gap-1 text-xs text-text-muted hover:text-green bg-surface2 hover:bg-green/10 border border-border hover:border-green/20 px-2 py-1 rounded-lg transition-all">
                          <Receipt className="w-3 h-3" /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-muted text-sm">
                    No payments found for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>

    <RecordPaymentModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      onAdd={(newPayment) => {
        setPayments(prev => [{
          id: String(Date.now()),
          member:      newPayment.member,
          amount:      newPayment.amount,
          status:      'completed',
          method:      newPayment.method,
          upi_ref:     newPayment.utr || null,
          cheque_no:   newPayment.cheque_no || null,
          description: newPayment.description,
          due_date:    newPayment.due_date || new Date().toISOString().split('T')[0],
          paid_at:     new Date().toISOString().split('T')[0],
        }, ...prev])
      }}
    />

    <InvoiceModal payment={invoicePayment} onClose={() => setInvoicePayment(null)} />
    </>
  )
}
