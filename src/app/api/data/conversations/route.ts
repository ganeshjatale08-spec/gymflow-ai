export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY   || 'placeholder'
  )
}

export async function GET() {
  const { data, error } = await db()
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// PATCH — update conversation fields (e.g. mark as read)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await db()
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
