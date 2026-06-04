export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppReply } from '@/lib/whatsapp'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function GET() {
  const supabase = db()
  const results: any[] = []

  // Get reminder days from settings (default 2)
  const { data: settings } = await supabase
    .from('gym_settings').select('business_hours, gym_name, phone').limit(1).maybeSingle()
  const bh = (settings?.business_hours as any) || {}
  const paymentDays = bh.reminder_payment || 2
  const gymName    = settings?.gym_name || 'Gym'
  const gymPhone   = settings?.phone || 'gym@upi'

  // Find pending/overdue payments
  const today  = new Date()
  const cutoff = new Date()
  cutoff.setDate(today.getDate() - paymentDays)

  const { data: payments } = await supabase
    .from('payments')
    .select('id, member_name, amount, method, due_date, member_id')
    .eq('status', 'pending')
    .lte('due_date', today.toISOString().split('T')[0])

  if (!payments || payments.length === 0) {
    return NextResponse.json({ message: 'No pending payments', sent: 0 })
  }

  // Get all members for phone lookup
  const { data: allMembers } = await supabase.from('members').select('id, phone, name')

  for (const payment of payments) {
    // Find phone: try member_id first, then name match
    const byId   = (allMembers || []).find((m: any) => m.id === payment.member_id)
    const byName = (allMembers || []).find((m: any) =>
      m.name?.toLowerCase().trim() === payment.member_name?.toLowerCase().trim()
    )
    const member = byId || byName
    const phone  = member?.phone
    if (!phone) { results.push({ name: payment.member_name, status: 'no_phone' }); continue }

    const overdueDays = Math.floor((today.getTime() - new Date(payment.due_date).getTime()) / 86400000)
    const msg = `Namaste ${payment.member_name || member?.name || 'ji'}! 🙏\n\nAapka *₹${Number(payment.amount).toLocaleString('en-IN')}* payment ${overdueDays > 0 ? `${overdueDays} din se` : 'aaj'} pending hai.\n\n📲 UPI: ${gymPhone}\n\nKripya jaldi payment karein taaki membership active rahe.\n\n${gymName} 🙏`

    try {
      await sendWhatsAppReply(phone, msg)

      // Save to conversation
      const { data: conv } = await supabase
        .from('conversations').select('id').eq('phone', phone).maybeSingle()
      if (conv) {
        await supabase.from('messages').insert({
          conversation_id: conv.id, role: 'assistant', content: msg, channel: 'whatsapp'
        })
        await supabase.from('conversations').update({
          last_message: msg, last_message_at: new Date().toISOString()
        }).eq('id', conv.id)
      }

      results.push({ name: payment.member_name, amount: payment.amount, overdueDays, status: 'sent' })
      await new Promise(r => setTimeout(r, 200))
    } catch {
      results.push({ name: payment.member_name, status: 'failed' })
    }
  }

  return NextResponse.json({
    sent:    results.filter(r => r.status === 'sent').length,
    failed:  results.filter(r => r.status === 'failed').length,
    no_phone: results.filter(r => r.status === 'no_phone').length,
    total:   payments.length,
    results,
  })
}
