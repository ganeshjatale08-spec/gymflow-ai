'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { toast.error('Email aur password required'); return }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      if (error.message.includes('Invalid login')) toast.error('Email ya password galat hai')
      else if (error.message.includes('Email not confirmed')) toast.error('Pehle email verify karein')
      else toast.error(error.message)
      return
    }

    toast.success('Login successful!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#08080a' }}>

      {/* Subtle grid background */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Blue glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[360px] relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              boxShadow: '0 0 0 1px rgba(59,130,246,0.3), 0 8px 32px rgba(59,130,246,0.25)',
            }}>
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">GymFlow AI</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Gym Management Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: '#0f0f12',
            border: '1px solid #242429',
            boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>

          {/* Top highlight line */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 50%, transparent 100%)' }} />

          <h2 className="text-[17px] font-bold text-text-primary tracking-tight mb-0.5">Welcome back</h2>
          <p className="text-[13px] text-text-muted mb-5">Sign in to your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  placeholder="admin@yourgym.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] text-text-primary font-medium transition-all"
                  style={{
                    background: '#16161a',
                    border: '1px solid #27272a',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = '#27272a'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-[13px] text-text-primary font-medium transition-all"
                  style={{
                    background: '#16161a',
                    border: '1px solid #27272a',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = '#27272a'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-[13px] font-bold text-white transition-all mt-2"
              style={{
                background: loading ? '#1d4ed8' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-text-muted mt-5">
          Pehli baar? Supabase Dashboard mein user banayein
        </p>

      </motion.div>
    </div>
  )
}
