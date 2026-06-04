export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password, secret } = await req.json()

  // Simple security — only allow with correct secret
  if (secret !== 'GYMFLOW_SETUP_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!sbUrl || !sbKey || sbUrl.includes('placeholder')) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  // Create user via Supabase Admin API
  const res = await fetch(`${sbUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sbKey}`,
      'apikey':        sbKey,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,  // auto-confirm email
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: data.message || data.error || 'Failed to create user' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    user: { id: data.id, email: data.email },
    message: `User created! Ab login karein: ${email}`,
  })
}
