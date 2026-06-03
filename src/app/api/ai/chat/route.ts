export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/openai'
import { sendWhatsAppMessage } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, message, sendToWhatsApp = false } = await req.json()

  if (!conversationId || !message) {
    return NextResponse.json({ error: 'conversationId and message required' }, { status: 400 })
  }

  const { data: conv } = await supabase
    .from('conversations')
    .select('*, gyms(ai_persona)')
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10)

  const historyForAI = ((history || []).reverse() as { role: 'user' | 'assistant' | 'system'; content: string }[])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const gymData = conv.gyms as { ai_persona?: string } | null
  const systemPrompt = gymData?.ai_persona || 'You are a helpful gym assistant.'
  const aiReply = await generateAIResponse(systemPrompt, historyForAI, message)

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    gym_id: conv.gym_id,
    role: 'assistant',
    content: aiReply,
    channel: 'whatsapp',
  })

  await supabase
    .from('conversations')
    .update({
      last_message: aiReply,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (sendToWhatsApp) {
    try {
      await sendWhatsAppMessage(conv.phone, aiReply)
    } catch (err) {
      console.error('Twilio error:', err)
    }
  }

  return NextResponse.json({ reply: aiReply })
}
