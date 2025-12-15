'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { UnifiedCard } from './UnifiedCard'
import { Target, Heart, Flame, Dove, Scale, DoorOpen, DollarSign, Sparkles, Gem, CheckCircle2, X, type IconComponent } from '@/lib/icons'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'
import { getValueTemplate } from '@/lib/value-templates'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'
import type { ValueIconId } from '@/lib/value-icons'
import { FirstFocusAreaPrompt } from '@/components/FirstFocusAreaPrompt'
import { StarterTemplatePicker } from '@/components/StarterTemplatePicker'
import type { TemplateCoreValue } from '@/lib/starter-templates'

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
  onApplyTemplate?: (values: TemplateCoreValue[], mode: 'replace' | 'add') => void
  onOpenSettings?: () => void
  theme?: import('@/lib/global-themes').GlobalTheme
  onAddFocusArea?: (name: string, iconId: ValueIconId, colorPair: readonly [string, string]) => void
}

// PALETTE moved to @/lib/value-colors

export function ValuesIntegration({ coreValues, onValueSelect, selectedValueId, onApplyTemplate, onOpenSettings, theme, onAddFocusArea }: ValuesIntegrationProps) {
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

    return valuesFromSettings
  }, [coreValues])
  const [selectedValue, setSelectedValue] = useState<Value | null>(null)
  const [hoveredValue, setHoveredValue] = useState<Value | null>(null)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateCoreValue[] | null>(null)
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

  const openTemplates = () => {
    setPendingTemplate(null)
    setIsTemplatesOpen(true)
  }

  const closeTemplates = () => {
    setPendingTemplate(null)
    setIsTemplatesOpen(false)
  }

  const canPortal = typeof document !== 'undefined'

  const templatesOverlay = (
    <AnimatePresence>
      {isTemplatesOpen && (
        <motion.div
          className="fixed inset-0 z-[205] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          aria-modal="true"
          role="dialog"
        >
          <motion.button
            type="button"
            className="absolute inset-0"
            style={{ 
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            aria-label="Close templates"
            onClick={closeTemplates}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          <motion.div
            className="relative w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{
              background: 'var(--aurora-card-bg-default, rgba(255,255,255,0.85))',
              border: 'var(--aurora-card-border, 1px solid rgba(255,255,255,0.18))',
              boxShadow: 'var(--aurora-card-shadow, 0 18px 55px rgba(0, 0, 0, 0.14))',
              willChange: 'transform, opacity',
              transform: 'translate3d(0, 0, 0)',
            }}
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            <div className="p-5 flex items-start justify-between gap-4 flex-shrink-0 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="min-w-0">
                <div className="text-xl font-black truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                  Starter Templates
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                  Pick a template, preview it, then add or replace.
                </div>
              </div>
              <button
                type="button"
                onClick={closeTemplates}
                className="p-2 rounded-xl"
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.10)',
                  color: 'var(--aurora-text, #111827)',
                }}
                aria-label="Close"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
              <StarterTemplatePicker
                onApply={(nextValues) => {
                  if (!onApplyTemplate) return
                  setPendingTemplate(nextValues)
                }}
                onOpenSettings={onOpenSettings}
              />

              {pendingTemplate ? (
                <div
                  className="mt-4 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap"
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--aurora-text, #111827)' }}>
                    Apply this template?
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTemplate?.(pendingTemplate, 'add')
                        closeTemplates()
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-black"
                      style={{
                        background: 'rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.10)',
                        color: 'var(--aurora-text, #111827)',
                      }}
                      title="Add any missing areas from this template"
                    >
                      Add to Mine
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTemplate?.(pendingTemplate, 'replace')
                        closeTemplates()
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-black"
                      style={{ background: 'var(--aurora-primary, #3B82F6)', color: '#ffffff' }}
                      title="Replace your current focus areas with this template"
                    >
                      Replace Mine
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingTemplate(null)}
                      className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(0,0,0,0.10)',
                        color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
                      }}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <UnifiedCard padding="md" className="relative overflow-hidden">
      {/* Static background orbs - no animation for better performance */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {values.slice(0, 2).map((value, i) => (
            <div
              key={value.id}
              className="absolute rounded-full opacity-15"
              style={{
                background: `radial-gradient(circle, ${value.color}, ${value.secondaryColor})`,
                width: '300px',
                height: '300px',
                left: `${i * 40}%`,
                top: `${i * 30}%`,
                filter: 'blur(40px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      {values.length === 0 ? (
        <div className="relative z-10">
          {theme ? (
            <FirstFocusAreaPrompt
              theme={theme}
              onOpenSettings={onOpenSettings ?? (() => {})}
              onAddFocusArea={onAddFocusArea ?? (() => {})}
            />
          ) : (
            <div className="text-center py-20 px-6">
              <p className="text-xl font-semibold mb-4" style={{ color: 'var(--aurora-text, #111827)' }}>
                Welcome to Aurora
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                Add your first focus area in Settings to get started.
              </p>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="px-6 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    background: 'var(--aurora-primary, #3B82F6)',
                    color: '#ffffff',
                  }}
                >
                  Open Settings
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="relative z-10 mb-8">
            <motion.div
              className="flex items-start justify-between gap-4 mb-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, delay: 0.05, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-4 min-w-0">
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
                <div className="min-w-0">
                  <h2
                    className="text-3xl font-bold leading-none mb-2 truncate"
                    style={{
                      color: 'var(--aurora-text, #111827)',
                    }}
                  >
                    Your Focus Areas
                  </h2>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}
                  >
                    Gentle buckets for what matters right now
                  </p>
                </div>
              </div>

              {/* Template button hidden by default - less overwhelming for first-time users */}
              {/* Users can access templates from Settings or when creating a new focus area */}
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
        </>
      )}

      {canPortal ? createPortal(templatesOverlay, document.body) : null}
    </UnifiedCard>
  )
}
