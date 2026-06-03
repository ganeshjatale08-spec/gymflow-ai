'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  onClick?: () => void
}

export function GlowCard({ children, className, glowColor = 'rgba(59,130,246,0.2)', onClick }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${glowColor}` }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'bg-surface border border-border rounded-xl relative overflow-hidden cursor-pointer',
        'shadow-card transition-colors hover:border-blue/30',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
