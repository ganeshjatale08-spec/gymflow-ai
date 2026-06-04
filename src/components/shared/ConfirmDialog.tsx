'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: 'red' | 'blue' | 'orange'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', confirmColor = 'red', onConfirm, onCancel }: Props) {
  const btnColors = {
    red:    'bg-red hover:bg-red/80 text-white',
    blue:   'bg-blue hover:bg-blue-muted text-white',
    orange: 'bg-orange hover:bg-orange/80 text-white',
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl z-10 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                confirmColor === 'red' ? 'bg-red/10 border border-red/20' : 'bg-orange/10 border border-orange/20')}>
                <AlertTriangle className={cn('w-4 h-4', confirmColor === 'red' ? 'text-red' : 'text-orange')} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-2.5 text-sm text-text-muted border border-border rounded-xl hover:bg-surface2 transition-colors">
                Cancel
              </button>
              <button onClick={() => { onConfirm(); onCancel() }}
                className={cn('flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors', btnColors[confirmColor])}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
