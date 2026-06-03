'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Plus, Play, Pause, ArrowRight, Bell, MessageSquare,
  CreditCard, Users, Send, ChevronDown, ChevronUp,
  Target, CheckCircle2, X, FileText, Copy, Check,
  Pencil, Trash2, Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { GlowCard } from '@/components/shared/GlowCard'
import { StatusDot } from '@/components/shared/StatusDot'
import { cn } from '@/lib/utils'

// ── Automations data ──────────────────────────────────
const triggerIcons: Record<string, React.ElementType> = {
  new_lead:           Users,
  message_received:   MessageSquare,
  payment_due:        CreditCard,
  membership_expiring: Bell,
  birthday:           Bell,
  inactivity:         Bell,
}

const mockAutomations = [
  {
    id: '1', name: 'New Lead Welcome', trigger_type: 'new_lead',
    trigger_label: 'When a new lead is captured', is_active: true, run_count: 247,
    actions: [
      { label: 'Send welcome message in Hindi/English' },
      { label: 'Wait 2 hours' },
      { label: 'Send membership pricing details' },
    ],
  },
  {
    id: '2', name: 'Membership Renewal Reminder', trigger_type: 'membership_expiring',
    trigger_label: '7 days before membership expires', is_active: true, run_count: 89,
    actions: [
      { label: 'Send renewal reminder with offer' },
      { label: 'Wait 3 days' },
      { label: 'Send final reminder with urgency' },
    ],
  },
  {
    id: '3', name: 'Payment Due Reminder', trigger_type: 'payment_due',
    trigger_label: 'When payment is 2 days overdue', is_active: true, run_count: 134,
    actions: [
      { label: 'Send payment reminder with UPI link' },
      { label: 'Update member status to "overdue"' },
    ],
  },
  {
    id: '4', name: 'Inactive Member Re-engagement', trigger_type: 'inactivity',
    trigger_label: "When member hasn't visited in 14 days", is_active: false, run_count: 23,
    actions: [
      { label: 'Send motivational message with fitness tip' },
      { label: 'Assign trainer for check-in call' },
    ],
  },
]

// ── Personalization variables ─────────────────────────
const VARIABLES = [
  { label: '{{name}}',       desc: "Member's name"       },
  { label: '{{plan}}',       desc: 'Plan name'           },
  { label: '{{amount}}',     desc: 'Plan amount'         },
  { label: '{{expiry}}',     desc: 'Expiry date'         },
  { label: '{{gym_name}}',   desc: 'Gym name'            },
  { label: '{{phone}}',      desc: "Member's phone"      },
]

// Mock counts
const MEMBER_COUNT = 847
const LEAD_COUNT   = 247

// ── Templates ─────────────────────────────────────────
type Template = { id: string; name: string; body: string }

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Membership Renewal',
    body: `Namaste {{name}} ji! 🙏\n\nAapki *{{plan}} membership* {{expiry}} ko expire ho rahi hai.\n\nAbhi renew karein!\n💳 UPI: gym@upi\nAmount: {{amount}}\n\nDhanyawad! 🙏`,
  },
  {
    id: '2',
    name: 'Payment Due',
    body: `Hi {{name}} ji,\n\nAapka *{{amount}}* payment pending hai.\n\n📲 UPI: gym@upi\n\nKripya jaldi payment karein taaki membership active rahe.\n\n{{gym_name}} 🙏`,
  },
]

