'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Users, Target, Check, X, AlertTriangle, Download, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

type ImportType = 'members' | 'leads'
type Row = Record<string, string>

// Parse CSV string → array of objects
function parseCSV(text: string): Row[] {
  const lines  = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Row = {}
    headers.forEach((h, i) => { row[h] = vals[i] || '' })
    return row
  })
}

// Sample CSV templates
const TEMPLATES: Record<ImportType, { headers: string[]; sample: string[][] }> = {
  members: {
    headers: ['name','phone','email','plan','amount','joining_date','plan_end','status','trainer'],
    sample: [
      ['Rahul Kumar', '+91 98765 43210', 'rahul@email.com', 'Growth', '3999', '2025-01-10', '2026-01-10', 'active', 'Arun Sharma'],
      ['Priya Sharma', '+91 87654 32109', '', 'Elite', '5999', '2025-03-01', '2026-03-01', 'active', ''],
    ]
  },
  leads: {
    headers: ['name','phone','email','status','source','interest','plan'],
    sample: [
      ['Ananya Singh', '+91 76543 21098', 'ananya@email.com', 'new', 'whatsapp', 'Weight loss', 'Growth'],
      ['Vikram Patel', '+91 65432 10987', '', 'contacted', 'referral', 'Yoga', 'Starter'],
    ]
  }
}

