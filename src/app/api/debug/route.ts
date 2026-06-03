export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

// Debug endpoint disabled in production
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }
  return NextResponse.json({ message: 'Debug only available in development' })
}
