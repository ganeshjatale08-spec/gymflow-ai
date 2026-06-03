export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAIResponse } from '@/lib/openai'
import { sendWhatsAppReply } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') || '917004607394'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: any = { phone, steps: [] }

  // Step 1: Find conversation
  const { data: conv, error: ce } = await supabase
    .from('conversations').select('*').eq('phone', phone).maybeSingle()
  results.conversation = conv ? { id: conv.id, ai_enabled: conv.ai_enabled } : null
  results.conv_error   = ce?.message || null
  if (!conv) return NextResponse.json(results)

  // Step 2: Get messages
  const { data: msgs, error: me } = await supabase
    .from('messages').select('role, content, created_at')
    .eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(10)
  results.messages      = msgs || []
  results.messages_error = me?.message || null

  // Step 3: Test AI
  try {
    const reply = await generateAIResponse(
      'You are a helpful gym assistant. Reply in Hindi or English.',
      [],
      'Hello test'
    )
    results.ai_test = { success: true, reply: reply.slice(0, 100) }
  } catch (e: any) {
    results.ai_test = { success: false, error: e.message }
  }

  // Step 4: Test WhatsApp send
  const { data: waTest } = await supabase.from('conversations').select('phone').eq('phone', phone).single()
  if (waTest) {
    try {
      const waResult = await sendWhatsAppReply(phone, 'Debug test ✅')
      results.wa_send = { success: true, result: JSON.stringify(waResult).slice(0, 100) }
    } catch (e: any) {
      results.wa_send = { success: false, error: e.message }
    }
  }

  return NextResponse.json(results)
}
