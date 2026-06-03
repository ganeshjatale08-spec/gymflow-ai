export async function sendWhatsAppMessage(to: string, body: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio not configured')
    return
  }
  const twilio = (await import('twilio')).default
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
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
  if (!process.env.TWILIO_AUTH_TOKEN) return false
  const twilio = require('twilio')
  return twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, params)
}
