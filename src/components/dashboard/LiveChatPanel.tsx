'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Bot, User, CheckCheck, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { cn, timeAgo, formatTime, getInitials } from '@/lib/utils'
import { StatusDot } from '@/components/shared/StatusDot'

type Chat = {
  id: string
  display_name: string | null
  phone: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  ai_enabled: boolean
  status: string
  messages?: { id: string; role: string; content: string; created_at: string }[]
}

export function LiveChatPanel() {
  const [chats, setChats]     = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef        = useRef<HTMLDivElement>(null)

  const active = chats.find(c => c.id === activeId) ?? null

  // Fetch conversations from API
  const fetchChats = useCallback(async () => {
    try {
      const res  = await fetch('/api/data/conversations')
      const data = await res.json()
      if (Array.isArray(data)) {
        setChats(data.slice(0, 5)) // show top 5 recent
      }
    } catch (e) {
      console.error('Failed to fetch chats:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 8000) // refresh every 8s
    return () => clearInterval(interval)
  }, [fetchChats])

  // Load messages when opening a chat
  async function openChat(id: string) {
    // Mark as read locally
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c))
    setActiveId(id)

    // Fetch messages
    try {
      const res  = await fetch(`/api/data/messages?conversation_id=${id}`)
      const msgs = await res.json()
      if (Array.isArray(msgs)) {
        setChats(prev => prev.map(c => c.id === id ? { ...c, messages: msgs } : c))
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages?.length])

  async function sendMessage() {
    if (!input.trim() || !activeId || !active) return
    const text = input.trim()
    setInput('')

    // Add optimistic message
    const tempMsg = { id: 'temp_' + Date.now(), role: 'assistant', content: text, created_at: new Date().toISOString() }
    setChats(prev => prev.map(c => c.id === activeId ? {
      ...c, last_message: text, last_message_at: new Date().toISOString(),
      messages: [...(c.messages || []), tempMsg]
    } : c))

    // Send via AI chat API
    try {
      await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ conversationId: activeId, message: text, sendToWhatsApp: true }),
      })
      // Refresh messages
      const res  = await fetch(`/api/data/messages?conversation_id=${activeId}`)
      const msgs = await res.json()
      if (Array.isArray(msgs)) {
        setChats(prev => prev.map(c => c.id === activeId ? { ...c, messages: msgs } : c))
      }
    } catch (e) {
      console.error('Send error:', e)
    }
  }

  const totalUnread = chats.reduce((s, c) => s + (c.unread_count || 0), 0)

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/[0.07] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] flex-shrink-0">
        {active ? (
          <div className="flex items-center gap-2 w-full min-w-0">
            <button onClick={() => setActiveId(null)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 text-white/40" />
            </button>
            <div className="w-7 h-7 bg-green/10 border border-green/20 rounded-full flex items-center justify-center text-[10px] font-bold text-green flex-shrink-0">
              {getInitials(active.display_name || active.phone)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/80 truncate">{active.display_name || active.phone}</div>
              <div className="text-[10px] text-white/30 truncate">{active.phone}</div>
            </div>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0',
              active.ai_enabled ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-white/25 bg-white/[0.04] border-white/[0.07]')}>
              {active.ai_enabled ? 'AI' : 'Manual'}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <StatusDot status="active" size="sm" />
              <span className="text-xs font-semibold text-white/75">Recent Chats</span>
              {totalUnread > 0 && (
                <span className="bg-green text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchChats} className="text-white/25 hover:text-white/60 transition-colors">
                <RefreshCw className="w-3 h-3" />
              </button>
              <Link href="/conversations" className="text-[10px] text-white/25 hover:text-white/55 flex items-center gap-1 transition-colors">
                All <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xs text-white/30">Loading chats...</div>
          </div>
        )}

        {/* Chat list */}
        {!loading && !active && (
          <motion.div key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden">

            {chats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/25 px-4 text-center">
                <div className="text-2xl">💬</div>
                <p className="text-xs">No WhatsApp chats yet</p>
                <p className="text-[10px] text-white/15">Messages will appear here</p>
              </div>
            ) : (
              <>
                {chats.map((chat, i) => (
                  <motion.div key={chat.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => openChat(chat.id)}
                    className={cn('flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors',
                      (chat.unread_count || 0) > 0 && 'bg-green/[0.03]')}>

                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 bg-green/10 border border-green/[0.18] rounded-full flex items-center justify-center text-[11px] font-bold text-green">
                        {getInitials(chat.display_name || chat.phone)}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a]',
                        chat.ai_enabled ? 'bg-emerald-400' : 'bg-white/20')} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn('text-xs truncate', (chat.unread_count || 0) > 0 ? 'font-semibold text-white/90' : 'font-medium text-white/55')}>
                          {chat.display_name || chat.phone}
                        </span>
                        <span className="text-[10px] text-white/20 flex-shrink-0 ml-1">
                          {chat.last_message_at ? timeAgo(chat.last_message_at) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn('text-[11px] truncate flex-1 leading-snug', (chat.unread_count || 0) > 0 ? 'text-white/55' : 'text-white/25')}>
                          {chat.last_message || 'No messages yet'}
                        </p>
                        {(chat.unread_count || 0) > 0 && (
                          <span className="w-4 h-4 bg-green rounded-full flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="mt-auto p-3 border-t border-white/[0.04]">
                  <Link href="/conversations"
                    className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-white/30 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl transition-all">
                    View all conversations <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Chat window */}
        {!loading && active && (
          <motion.div key="chat"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0">

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {!active.messages ? (
                <div className="flex items-center justify-center h-full text-white/25 text-xs">Loading...</div>
              ) : active.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/25 text-xs">No messages yet</div>
              ) : (
                active.messages.map(msg => (
                  <div key={msg.id} className={cn('flex items-end gap-1.5', msg.role === 'user' ? 'justify-start' : 'justify-end')}>
                    {msg.role === 'user' && (
                      <div className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <User className="w-2.5 h-2.5 text-white/30" />
                      </div>
                    )}
                    <div className={cn('max-w-[82%] px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-white/[0.06] border border-white/[0.08] text-white/65 rounded-2xl rounded-bl-sm'
                        : 'bg-green/[0.1] border border-green/[0.18] text-white/75 rounded-2xl rounded-br-sm')}>
                      {msg.content}
                      <div className={cn('flex items-center gap-1 mt-1', msg.role === 'user' ? 'justify-start' : 'justify-end')}>
                        <span className="text-[9px] text-white/20">{formatTime(msg.created_at)}</span>
                        {msg.role !== 'user' && <CheckCheck className="w-2.5 h-2.5 text-green/40" />}
                      </div>
                    </div>
                    {msg.role !== 'user' && (
                      <div className="w-5 h-5 rounded-full bg-green/10 border border-green/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 text-green" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-3 pt-2 border-t border-white/[0.05] flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Reply..." rows={2}
                  className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] text-white/65 placeholder-white/15 outline-none focus:border-green/25 resize-none transition-colors" />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="w-8 h-8 bg-green/70 hover:bg-green text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-25 flex-shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
