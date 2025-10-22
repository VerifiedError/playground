'use client'

// Animated Message Wrapper
// Smooth fade-in animation for chat messages

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedMessageProps {
  children: ReactNode
  delay?: number
}

/**
 * Fade-in animation for messages
 */
export function AnimatedMessage({ children, delay = 0 }: AnimatedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.4, 0, 0.2, 1], // Tailwind CSS easing
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide-in animation for modals
 */
export function AnimatedModal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade animation wrapper
 */
export function FadeIn({ children, delay = 0 }: AnimatedMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Typing indicator animation (3 bouncing dots)
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 bg-muted-foreground rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Button press animation
 */
export function AnimatedButton({ children, onClick, className = '', disabled = false }: {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  )
}
