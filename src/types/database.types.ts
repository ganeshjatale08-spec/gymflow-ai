export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageChannel = 'whatsapp' | 'sms' | 'email' | 'internal'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type MemberStatus = 'active' | 'inactive' | 'paused' | 'expired'
export type AutomationTrigger = 'new_lead' | 'message_received' | 'payment_due' | 'membership_expiring' | 'birthday' | 'inactivity' | 'manual'
export type PlanTier = 'starter' | 'growth' | 'enterprise'

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string
          name: string
          slug: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          logo_url: string | null
          plan_tier: PlanTier
          whatsapp_number: string | null
          twilio_sid: string | null
          ai_persona: string
          business_hours: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gyms']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['gyms']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          gym_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          role: string
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      leads: {
        Row: {
          id: string
          gym_id: string
          name: string | null
          phone: string
          email: string | null
          source: string
          status: LeadStatus
          score: number
          interest: string | null
          notes: string | null
          assigned_to: string | null
          converted_at: string | null
          last_contact: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      members: {
        Row: {
          id: string
          gym_id: string
          lead_id: string | null
          name: string
          phone: string
          email: string | null
          status: MemberStatus
          plan_name: string | null
          plan_amount: number | null
          plan_start: string | null
          plan_end: string | null
          trainer_id: string | null
          profile_photo_url: string | null
          health_notes: string | null
          attendance_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['members']['Insert']>
      }
      trainers: {
        Row: {
          id: string
          gym_id: string
          name: string
          phone: string | null
          email: string | null
          speciality: string[] | null
          bio: string | null
          photo_url: string | null
          is_active: boolean
          schedule: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['trainers']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['trainers']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          gym_id: string
          lead_id: string | null
          member_id: string | null
          phone: string
          display_name: string | null
          channel: MessageChannel
          status: string
          ai_enabled: boolean
          last_message: string | null
          last_message_at: string | null
          unread_count: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          gym_id: string
          role: MessageRole
          content: string
          channel: MessageChannel
          twilio_sid: string | null
          is_read: boolean
          tokens_used: number
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      payments: {
        Row: {
          id: string
          gym_id: string
          member_id: string | null
          amount: number
          currency: string
          status: PaymentStatus
          payment_method: string | null
          upi_ref: string | null
          description: string | null
          due_date: string | null
          paid_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      ai_agents: {
        Row: {
          id: string
          gym_id: string
          name: string
          description: string | null
          system_prompt: string
          model: string
          temperature: number
          max_tokens: number
          triggers: string[]
          is_active: boolean
          message_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_agents']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['ai_agents']['Insert']>
      }
      automations: {
        Row: {
          id: string
          gym_id: string
          name: string
          description: string | null
          trigger_type: AutomationTrigger
          trigger_config: Json
          actions: Json
          is_active: boolean
          run_count: number
          last_run_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['automations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['automations']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      lead_status: LeadStatus
      message_role: MessageRole
      message_channel: MessageChannel
      payment_status: PaymentStatus
      member_status: MemberStatus
      automation_trigger: AutomationTrigger
      plan_tier: PlanTier
    }
  }
}
