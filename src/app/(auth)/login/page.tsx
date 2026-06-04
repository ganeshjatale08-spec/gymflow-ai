'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fadeUp } from '@/lib/constants'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const router  = useRouter()
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary">GymFlow AI</div>
            <div className="text-xs text-text-muted">Gym Management Platform</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-7 shadow-2xl">
          <h2 className="text-xl font-bold text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus
                placeholder="admin@yourgym.com"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-blue/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 pr-10 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-blue/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue hover:bg-blue-muted text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-5">
          Pehli baar? Supabase Dashboard mein user banayein
        </p>

      </motion.div>
    </div>
  )
}
