'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import { UnifiedCard } from './UnifiedCard'
import { Target, Heart, Flame, Dove, Scale, DoorOpen, DollarSign, Sparkles, Gem, CheckCircle2, type IconComponent } from '@/lib/icons'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'
import { getValueTemplate } from '@/lib/value-templates'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'
import type { ValueIconId } from '@/lib/value-icons'

interface Value {
  id: string
  name: string
  icon: IconComponent
  color: string
  secondaryColor: string
  progress: number // 0-100
  active: boolean
  purpose: string
  tone: string
}

interface ValuesIntegrationProps {
  coreValues?: Array<{
    id: string
    name: string
    iconId: ValueIconId
    purpose?: string
    tone?: string
    colorPair?: readonly [string, string]
  }>
  onValueSelect?: (value: Value) => void
  selectedValueId?: string | null
}

const fallbackValues = [
  { id: 'work', name: 'Projects', icon: Target },
  { id: 'health', name: 'Body', icon: Flame },
  { id: 'relationships', name: 'People', icon: Heart },
  { id: 'home', name: 'Home Base', icon: DoorOpen },
  { id: 'money', name: 'Money Admin', icon: DollarSign },
  { id: 'learning', name: 'Curiosity', icon: Scale },
  { id: 'support', name: 'Reset', icon: Dove },
] as const

// PALETTE moved to @/lib/value-colors

