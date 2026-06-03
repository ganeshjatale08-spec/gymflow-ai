'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatusDotProps {
  status: 'active' | 'paused' | 'offline' | 'error'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const statusConfig = {
  active: {
    color: 'bg-green',
    glow: '0 0 8px rgba(34,197,94,0.8)',
    label: 'Active',
  },
  paused: {
    color: 'bg-orange',
    glow: 'none',
    label: 'Paused',
  },
  offline: {
    color: 'bg-text-muted',
    glow: 'none',
    label: 'Offline',
  },
  error: {
    color: 'bg-red',
    glow: '0 0 8px rgba(239,68,68,0.8)',
    label: 'Error',
  },
}

const sizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export function StatusDot({ status, size = 'md', label, className }: StatusDotProps) {
  const config = statusConfig[status]
  const animate = status === 'active' || status === 'error'

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <motion.div
        className={cn('rounded-full flex-shrink-0', config.color, sizeMap[size])}
        style={{ boxShadow: config.glow }}
        animate={animate ? {
          opacity: [1, 0.3, 1],
          scale: [1, 0.8, 1],
        } : {}}
        transition={animate ? {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      />
      {label && (
        <span className="text-xs text-text-secondary">{label || config.label}</span>
      )}
    </div>
  )
}
