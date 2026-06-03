'use client'

import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'

export default function AnalyticsPage() {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-semibold text-text-primary page-heading">Analytics</h1>
        <p className="text-text-muted text-sm mt-0.5">Performance insights for your gym</p>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-surface border border-border rounded-xl p-16">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <BarChart2 className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-xs text-text-muted text-center max-w-xs">
            Analytics will appear here once you start adding members, leads, and recording payments.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
