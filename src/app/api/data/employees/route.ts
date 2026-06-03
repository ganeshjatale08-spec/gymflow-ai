export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Store employees in gym_settings.employees_data (JSONB)
// This bypasses the PostgREST cache issue with the employees table

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

type Employee = { id: string; [key: string]: any }

async function getAll(): Promise<Employee[]> {
  const { data } = await db()
    .from('gym_settings')
    .select('employees_data')
    .limit(1)
    .maybeSingle()
  return (data?.employees_data as Employee[]) || []
}

async function saveAll(employees: Employee[]) {
  const supabase = db()
  const { data: existing } = await supabase
    .from('gym_settings').select('id').limit(1).maybeSingle()

  if (existing?.id) {
    await supabase.from('gym_settings')
      .update({ employees_data: employees })
      .eq('id', existing.id)
  } else {
    await supabase.from('gym_settings')
      .insert({ employees_data: employees })
  }
}

export async function GET() {
  const employees = await getAll()
  return NextResponse.json(employees)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const employees = await getAll()
  const newEmp = { ...body, id: Date.now().toString(), created_at: new Date().toISOString() }
  await saveAll([...employees, newEmp])
  return NextResponse.json(newEmp)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  const employees = await getAll()
  const updated   = employees.map((e: Employee) => e.id === id ? { ...e, ...updates } : e)
  await saveAll(updated)
  return NextResponse.json(updated.find((e: Employee) => e.id === id))
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const employees = await getAll()
  await saveAll(employees.filter((e: Employee) => e.id !== id))
  return NextResponse.json({ success: true })
}
