export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIResponse } from '@/lib/openai'
import { sendWhatsAppReply } from '@/lib/whatsapp'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY   || 'placeholder'
  )
}

// ── GET — Meta Webhook Verification ──────────────────────────
export async function GET(req: NextRequest) {
  const params    = req.nextUrl.searchParams
  const mode      = params.get('hub.mode')
  const token     = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified ✓')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST — Receive & Reply to WhatsApp Messages ───────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'no_text_message' }, { status: 200 })
    }

    const from    = message.from        // sender phone e.g. "919876543210"
    const text    = message.text?.body  // message content
    const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]
    const name    = contact?.profile?.name || from

    console.log(`📩 WhatsApp from ${name} (${from}): ${text}`)

    const supabase = getSupabase()

    // 1. Get or create conversation
    let { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone', from)
      .single()

    if (!conv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          phone:        from,
          display_name: name,
          ai_enabled:   true,
          status:       'open',
          unread_count: 1,
        })
        .select()
        .single()
      conv = newConv
    }

    if (!conv) {
      console.error('Could not create conversation')
      return NextResponse.json({ status: 'error' }, { status: 200 })
    }

    // 2. Save incoming message
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      role:            'user',
      content:         text,
      channel:         'whatsapp',
    })

    // Update last message
    await supabase.from('conversations').update({
      last_message:    text,
      last_message_at: new Date().toISOString(),
      unread_count:    (conv.unread_count || 0) + 1,
    }).eq('id', conv.id)

    // 3. Check if AI is enabled
    if (!conv.ai_enabled) {
      console.log('AI disabled for this conversation')
      return NextResponse.json({ status: 'ai_disabled' }, { status: 200 })
    }

    // 4. Get conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const historyForAI = ((history || []).reverse() as { role: 'user' | 'assistant'; content: string }[])
      .filter(m => m.role === 'user' || m.role === 'assistant')

    // 5. Get gym AI persona from settings
    const { data: settings } = await supabase
      .from('gym_settings')
      .select('ai_persona, gym_name')
      .single()

    const systemPrompt = settings?.ai_persona ||
      `You are a helpful AI assistant for ${settings?.gym_name || 'our gym'}. Help with membership info, schedules, and pricing. Reply in the same language as the user (Hindi or English). Keep responses short and friendly.`

    // 6. Generate AI reply
    const aiReply = await generateAIResponse(systemPrompt, historyForAI, text)

    // 7. Save AI reply to DB
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      role:            'assistant',
      content:         aiReply,
      channel:         'whatsapp',
    })

    await supabase.from('conversations').update({
      last_message:    aiReply,
      last_message_at: new Date().toISOString(),
    }).eq('id', conv.id)

    // 8. Send reply via WhatsApp
    await sendWhatsAppReply(from, aiReply)

    console.log(`✅ AI replied to ${name}: ${aiReply.slice(0, 60)}...`)

    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ status: 'ok' }, { status: 200 }) // Always 200 to Meta
  }
}
