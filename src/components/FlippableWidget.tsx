'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, X } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'

interface FlippableWidgetProps {
  front: React.ReactNode
  back?: React.ReactNode
  theme?: GlobalTheme
}

export function FlippableWidget({
  front,
  back,
  theme,
}: FlippableWidgetProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const hasSettings = back !== undefined

  return (
    <div className="relative w-full" style={{ perspective: '1000px', minHeight: '200px' }}>
      <motion.div
        className="relative w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', width: '100%' }}
      >
        {/* Front - Widget Content */}
        <div
          className={isFlipped ? 'absolute inset-0 w-full' : 'relative w-full'}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
          aria-hidden={isFlipped}
        >
          <div className="relative w-full">
            {front}
            {/* Flip button - only show if there are settings */}
            {hasSettings && (
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: theme?.colors.textSecondary || 'var(--aurora-text-secondary)' }}
                title="Settings"
              >
                <Settings size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Back - Settings */}
        {hasSettings && (
          <div
            className={isFlipped ? 'relative w-full' : 'absolute inset-0 w-full'}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              pointerEvents: isFlipped ? 'auto' : 'none',
            }}
            aria-hidden={!isFlipped}
          >
            <div className="relative w-full liquid-glass rounded-[22px] p-4" style={{
              background: 'var(--aurora-card-bg-default, rgba(255, 255, 255, 0.85))',
              border: 'var(--aurora-card-border, 1px solid rgba(255, 255, 255, 0.28))',
              boxShadow: 'var(--aurora-card-shadow, 0 18px 55px rgba(0, 0, 0, 0.14))',
            }}>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: theme?.colors.textSecondary || 'var(--aurora-text-secondary)' }}
                title="Back to widget"
              >
                <X size={16} strokeWidth={2} />
              </button>
              {back}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

