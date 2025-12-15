'use client'

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'

interface UnifiedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: 'default' | 'subtle' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  fullHeight?: boolean
}

export function UnifiedCard({
  children,
  variant = 'default',
  padding = 'md',
  fullHeight = false,
  className = '',
  ...motionProps
}: UnifiedCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const glassBg =
    variant === 'subtle'
      ? 'var(--aurora-card-bg-subtle, rgba(255, 255, 255, 0.6))'
      : variant === 'glass'
        ? 'var(--aurora-card-bg-glass, rgba(255, 255, 255, 0.7))'
        : 'var(--aurora-card-bg-default, rgba(255, 255, 255, 0.85))'

  return (
    <motion.div
      className={`
        relative overflow-hidden
        rounded-[22px]
        liquid-glass
        transition-transform duration-200
        ${paddingClasses[padding]}
        ${fullHeight ? 'h-full' : ''}
        ${className}
      `}
      style={
        {
          ['--aurora-glass-bg' as any]: glassBg,
          ['--aurora-glass-border' as any]: 'var(--aurora-card-border, 1px solid rgba(255, 255, 255, 0.28))',
          ['--aurora-glass-shadow' as any]: 'var(--aurora-card-shadow, 0 18px 55px rgba(0, 0, 0, 0.14))',
        } as any
      }
      initial={false}
      animate={false}
      transition={{ duration: 0 }}
      whileHover={prefersReducedMotion ? undefined : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

export function UnifiedCardHeader({
  title,
  subtitle,
  icon: IconComponent,
  action
}: {
  title: string
  subtitle?: string
  icon?: import('@/lib/icons').IconComponent
  action?: ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {IconComponent && (
            <div style={{ color: 'var(--aurora-text, #374151)' }}>
              <IconComponent size={24} strokeWidth={2} />
            </div>
          )}
          <h2 className="text-lg font-bold" style={{ color: 'var(--aurora-text, #111827)' }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      {subtitle && (
        <p className="text-xs ml-8" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
