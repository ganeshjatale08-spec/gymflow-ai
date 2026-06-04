import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function buildSystemPrompt(): Promise<string> {
  try {
    const supabase = db()
    const { data: s } = await supabase
      .from('gym_settings')
      .select('ai_persona, gym_name, city, phone, business_hours')
      .limit(1)
      .maybeSingle()

    if (!s) return 'You are a helpful gym assistant. Reply in Hindi or English. Keep responses 2-4 lines.'

    const sections: string[] = []
    const bh = (s.business_hours as any) || {}

    // 1. Base persona
    if (s.ai_persona) sections.push(s.ai_persona)

    // 2. Gym profile
    const gymLine = [s.gym_name, s.city].filter(Boolean).join(', ')
    if (gymLine) sections.push(`Gym: ${gymLine}${s.phone ? ` | Contact: ${s.phone}` : ''}`)

    // 3. Business hours
    const dayKeys = ['mon','tue','wed','thu','fri','sat','sun']
    const dayMap: Record<string,string> = { mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun' }
    if (bh && typeof bh === 'object') {
      const hourLines = Object.entries(bh)
        .filter(([k]) => dayKeys.includes(k))
        .map(([k, v]) => `${dayMap[k]}: ${v}`)
        .join(', ')
      if (hourLines) sections.push(`Timings: ${hourLines}`)
    }

    // 4. Plans from business_hours.plans
    const plans = (bh.plans as any[]) || []
    if (plans.length > 0) {
      const planLines = plans.map((p: any) =>
        `${p.name}: ₹${Number(p.price).toLocaleString('en-IN')}/${p.duration === 'monthly' ? 'mo' : p.duration === 'quarterly' ? '3mo' : 'yr'}${p.features?.length ? ' (' + p.features.slice(0,3).join(', ') + ')' : ''}`
      ).join(' | ')
      sections.push(`Plans: ${planLines}`)
    }

    // 5. Facilities
    const facilities = (bh.facilities as any[]) || []
    const available  = facilities.filter((f: any) => f.available).map((f: any) => f.name)
    if (available.length > 0) sections.push(`Facilities: ${available.join(', ')}`)

    // 6. Classes/Services
    const services = (bh.services as any[]) || []
    if (services.length > 0) {
      const svcLines = services.map((s: any) =>
        `${s.name}${s.timing ? ' ('+s.timing+')' : ''}${s.instructor ? ' - '+s.instructor : ''}`
      ).join(' | ')
      sections.push(`Classes: ${svcLines}`)
    }

    return sections.join('\n')
  } catch (err) {
    console.error('buildSystemPrompt error:', err)
    return 'You are a helpful gym assistant. Reply in Hindi or English. Keep responses 2-4 lines.'
  }
}
