'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useLeadStore } from '@/stores/leadStore'
import type { Lead } from '@/types'

export function useLeads(status?: string) {
  const { setLeads, addLead } = useLeadStore()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['leads', status],
    queryFn: async () => {
      let q = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (status) q = q.eq('status', status)

      const { data, error } = await q
      if (error) throw error
      return (data || []) as Lead[]
    },
  })

  useEffect(() => {
    if (query.data) setLeads(query.data)
  }, [query.data])

  useEffect(() => {
    const channel = supabase
      .channel('leads:realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          addLead(payload.new as Lead)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return query
}
