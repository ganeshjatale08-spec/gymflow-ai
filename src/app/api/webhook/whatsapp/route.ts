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

// ── GET — Verification ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const p         = req.nextUrl.searchParams
  const mode      = p.get('hub.mode')
  const token     = p.get('hub.verify_token')
  const challenge = p.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST — Receive & Reply ────────────────────────────────────
export async function POST(req: NextRequest) {
  const log: string[] = []

  try {
    const body = await req.json()

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 })
    }

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'no_text_message' }, { status: 200 })
    }

    const from    = message.from
    const text    = message.text?.body
    const name    = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || from

    log.push(`📩 From: ${from}, Text: ${text}`)

    const supabase = getSupabase()

    // 1. Get or create conversation
    const { data: existing, error: findErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone', from)
      .maybeSingle()

    if (findErr) log.push(`Find conv error: ${findErr.message}`)

    let conv = existing

    if (!conv) {
      log.push('Creating new conversation...')
      const { data: newConv, error: createErr } = await supabase
        .from('conversations')
        .insert({ phone: from, display_name: name, ai_enabled: true, status: 'open', unread_count: 0 })
        .select()
        .single()

      if (createErr) {
        log.push(`Create conv error: ${createErr.message}`)
        console.error('WEBHOOK ERROR:', log.join(' | '))
        return NextResponse.json({ status: 'ok' }, { status: 200 })
      }
      conv = newConv

      // ── Auto-create lead for new WhatsApp contact ──────
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', from)
        .maybeSingle()

      if (!existingLead) {
        const { error: leadErr } = await supabase.from('leads').insert({
          name:         name,
          phone:        from,
          status:       'new',
          score:        10,
          source:       'whatsapp',
          last_message: text,
        })
        if (leadErr) log.push(`Lead create error: ${leadErr.message}`)
        else log.push(`New lead created: ${name}`)
      }
    } else {
      // Update last_message on existing lead
      await supabase
        .from('leads')
        .update({ last_message: text, updated_at: new Date().toISOString() })
        .eq('phone', from)
    }

    log.push(`Conv ID: ${conv.id}, AI enabled: ${conv.ai_enabled}`)

    // 2. Save user message
    const { error: msgErr } = await supabase.from('messages').insert({
      conversation_id: conv.id,
      role:    'user',
      content: text,
      channel: 'whatsapp',
    })
    if (msgErr) log.push(`Save msg error: ${msgErr.message}`)

    // Update conversation
    await supabase.from('conversations').update({
      last_message:    text,
      last_message_at: new Date().toISOString(),
      unread_count:    (conv.unread_count || 0) + 1,
    }).eq('id', conv.id)

    // 3. Skip if AI disabled
    if (!conv.ai_enabled) {
      log.push('AI disabled — skipping reply')
      console.log('WEBHOOK:', log.join(' | '))
      return NextResponse.json({ status: 'ai_disabled' }, { status: 200 })
    }

    // 4. Get chat history
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const historyForAI = ((history || []).reverse() as { role: 'user' | 'assistant'; content: string }[])
      .filter(m => m.role === 'user' || m.role === 'assistant')

    // 5. Get AI persona
    const { data: settings } = await supabase
      .from('gym_settings')
      .select('ai_persona, gym_name')
      .limit(1)
      .maybeSingle()

    const systemPrompt = settings?.ai_persona ||
      'You are a helpful gym assistant. Help with membership info, pricing, and schedules. Reply in Hindi or English based on user language. Keep responses short and friendly.'

    // 6. Generate AI reply
    log.push('Generating AI reply...')
    const aiReply = await generateAIResponse(systemPrompt, historyForAI, text)
    log.push(`AI reply: ${aiReply.slice(0, 50)}`)

    // 7. Save AI reply
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      role:    'assistant',
      content: aiReply,
      channel: 'whatsapp',
    })

    await supabase.from('conversations').update({
      last_message:    aiReply,
      last_message_at: new Date().toISOString(),
    }).eq('id', conv.id)

    // 8. Send WhatsApp reply
    log.push('Sending WhatsApp reply...')
    const waResult = await sendWhatsAppReply(from, aiReply)
    log.push(`WA send result: ${JSON.stringify(waResult).slice(0, 100)}`)

    console.log('WEBHOOK SUCCESS:', log.join(' | '))
    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (err: any) {
    log.push(`FATAL ERROR: ${err.message}`)
    console.error('WEBHOOK FATAL:', log.join(' | '))
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  }
}
