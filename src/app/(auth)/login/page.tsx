'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { fadeUp } from '@/lib/constants'
import brand from '@/lib/brand.config'

const DEV_EMAIL = 'admin@gym.com'
const DEV_PASSWORD = 'admin123'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Dev credentials check (works without Supabase)
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      sessionStorage.setItem('dev_logged_in', '1')
      toast.success('Welcome back!')
      router.push('/dashboard')
      return
    }

    // Try Supabase if real credentials provided
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      toast.error('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center text-lg">
            {brand.logo}
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary">{brand.name}</div>
            <div className="text-xs text-text-muted">{brand.tagline}</div>
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
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@gym.com"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-blue/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-blue/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue hover:bg-blue-muted text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-4 p-3 bg-surface2 border border-border rounded-lg">
            <p className="text-xs text-text-muted text-center">
              Default login: <span className="text-text-secondary font-mono">admin@gym.com</span> / <span className="text-text-secondary font-mono">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          {brand.name} · {brand.city}
        </p>
      </motion.div>
    </div>
  )
}
