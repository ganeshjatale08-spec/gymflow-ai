'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bot, User, Send, MoreVertical, MessageSquare, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useConversationStore } from '@/stores/conversationStore'
import { useConversations } from '@/hooks/useConversations'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { AITypingIndicator } from '@/components/shared/AITypingIndicator'
import { StatusDot } from '@/components/shared/StatusDot'
import { messageSlideIn, fadeIn } from '@/lib/constants'
import { timeAgo, formatTime, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

export default function ConversationsPage() {
  const supabase = createClient()
  const {
    conversations,
    activeConversationId,
    messages,
    isAITyping,
    setActiveConversation,
    setMessages,
    toggleAI,
    markRead,
  } = useConversationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendAsAI, setSendAsAI] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useConversations()
  useRealtimeMessages(activeConversationId)

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const activeMessages = activeConversationId ? (messages[activeConversationId] || []) : []

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return

    markRead(activeConversationId)

    fetch(`/api/data/messages?conversation_id=${activeConversationId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(activeConversationId, data as Message[])
      })
  }, [activeConversationId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, isAITyping])

  const filteredConversations = conversations.filter((c) => {
    const matchSearch =
      !searchQuery ||
      c.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchFilter =
      filterStatus === 'all' ||
      (filterStatus === 'ai-on' && c.ai_enabled) ||
      (filterStatus === 'ai-off' && !c.ai_enabled) ||
      c.status === filterStatus

    return matchSearch && matchFilter
  })

  async function sendMessage() {
    if (!input.trim() || !activeConversationId || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      if (sendAsAI) {
        await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConversationId,
            message: content,
            sendToWhatsApp: true,
          }),
        })
      } else {
        await supabase.from('messages').insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content,
          channel: 'whatsapp',
        })
      }
    } finally {
      setSending(false)
    }
  }

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'ai-on', label: 'AI On' },
    { key: 'ai-off', label: 'AI Off' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <div className="flex h-full gap-0 -m-4 lg:-m-6 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Conversation list */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r border-border flex-col bg-surface`}>
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none flex-1"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={cn(
                'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0',
                filterStatus === key
                  ? 'border-blue text-blue-soft'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-sm">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    'flex items-start gap-3 px-3 py-3 cursor-pointer border-b border-border/50 hover:bg-surface2 transition-colors',
                    conv.id === activeConversationId && 'bg-surface2 border-l-2 border-l-blue'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-blue-soft font-semibold">
                    {getInitials(conv.display_name || conv.phone)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {conv.display_name || conv.phone}
                      </span>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {conv.last_message_at ? timeAgo(conv.last_message_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-muted truncate flex-1">
                        {conv.last_message || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <StatusDot status={conv.ai_enabled ? 'active' : 'offline'} size="sm" />
                        {conv.unread_count > 0 && (
                          <span className="bg-blue text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat window */}
      <div className={`${activeConversationId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-surface flex-shrink-0">
              {/* Back button — mobile only */}
              <button onClick={() => setActiveConversation(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4 text-text-muted" />
              </button>
              <div className="w-8 h-8 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-xs text-blue-soft font-semibold">
                {getInitials(activeConversation.display_name || activeConversation.phone)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {activeConversation.display_name || activeConversation.phone}
                </div>
                <div className="text-xs text-text-muted">{activeConversation.phone}</div>
              </div>

              {/* AI toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">AI</span>
                <button
                  onClick={() => toggleAI(activeConversation.id)}
                  className={cn(
                    'w-10 h-5 rounded-full relative transition-colors',
                    activeConversation.ai_enabled ? 'bg-blue' : 'bg-surface3'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      activeConversation.ai_enabled ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface2 transition-colors">
                <MoreVertical className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <AnimatePresence initial={false}>
                {activeMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageSlideIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={cn(
                      'flex items-end gap-2 mb-3',
                      msg.role === 'user' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-surface2 border border-border flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-text-muted" />
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 mt-1',
                        msg.role === 'user' ? 'justify-start' : 'justify-end'
                      )}>
                        {msg.role !== 'user' && (
                          <span className="text-xs text-blue-soft/60 font-medium">AI</span>
                        )}
                        <span className="text-xs text-text-muted">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                    {msg.role !== 'user' && (
                      <div className="w-6 h-6 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-blue-soft" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isAITyping && <AITypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 bg-surface flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendAsAI}
                    onChange={(e) => setSendAsAI(e.target.checked)}
                    className="w-3 h-3 accent-blue"
                  />
                  <span className="text-xs text-text-muted">Generate with AI</span>
                </label>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type a message... (Enter to send)"
                  rows={2}
                  className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 resize-none transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 bg-blue hover:bg-blue-muted text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-surface2 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-text-secondary font-medium mb-1">Select a conversation</h3>
              <p className="text-text-muted text-sm">Choose from the left to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

