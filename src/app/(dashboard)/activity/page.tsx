'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'

export default function ActivityPage() {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-4xl">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Activity Log</h1>
        <p className="text-text-muted text-sm mt-0.5">Full history of all actions in your gym app</p>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-16">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <Activity className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs text-text-muted text-center max-w-xs">
            Activity will appear here as you add members, record payments, and handle leads.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
