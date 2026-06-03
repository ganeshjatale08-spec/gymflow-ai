'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useConversationStore } from '@/stores/conversationStore'
import type { Conversation } from '@/types'

export function useConversations() {
  const { setConversations } = useConversationStore()

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/data/conversations')
      if (!res.ok) throw new Error('Failed to fetch conversations')
      return (await res.json()) as Conversation[]
    },
    refetchInterval: 5000, // refresh every 5 seconds
  })

  useEffect(() => {
    if (query.data) setConversations(query.data)
  }, [query.data])

  return query
}
