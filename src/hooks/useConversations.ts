'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useConversationStore } from '@/stores/conversationStore'
import type { Conversation } from '@/types'

export function useConversations() {
  const { setConversations, upsertConversation } = useConversationStore()
  const supabase = createClient()

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data || []) as Conversation[]
    },
  })

  useEffect(() => {
    if (query.data) setConversations(query.data)
  }, [query.data])

  useEffect(() => {
    const channel = supabase
      .channel('conversations:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertConversation(payload.new as Conversation)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return query
}
