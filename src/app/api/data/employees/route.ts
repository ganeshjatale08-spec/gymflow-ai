export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Store employees in gym_settings.business_hours as { employees: [...], hours: {...} }
// No schema change needed — business_hours is already JSONB

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

type Employee = { id: string; [key: string]: any }

async function readStore() {
  const { data } = await db()
    .from('gym_settings')
    .select('id, business_hours')
    .limit(1)
    .maybeSingle()
  const bh = (data?.business_hours as any) || {}
  return { id: data?.id, hours: bh.hours || {}, employees: (bh.employees as Employee[]) || [] }
}

async function writeEmployees(id: string | undefined, employees: Employee[], hours: any) {
  const supabase = db()
  const payload  = { business_hours: { hours, employees } }
  if (id) {
    const { error } = await supabase.from('gym_settings').update(payload).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('gym_settings').insert({ ...payload, gym_name: 'My Gym' })
    if (error) throw error
  }
}

export async function GET() {
  try {
    const { employees } = await readStore()
    return NextResponse.json(employees)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const store = await readStore()
    const newEmp: Employee = { ...body, id: Date.now().toString(), created_at: new Date().toISOString() }
    await writeEmployees(store.id, [...store.employees, newEmp], store.hours)
    return NextResponse.json(newEmp)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body  = await req.json()
    const { id, ...updates } = body
    const store = await readStore()
    const updated = store.employees.map((e: Employee) => e.id === id ? { ...e, ...updates } : e)
    await writeEmployees(store.id, updated, store.hours)
    return NextResponse.json(updated.find((e: Employee) => e.id === id))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const store  = await readStore()
    await writeEmployees(store.id, store.employees.filter((e: Employee) => e.id !== id), store.hours)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
