export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppReply } from '@/lib/whatsapp'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function POST(req: NextRequest) {
  const { conversationId, message } = await req.json()

  if (!conversationId || !message) {
    return NextResponse.json({ error: 'conversationId and message required' }, { status: 400 })
  }

  // Get phone number from conversation
  const { data: conv, error } = await db()
    .from('conversations')
    .select('phone, display_name')
    .eq('id', conversationId)
    .single()

  if (error || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Save message to DB
  await db().from('messages').insert({
    conversation_id: conversationId,
    role:    'assistant',
    content: message,
    channel: 'whatsapp',
  })

  // Update conversation last message
  await db().from('conversations').update({
    last_message:    message,
    last_message_at: new Date().toISOString(),
  }).eq('id', conversationId)

  // Send via WhatsApp
  try {
    const result = await sendWhatsAppReply(conv.phone, message)
    return NextResponse.json({ success: true, whatsapp: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
