'use client'

import { motion } from 'framer-motion'

export function AITypingIndicator() {
  const dots = [0, 1, 2]

  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-blue/20 border border-blue/30 flex items-center justify-center flex-shrink-0 text-xs text-blue-soft font-semibold">
        AI
      </div>
      <div className="bubble-ai flex items-center gap-1 px-4 py-3">
        {dots.map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-soft"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  )
}
