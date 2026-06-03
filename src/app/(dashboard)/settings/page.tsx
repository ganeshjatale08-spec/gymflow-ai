'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Bot, Clock, Phone, Save, Plus, Pencil, Trash2, Check, X, IndianRupee, Tag, Camera, ImageIcon, Sun, Moon, Users, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { cn } from '@/lib/utils'
import brand from '@/lib/brand.config'
import { useUIStore } from '@/stores/uiStore'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

type Plan = {
  id: string
  name: string
  price: number
  duration: 'monthly' | 'quarterly' | 'yearly'
  features: string[]
  popular: boolean
}

const DEFAULT_PLANS: Plan[] = [
  { id: '1', name: 'Starter',  price: 1999,  duration: 'monthly',   features: ['Gym access', 'Locker', 'Basic equipment'],                            popular: false },
  { id: '2', name: 'Growth',   price: 3999,  duration: 'monthly',   features: ['Unlimited access', '2 PT sessions/week', 'Diet consultation', 'Locker'], popular: true  },
  { id: '3', name: 'Elite',    price: 5999,  duration: 'monthly',   features: ['Unlimited access', 'Daily PT sessions', 'Diet + nutrition plan', 'Sauna', 'Priority booking'], popular: false },
]

const DURATION_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' }

const planColors = [
  'border-blue/20 bg-blue/5',
  'border-emerald-500/20 bg-emerald-500/5',
  'border-violet-500/20 bg-violet-500/5',
  'border-orange-500/20 bg-orange-500/5',
  'border-rose-500/20 bg-rose-500/5',
]

// ── Plan Edit Form ────────────────────────────────────
function PlanForm({
  plan, onSave, onCancel,
}: {
  plan: Partial<Plan>
  onSave: (p: Partial<Plan>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Plan>>({ duration: 'monthly', popular: false, features: [], ...plan })
  const [featureInput, setFeatureInput] = useState('')

  function addFeature() {
    const f = featureInput.trim()
    if (!f) return
    setForm(prev => ({ ...prev, features: [...(prev.features || []), f] }))
    setFeatureInput('')
  }

  function removeFeature(i: number) {
    setForm(prev => ({ ...prev, features: prev.features?.filter((_, idx) => idx !== i) }))
  }

  const inputCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'

  return (
    <div className="space-y-4 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Plan Name *</label>
          <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Premium" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Duration</label>
          <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value as Plan['duration'] }))}
            className={inputCls}>
            <option value="monthly"   className="bg-surface">Monthly</option>
            <option value="quarterly" className="bg-surface">Quarterly</option>
            <option value="yearly"    className="bg-surface">Yearly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1.5">Price (₹) *</label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input type="number" min="0" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
            placeholder="3999" className="w-full bg-surface2 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1.5">Features</label>
        <div className="flex gap-2 mb-2">
          <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
            placeholder="e.g. Unlimited gym access" className={cn(inputCls, 'flex-1')} />
          <button type="button" onClick={addFeature}
            className="px-3 py-2 bg-blue/10 border border-blue/20 text-blue-soft text-xs rounded-lg hover:bg-blue/20 transition-colors font-medium">
            Add
          </button>
        </div>
        {(form.features?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.features?.map((f, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-surface2 border border-border text-text-secondary px-2 py-1 rounded-lg">
                {f}
                <button onClick={() => removeFeature(i)} className="text-text-muted hover:text-red transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="popular" checked={form.popular || false}
          onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))}
          className="w-3.5 h-3.5 accent-blue" />
        <label htmlFor="popular" className="text-xs text-text-secondary cursor-pointer">Mark as Popular / Recommended</label>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
          Cancel
        </button>
        <button onClick={() => {
          if (!form.name?.trim()) { toast.error('Plan name required'); return }
          if (!form.price || form.price <= 0) { toast.error('Enter valid price'); return }
          onSave(form)
        }}
          className="flex-1 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors flex items-center justify-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Save Plan
        </button>
      </div>
    </div>
  )
}

// ── AI Persona Section ────────────────────────────────
const TONE_PRESETS = [
  {
    label: 'Friendly & Warm',
    icon: '😊',
    prompt: (gym: string) =>
      `You are Asha, a friendly and warm AI assistant for ${gym}. Always greet with "Namaste! 🙏". Use a conversational, supportive tone. Keep messages short (2-4 lines). Reply in the same language the user writes — Hindi or English. End with an open question to keep the conversation going.`,
  },
  {
    label: 'Professional',
    icon: '💼',
    prompt: (gym: string) =>
      `You are the AI assistant for ${gym}. Respond in a professional and concise manner. Provide accurate information about memberships, schedules, and facilities. Always address the person respectfully. Reply in Hindi or English based on user preference.`,
  },
  {
    label: 'Motivational',
    icon: '💪',
    prompt: (gym: string) =>
      `You are Coach AI at ${gym} — energetic, motivating, and passionate about fitness! Use fitness emojis 💪🏋️🔥. Hype up the members, celebrate their goals. Keep it punchy and exciting. Match the language (Hindi/English) the user uses.`,
  },
  {
    label: 'Sales Focused',
    icon: '🎯',
    prompt: (gym: string) =>
      `You are a sales assistant for ${gym}. Your goal is to convert leads into members. Highlight plan benefits, create urgency with limited offers, and always offer a free trial visit. Be persuasive but not pushy. Reply in Hindi or English as needed.`,
  },
]

