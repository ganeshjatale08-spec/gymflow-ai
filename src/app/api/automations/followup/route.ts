export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppReply } from '@/lib/whatsapp'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

// GET — send follow-up to leads with no reply in X days
export async function GET(req: NextRequest) {
  const supabase = db()
  const results: any[] = []

  // Get followup days from settings (default 3)
  const { data: settings } = await supabase
    .from('gym_settings').select('business_hours, gym_name').limit(1).maybeSingle()
  const bh = (settings?.business_hours as any) || {}
  const followupDays = bh.reminder_followup || 3
  const gymName = settings?.gym_name || 'our gym'

  // Find leads not updated in followupDays
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - followupDays)

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, phone, interest, plan_interest')
    .in('status', ['new', 'contacted'])
    .lte('updated_at', cutoff.toISOString())

  if (!leads || leads.length === 0) {
    return NextResponse.json({ message: 'No follow-ups needed', sent: 0 })
  }

  for (const lead of leads) {
    const msg = `Namaste ${lead.name || 'ji'}! 👋\n\nHum ${gymName} se bol rahe hain.\n\nKya aap abhi bhi gym join karne mein interested hain${lead.plan_interest ? ` (${lead.plan_interest} plan)` : ''}? Free trial ka option available hai! 💪\n\nReply karein — hum help karenge! 🙏`

    try {
      await sendWhatsAppReply(lead.phone, msg)

      // Update lead status to contacted
      await supabase.from('leads').update({
        status: 'contacted', updated_at: new Date().toISOString(), last_message: msg
      }).eq('id', lead.id)

      // Save to conversation
      const { data: conv } = await supabase
        .from('conversations').select('id').eq('phone', lead.phone).maybeSingle()
      if (conv) {
        await supabase.from('messages').insert({
          conversation_id: conv.id, role: 'assistant', content: msg, channel: 'whatsapp'
        })
        await supabase.from('conversations').update({
          last_message: msg, last_message_at: new Date().toISOString()
        }).eq('id', conv.id)
      }

      results.push({ name: lead.name, phone: lead.phone, status: 'sent' })
      await new Promise(r => setTimeout(r, 200))
    } catch {
      results.push({ name: lead.name, phone: lead.phone, status: 'failed' })
    }
  }

  return NextResponse.json({ sent: results.filter(r => r.status === 'sent').length, total: leads.length, results })
}
