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

export async function POST(req: NextRequest) {
  const { message, audience } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  const supabase = db()
  const recipients: { phone: string; name: string }[] = []

  // Build recipient list based on audience
  if (audience === 'members' || audience === 'all') {
    const { data } = await supabase.from('members').select('phone, name').eq('status', 'active')
    if (data) recipients.push(...data.map((m: any) => ({ phone: m.phone, name: m.name })))
  }

  if (audience === 'leads' || audience === 'all') {
    const { data } = await supabase.from('leads').select('phone, name').neq('status', 'lost')
    if (data) recipients.push(...data.map((l: any) => ({ phone: l.phone, name: l.name || l.phone })))
  }

  if (audience === 'renewals') {
    const today = new Date()
    const week  = new Date(today.getTime() + 7*86400000)
    const { data } = await supabase.from('members').select('phone, name, plan_end').eq('status', 'active')
    if (data) recipients.push(...data
      .filter((m: any) => new Date(m.plan_end) <= week && new Date(m.plan_end) >= today)
      .map((m: any) => ({ phone: m.phone, name: m.name })))
  }

  if (audience === 'expired') {
    const { data } = await supabase.from('members').select('phone, name').eq('status', 'expired')
    if (data) recipients.push(...data.map((m: any) => ({ phone: m.phone, name: m.name })))
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found', sent: 0 }, { status: 400 })
  }

  // Remove duplicates
  const unique = [...new Map(recipients.map(r => [r.phone, r])).values()]

  let sent = 0; let failed = 0

  for (const recipient of unique) {
    try {
      // Personalize message
      const { data: gymS } = await supabase.from('gym_settings').select('gym_name').limit(1).maybeSingle()
      const personalized = message
        .replace(/{{name}}/g,     recipient.name || 'Member')
        .replace(/{{gym_name}}/g, gymS?.gym_name || 'Gym')

      // 1. Send via WhatsApp
      await sendWhatsAppReply(recipient.phone, personalized)

      // 2. Get or create conversation
      let { data: conv } = await supabase
        .from('conversations')
        .select('id, unread_count')
        .eq('phone', recipient.phone)
        .maybeSingle()

      if (!conv) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            phone:        recipient.phone,
            display_name: recipient.name,
            ai_enabled:   true,
            status:       'open',
            unread_count: 0,
          })
          .select()
          .single()
        conv = newConv
      }

      if (conv) {
        // 3. Save message to DB so it shows in Conversations tab
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          role:            'assistant',
          content:         personalized,
          channel:         'whatsapp',
        })

        // 4. Update conversation last message
        await supabase.from('conversations').update({
          last_message:    personalized,
          last_message_at: new Date().toISOString(),
        }).eq('id', conv.id)
      }

      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: unique.length })
}
