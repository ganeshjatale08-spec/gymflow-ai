'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useInView, animate } from 'framer-motion'
import { formatINR } from '@/lib/utils'

interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  currency?: boolean
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  currency = false,
  duration = 1.5,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return

    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) {
          const val = Math.floor(v)
          ref.current.textContent = currency
            ? `${prefix}${formatINR(val)}${suffix}`
            : `${prefix}${val.toLocaleString('en-IN')}${suffix}`
        }
      },
    })

    return () => controls.stop()
  }, [inView, target, duration, currency, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {currency ? `${prefix}₹0${suffix}` : `${prefix}0${suffix}`}
    </span>
  )
}
