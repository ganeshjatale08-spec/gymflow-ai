export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppReply } from '@/lib/whatsapp'
import { buildSystemPrompt } from '@/lib/buildPrompt'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

// GET — check & send renewal reminders
// Called manually or via cron
export async function GET(req: NextRequest) {
  const supabase = db()
  const results: any[] = []

  // Get reminder days from settings (default 7)
  const { data: settings } = await supabase
    .from('gym_settings').select('business_hours').limit(1).maybeSingle()
  const bh = (settings?.business_hours as any) || {}
  const reminderDays = bh.reminder_expiry || 7

  // Find members expiring within reminderDays
  const today    = new Date()
  const deadline = new Date()
  deadline.setDate(today.getDate() + reminderDays)

  const { data: members } = await supabase
    .from('members')
    .select('id, name, phone, plan_name, plan_end, plan_amount')
    .eq('status', 'active')
    .lte('plan_end', deadline.toISOString().split('T')[0])
    .gte('plan_end', today.toISOString().split('T')[0])

  if (!members || members.length === 0) {
    return NextResponse.json({ message: 'No renewals due', sent: 0 })
  }

  // Get gym settings for message
  const { data: gs } = await supabase
    .from('gym_settings').select('gym_name, phone').limit(1).maybeSingle()

  for (const member of members) {
    const daysLeft = Math.ceil((new Date(member.plan_end).getTime() - today.getTime()) / 86400000)
    const msg = `Namaste ${member.name} ji! 🙏\n\nAapki *${member.plan_name} membership* ${member.plan_end} ko expire ho rahi hai (${daysLeft} din baaki).\n\nAbhi renew karein!\n💳 UPI: ${gs?.phone || 'gym@upi'}\n💰 Amount: ₹${member.plan_amount?.toLocaleString('en-IN')}\n\nDhanyawad! 🙏`

    try {
      await sendWhatsAppReply(member.phone, msg)
      results.push({ name: member.name, phone: member.phone, daysLeft, status: 'sent' })

      // Save to conversation
      const { data: conv } = await supabase
        .from('conversations').select('id').eq('phone', member.phone).maybeSingle()
      if (conv) {
        await supabase.from('messages').insert({
          conversation_id: conv.id, role: 'assistant', content: msg, channel: 'whatsapp'
        })
        await supabase.from('conversations').update({
          last_message: msg, last_message_at: new Date().toISOString()
        }).eq('id', conv.id)
      }

      await new Promise(r => setTimeout(r, 200))
    } catch {
      results.push({ name: member.name, phone: member.phone, daysLeft, status: 'failed' })
    }
  }

  return NextResponse.json({ sent: results.filter(r => r.status === 'sent').length, total: members.length, results })
}
