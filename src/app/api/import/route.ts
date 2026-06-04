export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )
}

export async function POST(req: NextRequest) {
  const { type, rows } = await req.json()
  // type = 'members' | 'leads'
  // rows = array of objects

  if (!type || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'type and rows required' }, { status: 400 })
  }

  const supabase = db()
  let inserted = 0; let failed = 0; const errors: string[] = []

  for (const row of rows) {
    try {
      if (type === 'members') {
        const { error } = await supabase.from('members').insert({
          name:             row.name || row.Name || row['Member Name'] || '',
          phone:            row.phone || row.Phone || row['Phone Number'] || row.Mobile || '',
          email:            row.email || row.Email || null,
          status:           (row.status || row.Status || 'active').toLowerCase(),
          plan_name:        row.plan || row.Plan || row['Plan Name'] || row['Membership Plan'] || null,
          plan_amount:      Number(row.amount || row.Amount || row['Plan Amount'] || row.Fees || 0) || 0,
          plan_end:         row.plan_end || row['Plan End'] || row['Expiry Date'] || row['Valid Till'] || null,
          joining_date:     row.joining_date || row['Joining Date'] || row['Join Date'] || null,
          trainer:          row.trainer || row.Trainer || null,
          attendance_count: Number(row.attendance || row.Attendance || 0) || 0,
        })
        if (error) { failed++; errors.push(`${row.name}: ${error.message}`) }
        else inserted++
      } else if (type === 'leads') {
        const { error } = await supabase.from('leads').insert({
          name:   row.name || row.Name || row['Lead Name'] || '',
          phone:  row.phone || row.Phone || row['Phone Number'] || row.Mobile || '',
          email:  row.email || row.Email || null,
          status: (row.status || row.Status || 'new').toLowerCase(),
          source: row.source || row.Source || 'whatsapp',
          score:  Number(row.score || row.Score || 0) || 0,
          interest: row.interest || row.Interest || row['Fitness Goal'] || null,
          plan_interest: row.plan || row.Plan || row['Interested Plan'] || null,
        })
        if (error) { failed++; errors.push(`${row.name}: ${error.message}`) }
        else inserted++
      }
    } catch (e: any) {
      failed++; errors.push(e.message)
    }
  }

  return NextResponse.json({ inserted, failed, errors: errors.slice(0, 5) })
}
