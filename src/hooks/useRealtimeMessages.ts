'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useConversationStore } from '@/stores/conversationStore'
import type { Message } from '@/types'

export function useRealtimeMessages(conversationId: string | null) {
  const { addMessage, updateConversationLastMessage } = useConversationStore()
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          addMessage(conversationId, msg)
          updateConversationLastMessage(conversationId, msg.content, msg.created_at)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])
}
