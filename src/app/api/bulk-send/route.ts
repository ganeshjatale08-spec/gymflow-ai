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
  const phones: { phone: string; name: string }[] = []

  // Get members
  if (audience === 'members' || audience === 'all') {
    const { data: members } = await supabase
      .from('members')
      .select('phone, name')
      .eq('status', 'active')
    if (members) phones.push(...members.map(m => ({ phone: m.phone, name: m.name })))
  }

  // Get leads (only for 'all')
  if (audience === 'all') {
    const { data: leads } = await supabase
      .from('leads')
      .select('phone, name')
      .neq('status', 'lost')
    if (leads) phones.push(...leads.map(l => ({ phone: l.phone, name: l.name || l.phone })))
  }

  if (phones.length === 0) {
    return NextResponse.json({ error: 'No recipients found', sent: 0 }, { status: 400 })
  }

  // Remove duplicates by phone
  const unique = [...new Map(phones.map(p => [p.phone, p])).values()]

  let sent = 0; let failed = 0

  for (const recipient of unique) {
    try {
      // Personalize message
      const personalized = message
        .replace(/{{name}}/g,     recipient.name || 'Member')
        .replace(/{{gym_name}}/g, process.env.GYM_NAME || 'Gym')

      await sendWhatsAppReply(recipient.phone, personalized)
      sent++

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    } catch {
      failed++
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: unique.length })
}
