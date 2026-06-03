'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Bot, Clock, Phone, Save, Plus, Pencil, Trash2, Check, X,
  IndianRupee, Tag, Camera, ImageIcon, Sun, Moon, Users, Bell, MessageSquare,
  Database, Zap, Shield, ChevronRight, User,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import brand from '@/lib/brand.config'
import { useUIStore } from '@/stores/uiStore'

// ── Constants ─────────────────────────────────────────
const DAYS = ['mon','tue','wed','thu','fri','sat','sun']
const DAY_LABELS: Record<string,string> = { mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday' }

const TABS = [
  { key: 'gym',           label: 'Gym Profile',    icon: Settings    },
  { key: 'appearance',    label: 'Appearance',     icon: Sun         },
  { key: 'ai',            label: 'AI Persona',     icon: Bot         },
  { key: 'plans',         label: 'Plans',          icon: Tag         },
  { key: 'hours',         label: 'Hours',          icon: Clock       },
  { key: 'notifications', label: 'Notifications',  icon: Bell        },
  { key: 'whatsapp',      label: 'WhatsApp API',   icon: MessageSquare },
  { key: 'supabase',      label: 'Database',       icon: Database    },
  { key: 'staff',         label: 'Staff',          icon: Users       },
  { key: 'reminders',     label: 'Reminders',      icon: Zap         },
  { key: 'schema',        label: 'DB Schema',      icon: Shield      },
] as const
type TabKey = typeof TABS[number]['key']

const iCls = 'w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue/40 transition-colors placeholder-text-muted'
const lCls = 'block text-xs text-text-muted mb-1.5 font-medium'

// ── Plans ─────────────────────────────────────────────
type Plan = { id:string; name:string; price:number; duration:'monthly'|'quarterly'|'yearly'; features:string[]; popular:boolean }
const DEFAULT_PLANS: Plan[] = [
  { id:'1', name:'Starter', price:1999, duration:'monthly', features:['Gym access','Locker','Basic equipment'], popular:false },
  { id:'2', name:'Growth',  price:3999, duration:'monthly', features:['Unlimited access','2 PT sessions/week','Diet consultation','Locker'], popular:true },
  { id:'3', name:'Elite',   price:5999, duration:'monthly', features:['Unlimited access','Daily PT sessions','Diet + nutrition plan','Sauna'], popular:false },
]
const DURATION_LABELS = { monthly:'Monthly', quarterly:'Quarterly', yearly:'Yearly' }
const planColors = ['border-blue/20 bg-blue/5','border-emerald-500/20 bg-emerald-500/5','border-violet-500/20 bg-violet-500/5','border-orange-500/20 bg-orange-500/5']

// ── Staff ─────────────────────────────────────────────
type StaffRole = 'Admin'|'Manager'|'Receptionist'|'Trainer'
type StaffMember = { id:string; name:string; email:string; role:StaffRole; active:boolean }
const roleColors: Record<StaffRole,string> = { Admin:'text-red bg-red/10 border-red/20', Manager:'text-blue-soft bg-blue/10 border-blue/20', Receptionist:'text-green bg-green/10 border-green/20', Trainer:'text-orange bg-orange/10 border-orange/20' }

// ── Notification Recipients ───────────────────────────
type NotifEvent = { key:string; label:string; desc:string; icon:React.ElementType; color:string }
const NOTIF_EVENTS: NotifEvent[] = [
  { key:'new_lead',      label:'New Lead',           desc:'WhatsApp pe naya lead aaye',        icon:MessageSquare, color:'text-blue-soft'  },
  { key:'payment_rcvd',  label:'Payment Received',   desc:'Member ka payment aaye',            icon:IndianRupee,   color:'text-green'      },
  { key:'payment_due',   label:'Payment Overdue',    desc:'Payment due date nikal jaaye',      icon:Bell,          color:'text-red'        },
  { key:'renewal',       label:'Membership Expiring',desc:'Member ki membership expire hone wali ho', icon:Clock, color:'text-orange'     },
  { key:'new_member',    label:'New Member Added',   desc:'Naya member join kare',             icon:Users,         color:'text-purple'     },
]

// ── SQL Schema ────────────────────────────────────────
const SQL_SCHEMA = `-- GymFlow AI — Full Schema
-- Supabase SQL Editor mein paste karo

create extension if not exists "uuid-ossp";

create type lead_status    as enum ('new','contacted','qualified','converted','lost');
create type member_status  as enum ('active','inactive','paused','expired');
create type payment_status as enum ('pending','completed','failed','refunded');
create type message_role   as enum ('user','assistant','system');

create table if not exists members (id uuid primary key default uuid_generate_v4(), name text not null, phone text not null unique, email text, status member_status default 'active', plan_name text, plan_amount integer, plan_start date, plan_end date, joining_date date, trainer text, profile_photo_url text, attendance_count integer default 0, notes text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists leads (id uuid primary key default uuid_generate_v4(), name text, phone text not null, email text, status lead_status default 'new', score integer default 0, source text default 'whatsapp', interest text, plan_interest text, trial_date date, assigned_agent text, last_message text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists conversations (id uuid primary key default uuid_generate_v4(), phone text not null unique, display_name text, last_message text, last_message_at timestamptz, unread_count integer default 0, ai_enabled boolean default true, status text default 'open', created_at timestamptz default now());

create table if not exists messages (id uuid primary key default uuid_generate_v4(), conversation_id uuid references conversations(id) on delete cascade, role message_role not null, content text not null, channel text default 'whatsapp', created_at timestamptz default now());

create table if not exists payments (id uuid primary key default uuid_generate_v4(), member_id uuid references members(id), member_name text, amount integer not null, status payment_status default 'pending', method text, utr_ref text, cheque_no text, collected_by text, description text, due_date date, paid_at date, created_at timestamptz default now());

create table if not exists employees (id uuid primary key default uuid_generate_v4(), name text not null, phone text not null, email text, role text default 'Other', status text default 'active', salary integer default 0, joining_date date, address text, emergency_contact text, avatar_url text, notes text, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists gym_settings (id uuid primary key default uuid_generate_v4(), gym_name text default 'My Gym', city text, phone text, logo_url text, ai_persona text, whatsapp_phone_id text, whatsapp_token text, wa_verify_token text, business_hours jsonb, created_at timestamptz default now());

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

alter table members enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table payments enable row level security;
alter table employees enable row level security;
alter table gym_settings enable row level security;

create policy "allow_all" on members       for all using (true) with check (true);
create policy "allow_all" on leads         for all using (true) with check (true);
create policy "allow_all" on conversations for all using (true) with check (true);
create policy "allow_all" on messages      for all using (true) with check (true);
create policy "allow_all" on payments      for all using (true) with check (true);
create policy "allow_all" on employees     for all using (true) with check (true);
create policy "allow_all" on gym_settings  for all using (true) with check (true);`

// ── Main Page ─────────────────────────────────────────
export default function SettingsPage() {
  const { gymName: storeGymName, setGymName: setStoreGymName, gymLogo, setGymLogo, theme, setTheme } = useUIStore()
  const [activeTab, setActiveTab] = useState<TabKey>('gym')
  const [saving, setSaving]       = useState(false)
  const [mounted, setMounted]     = useState(false)
  useEffect(() => setMounted(true), [])

  // Gym profile
  const [gymName, setGymName] = useState(storeGymName || brand.name)
  const [city, setCity]       = useState(brand.city)
  const [phone, setPhone]     = useState(brand.phone)
  const [logoPreview, setLogoPreview] = useState<string | null>(gymLogo)
  const logoRef = useRef<HTMLInputElement>(null)

  // Load gym settings from Supabase on mount
  useEffect(() => {
    fetch('/api/data/gym-settings')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          if (data.gym_name)  { setGymName(data.gym_name);  setStoreGymName(data.gym_name) }
          if (data.city)        setCity(data.city)
          if (data.phone)       setPhone(data.phone)
          if (data.logo_url)  { setLogoPreview(data.logo_url); setGymLogo(data.logo_url) }
          if (data.ai_persona)  setAiPersona(data.ai_persona)
        }
      })
  }, [])

  // AI Persona
  const [aiPersona, setAiPersona] = useState(`You are Asha, a friendly AI assistant for ${brand.name}. Help with membership info, pricing, and schedules. Reply in Hindi or English based on user language. Keep responses short and friendly.`)

  // Hours
  const [hours, setHours] = useState({ mon:'6:00-22:00',tue:'6:00-22:00',wed:'6:00-22:00',thu:'6:00-22:00',fri:'6:00-22:00',sat:'7:00-20:00',sun:'Closed' })

  // Plans
  const [plans, setPlans]       = useState<Plan[]>(DEFAULT_PLANS)
  const [editPlanId, setEditPlanId] = useState<string|null>(null)
  const [addingPlan, setAddingPlan] = useState(false)
  const [planForm, setPlanForm] = useState<Partial<Plan>>({})
  const [featureInput, setFeatureInput] = useState('')

  // Staff
  const [staff, setStaff]   = useState<StaffMember[]>([])
  const [addingStaff, setAddingStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({ name:'',email:'',role:'Receptionist' as StaffRole })

  // Notifications — which employees get which events
  const [notifRecipients, setNotifRecipients] = useState<Record<string, string[]>>({})
  const [employees, setEmployees] = useState<{id:string;name:string;phone:string;role:string}[]>([])

  useEffect(() => {
    fetch('/api/data/employees').then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setEmployees(d) })
  }, [])

  function toggleNotifRecipient(eventKey: string, empId: string) {
    setNotifRecipients(prev => {
      const curr = prev[eventKey] || []
      return { ...prev, [eventKey]: curr.includes(empId) ? curr.filter(id=>id!==empId) : [...curr, empId] }
    })
  }

  // WhatsApp
  const [waConfig, setWaConfig] = useState({ phone_number_id:'', access_token:'', verify_token:'gymflow_verify_secret123', waba_id:'' })
  const [showWaToken, setShowWaToken] = useState(false)
  const [waSaved, setWaSaved] = useState(false)

  // Supabase
  const [sbConfig, setSbConfig] = useState({ url:'', anon_key:'', service_key:'' })
  const [showAnon, setShowAnon]     = useState(false)
  const [showService, setShowService] = useState(false)
  const [sbTesting, setSbTesting]   = useState(false)
  const [sbStatus, setSbStatus]     = useState<'idle'|'ok'|'err'>('idle')

  // Auto reminders
  const [reminders, setReminders] = useState({ expiry:7, payment:2, followup:3 })

  // Schema copy
  const [schemaCopied, setSchemaCopied] = useState(false)
  const [schemaExpanded, setSchemaExpanded] = useState(false)

  // Theme
  function applyTheme(t: 'dark'|'light') {
    document.documentElement.classList.remove('light','dark')
    document.documentElement.classList.add(t)
    localStorage.setItem('gym-theme', t)
    setTheme(t)
    toast.success(`Theme: ${t === 'light' ? '☀️ Light' : '🌙 Dark'}`)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return
    if(file.size > 2*1024*1024) { toast.error('Max 2MB'); return }
    const r = new FileReader(); r.onload = () => setLogoPreview(r.result as string); r.readAsDataURL(file)
  }

  async function saveGymProfile() {
    setSaving(true)
    try {
      const payload = {
        gym_name:   gymName.trim() || brand.name,
        city,
        phone,
        logo_url:   logoPreview,
        ai_persona: aiPersona,
      }
      const res = await fetch('/api/data/gym-settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStoreGymName(payload.gym_name)
      setGymLogo(logoPreview)
      toast.success('Gym profile saved')
    } catch (e: any) {
      toast.error('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/whatsapp` : 'https://your-domain.com/api/webhook/whatsapp'

  async function testSupabase() {
    setSbTesting(true)
    await new Promise(r=>setTimeout(r,1000))
    setSbTesting(false)
    const valid = sbConfig.url.includes('supabase.co') && sbConfig.anon_key.startsWith('eyJ')
    setSbStatus(valid ? 'ok' : 'err')
    toast[valid ? 'success' : 'error'](valid ? 'Connected!' : 'Check URL/Key')
  }

  const currentTab = TABS.find(t => t.key === activeTab)!

  return (
    <div className="flex gap-6 max-w-6xl">

      {/* ── Left sidebar tabs ── */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-3">Settings</p>
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.key
                  ? 'bg-blue/10 border border-blue/20 text-blue-soft'
                  : 'text-text-muted hover:bg-surface2 hover:text-text-primary')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Right content ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-8 }} transition={{ duration:0.15 }}
            className="space-y-5">

            {/* Section title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-lg flex items-center justify-center">
                  <currentTab.icon className="w-4 h-4 text-blue-soft" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-text-primary">{currentTab.label}</h1>
                </div>
              </div>
              {activeTab === 'gym' && (
                <button onClick={saveGymProfile} disabled={saving}
                  className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>

            {/* ── GYM PROFILE ── */}
            {activeTab === 'gym' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
                {/* Logo */}
                <div>
                  <label className={lCls}>Gym Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="relative group flex-shrink-0">
                      <div onClick={() => logoRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-surface2 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue/40 transition-colors group">
                        {logoPreview
                          ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                          : <div className="flex flex-col items-center gap-1"><ImageIcon className="w-6 h-6 text-text-muted" /><span className="text-[10px] text-text-muted">Upload</span></div>}
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera className="w-5 h-5 text-white" /></div>
                      </div>
                      <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </div>
                    <div className="text-xs text-text-muted space-y-1">
                      <p className="font-medium text-text-secondary">{logoPreview ? 'Logo uploaded ✓' : 'No logo'}</p>
                      <p>PNG, JPG · Max 2MB · 200×200px</p>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => logoRef.current?.click()} className="text-xs text-blue-soft bg-blue/10 border border-blue/20 px-2 py-1 rounded-lg">{logoPreview ? 'Change' : 'Upload'}</button>
                        {logoPreview && <button onClick={() => setLogoPreview(null)} className="text-xs text-red/70 hover:text-red">Remove</button>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lCls}>Gym Name</label><input value={gymName} onChange={e=>setGymName(e.target.value)} className={iCls} /></div>
                  <div><label className={lCls}>City</label><input value={city} onChange={e=>setCity(e.target.value)} className={iCls} /></div>
                </div>
                <div>
                  <label className={lCls}>WhatsApp Number</label>
                  <div className="flex items-center gap-2 bg-surface2 border border-border rounded-xl px-3 py-2.5">
                    <Phone className="w-3.5 h-3.5 text-text-muted" />
                    <input value={phone} onChange={e=>setPhone(e.target.value)} className="bg-transparent text-sm text-text-primary outline-none flex-1" />
                  </div>
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">Choose your preferred theme</p>
                  <span className="text-xs text-green bg-green/10 border border-green/20 px-2.5 py-1 rounded-full">Applies instantly</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key:'light', label:'Light Mode', sub:'White & clean', bg:'bg-[#f1f5f9]', card:'bg-white', b1:'bg-[#e2e8f0]', b2:'bg-[#cbd5e1]', border:'border-[#e2e8f0]', icon:Sun },
                    { key:'dark',  label:'Dark Mode',  sub:'Easy on eyes',  bg:'bg-[#0a0a0a]', card:'bg-[#111]', b1:'bg-[#1a1a1a]', b2:'bg-[#222]',    border:'border-[#333]',    icon:Moon },
                  ].map(({ key, label, sub, bg, card, b1, b2, border, icon:Icon }) => {
                    const isActive = mounted && theme === key
                    return (
                      <button key={key} onClick={() => applyTheme(key as any)}
                        className={cn('flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all',
                          isActive ? 'bg-blue/10 border-blue/40 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' : 'bg-surface2 border-border hover:border-blue/25')}>
                        <div className={cn('w-full h-14 rounded-lg border overflow-hidden', bg, border)}>
                          <div className="p-2 space-y-1.5">
                            <div className={cn('h-2.5 rounded w-full', card)} />
                            <div className={cn('h-2 rounded w-3/4', b1)} />
                            <div className={cn('h-2 rounded w-1/2', b2)} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <div><div className="flex items-center gap-2"><Icon className={cn('w-3.5 h-3.5', isActive?'text-blue-soft':'text-text-muted')} /><span className={cn('text-sm font-semibold', isActive?'text-blue-soft':'text-text-primary')}>{label}</span></div><div className="text-xs text-text-muted">{sub}</div></div>
                          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', isActive?'bg-blue border-blue':'border-border')}>{isActive&&<Check className="w-3 h-3 text-white" />}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── AI PERSONA ── */}
            {activeTab === 'ai' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:'😊 Friendly', prompt:`You are Asha, a friendly AI assistant for ${gymName}. Always greet with "Namaste! 🙏". Use conversational tone. Reply in Hindi or English based on user.` },
                    { label:'💼 Professional', prompt:`You are the AI assistant for ${gymName}. Be professional and concise. Provide accurate membership info. Reply in Hindi or English as needed.` },
                    { label:'💪 Motivational', prompt:`You are Coach AI at ${gymName}! Energetic and passionate about fitness! Use emojis 💪🏋️🔥. Hype up members. Reply in Hindi or English.` },
                    { label:'🎯 Sales', prompt:`You are a sales assistant for ${gymName}. Convert leads to members. Highlight benefits, create urgency, offer free trial. Be persuasive but friendly.` },
                  ].map(p => (
                    <button key={p.label} onClick={() => setAiPersona(p.prompt)}
                      className="p-3 bg-surface2 border border-border rounded-xl text-xs font-medium text-text-secondary hover:border-blue/30 hover:bg-blue/5 transition-all text-left">{p.label}</button>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={lCls.replace('mb-1.5','')}>System Prompt</label>
                    <span className="text-xs text-text-muted">{aiPersona.length} chars</span>
                  </div>
                  <textarea value={aiPersona} onChange={e=>setAiPersona(e.target.value)} rows={6} className={cn(iCls,'resize-none leading-relaxed')} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['{{name}}','{{plan}}','{{amount}}','{{expiry}}','{{gym_name}}'].map(v=>(
                      <button key={v} onClick={()=>setAiPersona(p=>p+v)} className="text-[10px] font-mono px-1.5 py-0.5 bg-blue/10 border border-blue/20 text-blue-soft rounded hover:bg-blue/20 transition-colors">{v}</button>
                    ))}
                  </div>
                </div>
                <button onClick={async()=>{
                  await fetch('/api/data/gym-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ai_persona:aiPersona})})
                  toast.success('AI Persona saved')
                }} className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Save className="w-3.5 h-3.5" />Save Persona
                </button>
              </div>
            )}

            {/* ── PLANS ── */}
            {activeTab === 'plans' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{plans.length} plans</span>
                  {!addingPlan && !editPlanId && (
                    <button onClick={()=>{setAddingPlan(true);setPlanForm({duration:'monthly',popular:false,features:[]})}}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg hover:bg-blue/15">
                      <Plus className="w-3.5 h-3.5" />Add Plan
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {plans.map((plan,idx) => (
                    <div key={plan.id} className={cn('border rounded-xl overflow-hidden', planColors[idx%planColors.length])}>
                      {editPlanId === plan.id ? (
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input value={planForm.name||''} onChange={e=>setPlanForm(p=>({...p,name:e.target.value}))} placeholder="Plan name" className={iCls} />
                            <select value={planForm.duration} onChange={e=>setPlanForm(p=>({...p,duration:e.target.value as any}))} className={iCls}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                          </div>
                          <div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" /><input type="number" value={planForm.price||''} onChange={e=>setPlanForm(p=>({...p,price:Number(e.target.value)}))} placeholder="Price" className="w-full bg-surface2 border border-border rounded-xl pl-8 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue/40" /></div>
                          <div className="flex gap-2"><input value={featureInput} onChange={e=>setFeatureInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(featureInput.trim()){setPlanForm(p=>({...p,features:[...(p.features||[]),featureInput.trim()]}));setFeatureInput('')}}}} placeholder="Add feature, press Enter" className={cn(iCls,'flex-1')} /><button onClick={()=>{if(featureInput.trim()){setPlanForm(p=>({...p,features:[...(p.features||[]),featureInput.trim()]}));setFeatureInput('')}}} className="px-3 py-2 bg-blue/10 border border-blue/20 text-blue-soft text-xs rounded-xl">Add</button></div>
                          {(planForm.features||[]).length>0 && <div className="flex flex-wrap gap-1.5">{planForm.features?.map((f,i)=><span key={i} className="flex items-center gap-1 text-xs bg-surface2 border border-border text-text-secondary px-2 py-1 rounded-lg">{f}<button onClick={()=>setPlanForm(p=>({...p,features:p.features?.filter((_,j)=>j!==i)}))}><X className="w-3 h-3" /></button></span>)}</div>}
                          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer"><input type="checkbox" checked={planForm.popular||false} onChange={e=>setPlanForm(p=>({...p,popular:e.target.checked}))} className="accent-blue" />Mark as Popular</label>
                          <div className="flex gap-2"><button onClick={()=>setEditPlanId(null)} className="flex-1 py-2 text-sm text-text-muted border border-border rounded-xl">Cancel</button><button onClick={()=>{setPlans(p=>p.map(x=>x.id===editPlanId?{...x,...planForm} as Plan:x));setEditPlanId(null);toast.success('Plan updated')}} className="flex-1 py-2 text-sm font-medium bg-blue text-white rounded-xl flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" />Save</button></div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-4 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-text-primary">{plan.name}</span>{plan.popular&&<span className="text-[10px] font-semibold text-blue-soft bg-blue/10 border border-blue/20 px-1.5 py-0.5 rounded-full">Popular</span>}<span className="text-[10px] text-text-muted bg-surface2 border border-border px-1.5 py-0.5 rounded-full">{DURATION_LABELS[plan.duration]}</span></div>
                            <div className="text-xl font-bold text-text-primary mb-2">₹{plan.price.toLocaleString('en-IN')}<span className="text-xs text-text-muted font-normal ml-1">/{plan.duration==='monthly'?'mo':plan.duration==='quarterly'?'qtr':'yr'}</span></div>
                            <div className="flex flex-wrap gap-1.5">{plan.features.map((f,i)=><span key={i} className="flex items-center gap-1 text-[11px] text-text-muted bg-surface2 border border-border px-2 py-0.5 rounded-md"><Check className="w-2.5 h-2.5 text-green" />{f}</span>)}</div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={()=>{setEditPlanId(plan.id);setPlanForm({...plan})}} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface2 text-text-muted hover:text-blue-soft"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={()=>setPlans(p=>p.filter(x=>x.id!==plan.id))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red/10 text-text-muted hover:text-red"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {addingPlan && (
                    <div className="border border-blue/20 bg-blue/5 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-medium text-blue-soft">New Plan</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={planForm.name||''} onChange={e=>setPlanForm(p=>({...p,name:e.target.value}))} placeholder="Plan name *" className={iCls} />
                        <select value={planForm.duration} onChange={e=>setPlanForm(p=>({...p,duration:e.target.value as any}))} className={iCls}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
                      </div>
                      <div className="relative"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" /><input type="number" value={planForm.price||''} onChange={e=>setPlanForm(p=>({...p,price:Number(e.target.value)}))} placeholder="Price *" className="w-full bg-surface2 border border-border rounded-xl pl-8 pr-3 py-2.5 text-sm text-text-primary outline-none focus:border-blue/40" /></div>
                      <div className="flex gap-2"><button onClick={()=>setAddingPlan(false)} className="flex-1 py-2 text-sm text-text-muted border border-border rounded-xl">Cancel</button><button onClick={()=>{if(!planForm.name||!planForm.price){toast.error('Name & price required');return}setPlans(p=>[...p,{...planForm,id:Date.now().toString(),features:planForm.features||[]} as Plan]);setAddingPlan(false);toast.success('Plan added')}} className="flex-1 py-2 text-sm font-medium bg-blue text-white rounded-xl flex items-center justify-center gap-1.5"><Check className="w-3.5 h-3.5" />Add</button></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── HOURS ── */}
            {activeTab === 'hours' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary w-24 flex-shrink-0">{DAY_LABELS[day]}</span>
                    <input value={hours[day as keyof typeof hours]} onChange={e=>setHours(p=>({...p,[day]:e.target.value}))} placeholder="6:00-22:00 or Closed" className={cn(iCls,'flex-1')} />
                  </div>
                ))}
                <button onClick={()=>toast.success('Hours saved')} className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg mt-2">
                  <Save className="w-3.5 h-3.5" />Save Hours
                </button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-sm text-text-secondary">
                    Choose which employees receive notifications for each event. They will get WhatsApp messages when these events happen.
                  </p>
                </div>

                {employees.length === 0 ? (
                  <div className="bg-surface border border-border rounded-xl p-10 text-center">
                    <Users className="w-10 h-10 text-text-muted opacity-20 mx-auto mb-3" />
                    <p className="text-sm text-text-muted">No employees added yet</p>
                    <p className="text-xs text-text-muted mt-1">Add employees first from the Employees tab</p>
                  </div>
                ) : (
                  NOTIF_EVENTS.map(event => {
                    const Icon = event.icon
                    const selected = notifRecipients[event.key] || []
                    return (
                      <div key={event.key} className="bg-surface border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className={cn('w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center', event.color)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary">{event.label}</div>
                            <div className="text-xs text-text-muted">{event.desc}</div>
                          </div>
                          <span className="ml-auto text-xs text-text-muted">{selected.length} selected</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {employees.map(emp => {
                            const isSelected = selected.includes(emp.id)
                            return (
                              <button key={emp.id} onClick={() => toggleNotifRecipient(event.key, emp.id)}
                                className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all',
                                  isSelected ? 'bg-blue/10 border-blue/30 text-blue-soft' : 'bg-surface2 border-border text-text-muted hover:border-blue/20')}>
                                <div className="w-6 h-6 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-soft flex-shrink-0">
                                  {emp.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                                </div>
                                <span className="font-medium">{emp.name}</span>
                                <span className="text-[10px] opacity-60">{emp.role}</span>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}

                {employees.length > 0 && (
                  <button onClick={() => toast.success('Notification settings saved')}
                    className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg">
                    <Save className="w-3.5 h-3.5" />Save Notification Settings
                  </button>
                )}
              </div>
            )}

            {/* ── WHATSAPP API ── */}
            {activeTab === 'whatsapp' && (
              <div className="bg-surface border border-green/15 rounded-xl p-5 relative overflow-hidden space-y-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green/30 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-green/10 border border-green/20 rounded-lg flex items-center justify-center text-base">💬</div>
                    <div><div className="text-sm font-semibold text-text-primary">WhatsApp Cloud API</div><div className="text-xs text-text-muted">Meta Business — Official API</div></div>
                  </div>
                  <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-soft hover:text-blue transition-colors">Meta Dashboard →</a>
                </div>

                <div className="p-3 bg-surface2 border border-border rounded-xl text-xs text-text-muted space-y-1">
                  <p className="font-medium text-text-secondary">Setup Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Meta Developer Console → App → WhatsApp → API Setup</li>
                    <li>Phone Number ID aur Access Token copy karo</li>
                    <li>Neeche paste karo aur Save karo</li>
                    <li>Webhook URL set karo Meta mein</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lCls}>Phone Number ID *</label><input value={waConfig.phone_number_id} onChange={e=>setWaConfig(p=>({...p,phone_number_id:e.target.value}))} placeholder="123456789012345" className={iCls} /></div>
                  <div><label className={lCls}>Business Account ID</label><input value={waConfig.waba_id} onChange={e=>setWaConfig(p=>({...p,waba_id:e.target.value}))} placeholder="987654321098765" className={iCls} /></div>
                </div>

                <div>
                  <label className={lCls}>Access Token *</label>
                  <div className="relative">
                    <input type={showWaToken?'text':'password'} value={waConfig.access_token} onChange={e=>setWaConfig(p=>({...p,access_token:e.target.value}))} placeholder="EAAxxxxxxxx..." className={cn(iCls,'pr-16')} />
                    <button onClick={()=>setShowWaToken(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-text-secondary">{showWaToken?'Hide':'Show'}</button>
                  </div>
                </div>

                <div className="p-4 bg-green/5 border border-green/15 rounded-xl space-y-3">
                  <p className="text-xs font-semibold text-green">Webhook Configuration</p>
                  <div><label className={lCls}>Callback URL</label><div className="flex items-center gap-2"><code className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-xs text-blue-soft font-mono truncate">{webhookUrl}</code><button onClick={()=>{navigator.clipboard.writeText(webhookUrl);toast.success('Copied!')}} className="text-xs text-text-muted hover:text-text-secondary bg-surface2 border border-border px-2 py-2 rounded-lg">Copy</button></div></div>
                  <div><label className={lCls}>Verify Token</label><div className="flex items-center gap-2"><code className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-xs text-orange font-mono">{waConfig.verify_token}</code><button onClick={()=>{navigator.clipboard.writeText(waConfig.verify_token);toast.success('Copied!')}} className="text-xs text-text-muted hover:text-text-secondary bg-surface2 border border-border px-2 py-2 rounded-lg">Copy</button></div></div>
                </div>

                <button onClick={()=>{setWaSaved(true);toast.success('WhatsApp config saved');setTimeout(()=>setWaSaved(false),3000)}}
                  className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                    waSaved?'bg-green/15 border border-green/25 text-green':'bg-green/80 hover:bg-green text-white')}>
                  {waSaved?<><Check className="w-4 h-4" />Saved!</>:<><Save className="w-4 h-4" />Save Config</>}
                </button>
              </div>
            )}

            {/* ── SUPABASE ── */}
            {activeTab === 'supabase' && (
              <div className="bg-surface border border-blue/15 rounded-xl p-5 relative overflow-hidden space-y-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue/30 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-lg flex items-center justify-center text-base">🗄️</div>
                    <div><div className="text-sm font-semibold text-text-primary">Supabase Database</div><div className="text-xs text-text-muted">Database, Auth & Realtime</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sbStatus==='ok'&&<span className="flex items-center gap-1 text-xs text-green bg-green/10 border border-green/20 px-2 py-1 rounded-full"><Check className="w-3 h-3" />Connected</span>}
                    {sbStatus==='err'&&<span className="text-xs text-red bg-red/10 border border-red/20 px-2 py-1 rounded-full">Failed</span>}
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-soft hover:text-blue">Dashboard →</a>
                  </div>
                </div>

                <div><label className={lCls}>Project URL *</label><input value={sbConfig.url} onChange={e=>setSbConfig(p=>({...p,url:e.target.value}))} placeholder="https://xxxx.supabase.co" className={iCls} /></div>
                <div><label className={lCls}>Anon Key *</label><div className="relative"><input type={showAnon?'text':'password'} value={sbConfig.anon_key} onChange={e=>setSbConfig(p=>({...p,anon_key:e.target.value}))} placeholder="eyJhbGci..." className={cn(iCls,'pr-16')} /><button onClick={()=>setShowAnon(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">{showAnon?'Hide':'Show'}</button></div></div>
                <div><label className={lCls}>Service Role Key <span className="text-orange text-[10px]">(server only)</span></label><div className="relative"><input type={showService?'text':'password'} value={sbConfig.service_key} onChange={e=>setSbConfig(p=>({...p,service_key:e.target.value}))} placeholder="eyJhbGci..." className={cn(iCls,'pr-16')} /><button onClick={()=>setShowService(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">{showService?'Hide':'Show'}</button></div><p className="text-[10px] text-orange mt-1">⚠ Sirf .env.local mein rakhein</p></div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={testSupabase} disabled={sbTesting}
                    className="flex items-center justify-center gap-2 text-sm font-medium border border-blue/20 text-blue-soft bg-blue/10 hover:bg-blue/15 px-4 py-2 rounded-lg disabled:opacity-60">
                    {sbTesting?<><motion.div animate={{rotate:360}} transition={{duration:0.8,repeat:Infinity,ease:'linear'}} className="w-4 h-4 border-2 border-blue/30 border-t-blue-soft rounded-full" />Testing...</>:<>⚡ Test</>}
                  </button>
                  <button onClick={()=>toast.success('Supabase config saved')} className="flex items-center justify-center gap-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white px-4 py-2 rounded-lg">
                    <Save className="w-4 h-4" />Save
                  </button>
                </div>
              </div>
            )}

            {/* ── STAFF ── */}
            {activeTab === 'staff' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{staff.length} staff members</span>
                  {!addingStaff&&<button onClick={()=>setAddingStaff(true)} className="flex items-center gap-1.5 text-xs font-medium text-blue-soft bg-blue/10 border border-blue/20 px-3 py-1.5 rounded-lg"><Plus className="w-3.5 h-3.5" />Add</button>}
                </div>

                <AnimatePresence>
                  {addingStaff&&(
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                      <div className="p-4 bg-blue/5 border border-blue/15 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input value={newStaff.name} onChange={e=>setNewStaff(p=>({...p,name:e.target.value}))} placeholder="Full name" className={iCls} />
                          <input value={newStaff.email} onChange={e=>setNewStaff(p=>({...p,email:e.target.value}))} placeholder="Email" className={iCls} />
                        </div>
                        <select value={newStaff.role} onChange={e=>setNewStaff(p=>({...p,role:e.target.value as StaffRole}))} className={iCls}>
                          {(['Admin','Manager','Receptionist','Trainer'] as StaffRole[]).map(r=><option key={r} value={r} className="bg-surface">{r}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={()=>setAddingStaff(false)} className="flex-1 py-2 text-sm text-text-muted border border-border rounded-xl">Cancel</button>
                          <button onClick={()=>{if(!newStaff.name||!newStaff.email){toast.error('Name & email required');return}setStaff(p=>[...p,{id:Date.now().toString(),...newStaff,active:true}]);setNewStaff({name:'',email:'',role:'Receptionist'});setAddingStaff(false);toast.success('Staff added')}} className="flex-1 py-2 text-sm font-medium bg-blue text-white rounded-xl">Add</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {staff.length===0&&<div className="text-center py-8 text-text-muted text-sm">No staff accounts yet</div>}
                  {staff.map(s=>(
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-surface2 border border-border rounded-xl">
                      <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-soft">{s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-medium text-text-primary">{s.name}</div><div className="text-xs text-text-muted">{s.email}</div></div>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium',roleColors[s.role])}>{s.role}</span>
                      <button onClick={()=>setStaff(p=>p.filter(x=>x.id!==s.id))} className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-red"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REMINDERS ── */}
            {activeTab === 'reminders' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                {[
                  { key:'expiry',  label:'Membership Expiry', sub:'X days pehle reminder send karo', color:'text-orange' },
                  { key:'payment', label:'Payment Due',        sub:'X days baad reminder send karo',  color:'text-red'    },
                  { key:'followup',label:'Lead Follow-up',     sub:'X days baad follow-up karo',      color:'text-blue-soft'},
                ].map(({key,label,sub,color})=>(
                  <div key={key} className="flex items-center justify-between p-3 bg-surface2 border border-border rounded-xl">
                    <div><div className={cn('text-sm font-medium',color)}>{label}</div><div className="text-xs text-text-muted mt-0.5">{sub}</div></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input type="number" min={1} max={30} value={reminders[key as keyof typeof reminders]} onChange={e=>setReminders(p=>({...p,[key]:Number(e.target.value)}))} className="w-16 bg-surface2 border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none text-center" />
                      <span className="text-xs text-text-muted">days</span>
                    </div>
                  </div>
                ))}
                <button onClick={()=>toast.success('Reminders saved')} className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg">
                  <Save className="w-3.5 h-3.5" />Save Reminders
                </button>
              </div>
            )}

            {/* ── DB SCHEMA ── */}
            {activeTab === 'schema' && (
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <div className="p-3 bg-surface2 border border-border rounded-xl text-xs text-text-muted space-y-1">
                  <p className="font-medium text-text-secondary">How to setup:</p>
                  <ol className="list-decimal list-inside space-y-1"><li>Supabase Dashboard → SQL Editor</li><li>"Copy SQL" karo</li><li>Paste karo → ▶ Run karo</li></ol>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[{n:'members',i:'👥'},{n:'leads',i:'🎯'},{n:'conversations',i:'💬'},{n:'messages',i:'📨'},{n:'payments',i:'💳'},{n:'employees',i:'👔'},{n:'gym_settings',i:'⚙️'}].map(t=>(
                    <div key={t.n} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-surface2 text-xs font-medium text-text-muted"><span>{t.i}</span><span className="truncate">{t.n}</span></div>
                  ))}
                </div>
                <div>
                  <button onClick={()=>setSchemaExpanded(v=>!v)} className="text-xs text-text-muted hover:text-text-secondary mb-2 transition-colors">{schemaExpanded?'▲ Hide SQL':'▼ Preview SQL'}</button>
                  <AnimatePresence>
                    {schemaExpanded&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden"><pre className="bg-surface2 border border-border rounded-xl p-4 text-[10px] text-text-muted font-mono overflow-x-auto max-h-60 overflow-y-auto">{SQL_SCHEMA}</pre></motion.div>}
                  </AnimatePresence>
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(SQL_SCHEMA);setSchemaCopied(true);toast.success('SQL copied!');setTimeout(()=>setSchemaCopied(false),3000)}}
                  className={cn('flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all',
                    schemaCopied?'bg-green/15 border border-green/25 text-green':'bg-blue hover:bg-blue-muted text-white')}>
                  {schemaCopied?<><Check className="w-4 h-4" />Copied!</>:<>📋 Copy SQL Schema</>}
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