export function ValuesIntegration({ coreValues, onValueSelect, selectedValueId }: ValuesIntegrationProps) {
  const values: Value[] = useMemo(() => {
    const valuesFromSettings = (coreValues ?? []).map((v, idx) => {
      const icon = VALUE_ICON_OPTIONS[v.iconId] ?? Sparkles
      const [color, secondaryColor] = v.colorPair ?? CORE_VALUE_PALETTE[idx % CORE_VALUE_PALETTE.length]
      return {
        id: v.id,
        name: v.name,
        icon,
        color,
        secondaryColor,
        progress: 0,
        active: true,
        purpose: v.purpose ?? getValueTemplate(v.id)?.purpose ?? 'Small actions, repeated, become identity.',
        tone: v.tone ?? getValueTemplate(v.id)?.tone ?? 'Gentle structure that fits your brain.',
      } satisfies Value
    })

    if (valuesFromSettings.length > 0) return valuesFromSettings

    return fallbackValues.map((v, idx) => {
      const [color, secondaryColor] = CORE_VALUE_PALETTE[idx % CORE_VALUE_PALETTE.length]
      return {
        id: v.id,
        name: v.name,
        icon: v.icon,
        color,
        secondaryColor,
        progress: 0,
        active: true,
        purpose: getValueTemplate(v.id)?.purpose ?? 'Small actions, repeated, become identity.',
        tone: getValueTemplate(v.id)?.tone ?? 'Gentle structure that fits your brain.',
      }
    })
  }, [coreValues])
  const [selectedValue, setSelectedValue] = useState<Value | null>(null)
  const [hoveredValue, setHoveredValue] = useState<Value | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const handleValueClick = (value: Value) => {
    if (selectedValueId == null) setSelectedValue(value)
    onValueSelect?.(value)
  }

  const controlledSelected = selectedValueId ? values.find((v) => v.id === selectedValueId) ?? null : null
  const activeSelected = controlledSelected || selectedValue
  const displayValue = hoveredValue || activeSelected
  const enterSpring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }
  const fastTween = prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }
  const hoverSpring = prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }

  return (
    <UnifiedCard padding="md" className="relative overflow-hidden">
      {/* Keep custom background orbs for visual interest */}
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {values.slice(0, 3).map((value, i) => (
          <motion.div
            key={value.id}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${value.color}, ${value.secondaryColor})`,
              width: '400px',
              height: '400px',
              left: `${i * 35}%`,
              top: `${i * 30}%`,
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                  scale: [1, 1.06, 1],
                  x: [0, 14, 0],
                  y: [0, -14, 0],
                }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                  duration: 6 + i * 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }
            }
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <motion.div
          className="flex items-center gap-4 mb-3"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        >
          <motion.span
            className="text-6xl"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                  rotate: [0, 6, -6, 0],
                  scale: [1, 1.04, 1],
                }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
            }
          >
            <Gem size={48} strokeWidth={2} style={{ color: 'var(--aurora-text, #111827)' }} />
          </motion.span>
          <div>
            <h2
              className="text-3xl font-bold leading-none mb-2"
              style={{
                color: 'var(--aurora-text, #111827)',
              }}
            >
              Your Core Values
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}
            >
              Every action you take moves you closer to who you want to be
            </p>
          </div>
        </motion.div>
      </div>

      {/* Values Display - Radial Layout */}
      <div className="relative z-10">
        <div className="grid grid-cols-6 gap-4 mb-8">
          {values.map((value, index) => (
            <motion.button
              key={value.id}
              className="relative group"
              onClick={() => handleValueClick(value)}
              onMouseEnter={() => setHoveredValue(value)}
              onMouseLeave={() => setHoveredValue(null)}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{
                opacity: 1,
                scale: activeSelected?.id === value.id ? 1.05 : 1,
                y: 0
              }}
              transition={{
                ...enterSpring,
                delay: prefersReducedMotion ? 0 : index * 0.04,
              }}
            >
              {/* Card Container - Glassmorphic */}
              <div
                className={`
                  relative rounded-2xl overflow-hidden transition-all duration-300
                  ${activeSelected?.id === value.id ? 'liquid-glass' : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                `}
                style={{
                  height: '160px',
                  boxShadow: activeSelected?.id === value.id
                    ? `0 0 30px ${value.color}40, inset 0 0 20px ${value.color}20`
                    : 'none'
                }}
              >
                {/* Active glow background */}
                {activeSelected?.id === value.id && (
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at center, ${value.color}, transparent 80%)`
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                  {/* Icon */}
                  <motion.div
                    className="mb-4 relative"
                    animate={{
                      y: activeSelected?.id === value.id ? [0, -4, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Icon Glow */}
                    <div
                      className="absolute inset-0 blur-xl opacity-40"
                      style={{ background: value.color }}
                    />

                    {value.icon &&
                      React.createElement(value.icon, {
                        size: 36,
                        strokeWidth: 2,
                        style: {
                          color: activeSelected?.id === value.id ? value.color : 'var(--aurora-text)',
                          filter: activeSelected?.id === value.id ? `drop-shadow(0 0 8px ${value.color}80)` : 'none'
                        },
                      })}
                  </motion.div>

                  {/* Name */}
                  <h3
                    className="text-sm font-bold text-center leading-tight transition-colors"
                    style={{
                      color: activeSelected?.id === value.id ? value.color : 'var(--aurora-text)',
                      fontFamily: 'var(--font-display, sans-serif)',
                      opacity: activeSelected?.id === value.id ? 1 : 0.8
                    }}
                  >
                    {value.name}
                  </h3>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected/Hovered Value Details */}
        <AnimatePresence mode="wait">
          {displayValue && (
            <motion.div
              key={displayValue.id}
              className="relative rounded-2xl p-8 overflow-hidden liquid-glass"
              style={{
                ['--aurora-glass-bg' as any]: `linear-gradient(135deg, ${displayValue.color}10, ${displayValue.secondaryColor}05)`,
                border: `1px solid ${displayValue.color}30`,
              }}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={fastTween}
            >
              {/* Background decoration */}
              <div
                className="absolute right-0 top-0 text-9xl opacity-10 select-none"
                style={{ color: displayValue.color }}
              >
                {displayValue.icon && React.createElement(displayValue.icon, { size: 96 })}
              </div>

              <div className="relative z-10 flex items-center gap-6">
                {/* Icon */}
                <motion.div
                  className="text-7xl"
                  animate={prefersReducedMotion ? undefined : { scale: [1, 1.04, 1] }}
                  transition={prefersReducedMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {displayValue.icon &&
                    React.createElement(displayValue.icon, {
                      size: 80,
                      style: { color: displayValue.color },
                    })}
                </motion.div>

                {/* Content */}
                <div className="flex-1">
                  <h3
                    className="text-3xl font-black mb-2"
                    style={{
                      color: displayValue.color,
                      fontFamily: '"Fraunces", serif',
                    }}
                  >
                    {displayValue.name}
                  </h3>

                  <p
                    className="text-lg italic"
                    style={{
                      color: displayValue.color,
                      opacity: 0.8,
                    }}
                  >
                    {displayValue.purpose}
                  </p>

                  <p className="text-sm mt-2" style={{ color: displayValue.color, opacity: 0.7 }}>
                    {displayValue.tone}
                  </p>
                </div>

                {/* Action hint */}
                <motion.div
                  className="px-6 py-3 rounded-xl text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${displayValue.color}, ${displayValue.secondaryColor})`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={hoverSpring}
                >
                  Focus Here
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </UnifiedCard>
  )
}
