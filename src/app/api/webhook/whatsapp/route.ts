export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// ── GET — Meta Webhook Verification ──────────────────────────
// Meta sends this request to verify your webhook URL
// URL: https://your-domain.com/api/webhook/whatsapp
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  // Verify the mode and token
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified successfully')
    // Return the challenge to confirm verification
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('WhatsApp webhook verification failed')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ── POST — Receive WhatsApp Messages ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Verify it's from Meta
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const entry    = body.entry?.[0]
    const changes  = entry?.changes?.[0]
    const value    = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'no_messages' }, { status: 200 })
    }

    const message = messages[0]
    const from    = message.from        // sender's phone number
    const text    = message.text?.body  // message text
    const msgId   = message.id

    console.log(`WhatsApp message from ${from}: ${text}`)

    // TODO: Process message — save to DB, trigger AI response
    // This will be connected to Supabase + OpenAI when env vars are set

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
