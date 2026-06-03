export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

const SB_URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SB_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function sbFetch(path: string, options?: RequestInit) {
  return fetch(`${SB_URL()}/rest/v1${path}`, {
    ...options,
    headers: {
      'apikey':        SB_KEY(),
      'Authorization': `Bearer ${SB_KEY()}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
      ...((options?.headers) || {}),
    },
  })
}

export async function GET() {
  const res = await sbFetch('/employees?order=created_at.desc')
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json(Array.isArray(data) ? data : [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res  = await sbFetch('/employees', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'Prefer': 'return=representation' },
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json(Array.isArray(data) ? data[0] : data)
}

export async function PUT(req: NextRequest) {
  const body        = await req.json()
  const { id, ...rest } = body
  const res  = await sbFetch(`/employees?id=eq.${id}`, {
    method:  'PATCH',
    body:    JSON.stringify(rest),
    headers: { 'Prefer': 'return=representation' },
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json(Array.isArray(data) ? data[0] : data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const res = await sbFetch(`/employees?id=eq.${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    return NextResponse.json({ error: data }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
