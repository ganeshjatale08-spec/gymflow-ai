'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Users, Target, CreditCard, Zap, Settings, BarChart2, UserCog, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = {
  icon: React.ElementType
  title: string
  color: string
  steps: { q: string; a: string }[]
}

const SECTIONS: Section[] = [
  {
    icon: MessageSquare, title: 'Conversations', color: 'text-green',
    steps: [
      { q: 'WhatsApp message kaise aate hain?', a: 'Jab koi customer aapke gym WhatsApp number pe message karta hai, woh automatically yahan dikhta hai aur AI reply karta hai.' },
      { q: 'Manual message kaise bhejein?', a: 'Conversation click karein → message type karein → Send dabayein. Message directly customer ke WhatsApp pe jaata hai.' },
      { q: 'AI reply band kaise karein?', a: 'Conversation header mein "AI" toggle OFF karein. Phir sirf aap manually reply kar sakte hain.' },
      { q: 'Purani conversations kahan hain?', a: 'Sab conversations list mein hain. Search box se naam ya number se dhundh sakte hain.' },
    ]
  },
  {
    icon: Target, title: 'Leads', color: 'text-violet-400',
    steps: [
      { q: 'Lead automatically kaise banta hai?', a: 'Jab koi naya WhatsApp number message karta hai, automatically Lead tab mein add ho jaata hai (status: New).' },
      { q: 'Lead manually kaise add karein?', a: '"Add Lead" button click karein → naam, phone, plan interest bharein → Add karo.' },
      { q: 'Kanban view kya hai?', a: 'Grid icon se Kanban view mein switch karein — leads ko stages mein dekho: New → Contacted → Qualified → Converted.' },
      { q: 'Lead ka status kaise badlein?', a: 'Lead row pe click karein → Edit button → Status change karein → Save.' },
    ]
  },
  {
    icon: Users, title: 'Members', color: 'text-blue-soft',
    steps: [
      { q: 'Member kaise add karein?', a: '"Add Member" click karein → details bharein (naam, phone, plan, expiry) → Add karo. Data automatically save hota hai.' },
      { q: 'Multiple members select karke kya kar sakte hain?', a: 'Checkboxes se members select karein → "Send WhatsApp" ya "Renew 1 Month" button use karein.' },
      { q: 'Member profile kaise edit karein?', a: 'Table mein member pe click karein → side panel khulega → Edit button → changes save karein.' },
      { q: 'Profile photo kaise add karein?', a: 'Member profile drawer mein → Edit → photo box click karein → image upload karein.' },
    ]
  },
  {
    icon: CreditCard, title: 'Payments', color: 'text-green',
    steps: [
      { q: 'Payment record kaise karein?', a: '"Record Payment" button → member select karein → amount, method (UPI/Cash/Card/Cheque) bharein → Save.' },
      { q: 'UPI payment mein UTR kahan daalein?', a: 'Method "UPI" select karne pe UTR field automatically aata hai — 12-digit UTR number daalein.' },
      { q: 'Invoice kaise download karein?', a: 'Payment row ke "Invoice" button pe click karein → "Print/PDF" se save karein.' },
      { q: 'Payment export kaise karein?', a: '"Export" button → CSV, Excel ya PDF select karein — current filtered data export hogi.' },
    ]
  },
  {
    icon: Zap, title: 'Automations & Bulk Message', color: 'text-orange',
    steps: [
      { q: 'Bulk WhatsApp message kaise bhejein?', a: 'Automations tab → "Bulk WhatsApp Message" section → audience choose karein → message type karein → Send.' },
      { q: 'Personalized message kaise bhejein?', a: 'Message mein {{name}} likhein — har member ko unke naam se message jaayega.' },
      { q: 'Template kaise use karein?', a: 'Templates section mein → "Use" button click karein → message box mein template load ho jaata hai → edit karke send karein.' },
      { q: 'Bulk message Conversations tab mein dikhega?', a: 'Haan — bulk message bhejne ke baad har recipient ki conversation mein message visible hoga.' },
    ]
  },
  {
    icon: UserCog, title: 'Employees', color: 'text-purple',
    steps: [
      { q: 'Employee kaise add karein?', a: '"Add Employee" button → naam, phone, role, salary, joining date bharein → photo upload kar sakte hain → Add.' },
      { q: 'Employee edit/delete kaise karein?', a: 'Card pe hover karein → ✏️ Edit ya 🗑️ Delete icon dikhega.' },
      { q: 'Employee notifications kaise set karein?', a: 'Settings → Notifications tab → har event ke liye employees select karein jo notification receive karein.' },
    ]
  },
  {
    icon: Settings, title: 'Settings', color: 'text-text-muted',
    steps: [
      { q: 'Gym name/logo kaise change karein?', a: 'Settings → Gym Profile tab → naam aur logo update karein → Save Changes.' },
      { q: 'AI kaise baat karta hai yeh kaise set karein?', a: 'Settings → AI Persona tab → system prompt likhein → Save. AI aapke prompt ke hisaab se reply karega.' },
      { q: 'Membership plans kaise add karein?', a: 'Settings → Plans tab → "Add Plan" → naam, price, features bharein → Add.' },
      { q: 'WhatsApp API kaise connect karein?', a: 'Settings → WhatsApp API tab → Phone Number ID aur Access Token daalein → Webhook URL Meta mein set karein.' },
      { q: 'Theme kaise change karein?', a: 'Settings → Appearance tab → Light ya Dark mode select karein → instantly apply hota hai.' },
    ]
  },
  {
    icon: BarChart2, title: 'Analytics & Activity', color: 'text-blue-soft',
    steps: [
      { q: 'Analytics kab data dikhayega?', a: 'Jaise jaise members, leads aur payments add honge, analytics automatically populate hoga.' },
      { q: 'Activity Log kya hai?', a: 'Activity tab mein gym mein hone wale sab events ka history dikhta hai — payments, leads, messages sab.' },
    ]
  },
]

interface Props { open: boolean; onClose: () => void }

export function HelpPanel({ open, onClose }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('Conversations')

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

          <motion.div key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-soft" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Help & Guide</h2>
                  <p className="text-xs text-text-muted">GymFlow AI — How to use</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Quick start banner */}
            <div className="mx-4 mt-4 p-3 bg-blue/5 border border-blue/15 rounded-xl flex-shrink-0">
              <p className="text-xs font-semibold text-blue-soft mb-1">🚀 Quick Start</p>
              <ol className="text-xs text-text-muted space-y-1 list-decimal list-inside">
                <li>Settings → Gym Profile → naam save karein</li>
                <li>WhatsApp API → credentials add karein</li>
                <li>Members → staff add karein</li>
                <li>Conversations tab → customer messages dekho</li>
              </ol>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {SECTIONS.map(section => {
                const Icon = section.icon
                const isOpen = openSection === section.title
                return (
                  <div key={section.title} className="bg-surface2 border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenSection(isOpen ? null : section.title)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn('w-4 h-4', section.color)} />
                        <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                        <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded-full border border-border">
                          {section.steps.length} tips
                        </span>
                      </div>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-text-muted" />
                        : <ChevronDown className="w-4 h-4 text-text-muted" />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: 'auto' }}
                          exit={{ height: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-border">
                            {section.steps.map((step, i) => (
                              <div key={i} className="pt-3">
                                <p className="text-xs font-semibold text-text-primary mb-1">
                                  ❓ {step.q}
                                </p>
                                <p className="text-xs text-text-muted leading-relaxed">
                                  💡 {step.a}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex-shrink-0">
              <p className="text-xs text-text-muted text-center">
                GymFlow AI · Single Gym CRM with WhatsApp Automation
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
