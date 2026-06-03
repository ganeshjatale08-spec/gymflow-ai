export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function GET() {
  const { data, error } = await db()
    .from('gym_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || {})
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = db()

  // Check if row exists
  const { data: existing } = await supabase
    .from('gym_settings')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    // Update existing
    const { data, error } = await supabase
      .from('gym_settings')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('gym_settings')
      .insert(body)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}
