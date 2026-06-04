'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Users, Target, Check, X, AlertTriangle,
  ChevronRight, FileSpreadsheet, Wand2, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Row = Record<string, string>

// ── Smart column keyword matching ─────────────────────
const FIELD_KEYWORDS: Record<string, string[]> = {
  name:           ['name','naam','member','full name','member name','customer','client','person'],
  phone:          ['phone','mobile','contact','number','mob','cell','whatsapp','ph','tel','phon'],
  email:          ['email','mail','e-mail','gmail','id'],
  plan:           ['plan','membership','package','scheme','subscription','tier'],
  amount:         ['amount','fees','fee','price','charge','cost','payment','rs','inr','rupee','rate'],
  status:         ['status','active','inactive','state'],
  joining_date:   ['join','joining','joined','start','enrollment','admit','admission','doj'],
  plan_end:       ['end','expiry','expire','last','due','valid','till','until','renewal','renew'],
  trainer:        ['trainer','coach','instructor','staff'],
  interest:       ['interest','goal','objective','fitness','target','aim'],
  source:         ['source','channel','from','referred','reference'],
}

function detectFieldType(header: string): string | null {
  const h = header.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim()
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some(k => h.includes(k))) return field
  }
  return null
}

// ── Parse any CSV/TSV/text ─────────────────────────────
function parseFile(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  // Detect delimiter
  const firstLine = lines[0]
  const delimiter = firstLine.includes('\t') ? '\t'
    : firstLine.includes(';') ? ';'
    : ','

  function splitLine(line: string): string[] {
    const result: string[] = []
    let current = ''; let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = '' }
      else { current += ch }
    }
    result.push(current.trim())
    return result
  }

  const headers = splitLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  return lines.slice(1)
    .filter(l => l.trim() && l !== headers.join(delimiter))
    .map(line => {
      const vals = splitLine(line)
      const row: Row = {}
      headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim() })
      return row
    })
    .filter(row => Object.values(row).some(v => v.trim()))
}

// ── Parse Excel (xlsx) client-side ────────────────────
async function parseExcel(file: File): Promise<Row[]> {
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb    = XLSX.read(buffer, { type: 'array' })
    const ws    = wb.Sheets[wb.SheetNames[0]]
    const data  = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' })
    return data.map(row => {
      const r: Row = {}
      Object.entries(row).forEach(([k, v]) => { r[String(k).trim()] = String(v || '').trim() })
      return r
    })
  } catch { return [] }
}

type FieldMapping = Record<string, string> // systemField → fileColumn

const SYSTEM_FIELDS = [
  { key:'name',         label:'Name',         required:true,  color:'text-red'       },
  { key:'phone',        label:'Phone',        required:true,  color:'text-red'       },
  { key:'email',        label:'Email',        required:false, color:'text-text-muted'},
  { key:'plan',         label:'Plan',         required:false, color:'text-text-muted'},
  { key:'amount',       label:'Amount',       required:false, color:'text-text-muted'},
  { key:'joining_date', label:'Joining Date', required:false, color:'text-text-muted'},
  { key:'plan_end',     label:'Last Date',    required:false, color:'text-text-muted'},
  { key:'status',       label:'Status',       required:false, color:'text-text-muted'},
  { key:'trainer',      label:'Trainer',      required:false, color:'text-text-muted'},
  { key:'interest',     label:'Interest',     required:false, color:'text-text-muted'},
]

