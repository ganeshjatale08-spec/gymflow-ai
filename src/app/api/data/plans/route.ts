export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Store plans inside business_hours JSONB as { hours:{...}, plans:[...], employees:[...] }
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

async function readBH() {
  const { data } = await db().from('gym_settings').select('id, business_hours').limit(1).maybeSingle()
  const bh = (data?.business_hours as any) || {}
  return { id: data?.id, bh }
}

async function writeBH(id: string | undefined, bh: any) {
  if (id) {
    await db().from('gym_settings').update({ business_hours: bh }).eq('id', id)
  } else {
    await db().from('gym_settings').insert({ business_hours: bh, gym_name: 'My Gym' })
  }
}

export async function GET() {
  const { bh } = await readBH()
  return NextResponse.json(bh.plans || [])
}

export async function POST(req: NextRequest) {
  const plans = await req.json()
  const { id, bh } = await readBH()
  await writeBH(id, { ...bh, plans })
  return NextResponse.json({ success: true })
}
