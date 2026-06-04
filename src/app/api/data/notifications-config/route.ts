export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

// Store notification config in business_hours.notif_config
async function readBH() {
  const { data } = await db().from('gym_settings').select('id, business_hours').limit(1).maybeSingle()
  const bh = (data?.business_hours as any) || {}
  return { id: data?.id, bh }
}

export async function GET() {
  const { bh } = await readBH()
  return NextResponse.json(bh.notif_config || {})
}

export async function POST(req: NextRequest) {
  const config = await req.json()
  const { id, bh } = await readBH()
  if (id) {
    await db().from('gym_settings').update({ business_hours: { ...bh, notif_config: config } }).eq('id', id)
  }
  return NextResponse.json({ success: true })
}