function downloadTemplate(type: ImportType) {
  const t = TEMPLATES[type]
  const rows = [t.headers.join(','), ...t.sample.map(r => r.join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = `${type}_template.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function ImportPage() {
  const [step, setStep]           = useState<'select'|'preview'|'done'>('select')
  const [importType, setType]     = useState<ImportType>('members')
  const [rows, setRows]           = useState<Row[]>([])
  const [filename, setFilename]   = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult]       = useState<{ inserted: number; failed: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text   = ev.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) { toast.error('File mein koi data nahi mila ya format galat hai'); return }
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleImport() {
    setImporting(true)
    try {
      const res  = await fetch('/api/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: importType, rows }),
      })
      const data = await res.json()
      setResult(data)
      setStep('done')
      if (data.inserted > 0) toast.success(`✅ ${data.inserted} records imported!`)
      if (data.failed > 0)   toast.error(`${data.failed} records failed`)
    } catch { toast.error('Import failed — try again') }
    finally { setImporting(false) }
  }

  function reset() {
    setStep('select'); setRows([]); setFilename(''); setResult(null)
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-4xl">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Import Data</h1>
        <p className="text-text-muted text-sm mt-0.5">Apna existing gym data CSV se import karein</p>
      </motion.div>

      {/* Step indicator */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        {['select','preview','done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
              step === s ? 'bg-blue text-white' :
              ['select','preview','done'].indexOf(step) > i ? 'bg-green text-white' : 'bg-surface2 border border-border text-text-muted')}>
              {['select','preview','done'].indexOf(step) > i ? <Check className="w-3.5 h-3.5" /> : i+1}
            </div>
            <span className={cn('text-xs font-medium', step === s ? 'text-text-primary' : 'text-text-muted')}>
              {s === 'select' ? 'File Select' : s === 'preview' ? 'Preview' : 'Done'}
            </span>
            {i < 2 && <ChevronRight className="w-3 h-3 text-text-muted" />}
          </div>
        ))}
      </motion.div>

      {/* ── STEP 1: SELECT ── */}
      {step === 'select' && (
        <motion.div variants={fadeUp} className="space-y-4">

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-3">
            {(['members','leads'] as ImportType[]).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={cn('flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  importType === t ? 'bg-blue/10 border-blue/30' : 'bg-surface border-border hover:border-blue/20')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                  importType === t ? 'bg-blue/15 border border-blue/25' : 'bg-surface2 border border-border')}>
                  {t === 'members' ? <Users className={cn('w-5 h-5', importType===t?'text-blue-soft':'text-text-muted')} />
                    : <Target className={cn('w-5 h-5', importType===t?'text-blue-soft':'text-text-muted')} />}
                </div>
                <div>
                  <div className={cn('text-sm font-semibold capitalize', importType===t?'text-blue-soft':'text-text-primary')}>{t}</div>
                  <div className="text-xs text-text-muted">{t === 'members' ? 'Gym members import' : 'Leads import'}</div>
                </div>
                {importType === t && <Check className="w-4 h-4 text-blue-soft ml-auto" />}
              </button>
            ))}
          </div>

          {/* Download template */}
          <div className="p-4 bg-surface2 border border-border rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Sample CSV Template</p>
              <p className="text-xs text-text-muted mt-0.5">Pehle template download karein, us format mein data bharein</p>
            </div>
            <button onClick={() => downloadTemplate(importType)}
              className="flex items-center gap-2 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-2 rounded-lg hover:bg-blue/15 transition-colors">
              <Download className="w-3.5 h-3.5" /> Template
            </button>
          </div>

          {/* Required columns info */}
          <div className="p-4 bg-surface border border-border rounded-xl">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">CSV Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES[importType].headers.map(h => (
                <span key={h} className={cn('text-xs px-2 py-0.5 rounded-md font-mono',
                  (importType === 'members' ? ['name','phone'] : ['name','phone']).includes(h)
                    ? 'bg-red/10 border border-red/20 text-red'
                    : 'bg-surface2 border border-border text-text-muted')}>
                  {h}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-text-muted mt-2">Red = Required, baaki optional</p>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-blue/40 rounded-xl p-10 text-center cursor-pointer transition-colors group"
          >
            <Upload className="w-10 h-10 text-text-muted opacity-40 mx-auto mb-3 group-hover:text-blue-soft group-hover:opacity-100 transition-all" />
            <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Click karke CSV file upload karein</p>
            <p className="text-xs text-text-muted mt-1">CSV format supported · Max 1000 rows</p>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          </div>

        </motion.div>
      )}

      {/* ── STEP 2: PREVIEW ── */}
      {step === 'preview' && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-soft" />
              <span className="text-sm font-medium text-text-primary">{filename}</span>
              <span className="text-xs text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-full">{rows.length} rows</span>
            </div>
            <button onClick={reset} className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>

          {/* Preview table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-64">
              <table className="w-full data-table text-xs">
                <thead>
                  <tr>
                    <th className="text-text-muted">#</th>
                    {Object.keys(rows[0] || {}).map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0,10).map((row, i) => (
                    <tr key={i}>
                      <td className="text-text-muted">{i+1}</td>
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="max-w-[120px] truncate">{v || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 10 && (
              <div className="px-4 py-2 border-t border-border bg-surface2 text-xs text-text-muted">
                +{rows.length - 10} more rows not shown
              </div>
            )}
          </div>

          <div className="p-4 bg-orange/5 border border-orange/15 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Import karne se pehle check karein</p>
              <p className="text-xs text-text-muted mt-0.5">
                {rows.length} {importType} import honge Supabase mein. Duplicate phone numbers skip honge.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
              Back
            </button>
            <button onClick={handleImport} disabled={importing}
              className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {importing
                ? <><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Importing...</>
                : <><Upload className="w-4 h-4" />Import {rows.length} {importType}</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── STEP 3: DONE ── */}
      {step === 'done' && result && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="text-center py-8">
            <div className={cn('w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4',
              result.failed === 0 ? 'bg-green/10 border border-green/20' : 'bg-orange/10 border border-orange/20')}>
              {result.failed === 0
                ? <Check className="w-8 h-8 text-green" />
                : <AlertTriangle className="w-8 h-8 text-orange" />}
            </div>
            <h3 className="text-lg font-bold text-text-primary">Import Complete!</h3>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green">{result.inserted}</div>
                <div className="text-xs text-text-muted">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red">{result.failed}</div>
                <div className="text-xs text-text-muted">Failed</div>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-4 bg-red/5 border border-red/15 rounded-xl">
              <p className="text-xs font-semibold text-red mb-2">Errors:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-text-muted">{e}</p>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset}
              className="py-2.5 text-sm font-medium border border-border text-text-secondary rounded-xl hover:bg-surface2 transition-colors">
              Import More
            </button>
            <a href={`/${importType}`}
              className="py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors flex items-center justify-center gap-2">
              View {importType === 'members' ? 'Members' : 'Leads'} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
