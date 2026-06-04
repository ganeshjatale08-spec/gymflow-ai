export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Store plans in gym_settings as plans_data JSON
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

async function getSettings() {
  const { data } = await db().from('gym_settings').select('id, plans_data, business_hours').limit(1).maybeSingle()
  return data
}

export async function GET() {
  const s = await getSettings()
  // Try plans_data first, fallback to business_hours.plans
  const plans = s?.plans_data || (s?.business_hours as any)?.plans || []
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const plans = await req.json()
  const s = await getSettings()
  if (s?.id) {
    await db().from('gym_settings').update({ plans_data: plans }).eq('id', s.id)
  } else {
    await db().from('gym_settings').insert({ plans_data: plans, gym_name: 'My Gym' })
  }
  return NextResponse.json({ success: true })
}
