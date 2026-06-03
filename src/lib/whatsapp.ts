export async function sendWhatsAppReply(to: string, message: string) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token   = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneId || !token) {
    console.error('WhatsApp credentials missing')
    return
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) console.error('WhatsApp send error:', data)
  return data
}
