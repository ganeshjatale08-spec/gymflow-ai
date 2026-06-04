'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Users, Target, Check, AlertTriangle, ChevronRight, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Row = Record<string, string>

// Smart field detection keywords
const KEYWORDS: Record<string, string[]> = {
  name:         ['name','naam','member','full name','customer','client'],
  phone:        ['phone','mobile','contact','mob','cell','whatsapp','ph','number'],
  email:        ['email','mail','e-mail'],
  plan:         ['plan','membership','package','subscription'],
  amount:       ['amount','fees','fee','price','charge','rs','inr','rupee','rate','cost'],
  status:       ['status','active','state'],
  joining_date: ['join','joining','joined','start','doj','enrollment','admission'],
  plan_end:     ['end','expiry','expire','last','due','valid','till','renewal'],
  trainer:      ['trainer','coach','instructor'],
  interest:     ['interest','goal','fitness','objective'],
}

function detectField(header: string): string | null {
  const h = header.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim()
  for (const [field, kws] of Object.entries(KEYWORDS)) {
    if (kws.some(k => h.includes(k))) return field
  }
  return null
}

function parseCSV(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const delim = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
  const clean = (s: string) => s.trim().replace(/^["']|["']$/g, '').trim()
  const splitLine = (line: string) => {
    const res: string[] = []; let cur = ''; let inQ = false
    for (const ch of line) {
      if (ch === '"') inQ = !inQ
      else if (ch === delim && !inQ) { res.push(clean(cur)); cur = '' }
      else cur += ch
    }
    res.push(clean(cur)); return res
  }
  const headers = splitLine(lines[0]).map(clean)
  return lines.slice(1).map(line => {
    const vals = splitLine(line)
    const row: Row = {}
    headers.forEach((h, i) => { if (h) row[h] = clean(vals[i] || '') })
    return row
  }).filter(r => Object.values(r).some(v => v))
}

// Auto-map file columns to system fields
function autoMap(rows: Row[]): Record<string, string> {
  const headers = Object.keys(rows[0] || {})
  const map: Record<string, string> = {}
  headers.forEach(h => {
    const field = detectField(h)
    if (field && !map[field]) map[field] = h
  })
  return map
}

// Apply mapping to get clean rows
function applyMap(rows: Row[], map: Record<string, string>): Record<string,string>[] {
  return rows.map(row => {
    const out: Record<string,string> = {}
    Object.entries(map).forEach(([field, col]) => { out[field] = row[col] || '' })
    return out
  }).filter(r => r.name?.trim() || r.phone?.trim())
}

export default function ImportPage() {
  const [step, setStep]         = useState<'upload'|'confirm'|'done'>('upload')
  const [rows, setRows]         = useState<Row[]>([])
  const [mappedRows, setMappedRows] = useState<Record<string,string>[]>([])
  const [fieldMap, setFieldMap] = useState<Record<string,string>>({})
  const [importType, setType]   = useState<'members'|'leads'>('members')
  const [filename, setFilename] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setFilename(file.name)
    let parsed: Row[] = []

    try {
      if (file.name.match(/\.(xlsx|xls)$/i)) {
        // Excel: convert using xlsx
        const XLSX = await import('xlsx')
        const buf  = await file.arrayBuffer()
        const wb   = XLSX.read(buf)
        const ws   = wb.Sheets[wb.SheetNames[0]]
        parsed = (XLSX.utils.sheet_to_json(ws, { defval:'' }) as Row[])
          .map(r => Object.fromEntries(Object.entries(r).map(([k,v]) => [String(k).trim(), String(v||'').trim()])))
      } else {
        parsed = parseCSV(await file.text())
      }
    } catch {
      toast.error('File parse nahi hua — CSV ya Excel format use karein')
      return
    }

    if (parsed.length === 0) {
      toast.error('File mein koi data nahi mila')
      return
    }

    const map = autoMap(parsed)
    const mapped = applyMap(parsed, map)

    if (mapped.length === 0) {
      toast.error('Name ya Phone column detect nahi hua — column headers check karein')
      return
    }

    setRows(parsed)
    setFieldMap(map)
    setMappedRows(mapped)
    setStep('confirm')
    toast.success(`${mapped.length} rows ready to import`)
  }

  async function doImport() {
    setImporting(true)
    try {
      const res  = await fetch('/api/import', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type: importType, rows: mappedRows }),
      })
      const data = await res.json()
      setResult(data); setStep('done')
      if (data.inserted > 0) toast.success(`✅ ${data.inserted} records imported!`)
      if (data.failed > 0)   toast.error(`${data.failed} records failed`)
    } catch {
      toast.error('Import failed — try again')
    } finally {
      setImporting(false)
    }
  }

  function reset() {
    setStep('upload'); setRows([]); setMappedRows([])
    setFieldMap({}); setFilename(''); setResult(null)
  }

  // Detected columns summary
  const detectedFields = Object.keys(fieldMap)

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-3xl">

      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Import Data</h1>
        <p className="text-text-muted text-sm mt-0.5">CSV ya Excel file upload karein — data automatic detect hoga</p>
      </motion.div>

      {/* ── UPLOAD ── */}
      {step === 'upload' && (
        <motion.div variants={fadeUp} className="space-y-4">

          {/* Type */}
          <div className="grid grid-cols-2 gap-3">
            {(['members','leads'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={cn('flex items-center gap-3 p-4 rounded-xl border transition-all',
                  importType===t ? 'bg-blue/10 border-blue/30' : 'bg-surface border-border hover:border-blue/20')}>
                {t==='members'
                  ? <Users className={cn('w-5 h-5', importType===t?'text-blue-soft':'text-text-muted')} />
                  : <Target className={cn('w-5 h-5', importType===t?'text-blue-soft':'text-text-muted')} />}
                <div className="text-left">
                  <div className={cn('text-sm font-semibold capitalize', importType===t?'text-blue-soft':'text-text-primary')}>{t}</div>
                  <div className="text-xs text-text-muted">{t==='members'?'Gym members data':'Leads / enquiries data'}</div>
                </div>
                {importType===t && <Check className="w-4 h-4 text-blue-soft ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
            onClick={() => fileRef.current?.click()}
            className={cn('border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
              dragging ? 'border-blue bg-blue/5' : 'border-border hover:border-blue/30 hover:bg-surface2')}
          >
            <Upload className={cn('w-10 h-10 mx-auto mb-4 transition-colors', dragging?'text-blue-soft':'text-text-muted opacity-50')} />
            <p className="text-base font-semibold text-text-primary mb-1">File drag karo ya click karo</p>
            <p className="text-sm text-text-muted">CSV (.csv) · Excel (.xlsx, .xls)</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt,.tsv" className="hidden"
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);if(fileRef.current)fileRef.current.value=''}} />
          </div>

          {/* Info */}
          <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
            <p className="text-sm font-medium text-text-primary">Kaunse columns chahiye?</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted">
              <span>• Name, Full Name, Member Name</span>
              <span>• Phone, Mobile, Contact</span>
              <span>• Plan, Membership, Package</span>
              <span>• Amount, Fees, Rate</span>
              <span>• Joining Date, DOJ, Start</span>
              <span>• Expiry, Last Date, Valid Till</span>
            </div>
            <p className="text-xs text-text-muted mt-1">Column names exact nahi honi chahiye — system automatically samjhega</p>
          </div>
        </motion.div>
      )}

      {/* ── CONFIRM ── */}
      {step === 'confirm' && (
        <motion.div variants={fadeUp} className="space-y-4">

          {/* Summary */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-primary">{filename}</span>
              </div>
              <span className="text-xs text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-full">{mappedRows.length} rows</span>
            </div>

            {/* Detected fields */}
            <p className="text-xs text-text-muted mb-2">Detected columns:</p>
            <div className="flex flex-wrap gap-1.5">
              {detectedFields.map(f => (
                <span key={f} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-green/10 border border-green/20 text-green">
                  <Check className="w-2.5 h-2.5" />{f} ← {fieldMap[f]}
                </span>
              ))}
              {!fieldMap.name && <span className="text-xs text-red bg-red/10 border border-red/20 px-2 py-0.5 rounded-md">⚠ Name not found</span>}
              {!fieldMap.phone && <span className="text-xs text-red bg-red/10 border border-red/20 px-2 py-0.5 rounded-md">⚠ Phone not found</span>}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-surface2 border-b border-border">
              <p className="text-xs font-semibold text-text-muted">Preview — pehle 5 rows</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table text-xs">
                <thead>
                  <tr>
                    {detectedFields.slice(0,6).map(f => <th key={f} className="capitalize">{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0,5).map((row,i) => (
                    <tr key={i}>
                      {detectedFields.slice(0,6).map(f => (
                        <td key={f} className="max-w-[120px] truncate">{row[f] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mappedRows.length > 5 && (
              <div className="px-4 py-2 border-t border-border bg-surface2 text-xs text-text-muted">
                +{mappedRows.length - 5} more rows
              </div>
            )}
          </div>

          {(!fieldMap.name || !fieldMap.phone) && (
            <div className="p-4 bg-red/5 border border-red/15 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Required column missing</p>
                <p className="text-xs text-text-muted mt-0.5">File mein "Name" ya "Phone" column honi chahiye. Column header rename karein aur dobara try karein.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
              Cancel
            </button>
            <button onClick={doImport} disabled={importing || !fieldMap.name || !fieldMap.phone}
              className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {importing
                ? <><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Importing {mappedRows.length} rows...</>
                : <><Upload className="w-4 h-4" />Import {mappedRows.length} {importType}</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && result && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className={cn('text-center py-10 bg-surface border rounded-2xl',
            result.failed===0 ? 'border-green/20' : 'border-orange/20')}>
            <div className={cn('w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4',
              result.failed===0 ? 'bg-green/10' : 'bg-orange/10')}>
              {result.failed===0 ? <Check className="w-8 h-8 text-green" /> : <AlertTriangle className="w-8 h-8 text-orange" />}
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-4">Import Complete!</h3>
            <div className="flex justify-center gap-10">
              <div><div className="text-3xl font-bold text-green">{result.inserted}</div><div className="text-xs text-text-muted mt-1">Successfully imported</div></div>
              {result.failed > 0 && <div><div className="text-3xl font-bold text-red">{result.failed}</div><div className="text-xs text-text-muted mt-1">Failed</div></div>}
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="p-4 bg-red/5 border border-red/15 rounded-xl">
              <p className="text-xs font-semibold text-red mb-2">Errors (first 5):</p>
              {result.errors.map((e: string, i: number) => <p key={i} className="text-xs text-text-muted">{e}</p>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset} className="py-2.5 text-sm font-medium border border-border text-text-secondary rounded-xl hover:bg-surface2 transition-colors">
              Import More
            </button>
            <a href={`/${importType}`} className="py-2.5 text-sm font-semibold bg-blue text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-muted transition-colors">
              View {importType==='members'?'Members':'Leads'} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
