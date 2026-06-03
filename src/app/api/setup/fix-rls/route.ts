export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'public' } }
  )

  const queries = [
    `drop policy if exists "authenticated_all" on conversations`,
    `create policy "allow_all" on conversations for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on messages`,
    `create policy "allow_all" on messages for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on leads`,
    `create policy "allow_all" on leads for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on members`,
    `create policy "allow_all" on members for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on payments`,
    `create policy "allow_all" on payments for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on gym_settings`,
    `create policy "allow_all" on gym_settings for all using (true) with check (true)`,
    `drop policy if exists "authenticated_all" on activity_log`,
    `create policy "allow_all" on activity_log for all using (true) with check (true)`,
  ]

  const results: { query: string; ok: boolean; error?: string }[] = []

  for (const query of queries) {
    const { error } = await supabase.rpc('exec_sql', { sql: query }).single()
    if (error) {
      // Try direct query via REST
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ sql: query }),
        }
      )
      results.push({ query: query.slice(0, 50), ok: res.ok, error: res.ok ? undefined : await res.text() })
    } else {
      results.push({ query: query.slice(0, 50), ok: true })
    }
  }

  return NextResponse.json({ results })
}
