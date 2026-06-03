export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

type Employee = { id: string; [key: string]: any }

async function getAll(): Promise<Employee[]> {
  try {
    const { data, error } = await db()
      .from('gym_settings')
      .select('employees_data')
      .limit(1)
      .maybeSingle()
    if (error) {
      console.error('getAll error:', error.message)
      return []
    }
    return (data?.employees_data as Employee[]) || []
  } catch { return [] }
}

async function saveAll(employees: Employee[]) {
  const supabase = db()
  try {
    const { data: existing, error: fe } = await supabase
      .from('gym_settings').select('id').limit(1).maybeSingle()

    if (fe) { console.error('find error:', fe.message); return }

    if (existing?.id) {
      const { error } = await supabase.from('gym_settings')
        .update({ employees_data: employees })
        .eq('id', existing.id)
      if (error) console.error('update error:', error.message)
    } else {
      const { error } = await supabase.from('gym_settings')
        .insert({ employees_data: employees, gym_name: 'My Gym' })
      if (error) console.error('insert error:', error.message)
    }
  } catch (e) { console.error('saveAll error:', e) }
}

export async function GET() {
  const employees = await getAll()
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const body      = await req.json()
  const employees = await getAll()
  const newEmp    = { ...body, id: Date.now().toString(), created_at: new Date().toISOString() }
  const updated   = [...employees, newEmp]
  await saveAll(updated)

  // Verify it was saved
  const verify = await getAll()
  if (verify.length !== updated.length) {
    return NextResponse.json({ error: 'Save failed — run ALTER TABLE SQL in Supabase' }, { status: 500 })
  }
  return NextResponse.json(newEmp)
}

export async function PUT(req: NextRequest) {
  const body      = await req.json()
  const { id, ...updates } = body
  const employees = await getAll()
  const updated   = employees.map((e: Employee) => e.id === id ? { ...e, ...updates } : e)
  await saveAll(updated)
  return NextResponse.json(updated.find((e: Employee) => e.id === id))
}

export async function DELETE(req: NextRequest) {
  const { id }    = await req.json()
  const employees = await getAll()
  await saveAll(employees.filter((e: Employee) => e.id !== id))
  return NextResponse.json({ success: true })
}
