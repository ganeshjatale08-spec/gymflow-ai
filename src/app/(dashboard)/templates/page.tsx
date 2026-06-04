'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Plus, Pencil, Trash2, Copy, Check,
  X, Save, Eye, Tag, Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

// ── Types ─────────────────────────────────────────────
type Category = 'welcome' | 'renewal' | 'payment' | 'follow-up' | 'festival' | 'support'

type Template = {
  id: string
  name: string
  category: Category
  body: string
  variables: string[]
}

// ── Data ─────────────────────────────────────────────
const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'welcome',     label: 'Welcome',     color: 'text-blue-soft  bg-blue/10    border-blue/20'    },
  { key: 'renewal',     label: 'Renewal',     color: 'text-orange     bg-orange/10  border-orange/20'  },
  { key: 'payment',     label: 'Payment',     color: 'text-green      bg-green/10   border-green/20'   },
  { key: 'follow-up',  label: 'Follow-up',   color: 'text-purple     bg-purple/10  border-purple/20'  },
  { key: 'festival',    label: 'Festival',    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'},
  { key: 'support',     label: 'Support',     color: 'text-text-muted bg-surface2    border-border'     },
]

const VARIABLES = ['{{name}}', '{{plan}}', '{{amount}}', '{{expiry}}', '{{gym_name}}', '{{phone}}', '{{trial_date}}']

const defaultTemplates: Template[] = [
  {
    id: '1', name: 'New Lead Welcome', category: 'welcome',
    body: `Namaste {{name}} ji! 🙏\n\nWelcome to {{gym_name}}! 💪\n\nHamari membership plans:\n• Starter – ₹1,999/mo\n• Growth – ₹3,999/mo\n• Elite – ₹5,999/mo\n\nKya aap free trial visit book karna chahenge?\n\nReply *YES* to confirm! ✅`,
    variables: ['{{name}}', '{{gym_name}}'],
  },
  {
    id: '2', name: 'Membership Renewal Reminder', category: 'renewal',
    body: `Namaste {{name}} ji! 🙏\n\nAapki *{{plan}} membership* {{expiry}} ko expire ho rahi hai.\n\nAbhi renew karein aur *10% discount* payen! 🎉\n\nPayment UPI: gym@upi\nAmount: {{amount}}\n\nKoi sawaal? Reply karein! 😊`,
    variables: ['{{name}}', '{{plan}}', '{{expiry}}', '{{amount}}'],
  },
  {
    id: '3', name: 'Payment Due Reminder', category: 'payment',
    body: `Namaste {{name}} ji,\n\nAapka *{{amount}}* payment due hai.\n\n💳 UPI: gym@upi\n\nKripya jaldi payment karein taaki membership active rahe.\n\nDhanyawad! 🙏`,
    variables: ['{{name}}', '{{amount}}'],
  },
  {
    id: '4', name: 'Follow-up After Enquiry', category: 'follow-up',
    body: `Hi {{name}} ji! 👋\n\nKal aapne {{gym_name}} ke baare mein enquiry ki thi.\n\nKya aap aaj free trial ke liye aa sakte hain? 🏋️\n\nTimings: 6 AM – 10 PM\n\nBata dijiye! 😊`,
    variables: ['{{name}}', '{{gym_name}}'],
  },
  {
    id: '5', name: 'Trial Visit Confirmation', category: 'welcome',
    body: `Namaste {{name}} ji! 🎉\n\nAapka trial visit *{{trial_date}}* ko confirm ho gaya hai!\n\n📍 {{gym_name}}\n⏰ Apna preferred time batayein\n\nKuch lana zaroori nahi, sirf comfortable clothes! 💪\n\nMilte hain! 🙏`,
    variables: ['{{name}}', '{{trial_date}}', '{{gym_name}}'],
  },
  {
    id: '6', name: 'Inactive Member Re-engagement', category: 'follow-up',
    body: `Hey {{name}} ji! 💪\n\nHumne aapko kuch dino se gym mein nahi dekha.\n\nAapki fitness journey matter karti hai! 🏋️\n\nKya koi problem hai? Reply karein, hum help karenge!\n\n{{gym_name}} Team 🙏`,
    variables: ['{{name}}', '{{gym_name}}'],
  },
  {
    id: '7', name: 'Festival Special Offer', category: 'festival',
    body: `🎉 Festival Special Offer!\n\nNamaste {{name}} ji,\n\n{{gym_name}} ki taraf se aapko *Festival Ki Shubhkamnayein!* 🌟\n\nIs festival season mein join karein aur payen:\n✅ 1 Month FREE on 3 Month Plan\n✅ Free Personal Training Session\n✅ Special Discount on Supplements\n\nOffer sirf *3 din* tak valid hai!\n\nAbhi join karein 👇\nCall/WhatsApp: {{phone}}\n\nJai Ho! 🙏`,
    variables: ['{{name}}', '{{gym_name}}', '{{phone}}'],
  },
  {
    id: '8', name: 'Payment Due - Expiry Notice', category: 'payment',
    body: `Namaste {{name}} ji,\n\nAapki *{{plan}} membership* ka expiry date *{{expiry}}* hai aur payment abhi pending hai.\n\n💳 Amount: {{amount}}\n📲 UPI: gym@upi\n\nKripya aaj hi payment karein warna membership band ho jayegi.\n\nKoi dikkat ho toh reply karein!\n\n{{gym_name}} 🙏`,
    variables: ['{{name}}', '{{plan}}', '{{expiry}}', '{{amount}}', '{{gym_name}}'],
  },
]

