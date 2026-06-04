'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

type Payment = {
  id: string; member: string; amount: number; status: string
  method: string | null; upi_ref?: string | null; cheque_no?: string | null
  collected_by?: string | null; description: string | null
  due_date: string | null; paid_at: string | null
}

interface Props { payment: Payment | null; onClose: () => void }

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function InvoiceModal({ payment, onClose }: Props) {
  const { gymName } = useUIStore()
  const printRef    = useRef<HTMLDivElement>(null)

  if (!payment) return null

  const invoiceNo = `INV-${payment.id.toString().slice(0,6).toUpperCase()}-${new Date().getFullYear()}`
  const today     = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const city      = typeof window !== 'undefined' ? (localStorage.getItem('gym_city') || '') : ''
  const phone     = typeof window !== 'undefined' ? (localStorage.getItem('gym_phone') || '') : ''

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html>
      <head><title>Invoice ${invoiceNo}</title><meta charset="utf-8" />
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Arial,sans-serif;color:#111;background:#fff;padding:40px}
        .invoice{max-width:680px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e5e7eb}
        .gym-name{font-size:22px;font-weight:700}
        .gym-sub{font-size:13px;color:#6b7280;margin-top:4px}
        .inv-label .title{font-size:28px;font-weight:800;color:#3b82f6}
        .inv-label .no{font-size:13px;color:#6b7280;margin-top:4px}
        .section{margin-bottom:28px}
        .section-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;margin-bottom:12px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .info-item label{font-size:11px;color:#9ca3af;display:block;margin-bottom:3px}
        .info-item span{font-size:14px;color:#111;font-weight:500}
        table{width:100%;border-collapse:collapse}
        thead tr{background:#f9fafb}
        th{padding:10px 16px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb}
        td{padding:14px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6}
        .total-row td{font-weight:700;color:#111;font-size:16px;background:#f9fafb}
        .status-paid{background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
        .footer{margin-top:48px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af}
        @media print{body{padding:20px}}
      </style></head>
      <body>${content}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col">

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Invoice / Receipt</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Invoice content */}
          <div className="overflow-y-auto flex-1 p-6 bg-white">
            <div ref={printRef} className="invoice">

              {/* Header */}
              <div className="header">
                <div>
                  <div className="gym-name">{gymName || 'My Gym'}</div>
                  <div className="gym-sub">
                    {[city, phone].filter(Boolean).join(' · ') || 'Gym Invoice'}
                  </div>
                </div>
                <div className="inv-label" style={{ textAlign: 'right' }}>
                  <div className="title">INVOICE</div>
                  <div className="no">{invoiceNo}</div>
                  <div className="no" style={{ marginTop: 6 }}>Date: {today}</div>
                </div>
              </div>

              {/* Bill to + payment info */}
              <div className="section">
                <div className="section-title">Payment Details</div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Member Name</label>
                    <span>{payment.member}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span>
                      <span className="status-paid" style={{ background: payment.status === 'completed' ? '#dcfce7' : '#fef3c7', color: payment.status === 'completed' ? '#16a34a' : '#d97706' }}>
                        {payment.status === 'completed' ? 'PAID' : payment.status.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Method</label>
                    <span>{payment.method || '—'}</span>
                  </div>
                  {payment.paid_at && (
                    <div className="info-item">
                      <label>Paid On</label>
                      <span>{payment.paid_at}</span>
                    </div>
                  )}
                  {payment.due_date && (
                    <div className="info-item">
                      <label>Due Date</label>
                      <span>{payment.due_date}</span>
                    </div>
                  )}
                  {payment.upi_ref && (
                    <div className="info-item">
                      <label>UTR Number</label>
                      <span style={{ fontFamily: 'monospace' }}>{payment.upi_ref}</span>
                    </div>
                  )}
                  {payment.cheque_no && (
                    <div className="info-item">
                      <label>Cheque Number</label>
                      <span style={{ fontFamily: 'monospace' }}>{payment.cheque_no}</span>
                    </div>
                  )}
                  {payment.collected_by && (
                    <div className="info-item">
                      <label>Collected By</label>
                      <span>{payment.collected_by}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount table */}
              <div className="section">
                <div className="section-title">Summary</div>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{payment.description || 'Membership Fee'}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(payment.amount)}</td>
                    </tr>
                    <tr className="total-row">
                      <td><strong>Total Amount</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>{fmt(payment.amount)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="footer">
                <p>Thank you for your payment! 🙏</p>
                <p style={{ marginTop: 6 }}>This is a computer-generated receipt. No signature required.</p>
                <p style={{ marginTop: 4 }}>{gymName || 'My Gym'}{city ? ` · ${city}` : ''}</p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
