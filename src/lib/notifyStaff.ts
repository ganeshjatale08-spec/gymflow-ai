import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppReply } from './whatsapp'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function notifyStaff(eventKey: string, message: string) {
  try {
    const supabase = db()

    // Get notification config
    const { data: gs } = await supabase
      .from('gym_settings').select('business_hours').limit(1).maybeSingle()
    const bh         = (gs?.business_hours as any) || {}
    const config     = bh.notif_config || {}
    const empIds: string[] = config[eventKey] || []

    if (empIds.length === 0) return // no one subscribed

    // Get employees from business_hours.employees
    const allEmployees = (bh.employees as any[]) || []
    const targets      = allEmployees.filter((e: any) => empIds.includes(e.id) && e.phone)

    for (const emp of targets) {
      try {
        await sendWhatsAppReply(emp.phone, message)
      } catch (err) {
        console.error(`Staff notify failed for ${emp.name}:`, err)
      }
    }
  } catch (err) {
    console.error('notifyStaff error:', err)
  }
}