// ── Page ─────────────────────────────────────────────
export default function AutomationsPage() {
  const [automations, setAutomations] = useState(mockAutomations)

  // Template state
  const [templates, setTemplates]       = useState<Template[]>(DEFAULT_TEMPLATES)
  const [addingTemplate, setAddingTemplate] = useState(false)
  const [editingTplId, setEditingTplId] = useState<string | null>(null)
  const [tplForm, setTplForm]           = useState({ name: '', body: '' })
  const [copiedId, setCopiedId]         = useState<string | null>(null)

  // Bulk message state
  const [message, setMessage]           = useState('')
  const [audience, setAudience]         = useState<'members' | 'all'>('members')
  const [sending, setSending]           = useState(false)
  const [sent, setSent]                 = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [showPreview, setShowPreview]   = useState(false)

  function copyTemplate(t: Template) {
    navigator.clipboard.writeText(t.body).then(() => {
      setCopiedId(t.id)
      toast.success('Template copied!')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  function useTemplate(t: Template) {
    setMessage(t.body)
    toast.success(`Template "${t.name}" loaded`)
  }

  function startEditTpl(t: Template) {
    setTplForm({ name: t.name, body: t.body })
    setEditingTplId(t.id)
    setAddingTemplate(false)
  }

  function startAddTpl() {
    setTplForm({ name: '', body: '' })
    setAddingTemplate(true)
    setEditingTplId(null)
  }

  function saveTpl() {
    if (!tplForm.name.trim()) { toast.error('Template name required'); return }
    if (!tplForm.body.trim()) { toast.error('Message body required');  return }
    if (editingTplId) {
      setTemplates(prev => prev.map(t => t.id === editingTplId ? { ...t, ...tplForm } : t))
      toast.success('Template updated')
      setEditingTplId(null)
    } else {
      setTemplates(prev => [...prev, { id: Date.now().toString(), ...tplForm }])
      toast.success('Template created')
      setAddingTemplate(false)
    }
  }

  function deleteTpl(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
  }

  function toggle(id: string) {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a))
  }

  function insertVariable(v: string) {
    setMessage(prev => prev + v)
  }

  const recipientCount = audience === 'members' ? MEMBER_COUNT : MEMBER_COUNT + LEAD_COUNT

  const previewText = message
    .replace(/{{name}}/g,     'Rahul Kumar')
    .replace(/{{plan}}/g,     'Growth')
    .replace(/{{amount}}/g,   '₹3,999')
    .replace(/{{expiry}}/g,   '30 Jun 2026')
    .replace(/{{gym_name}}/g, 'Iron Pulse Gym')
    .replace(/{{phone}}/g,    '+91 98765 43210')

  async function handleSend() {
    if (!message.trim()) { toast.error('Please write a message first'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1800))
    setSending(false)
    setSent(true)
    toast.success(`Message sent to ${recipientCount.toLocaleString('en-IN')} recipients via WhatsApp`)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-4xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Automations</h1>
          <p className="text-text-muted text-sm mt-0.5">Trigger → Action workflows + Bulk messaging</p>
        </div>
        <button className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />New Automation
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Automations', value: automations.filter(a => a.is_active).length, color: 'text-green'      },
          { label: 'Total Runs',         value: automations.reduce((s, a) => s + a.run_count, 0), color: 'text-blue-soft' },
          { label: 'Messages Sent',      value: '1,247',  color: 'text-text-primary' },
          { label: 'Conversions',        value: '34',     color: 'text-orange'       },
        ].map(({ label, value, color }) => (
          <div key={label} className="kpi-card">
            <div className={`text-2xl font-bold mb-0.5 ${color}`}>{value}</div>
            <div className="text-sm text-text-secondary">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Bulk Message Section ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-blue/20 rounded-xl overflow-hidden">

        {/* Section header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-blue/5">
          <div className="w-8 h-8 bg-blue/15 border border-blue/25 rounded-lg flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4 text-blue-soft" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Bulk WhatsApp Message</h2>
            <p className="text-xs text-text-muted mt-0.5">Send a personalized message to all members or leads at once</p>
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* Audience selector */}
          <div>
            <label className="block text-xs text-text-muted mb-2">Send To</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                {
                  key: 'members',
                  label: 'Gym Members Only',
                  sub: 'Active members of your gym',
                  count: MEMBER_COUNT,
                  icon: Users,
                  color: 'blue',
                },
                {
                  key: 'all',
                  label: 'All Contacts',
                  sub: 'Members + all leads in database',
                  count: MEMBER_COUNT + LEAD_COUNT,
                  icon: MessageSquare,
                  color: 'green',
                },
              ] as const).map(({ key, label, sub, count, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setAudience(key)}
                  className={cn(
                    'flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all',
                    audience === key
                      ? color === 'blue'
                        ? 'bg-blue/10 border-blue/30'
                        : 'bg-green/10 border-green/30'
                      : 'bg-surface2 border-border hover:border-border'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                      audience === key
                        ? color === 'blue' ? 'bg-blue/15 border border-blue/25' : 'bg-green/15 border border-green/25'
                        : 'bg-surface border border-border'
                    )}>
                      <Icon className={cn('w-3.5 h-3.5', audience === key
                        ? color === 'blue' ? 'text-blue-soft' : 'text-green'
                        : 'text-text-muted'
                      )} />
                    </div>
                    {audience === key && (
                      <CheckCircle2 className={cn('w-4 h-4', color === 'blue' ? 'text-blue-soft' : 'text-green')} />
                    )}
                  </div>
                  <div>
                    <div className={cn('text-sm font-semibold', audience === key
                      ? color === 'blue' ? 'text-blue-soft' : 'text-green'
                      : 'text-text-secondary'
                    )}>
                      {label}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold text-text-primary">{count.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-text-muted ml-1">contacts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message composer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-text-muted">Message</label>
              <button
                onClick={() => setShowVariables(v => !v)}
                className="flex items-center gap-1 text-xs text-blue-soft hover:text-blue transition-colors"
              >
                Personalize {showVariables ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Variable chips */}
            <AnimatePresence>
              {showVariables && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-2"
                >
                  <div className="flex flex-wrap gap-1.5 p-3 bg-surface2 border border-border rounded-lg">
                    <span className="text-[10px] text-text-muted w-full mb-1">Click to insert variable:</span>
                    {VARIABLES.map(v => (
                      <button
                        key={v.label}
                        onClick={() => insertVariable(v.label)}
                        title={v.desc}
                        className="text-[11px] font-mono px-2 py-1 bg-blue/10 border border-blue/20 text-blue-soft rounded-lg hover:bg-blue/20 transition-colors"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder={`Write your message here...\n\nExample:\nNamaste {{name}} ji 🙏\nYour {{plan}} membership at Iron Pulse Gym is expiring on {{expiry}}.\n\nRenew now and get 10% off! 💪`}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 resize-none transition-colors leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-text-muted">{message.length} characters</span>
              {message.trim() && (
                <button
                  onClick={() => setShowPreview(v => !v)}
                  className="text-[11px] text-blue-soft hover:text-blue transition-colors"
                >
                  {showPreview ? 'Hide preview' : 'Preview message →'}
                </button>
              )}
            </div>
          </div>

          {/* Message preview */}
          <AnimatePresence>
            {showPreview && message.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-surface2 border-b border-border">
                    <span className="text-xs text-text-muted font-medium">WhatsApp Preview — as received by "Rahul Kumar"</span>
                    <button onClick={() => setShowPreview(false)} className="text-text-muted hover:text-text-secondary transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 bg-[#0a0a0a]">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-surface2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{previewText}</p>
                        <p className="text-[10px] text-text-muted mt-2 text-right">12:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-text-muted">
              <span className="text-text-secondary font-medium">{recipientCount.toLocaleString('en-IN')}</span> recipients ·{' '}
              <span className="text-text-secondary font-medium">
                {audience === 'members' ? 'Gym Members Only' : 'All Contacts'}
              </span>
              {' '}· via WhatsApp
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                sent
                  ? 'bg-green/15 border border-green/25 text-green'
                  : 'bg-blue hover:bg-blue-muted text-white disabled:opacity-50'
              )}
            >
              {sent ? (
                <><CheckCircle2 className="w-4 h-4" />Sent!</>
              ) : sending ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Sending...</>
              ) : (
                <><Send className="w-4 h-4" />Send Message</>
              )}
            </motion.button>
          </div>

        </div>
      </motion.div>

      {/* ── WhatsApp Templates ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green/10 border border-green/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">WhatsApp Templates</h2>
              <p className="text-xs text-text-muted mt-0.5">Reusable messages with variables</p>
            </div>
          </div>
          {!addingTemplate && !editingTplId && (
            <button onClick={startAddTpl}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg hover:bg-blue/15 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          )}
        </div>

        <div className="p-5 space-y-3">

          {/* Add / Edit form */}
          <AnimatePresence>
            {(addingTemplate || editingTplId) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="border border-blue/20 bg-blue/5 rounded-xl p-4 space-y-3 mb-3">
                  <p className="text-xs font-medium text-blue-soft">{editingTplId ? 'Edit Template' : 'New Template'}</p>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Template Name *</label>
                    <input value={tplForm.name} onChange={e => setTplForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Renewal Reminder"
                      className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-text-muted">Message Body *</label>
                      <div className="flex gap-1">
                        {['{{name}}','{{plan}}','{{amount}}','{{expiry}}','{{gym_name}}'].map(v => (
                          <button key={v} type="button"
                            onClick={() => setTplForm(p => ({ ...p, body: p.body + v }))}
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-blue/10 border border-blue/20 text-blue-soft rounded hover:bg-blue/20 transition-colors">
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea value={tplForm.body} onChange={e => setTplForm(p => ({ ...p, body: e.target.value }))}
                      rows={5} placeholder="Type your WhatsApp message..."
                      className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-blue/40 resize-none transition-colors font-mono leading-relaxed placeholder-text-muted" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingTemplate(false); setEditingTplId(null) }}
                      className="flex-1 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
                      Cancel
                    </button>
                    <button onClick={saveTpl}
                      className="flex-1 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Template cards */}
          <AnimatePresence>
            {templates.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="flex items-start gap-3 p-4 bg-surface2 border border-border rounded-xl hover:border-green/20 transition-colors">
                <div className="w-8 h-8 bg-green/10 border border-green/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary mb-1">{t.name}</div>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{t.body}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => useTemplate(t)}
                    className="text-[11px] font-medium text-blue-soft bg-blue/10 border border-blue/20 px-2 py-1 rounded-lg hover:bg-blue/15 transition-colors whitespace-nowrap">
                    Use
                  </button>
                  <button onClick={() => copyTemplate(t)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-text-muted hover:text-green transition-colors">
                    {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => startEditTpl(t)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-text-muted hover:text-blue-soft transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteTpl(t.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {templates.length === 0 && !addingTemplate && (
            <div className="text-center py-6 text-text-muted text-sm">
              No templates yet.{' '}
              <button onClick={startAddTpl} className="text-blue-soft hover:underline">Create one</button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Automations List ── */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Workflow Automations</h2>
        {automations.map((auto) => {
          const TriggerIcon = triggerIcons[auto.trigger_type] || Zap
          return (
            <div key={auto.id} className={cn('bg-surface border border-border rounded-xl p-5 transition-all', !auto.is_active && 'opacity-55')}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', auto.is_active ? 'bg-blue/10 border border-blue/20' : 'bg-surface2 border border-border')}>
                    <TriggerIcon className={cn('w-4 h-4', auto.is_active ? 'text-blue-soft' : 'text-text-muted')} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{auto.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{auto.trigger_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-text-muted">{auto.run_count} runs</div>
                  <StatusDot status={auto.is_active ? 'active' : 'offline'} size="sm" />
                  <button
                    onClick={() => toggle(auto.id)}
                    className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                      auto.is_active ? 'bg-orange/10 hover:bg-orange/20 text-orange' : 'bg-green/10 hover:bg-green/20 text-green')}
                  >
                    {auto.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {auto.actions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-surface2 border border-border rounded-lg px-3 py-1.5 text-xs text-text-secondary">{action.label}</div>
                    {i < auto.actions.length - 1 && <ArrowRight className="w-3 h-3 text-text-muted flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </motion.div>

    </motion.div>
  )
}