const VARIABLES = [
  { var: '{{gym_name}}',  desc: 'Gym ka naam' },
  { var: '{{member_name}}', desc: "Member ka naam" },
  { var: '{{plan}}',      desc: 'Plan name' },
  { var: '{{price}}',     desc: 'Plan price' },
  { var: '{{expiry}}',    desc: 'Expiry date' },
]

function AIPersonaSection({
  aiPersona, setAiPersona, gymName,
}: {
  aiPersona: string
  setAiPersona: (v: string) => void
  gymName: string
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewMsg, setPreviewMsg]   = useState('Bhai membership kitne ki hai?')

  function insertVar(v: string) {
    setAiPersona(aiPersona + v)
  }

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-soft" />
          <h2 className="text-sm font-semibold text-text-primary">AI Persona & Prompt</h2>
        </div>
        <span className="text-xs text-text-muted">{aiPersona.length} characters</span>
      </div>

      {/* Tone presets */}
      <div>
        <p className="text-xs text-text-muted mb-2 font-medium">Quick Tone Presets</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONE_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setAiPersona(preset.prompt(gymName))}
              className="flex flex-col items-start gap-1 p-3 rounded-xl border border-border bg-surface2 hover:border-blue/30 hover:bg-blue/5 transition-all text-left group"
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Variable chips */}
      <div>
        <p className="text-xs text-text-muted mb-2 font-medium">Insert Variable</p>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map(v => (
            <button
              key={v.var}
              onClick={() => insertVar(v.var)}
              title={v.desc}
              className="text-[11px] font-mono px-2 py-1 bg-blue/10 border border-blue/20 text-blue-soft rounded-lg hover:bg-blue/20 transition-colors"
            >
              {v.var}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt textarea */}
      <div>
        <p className="text-xs text-text-muted mb-2 font-medium">System Prompt</p>
        <textarea
          value={aiPersona}
          onChange={e => setAiPersona(e.target.value)}
          rows={7}
          placeholder="AI ko batao kaise baat karni hai, kya jaankari deni hai, aur kaunsi language mein reply karni hai..."
          className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue/40 resize-none transition-colors leading-relaxed"
        />
      </div>

      {/* Preview section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-text-muted font-medium">Test Preview</p>
          <button
            onClick={() => setShowPreview(v => !v)}
            className="text-xs text-blue-soft hover:text-blue transition-colors"
          >
            {showPreview ? 'Hide' : 'Show preview'}
          </button>
        </div>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface2 border-b border-border px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-green/10 border border-green/20 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-green" />
                  </div>
                  <span className="text-xs text-text-muted">WhatsApp Preview — aapka AI agent aise reply karega</span>
                </div>
                <div className="p-4 bg-[#0a0a0a] space-y-2">
                  {/* User message */}
                  <div className="flex justify-start">
                    <div className="bg-surface2 border border-border rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          value={previewMsg}
                          onChange={e => setPreviewMsg(e.target.value)}
                          className="bg-transparent text-xs text-text-primary outline-none flex-1 min-w-0"
                          placeholder="Type a test message..."
                        />
                        <span className="text-[9px] text-text-muted flex-shrink-0">You</span>
                      </div>
                    </div>
                  </div>
                  {/* AI reply hint */}
                  <div className="flex justify-end">
                    <div className="bg-green/10 border border-green/20 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      <p className="text-xs text-text-secondary italic">
                        AI will reply based on your prompt above. Tone: {
                          aiPersona.includes('warm') || aiPersona.includes('friendly') ? '😊 Friendly' :
                          aiPersona.includes('professional') || aiPersona.includes('Professional') ? '💼 Professional' :
                          aiPersona.includes('motivat') || aiPersona.includes('energy') ? '💪 Motivational' :
                          aiPersona.includes('sales') || aiPersona.includes('convert') ? '🎯 Sales' : '🤖 Custom'
                        }
                      </p>
                      <p className="text-[9px] text-text-muted mt-1">Connect Supabase + OpenAI to see live response</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-blue/5 border border-blue/15 rounded-xl">
        <p className="text-xs text-text-muted leading-relaxed">
          <span className="text-blue-soft font-medium">Tips:</span> Gym ka naam, pricing (₹1,999 / ₹3,999 / ₹5,999), specialties,
          aur Hindi/English switching zaror mention karo. Jitna detailed prompt, utna better AI response.
        </p>
      </div>
    </motion.div>
  )
}

