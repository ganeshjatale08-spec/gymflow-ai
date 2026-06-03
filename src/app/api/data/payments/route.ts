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
    .from('payments').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const normalized = (data || []).map((p: any) => ({ ...p, member: p.member_name || p.member || '' }))
  return NextResponse.json(normalized)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const payload = {
    member_name:  body.member || body.member_name || '',
    amount:       body.amount,
    status:       body.status || 'completed',
    method:       body.method || null,
    utr_ref:      body.utr || body.utr_ref || null,
    cheque_no:    body.cheque_no || null,
    description:  body.description || null,
    due_date:     body.due_date || null,
    paid_at:      body.paid_at || null,
  }
  const { data, error } = await db().from('payments').insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, member: data.member_name })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, member, ...rest } = body
  const { data, error } = await db()
    .from('payments').update({ ...rest, member_name: member || rest.member_name })
    .eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, member: data.member_name })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await db().from('payments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
