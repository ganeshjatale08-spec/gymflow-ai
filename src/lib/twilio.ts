import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendWhatsAppMessage(to: string, body: string) {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: toFormatted,
    body,
  })
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  )
}