// ── WhatsApp Cloud API ────────────────────────────────
function WhatsAppCloudSection() {
  const [config, setConfig] = useState({
    phone_number_id:   '',
    waba_id:           '',
    access_token:      '',
    verify_token:      'gymflow_verify_' + Math.random().toString(36).slice(2, 8),
  })
  const [showToken, setShowToken] = useState(false)
  const [saved, setSaved]         = useState(false)

  function set(field: string, value: string) {
    setConfig(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    if (!config.phone_number_id || !config.access_token) {
      toast.error('Phone Number ID and Access Token are required')
      return
    }
    await new Promise(r => setTimeout(r, 500))
    setSaved(true)
    toast.success('WhatsApp Cloud API configured successfully')
  }

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhook/whatsapp`
    : 'https://your-domain.com/api/webhook/whatsapp'

  const iCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-green/40 transition-colors placeholder-text-muted font-mono'
  const lCls = 'block text-xs text-text-muted mb-1.5 font-medium'

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-green/15 rounded-xl p-5 space-y-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green/30 to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green/10 border border-green/20 rounded-lg flex items-center justify-center text-base">
            💬
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">WhatsApp Cloud API</h2>
            <p className="text-xs text-text-muted mt-0.5">Meta Business — Official WhatsApp API</p>
          </div>
        </div>
        <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-soft hover:text-blue transition-colors">
          Meta Dashboard →
        </a>
      </div>

      {/* Step guide */}
      <div className="p-3 bg-surface2 border border-border rounded-xl">
        <p className="text-xs font-medium text-text-secondary mb-2">Setup Steps:</p>
        <ol className="space-y-1 text-xs text-text-muted list-decimal list-inside">
          <li>Meta Developer Console mein app banao</li>
          <li>WhatsApp product add karo → Business Account select karo</li>
          <li>Phone Number ID aur Access Token copy karo</li>
          <li>Webhook URL set karo (neeche diya hai)</li>
          <li>Verify Token match karo</li>
        </ol>
      </div>

      {/* Config fields */}
      <div className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lCls}>Phone Number ID <span className="text-red">*</span></label>
            <input value={config.phone_number_id}
              onChange={e => set('phone_number_id', e.target.value)}
              placeholder="123456789012345"
              className={iCls} />
            <p className="text-[10px] text-text-muted mt-1">WhatsApp → API Setup → Phone Number ID</p>
          </div>
          <div>
            <label className={lCls}>WhatsApp Business Account ID</label>
            <input value={config.waba_id}
              onChange={e => set('waba_id', e.target.value)}
              placeholder="987654321098765"
              className={iCls} />
            <p className="text-[10px] text-text-muted mt-1">WhatsApp → Configuration → Account ID</p>
          </div>
        </div>

        <div>
          <label className={lCls}>Permanent Access Token <span className="text-red">*</span></label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={config.access_token}
              onChange={e => set('access_token', e.target.value)}
              placeholder="EAAxxxxxxxxxxxxxxx..."
              className={cn(iCls, 'pr-16')}
            />
            <button type="button" onClick={() => setShowToken(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-[10px] text-text-muted mt-1">System User token ya temporary token — Meta Business Settings se milega</p>
        </div>

        {/* Webhook config — read only */}
        <div className="p-4 bg-green/5 border border-green/15 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-green">Webhook Configuration</p>

          <div>
            <label className={lCls}>Webhook URL <span className="text-xs text-text-muted">(Meta mein paste karo)</span></label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-xs text-blue-soft font-mono truncate">
                {webhookUrl}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Copied!') }}
                className="flex-shrink-0 text-xs text-text-muted hover:text-text-secondary bg-surface2 border border-border px-2 py-2 rounded-lg transition-colors">
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className={lCls}>Verify Token <span className="text-xs text-text-muted">(Meta ke saath match karo)</span></label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-xs text-orange font-mono">
                {config.verify_token}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(config.verify_token); toast.success('Copied!') }}
                className="flex-shrink-0 text-xs text-text-muted hover:text-text-secondary bg-surface2 border border-border px-2 py-2 rounded-lg transition-colors">
                Copy
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-text-muted mb-1 font-medium">Subscribe karo in Webhook fields ko:</p>
            <div className="flex flex-wrap gap-1.5">
              {['messages', 'message_deliveries', 'message_reads'].map(f => (
                <span key={f} className="text-[10px] font-mono bg-surface border border-border text-text-muted px-2 py-0.5 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all',
          saved
            ? 'bg-green/15 border border-green/25 text-green'
            : 'bg-green/80 hover:bg-green text-white'
        )}>
        {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Configuration</>}
      </button>
    </motion.div>
  )
}

// ── Supabase Config ───────────────────────────────────
function SupabaseSection() {
  const [config, setConfig] = useState({
    url:          '',
    anon_key:     '',
    service_key:  '',
  })
  const [showAnon, setShowAnon]       = useState(false)
  const [showService, setShowService] = useState(false)
  const [testing, setTesting]         = useState(false)
  const [status, setStatus]           = useState<'idle' | 'success' | 'error'>('idle')
  const [saved, setSaved]             = useState(false)

  function set(field: string, value: string) {
    setConfig(prev => ({ ...prev, [field]: value }))
    setSaved(false); setStatus('idle')
  }

  async function testConnection() {
    if (!config.url || !config.anon_key) { toast.error('URL aur Anon Key required hai'); return }
    setTesting(true)
    await new Promise(r => setTimeout(r, 1200))
    setTesting(false)
    // Simulate — in real app this would ping Supabase
    const valid = config.url.includes('supabase.co') && config.anon_key.startsWith('eyJ')
    setStatus(valid ? 'success' : 'error')
    if (valid) toast.success('Supabase connection successful!')
    else toast.error('Connection failed — URL ya key check karo')
  }

  async function handleSave() {
    if (!config.url || !config.anon_key) { toast.error('URL aur Anon Key required hai'); return }
    await new Promise(r => setTimeout(r, 500))
    setSaved(true)
    toast.success('Supabase config saved — restart karein to apply')
  }

  const iCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted font-mono'
  const lCls = 'block text-xs text-text-muted mb-1.5 font-medium'

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-blue/15 rounded-xl p-5 space-y-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/30 to-transparent" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-lg flex items-center justify-center text-base">
            🗄️
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Supabase Database</h2>
            <p className="text-xs text-text-muted mt-0.5">Database, Auth & Real-time sync</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green bg-green/10 border border-green/20 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" /> Connected
            </span>
          )}
          {status === 'error' && (
            <span className="text-xs text-red bg-red/10 border border-red/20 px-2 py-1 rounded-full">
              ✕ Failed
            </span>
          )}
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-soft hover:text-blue transition-colors">
            Supabase Dashboard →
          </a>
        </div>
      </div>

      {/* Step guide */}
      <div className="p-3 bg-surface2 border border-border rounded-xl">
        <p className="text-xs font-medium text-text-secondary mb-2">Setup Steps:</p>
        <ol className="space-y-1 text-xs text-text-muted list-decimal list-inside">
          <li>supabase.com pe free account banao</li>
          <li>New project create karo</li>
          <li>Settings → API se URL aur keys copy karo</li>
          <li>Neeche paste karo aur Test karo</li>
          <li>Save karo aur app restart karo</li>
        </ol>
      </div>

      {/* Fields */}
      <div className="space-y-4">

        <div>
          <label className={lCls}>Project URL <span className="text-red">*</span></label>
          <input value={config.url} onChange={e => set('url', e.target.value)}
            placeholder="https://xxxxxxxxxxxx.supabase.co"
            className={iCls} />
          <p className="text-[10px] text-text-muted mt-1">Settings → API → Project URL</p>
        </div>

        <div>
          <label className={lCls}>Anon / Public Key <span className="text-red">*</span></label>
          <div className="relative">
            <input type={showAnon ? 'text' : 'password'} value={config.anon_key}
              onChange={e => set('anon_key', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className={cn(iCls, 'pr-16')} />
            <button type="button" onClick={() => setShowAnon(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
              {showAnon ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-[10px] text-text-muted mt-1">Settings → API → anon public key — frontend mein safe hai</p>
        </div>

        <div>
          <label className={lCls}>Service Role Key <span className="text-xs text-orange font-normal">(optional — server only)</span></label>
          <div className="relative">
            <input type={showService ? 'text' : 'password'} value={config.service_key}
              onChange={e => set('service_key', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className={cn(iCls, 'pr-16')} />
            <button type="button" onClick={() => setShowService(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-text-secondary transition-colors">
              {showService ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-[10px] text-orange mt-1">⚠ Kabhi frontend mein expose mat karo — sirf .env.local mein</p>
        </div>

        {/* Features info */}
        <div className="p-3 bg-blue/5 border border-blue/15 rounded-xl">
          <p className="text-xs font-medium text-blue-soft mb-2">Supabase se kya milega:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🗄️', label: 'Database', sub: 'Members, Leads, Payments data' },
              { icon: '⚡', label: 'Real-time', sub: 'Live WhatsApp messages sync' },
              { icon: '🔐', label: 'Auth', sub: 'Secure admin login' },
              { icon: '📁', label: 'Storage', sub: 'Member profile photos' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2 p-2 bg-surface rounded-lg border border-border">
                <span className="text-sm flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="text-xs font-medium text-text-secondary">{f.label}</div>
                  <div className="text-[10px] text-text-muted">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={testConnection} disabled={testing}
          className="flex items-center gap-2 text-sm font-medium border border-blue/20 text-blue-soft bg-blue/10 hover:bg-blue/15 px-4 py-2 rounded-lg transition-all disabled:opacity-60">
          {testing ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-blue/30 border-t-blue-soft rounded-full" />Testing...</>
          ) : (
            <>⚡ Test Connection</>
          )}
        </button>

        <button onClick={handleSave}
          className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all',
            saved ? 'bg-green/15 border border-green/25 text-green' : 'bg-blue hover:bg-blue-muted text-white')}>
          {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Config</>}
        </button>
      </div>

      <p className="text-[11px] text-text-muted">
        Save karne ke baad <code className="text-blue-soft">.env.local</code> mein bhi add karo aur server restart karo.
      </p>
    </motion.div>
  )
}

// ── Database Schema ───────────────────────────────────
const SQL_SCHEMA = `-- GymFlow AI — Supabase Database Schema
-- Supabase SQL Editor mein paste karo aur Run karo

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUMS ─────────────────────────────────────────────
create type lead_status as enum ('new','contacted','qualified','converted','lost');
create type member_status as enum ('active','inactive','paused','expired');
create type payment_status as enum ('pending','completed','failed','refunded');
create type message_role as enum ('user','assistant','system');

-- ── MEMBERS ───────────────────────────────────────────
create table members (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  phone             text not null unique,
  email             text,
  status            member_status default 'active',
  plan_name         text,
  plan_amount       integer,
  plan_start        date,
  plan_end          date,
  joining_date      date,
  trainer           text,
  profile_photo_url text,
  attendance_count  integer default 0,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── LEADS ─────────────────────────────────────────────
create table leads (
  id              uuid primary key default uuid_generate_v4(),
  name            text,
  phone           text not null,
  email           text,
  status          lead_status default 'new',
  score           integer default 0,
  source          text default 'whatsapp',
  interest        text,
  plan_interest   text,
  trial_date      date,
  assigned_agent  text,
  last_message    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── CONVERSATIONS ─────────────────────────────────────
create table conversations (
  id               uuid primary key default uuid_generate_v4(),
  phone            text not null,
  display_name     text,
  last_message     text,
  last_message_at  timestamptz,
  unread_count     integer default 0,
  ai_enabled       boolean default true,
  status           text default 'open',
  created_at       timestamptz default now()
);

-- ── MESSAGES ──────────────────────────────────────────
create table messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid references conversations(id) on delete cascade,
  role             message_role not null,
  content          text not null,
  created_at       timestamptz default now()
);

-- ── PAYMENTS ──────────────────────────────────────────
create table payments (
  id              uuid primary key default uuid_generate_v4(),
  member_id       uuid references members(id),
  member_name     text,
  amount          integer not null,
  status          payment_status default 'pending',
  method          text,
  utr_ref         text,
  cheque_no       text,
  collected_by    text,
  description     text,
  due_date        date,
  paid_at         date,
  created_at      timestamptz default now()
);

-- ── REALTIME ──────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table leads;

-- ── RLS (Row Level Security) ──────────────────────────
alter table members       enable row level security;
alter table leads         enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table payments      enable row level security;

-- Allow all for authenticated users (single gym setup)
create policy "auth_all" on members       for all using (auth.role() = 'authenticated');
create policy "auth_all" on leads         for all using (auth.role() = 'authenticated');
create policy "auth_all" on conversations for all using (auth.role() = 'authenticated');
create policy "auth_all" on messages      for all using (auth.role() = 'authenticated');
create policy "auth_all" on payments      for all using (auth.role() = 'authenticated');`

function DatabaseSchemaSection() {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function copySQL() {
    navigator.clipboard.writeText(SQL_SCHEMA)
    setCopied(true)
    toast.success('SQL copied! Supabase SQL Editor mein paste karo')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple/10 border border-purple/20 rounded-lg flex items-center justify-center text-base">
            📋
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Database Schema (SQL)</h2>
            <p className="text-xs text-text-muted mt-0.5">Supabase SQL Editor mein run karo — ek baar</p>
          </div>
        </div>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-soft hover:text-blue transition-colors">
          SQL Editor →
        </a>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-surface2 border border-border rounded-xl">
        <p className="text-xs font-medium text-text-secondary mb-2">Steps:</p>
        <ol className="space-y-1 text-xs text-text-muted list-decimal list-inside">
          <li>Project folder mein <code className="text-blue-soft">supabase/schema.sql</code> file hai</li>
          <li>Supabase Dashboard → SQL Editor open karo</li>
          <li>Neeche "Copy SQL" karo aur paste karo</li>
          <li>▶ Run karo — sab 7 tables ek baar mein ban jaayenge</li>
        </ol>
      </div>

      {/* Tables list */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { name: 'members',       icon: '👥', color: 'text-blue-soft bg-blue/10 border-blue/20'        },
          { name: 'leads',         icon: '🎯', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
          { name: 'conversations', icon: '💬', color: 'text-green bg-green/10 border-green/20'          },
          { name: 'messages',      icon: '📨', color: 'text-orange bg-orange/10 border-orange/20'       },
          { name: 'payments',      icon: '💳', color: 'text-text-muted bg-surface2 border-border'       },
        ].map(t => (
          <div key={t.name} className={cn('flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium', t.color)}>
            <span>{t.icon}</span>
            <span>{t.name}</span>
          </div>
        ))}
      </div>

      {/* SQL preview */}
      <div>
        <button onClick={() => setExpanded(v => !v)}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors mb-2">
          {expanded ? '▲ Hide SQL' : '▼ Preview SQL'}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }} className="overflow-hidden">
              <pre className="bg-surface2 border border-border rounded-xl p-4 text-[10px] text-text-muted font-mono leading-relaxed overflow-x-auto max-h-60 overflow-y-auto">
                {SQL_SCHEMA}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={copySQL}
        className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all',
          copied ? 'bg-green/15 border border-green/25 text-green' : 'bg-blue hover:bg-blue-muted text-white')}>
        {copied ? <><Check className="w-4 h-4" />Copied!</> : <>📋 Copy SQL Schema</>}
      </button>
    </motion.div>
  )
}

// ── Staff Management ──────────────────────────────────
type StaffRole = 'Admin' | 'Manager' | 'Receptionist' | 'Trainer'
type StaffMember = { id: string; name: string; email: string; role: StaffRole; active: boolean }

function StaffSection() {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id:'1', name:'Arun Sharma',  email:'arun@gym.com',  role:'Trainer',      active: true  },
    { id:'2', name:'Sneha Mehta',  email:'sneha@gym.com', role:'Receptionist', active: true  },
    { id:'3', name:'Rohit Patel',  email:'rohit@gym.com', role:'Manager',      active: false },
  ])
  const [adding, setAdding] = useState(false)
  const [newStaff, setNewStaff] = useState({ name:'', email:'', role:'Receptionist' as StaffRole })

  function addStaff() {
    if (!newStaff.name || !newStaff.email) { toast.error('Name and email required'); return }
    setStaff(prev => [...prev, { id: Date.now().toString(), ...newStaff, active: true }])
    setNewStaff({ name:'', email:'', role:'Receptionist' })
    setAdding(false)
    toast.success('Staff member added')
  }

  const roleColors: Record<StaffRole, string> = {
    Admin:'bg-red/10 text-red border-red/20', Manager:'bg-blue/10 text-blue-soft border-blue/20',
    Receptionist:'bg-green/10 text-green border-green/20', Trainer:'bg-orange/10 text-orange border-orange/20',
  }

  const iCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Staff Accounts</h2>
          <span className="text-xs text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-full">{staff.length}</span>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg hover:bg-blue/15 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </button>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} className="overflow-hidden mb-4">
            <div className="p-4 bg-blue/5 border border-blue/15 rounded-xl space-y-3">
              <p className="text-xs font-medium text-blue-soft">Add New Staff</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={newStaff.name} onChange={e => setNewStaff(p=>({...p,name:e.target.value}))} placeholder="Full name" className={iCls} />
                <input value={newStaff.email} onChange={e => setNewStaff(p=>({...p,email:e.target.value}))} placeholder="email@gym.com" className={iCls} />
              </div>
              <select value={newStaff.role} onChange={e => setNewStaff(p=>({...p,role:e.target.value as StaffRole}))} className={iCls}>
                {(['Admin','Manager','Receptionist','Trainer'] as StaffRole[]).map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">Cancel</button>
                <button onClick={addStaff} className="flex-1 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors">Add</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {staff.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-surface2 border border-border rounded-xl">
            <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-soft flex-shrink-0">
              {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary">{s.name}</div>
              <div className="text-xs text-text-muted">{s.email}</div>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', roleColors[s.role])}>{s.role}</span>
            <button onClick={() => setStaff(prev => prev.filter(x => x.id !== s.id))}
              className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-red transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Auto Reminders ─────────────────────────────────────
function AutoReminderSection() {
  const [days, setDays] = useState({ expiry: 7, payment: 2, followup: 3 })

  const iCls = 'w-16 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors text-center'

  return (
    <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-4 h-4 text-orange" />
        <h2 className="text-sm font-semibold text-text-primary">Auto Reminder Days</h2>
      </div>
      <div className="space-y-4">
        {[
          { key: 'expiry',   label: 'Membership Expiry Reminder', sub: 'Send WhatsApp reminder X days before expiry', color: 'text-orange' },
          { key: 'payment',  label: 'Payment Due Reminder',        sub: 'Remind member X days after payment is due',   color: 'text-red'    },
          { key: 'followup', label: 'Lead Follow-up Reminder',     sub: 'Follow up with lead after X days of no reply',color: 'text-blue-soft'},
        ].map(({ key, label, sub, color }) => (
          <div key={key} className="flex items-center justify-between p-3 bg-surface2 border border-border rounded-xl">
            <div>
              <div className={cn('text-sm font-medium', color)}>{label}</div>
              <div className="text-xs text-text-muted mt-0.5">{sub}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input type="number" min={1} max={30}
                value={days[key as keyof typeof days]}
                onChange={e => setDays(p => ({ ...p, [key]: Number(e.target.value) }))}
                className={iCls} />
              <span className="text-xs text-text-muted">days</span>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => toast.success('Reminder settings saved')}
        className="mt-4 flex items-center gap-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white px-4 py-2 rounded-lg transition-colors">
        <Save className="w-4 h-4" /> Save Reminders
      </button>
    </motion.div>
  )
}


// ── Main Page ─────────────────────────────────────────
export default function SettingsPage() {
  const { gymName: storeGymName, setGymName: setStoreGymName, gymLogo, setGymLogo, theme, setTheme } = useUIStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function applyThemeNow(t: 'dark' | 'light') {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(t)
    localStorage.setItem('gym-theme', t)
    setTheme(t)
    toast.success(`Theme: ${t === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}`)
  }

  const [gymName, setGymName] = useState(storeGymName || brand.name)
  const [city, setCity]       = useState(brand.city)
  const [phone, setPhone]     = useState(brand.phone)
  const [logoPreview, setLogoPreview] = useState<string | null>(gymLogo)
  const logoInputRef = useRef<HTMLInputElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo size must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }
  const [aiPersona, setAiPersona] = useState(
    `You are Asha, a friendly and motivating AI assistant for ${brand.name}. Help members and leads with membership info, schedules, pricing, and fitness queries. Keep responses short and warm. Always reply in the same language the user writes in (Hindi or English).`
  )
  const [hours, setHours] = useState({
    mon: '6:00-22:00', tue: '6:00-22:00', wed: '6:00-22:00',
    thu: '6:00-22:00', fri: '6:00-22:00', sat: '7:00-20:00', sun: 'Closed',
  })
  const [saving, setSaving] = useState(false)

  // Plans state
  const [plans, setPlans]       = useState<Plan[]>(DEFAULT_PLANS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)

    // Update uiStore so sidebar + topbar reflect changes immediately
    setStoreGymName(gymName.trim() || brand.name)
    setGymLogo(logoPreview)

    toast.success('Settings saved successfully')
  }

  function savePlan(updated: Partial<Plan>) {
    if (editingId) {
      setPlans(prev => prev.map(p => p.id === editingId ? { ...p, ...updated } as Plan : p))
      toast.success('Plan updated')
      setEditingId(null)
    } else {
      setPlans(prev => [...prev, { ...updated, id: Date.now().toString() } as Plan])
      toast.success('Plan added')
      setAddingNew(false)
    }
  }

  function deletePlan(id: string) {
    setPlans(prev => prev.filter(p => p.id !== id))
    toast.success('Plan deleted')
  }

  const inputCls = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors'

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-3xl">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary page-heading">Settings</h1>
          <p className="text-text-muted text-sm mt-0.5">Configure your gym profile and AI behavior</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      {/* Gym Profile */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Gym Profile</h2>
        </div>

        {/* Logo upload */}
        <div className="mb-5 pb-5 border-b border-border">
          <label className="block text-xs text-text-muted mb-3">Gym Logo</label>
          <div className="flex items-center gap-5">
            {/* Preview box */}
            <div className="relative group flex-shrink-0">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-surface2 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue/40 transition-colors group"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Gym logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ImageIcon className="w-6 h-6 text-text-muted" />
                    <span className="text-[10px] text-text-muted">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>

            {/* Info + actions */}
            <div className="space-y-1.5">
              <p className="text-sm text-text-secondary font-medium">
                {logoPreview ? 'Logo uploaded ✓' : 'No logo uploaded'}
              </p>
              <p className="text-xs text-text-muted">PNG, JPG, SVG · Max 2MB</p>
              <p className="text-xs text-text-muted">Recommended: 200×200px square</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1 rounded-lg hover:bg-blue/15 transition-colors"
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-xs text-red/70 hover:text-red transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Gym Name', value: gymName, onChange: setGymName },
            { label: 'City',     value: city,    onChange: setCity    },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-xs text-text-muted mb-1.5">{label}</label>
              <input value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-text-muted mb-1.5">WhatsApp Number</label>
            <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2">
              <Phone className="w-3.5 h-3.5 text-text-muted" />
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="bg-transparent text-sm text-text-primary outline-none flex-1" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Appearance / Theme ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">Appearance</h2>
          </div>
          <span className="text-xs text-green bg-green/10 border border-green/20 px-2.5 py-1 rounded-full font-medium">
            Applies instantly
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            {
              key:   'light',
              label: 'Light Mode',
              sub:   'White & clean look',
              icon:  Sun,
              bg:    'bg-[#f1f5f9]',
              card:  'bg-white',
              bar1:  'bg-[#e2e8f0]',
              bar2:  'bg-[#cbd5e1]',
              bar3:  'bg-blue-500',
              border:'border-[#e2e8f0]',
            },
            {
              key:   'dark',
              label: 'Dark Mode',
              sub:   'Easy on the eyes',
              icon:  Moon,
              bg:    'bg-[#0a0a0a]',
              card:  'bg-[#111]',
              bar1:  'bg-[#1a1a1a]',
              bar2:  'bg-[#222]',
              bar3:  'bg-blue-500',
              border:'border-[#333]',
            },
          ] as const).map(({ key, label, sub, icon: Icon, bg, card, bar1, bar2, bar3, border }) => {
            const isActive = mounted && theme === key
            return (
              <button
                key={key}
                onClick={() => applyThemeNow(key)}
                className={cn(
                  'relative flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
                  isActive
                    ? 'bg-blue/10 border-blue/40 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
                    : 'bg-surface2 border-border hover:border-blue/25'
                )}
              >
                <div className={cn('w-full h-16 rounded-lg border overflow-hidden', bg, border)}>
                  <div className="p-2 space-y-1.5">
                    <div className={cn('h-2.5 rounded w-full', card)} />
                    <div className={cn('h-2 rounded w-3/4', bar1)} />
                    <div className={cn('h-2 rounded w-1/2', bar2)} />
                    <div className={cn('h-2 rounded w-1/4', bar3)} />
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-blue-soft' : 'text-text-muted')} />
                      <span className={cn('text-sm font-semibold', isActive ? 'text-blue-soft' : 'text-text-primary')}>
                        {label}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">{sub}</div>
                  </div>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    isActive ? 'bg-blue border-blue' : 'border-border')}>
                    {isActive && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-text-muted mt-3">
          Current: <span className="text-text-secondary font-medium capitalize">{mounted ? theme : 'dark'}</span>
          · Applies instantly, no save needed.
        </p>
      </motion.div>

      {/* ── Gym Plans ── */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-soft" />
            <h2 className="text-sm font-semibold text-text-primary">Membership Plans</h2>
            <span className="text-xs text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-full">{plans.length} plans</span>
          </div>
          {!addingNew && !editingId && (
            <button onClick={() => setAddingNew(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg hover:bg-blue/15 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Plan
            </button>
          )}
        </div>

        {/* Existing plans */}
        <div className="space-y-3">
          <AnimatePresence>
            {plans.map((plan, idx) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className={cn('border rounded-xl overflow-hidden transition-all', planColors[idx % planColors.length])}>

                {editingId === plan.id ? (
                  <div className="p-4">
                    <p className="text-xs font-medium text-text-muted mb-3">Editing: {plan.name}</p>
                    <PlanForm plan={plan} onSave={savePlan} onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] font-semibold text-blue-soft bg-blue/10 border border-blue/20 px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted bg-surface2 border border-border px-1.5 py-0.5 rounded-full capitalize">
                          {DURATION_LABELS[plan.duration]}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-text-primary mb-2">
                        ₹{plan.price.toLocaleString('en-IN')}
                        <span className="text-xs text-text-muted font-normal ml-1">/{plan.duration === 'monthly' ? 'mo' : plan.duration === 'quarterly' ? 'qtr' : 'yr'}</span>
                      </div>
                      {plan.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {plan.features.map((f, i) => (
                            <span key={i} className="flex items-center gap-1 text-[11px] text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-md">
                              <Check className="w-2.5 h-2.5 text-green" />{f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingId(plan.id); setAddingNew(false) }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-text-muted hover:text-blue-soft transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletePlan(plan.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add new plan form */}
        <AnimatePresence>
          {addingNew && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-3 border border-blue/20 bg-blue/5 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-soft mb-3">New Plan</p>
              <PlanForm plan={{}} onSave={savePlan} onCancel={() => setAddingNew(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {plans.length === 0 && !addingNew && (
          <div className="text-center py-8 text-text-muted text-sm">
            No plans yet.{' '}
            <button onClick={() => setAddingNew(true)} className="text-blue-soft hover:underline">Add your first plan</button>
          </div>
        )}
      </motion.div>

      {/* AI Persona */}
      <AIPersonaSection aiPersona={aiPersona} setAiPersona={setAiPersona} gymName={gymName} />

      {/* Business Hours */}
      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Business Hours</h2>
        </div>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-4">
              <span className="text-sm text-text-secondary w-24">{DAY_LABELS[day]}</span>
              <input value={hours[day as keyof typeof hours]}
                onChange={e => setHours(prev => ({ ...prev, [day]: e.target.value }))}
                placeholder="e.g. 6:00-22:00 or Closed"
                className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors" />
            </div>
          ))}
        </div>
      </motion.div>


      {/* ── WhatsApp Cloud API ── */}
      <WhatsAppCloudSection />

      {/* ── Supabase ── */}
      <SupabaseSection />

      {/* ── Database Schema ── */}
      <DatabaseSchemaSection />

      {/* ── Staff Management ── */}
      <StaffSection />

      {/* ── Auto Reminders ── */}
      <AutoReminderSection />


    </motion.div>
  )
}