export default function ImportPage() {
  const [step, setStep]         = useState<'upload'|'map'|'preview'|'done'>('upload')
  const [rows, setRows]         = useState<Row[]>([])
  const [columns, setColumns]   = useState<string[]>([])
  const [mapping, setMapping]   = useState<FieldMapping>({})
  const [importType, setType]   = useState<'members'|'leads'>('members')
  const [filename, setFilename] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult]     = useState<any>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    setFilename(file.name)
    let parsed: Row[] = []

    if (file.name.match(/\.(xlsx|xls|ods)$/i)) {
      parsed = await parseExcel(file)
    } else {
      const text = await file.text()
      parsed = parseFile(text)
    }

    if (parsed.length === 0) {
      toast.error('File mein koi data nahi mila — check karein format')
      return
    }

    const cols = Object.keys(parsed[0] || {})
    setColumns(cols)
    setRows(parsed)

    // Auto-detect mapping
    const autoMap: FieldMapping = {}
    cols.forEach(col => {
      const field = detectFieldType(col)
      if (field && !Object.values(autoMap).includes(col)) {
        autoMap[field] = col
      }
    })
    setMapping(autoMap)
    setStep('map')
    toast.success(`${parsed.length} rows detected — column mapping check karein`)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Transform rows using mapping
  function getMappedRows() {
    return rows.map(row => {
      const out: Record<string,string> = {}
      Object.entries(mapping).forEach(([field, col]) => {
        if (col && col !== '__none__') out[field] = row[col] || ''
      })
      return out
    }).filter(r => r.name?.trim() || r.phone?.trim())
  }

  async function handleImport() {
    const mapped = getMappedRows()
    if (mapped.length === 0) { toast.error('No valid rows to import'); return }
    setImporting(true)
    try {
      const res  = await fetch('/api/import', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type: importType, rows: mapped }),
      })
      const data = await res.json()
      setResult(data); setStep('done')
      if (data.inserted > 0) toast.success(`✅ ${data.inserted} records imported!`)
      if (data.failed > 0)   toast.error(`${data.failed} records failed`)
    } catch { toast.error('Import failed') }
    finally { setImporting(false) }
  }

  function reset() {
    setStep('upload'); setRows([]); setColumns([]); setMapping({})
    setFilename(''); setResult(null)
  }

  const mapped = getMappedRows()

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-3xl">

      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Import Data</h1>
        <p className="text-text-muted text-sm mt-0.5">Koi bhi file — CSV, Excel, ya koi bhi format — directly import karein</p>
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
                {t==='members' ? <Users className={cn('w-5 h-5',importType===t?'text-blue-soft':'text-text-muted')} />
                  : <Target className={cn('w-5 h-5',importType===t?'text-blue-soft':'text-text-muted')} />}
                <div className="text-left">
                  <div className={cn('text-sm font-semibold capitalize',importType===t?'text-blue-soft':'text-text-primary')}>{t}</div>
                  <div className="text-xs text-text-muted">{t==='members'?'Gym members':'Leads / enquiries'}</div>
                </div>
                {importType===t && <Check className="w-4 h-4 text-blue-soft ml-auto" />}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn('border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
              dragging ? 'border-blue/60 bg-blue/5' : 'border-border hover:border-blue/30 hover:bg-surface2')}
          >
            <div className="w-16 h-16 bg-blue/10 border border-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className={cn('w-7 h-7 transition-colors', dragging?'text-blue-soft':'text-text-muted')} />
            </div>
            <p className="text-base font-semibold text-text-primary mb-1">
              {dragging ? 'Drop karein!' : 'File drag karo ya click karo'}
            </p>
            <p className="text-sm text-text-muted">CSV · Excel (.xlsx) · Tab-separated · Koi bhi format</p>
            <p className="text-xs text-text-muted mt-2">Column names koi bhi ho sakti hain — system auto-detect karega</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt,.tsv,.ods" className="hidden" onChange={handleFileInput} />
          </div>

          <div className="p-4 bg-surface2 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <Wand2 className="w-4 h-4 text-blue-soft flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Smart Auto-Detection</p>
                <p className="text-xs text-text-muted mt-0.5">
                  System apne aap detect karega — Name, Phone, Email, Plan, Amount, Dates etc. aapke column headers ke hisaab se. Aap manually bhi set kar sakte ho agar galat ho.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── COLUMN MAPPING ── */}
      {step === 'map' && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{filename}</p>
              <p className="text-xs text-text-muted">{rows.length} rows · {columns.length} columns detected</p>
            </div>
            <button onClick={reset} className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" />Change file
            </button>
          </div>

          <div className="bg-blue/5 border border-blue/15 rounded-xl p-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-blue-soft flex-shrink-0" />
            <p className="text-xs text-blue-soft">Auto-detected columns shown below. Galat ho toh dropdown se change karein. Required fields * hain.</p>
          </div>

          {/* Mapping table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-surface2 border-b border-border grid grid-cols-5 gap-2">
              <div className="col-span-2 text-xs font-semibold text-text-muted uppercase tracking-wide">System Field</div>
              <div className="col-span-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Your File Column</div>
            </div>
            <div className="divide-y divide-border">
              {SYSTEM_FIELDS.map(field => (
                <div key={field.key} className="px-4 py-3 grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={cn('text-sm font-medium', field.required ? 'text-text-primary' : 'text-text-secondary')}>
                      {field.label}
                    </span>
                    {field.required && <span className="text-red text-xs">*</span>}
                    {mapping[field.key] && mapping[field.key] !== '__none__' && (
                      <Check className="w-3.5 h-3.5 text-green flex-shrink-0" />
                    )}
                  </div>
                  <div className="col-span-3">
                    <select
                      value={mapping[field.key] || '__none__'}
                      onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full bg-surface2 border border-border rounded-lg px-2.5 py-1.5 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors"
                    >
                      <option value="__none__" className="bg-surface">— Not mapped —</option>
                      {columns.map(col => (
                        <option key={col} value={col} className="bg-surface">{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample preview */}
          {mapped.length > 0 && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-surface2 border-b border-border">
                <p className="text-xs font-semibold text-text-muted">Preview (first 3 rows after mapping)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table text-xs">
                  <thead>
                    <tr>
                      {Object.keys(mapped[0] || {}).filter(k => mapped[0][k]).map(k => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {mapped.slice(0,3).map((row,i) => (
                      <tr key={i}>
                        {Object.keys(mapped[0] || {}).filter(k => mapped[0][k]).map(k => (
                          <td key={k} className="max-w-[120px] truncate">{row[k] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">Back</button>
            <button onClick={handleImport} disabled={importing || !mapped.length}
              className="flex-1 py-2.5 text-sm font-semibold bg-blue hover:bg-blue-muted text-white rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {importing
                ? <><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Importing...</>
                : <><Upload className="w-4 h-4" />Import {mapped.length} rows</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── DONE ── */}
      {step === 'done' && result && (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className={cn('text-center py-10 bg-surface border rounded-2xl', result.failed===0?'border-green/20':'border-orange/20')}>
            <div className={cn('w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4', result.failed===0?'bg-green/10':'bg-orange/10')}>
              {result.failed===0 ? <Check className="w-8 h-8 text-green" /> : <AlertTriangle className="w-8 h-8 text-orange" />}
            </div>
            <h3 className="text-lg font-bold text-text-primary">Import Complete!</h3>
            <div className="flex justify-center gap-8 mt-4">
              <div><div className="text-3xl font-bold text-green">{result.inserted}</div><div className="text-xs text-text-muted">Imported</div></div>
              {result.failed > 0 && <div><div className="text-3xl font-bold text-red">{result.failed}</div><div className="text-xs text-text-muted">Failed</div></div>}
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="p-4 bg-red/5 border border-red/15 rounded-xl space-y-1">
              <p className="text-xs font-semibold text-red">Errors:</p>
              {result.errors.map((e: string, i: number) => <p key={i} className="text-xs text-text-muted">{e}</p>)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={reset} className="py-2.5 text-sm font-medium border border-border text-text-secondary rounded-xl hover:bg-surface2 transition-colors">Import More</button>
            <a href={`/${importType}`} className="py-2.5 text-sm font-semibold bg-blue text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-muted transition-colors">
              View {importType==='members'?'Members':'Leads'} <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
