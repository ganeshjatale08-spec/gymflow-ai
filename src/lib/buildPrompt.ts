import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function buildSystemPrompt(): Promise<string> {
  const supabase = db()
  const { data: s } = await supabase
    .from('gym_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (!s) return 'You are a helpful gym assistant. Reply in Hindi or English. Keep responses 2-4 lines.'

  const sections: string[] = []

  // 1. Base persona
  if (s.ai_persona) sections.push(s.ai_persona)

  // 2. Gym profile
  const gymLine = [s.gym_name, s.city].filter(Boolean).join(', ')
  if (gymLine) sections.push(`Gym: ${gymLine}${s.phone ? ` | Contact: ${s.phone}` : ''}`)

  // 3. Business hours
  const hours = s.business_hours as any
  if (hours && typeof hours === 'object') {
    const dayMap: Record<string, string> = { mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun' }
    const hourLines = Object.entries(hours)
      .filter(([k]) => k !== 'employees' && k !== 'plans')
      .map(([k, v]) => `${dayMap[k] || k}: ${v}`)
      .join(', ')
    if (hourLines) sections.push(`Timings: ${hourLines}`)
  }

  // 4. Membership plans
  const plans = (s.plans_data as any[]) || []
  if (plans.length > 0) {
    const planLines = plans.map((p: any) =>
      `${p.name}: ₹${Number(p.price).toLocaleString('en-IN')}/${p.duration === 'monthly' ? 'mo' : p.duration === 'quarterly' ? '3mo' : 'yr'}${p.features?.length ? ' (' + p.features.slice(0,3).join(', ') + ')' : ''}`
    ).join(' | ')
    sections.push(`Plans: ${planLines}`)
  }

  return sections.join('\n')
}
