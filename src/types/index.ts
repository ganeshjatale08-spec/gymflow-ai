export type { Database } from './database.types'
export type { LeadStatus, MessageRole, MessageChannel, PaymentStatus, MemberStatus, AutomationTrigger, PlanTier } from './database.types'

export interface Gym {
  id: string
  name: string
  slug: string
  city: string | null
  plan_tier: string
  ai_persona: string
}

export interface Profile {
  id: string
  gym_id: string | null
  full_name: string | null
  email: string | null
  role: string
  avatar_url: string | null
}

export interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  status: import('./database.types').LeadStatus
  score: number
  source: string
  interest: string | null
  created_at: string
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  status: import('./database.types').MemberStatus
  plan_name: string | null
  plan_amount: number | null
  plan_end: string | null
  trainer_id: string | null
  attendance_count: number
}

export interface Trainer {
  id: string
  name: string
  phone: string | null
  email: string | null
  speciality: string[] | null
  bio: string | null
  is_active: boolean
}

export interface Conversation {
  id: string
  gym_id: string
  phone: string
  display_name: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  ai_enabled: boolean
  status: string
}

export interface Message {
  id: string
  conversation_id: string
  role: import('./database.types').MessageRole
  content: string
  created_at: string
}

export interface Payment {
  id: string
  member_id: string | null
  amount: number
  currency: string
  status: import('./database.types').PaymentStatus
  payment_method: string | null
  upi_ref: string | null
  description: string | null
  due_date: string | null
  paid_at: string | null
  created_at: string
}

export interface AIAgent {
  id: string
  name: string
  description: string | null
  system_prompt: string
  model: string
  is_active: boolean
  message_count: number
  triggers: string[]
}

export interface Automation {
  id: string
  name: string
  description: string | null
  trigger_type: import('./database.types').AutomationTrigger
  is_active: boolean
  run_count: number
  last_run_at: string | null
}
