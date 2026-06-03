export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIResponse } from '@/lib/openai'
import { sendWhatsAppReply } from '@/lib/whatsapp'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function POST(req: NextRequest) {
  const { conversationId, message, sendToWhatsApp = false } = await req.json()

  if (!conversationId || !message) {
    return NextResponse.json({ error: 'conversationId and message required' }, { status: 400 })
  }

  const supabase = db()

  // Get conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  // Get message history
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  const historyForAI = ((history || []).reverse() as { role: 'user' | 'assistant'; content: string }[])
    .filter(m => m.role === 'user' || m.role === 'assistant')

  // Get AI persona from gym settings
  const { data: settings } = await supabase
    .from('gym_settings')
    .select('ai_persona')
    .limit(1)
    .maybeSingle()

  const systemPrompt = settings?.ai_persona ||
    'You are a helpful gym assistant. Reply in Hindi or English based on user language. Keep responses short and friendly.'

  // Generate AI reply
  const aiReply = await generateAIResponse(systemPrompt, historyForAI, message)

  // Save AI reply to DB
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role:    'assistant',
    content: aiReply,
    channel: 'whatsapp',
  })

  // Update conversation
  await supabase.from('conversations').update({
    last_message:    aiReply,
    last_message_at: new Date().toISOString(),
  }).eq('id', conversationId)

  // Send to WhatsApp
  if (sendToWhatsApp) {
    try {
      await sendWhatsAppReply(conv.phone, aiReply)
    } catch (err) {
      console.error('WhatsApp send error:', err)
    }
  }

  return NextResponse.json({ reply: aiReply })
}