// ── Template Form ─────────────────────────────────────
function TemplateForm({
  initial, onSave, onCancel,
}: {
  initial: Partial<Template>
  onSave: (t: Partial<Template>) => void
  onCancel: () => void
}) {
  const [form, setForm]     = useState<Partial<Template>>({ category: 'welcome', body: '', name: '', ...initial })
  const [preview, setPreview] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function insertVar(v: string) {
    setForm(prev => ({ ...prev, body: (prev.body || '') + v }))
  }

  const gymNamePreview = typeof window !== 'undefined' ? (localStorage.getItem('gym_name') || 'My Gym') : 'My Gym'
  const gymPhonePreview = typeof window !== 'undefined' ? (localStorage.getItem('gym_phone') || '') : ''

  const previewText = (form.body || '')
    .replace(/{{name}}/g,       'Rahul Kumar')
    .replace(/{{plan}}/g,       'Growth')
    .replace(/{{amount}}/g,     '₹3,999')
    .replace(/{{expiry}}/g,     '30 Jun 2026')
    .replace(/{{gym_name}}/g,   gymNamePreview)
    .replace(/{{phone}}/g,      gymPhonePreview || 'gym@upi')
    .replace(/{{trial_date}}/g, '5 Jun 2026')

  const inputCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'
  const labelCls = 'block text-xs text-text-muted mb-1.5'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Template Name *</label>
          <input value={form.name || ''} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Welcome Message" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
            {CATEGORIES.map(c => <option key={c.key} value={c.key} className="bg-surface">{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Variables */}
      <div>
        <label className={labelCls}>Insert Variable</label>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map(v => (
            <button key={v} type="button" onClick={() => insertVar(v)}
              className="text-[11px] font-mono px-2 py-1 bg-blue/10 border border-blue/20 text-blue-soft rounded-lg hover:bg-blue/20 transition-colors">
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls.replace('mb-1.5', '')}>Message Body *</label>
          {form.body?.trim() && (
            <button onClick={() => setPreview(v => !v)}
              className="flex items-center gap-1 text-[11px] text-blue-soft hover:text-blue transition-colors">
              <Eye className="w-3 h-3" />{preview ? 'Edit' : 'Preview'}
            </button>
          )}
        </div>

        {!preview ? (
          <textarea value={form.body || ''} onChange={e => set('body', e.target.value)} rows={7}
            placeholder="Type your WhatsApp message here..." className={cn(inputCls, 'resize-none leading-relaxed font-mono text-xs')} />
        ) : (
          <div className="bg-[#0a0a0a] border border-border rounded-xl p-4">
            <div className="text-[10px] text-text-muted mb-3">Preview (as received by "Rahul Kumar")</div>
            <div className="bg-surface2 border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{previewText}</p>
              <p className="text-[9px] text-text-muted mt-1.5 text-right">12:00 PM</p>
            </div>
          </div>
        )}
        <div className="text-[11px] text-text-muted mt-1">{(form.body || '').length} characters</div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
          Cancel
        </button>
        <button onClick={() => {
          if (!form.name?.trim()) { toast.error('Template name required'); return }
          if (!form.body?.trim()) { toast.error('Message body required');  return }
          onSave(form)
        }}
          className="flex-1 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Save Template
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────
export default function TemplatesPage() {
  const { gymName, phone } = useUIStore()
  const [templates, setTemplates]   = useState<Template[]>(defaultTemplates)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState<Category | 'all'>('all')
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [addingNew, setAddingNew]   = useState(false)
  const [copiedId, setCopiedId]     = useState<string | null>(null)

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'all' || t.category === catFilter
    return matchSearch && matchCat
  })

  function copyTemplate(t: Template) {
    navigator.clipboard.writeText(t.body).then(() => {
      setCopiedId(t.id)
      toast.success('Template copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  function deleteTemplate(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
  }

  function saveTemplate(data: Partial<Template>) {
    if (editingId) {
      setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, ...data } as Template : t))
      toast.success('Template updated')
      setEditingId(null)
    } else {
      setTemplates(prev => [...prev, { ...data, id: Date.now().toString(), variables: [] } as Template])
      toast.success('Template created')
      setAddingNew(false)
    }
  }

  function getCatStyle(cat: Category) {
    return CATEGORIES.find(c => c.key === cat)?.color || CATEGORIES[5].color
  }

  function getCatLabel(cat: Category) {
    return CATEGORIES.find(c => c.key === cat)?.label || cat
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-5xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">WhatsApp Templates</h1>
          <p className="text-text-muted text-sm mt-0.5">Create and manage reusable message templates</p>
        </div>
        {!addingNew && !editingId && (
          <button onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />New Template
          </button>
        )}
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCatFilter(prev => prev === c.key ? 'all' : c.key)}
            className={cn('p-3 rounded-xl border text-center transition-all',
              catFilter === c.key ? cn(c.color, 'border-current') : 'bg-surface border-border hover:bg-surface2')}>
            <div className={cn('text-lg font-bold', catFilter === c.key ? '' : 'text-text-primary')}>
              {templates.filter(t => t.category === c.key).length}
            </div>
            <div className={cn('text-[10px] mt-0.5', catFilter === c.key ? '' : 'text-text-muted')}>{c.label}</div>
          </button>
        ))}
      </motion.div>

      {/* Add new form */}
      <AnimatePresence>
        {addingNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-surface border border-blue/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue/10 border border-blue/20 rounded-lg flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-blue-soft" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">New Template</h3>
            </div>
            <TemplateForm initial={{}} onSave={saveTemplate} onCancel={() => setAddingNew(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1" />
      </motion.div>

      {/* Template list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              layout
              className="bg-surface border border-border rounded-xl overflow-hidden">

              {editingId === t.id ? (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Pencil className="w-4 h-4 text-text-muted" />
                    <h3 className="text-sm font-semibold text-text-primary">Edit: {t.name}</h3>
                  </div>
                  <TemplateForm initial={t} onSave={saveTemplate} onCancel={() => setEditingId(null)} />
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-green/10 border border-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-green" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">{t.name}</div>
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', getCatStyle(t.category))}>
                          {getCatLabel(t.category)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button onClick={() => copyTemplate(t)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-text-muted hover:text-green transition-colors"
                        title="Copy message">
                        {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditingId(t.id); setAddingNew(false) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-text-muted hover:text-blue-soft transition-colors"
                        title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteTemplate(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors"
                        title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="bg-surface2 border border-border rounded-xl px-4 py-3 text-xs text-text-secondary leading-relaxed whitespace-pre-line line-clamp-4">
                    {t.body}
                  </div>

                  {/* Variables used */}
                  {t.variables.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      <Tag className="w-3 h-3 text-text-muted flex-shrink-0" />
                      {t.variables.map(v => (
                        <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 bg-blue/10 border border-blue/20 text-blue-soft rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No templates found.{' '}
            <button onClick={() => setAddingNew(true)} className="text-blue-soft hover:underline">Create one</button>
          </div>
        )}
      </div>

    </motion.div>
  )
}
