import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIResponse } from '@/lib/openai'
import { sendWhatsAppMessage, validateTwilioSignature } from '@/lib/twilio'
import type { Database } from '@/types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EMPTY_RESPONSE = new NextResponse('<Response></Response>', {
  headers: { 'Content-Type': 'text/xml' },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => {
    params[key] = value.toString()
  })

  // Validate Twilio signature
  const signature = req.headers.get('x-twilio-signature') || ''
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/twilio`

  if (process.env.NODE_ENV === 'production' && !validateTwilioSignature(signature, url, params)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const fromRaw = params.From || ''
  const body = params.Body?.trim()
  const phone = fromRaw.replace('whatsapp:', '')

  if (!body || !phone) return EMPTY_RESPONSE

  // Find gym — in production, match by Twilio number
  const { data: gym } = await supabase
    .from('gyms')
    .select('*')
    .limit(1)
    .single()

  if (!gym) return EMPTY_RESPONSE

  // Find or create conversation
  let { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('phone', phone)
    .eq('gym_id', gym.id)
    .single()

  if (!conv) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        gym_id: gym.id,
        phone,
        display_name: params.ProfileName || phone,
        channel: 'whatsapp',
        ai_enabled: true,
        status: 'open',
        unread_count: 1,
      })
      .select()
      .single()

    conv = newConv

    // Create lead if not exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .eq('gym_id', gym.id)
      .single()

    if (!existingLead) {
      await supabase.from('leads').insert({
        gym_id: gym.id,
        phone,
        name: params.ProfileName || null,
        source: 'whatsapp',
        status: 'new',
        score: 10,
      })
    }
  }

  if (!conv) return EMPTY_RESPONSE

  // Save incoming user message
  await supabase.from('messages').insert({
    conversation_id: conv.id,
    gym_id: gym.id,
    role: 'user',
    content: body,
    channel: 'whatsapp',
  })

  // Update conversation last message
  await supabase
    .from('conversations')
    .update({
      last_message: body,
      last_message_at: new Date().toISOString(),
      unread_count: (conv.unread_count || 0) + 1,
    })
    .eq('id', conv.id)

  // Skip AI if disabled
  if (!conv.ai_enabled) return EMPTY_RESPONSE

  // Get conversation history (last 10 messages)
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const historyForAI = ((history || []).reverse() as { role: 'user' | 'assistant' | 'system'; content: string }[])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  // Generate AI reply
  const systemPrompt = (gym.ai_persona as string) ||
    'You are a friendly gym assistant. Reply briefly in the same language as the user (Hindi or English). Keep answers helpful and concise.'

  let aiReply: string
  try {
    aiReply = await generateAIResponse(systemPrompt, historyForAI, body)
  } catch (err) {
    console.error('OpenAI error:', err)
    aiReply = 'Namaste! Thank you for reaching out. Our team will get back to you shortly.'
  }

  // Save AI reply
  await supabase.from('messages').insert({
    conversation_id: conv.id,
    gym_id: gym.id,
    role: 'assistant',
    content: aiReply,
    channel: 'whatsapp',
  })

  // Update conversation with AI reply
  await supabase
    .from('conversations')
    .update({
      last_message: aiReply,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conv.id)

  // Send WhatsApp reply
  try {
    await sendWhatsAppMessage(phone, aiReply)
  } catch (err) {
    console.error('Twilio send error:', err)
  }

  return EMPTY_RESPONSE
}
