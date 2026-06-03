export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token   = process.env.WHATSAPP_ACCESS_TOKEN
  const to      = req.nextUrl.searchParams.get('to') || '919876543210'

  if (!phoneId || !token) {
    return NextResponse.json({ error: 'Missing credentials', phoneId: !!phoneId, token: !!token })
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: 'Test message from GymFlow AI ✅' },
        }),
      }
    )

    const data = await res.json()

    return NextResponse.json({
      http_status: res.status,
      response:    data,
      phone_id:    phoneId,
      to,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
