import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

export const slideFromLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
}

export const slideFromRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
}

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 0 0 rgba(59,130,246,0)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(59,130,246,0.2)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

export const orbPulse: Variants = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.5, 0.7, 0.5],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const floatAnimation: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const floatAnimationDelayed: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
  },
}

export const messageSlideIn: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const SPRING = { type: 'spring', stiffness: 300, damping: 30 }
export const SPRING_SLOW = { type: 'spring', stiffness: 120, damping: 20 }
