export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Check env vars
  results.env = {
    supabase_url:    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'),
    supabase_anon:   !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder'),
    supabase_service:!!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder'),
    openai:          !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder'),
    wa_phone_id:     !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    wa_token:        !!process.env.WHATSAPP_ACCESS_TOKEN,
    wa_verify:       !!process.env.WHATSAPP_VERIFY_TOKEN,
  }

  // 2. Test Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase.from('conversations').select('count').limit(1)
    results.supabase = error ? { connected: false, error: error.message } : { connected: true }
  } catch (e: any) {
    results.supabase = { connected: false, error: e.message }
  }

  // 3. Test OpenAI
  try {
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      })
      results.openai = { connected: res.ok, status: res.status }
    } else {
      results.openai = { connected: false, error: 'API key missing or placeholder' }
    }
  } catch (e: any) {
    results.openai = { connected: false, error: e.message }
  }

  // 4. Check recent conversations in DB
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: convs } = await supabase
      .from('conversations')
      .select('phone, display_name, last_message, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    results.recent_conversations = convs || []
  } catch (e: any) {
    results.recent_conversations = { error: e.message }
  }

  return NextResponse.json(results, { status: 200 })
}
