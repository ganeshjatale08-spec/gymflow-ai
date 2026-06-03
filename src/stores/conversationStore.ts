import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Conversation, Message } from '@/types'

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  isAITyping: boolean
  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  setAITyping: (typing: boolean) => void
  updateConversationLastMessage: (id: string, message: string, at: string) => void
  toggleAI: (conversationId: string) => void
  markRead: (conversationId: string) => void
  upsertConversation: (conv: Conversation) => void
}

export const useConversationStore = create<ConversationState>()(
  devtools((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: {},
    isAITyping: false,

    setConversations: (conversations) => set({ conversations }),

    setActiveConversation: (id) => set({ activeConversationId: id }),

    addMessage: (conversationId, message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), message],
        },
      })),

    setMessages: (conversationId, messages) =>
      set((state) => ({
        messages: { ...state.messages, [conversationId]: messages },
      })),

    setAITyping: (isAITyping) => set({ isAITyping }),

    updateConversationLastMessage: (id, message, at) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, last_message: message, last_message_at: at } : c
        ),
      })),

    toggleAI: (conversationId) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, ai_enabled: !c.ai_enabled } : c
        ),
      })),

    markRead: (conversationId) =>
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ),
      })),

    upsertConversation: (conv) =>
      set((state) => {
        const exists = state.conversations.find((c) => c.id === conv.id)
        if (exists) {
          return {
            conversations: state.conversations.map((c) =>
              c.id === conv.id ? { ...c, ...conv } : c
            ),
          }
        }
        return { conversations: [conv, ...state.conversations] }
      }),
  }))
)
