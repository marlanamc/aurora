'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, ChevronDown, ChevronRight } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { STARTER_TEMPLATES, buildCoreValuesFromStarterTemplate, type TemplateCoreValue } from '@/lib/starter-templates'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'

type QuickStartSectionProps = {
  theme: GlobalTheme
  currentCount: number
  onApplyTemplate: (values: TemplateCoreValue[], mode: 'replace' | 'add') => void
}

export function QuickStartSection({ theme, currentCount, onApplyTemplate }: QuickStartSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const handleApplyTemplate = (templateId: string) => {
    const template = STARTER_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    const values = buildCoreValuesFromStarterTemplate(template)
    const mode = currentCount === 0 ? 'replace' : 'add'
    onApplyTemplate(values, mode)
    setIsExpanded(false)
    setSelectedTemplateId(null)
  }

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: `${theme.colors.primary}08`,
        borderColor: `${theme.colors.primary}20`,
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 mb-2"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${theme.colors.primary}15`,
              color: theme.colors.primary,
            }}
          >
            <Zap size={20} strokeWidth={2} />
          </div>
          <div className="text-left">
            <div className="text-sm font-black" style={{ color: theme.colors.text }}>
              Quick Start
            </div>
            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {currentCount === 0
                ? 'Choose a template to get started'
                : 'Add focus areas from a template'}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown size={18} style={{ color: theme.colors.textSecondary }} />
        ) : (
          <ChevronRight size={18} style={{ color: theme.colors.textSecondary }} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {STARTER_TEMPLATES.slice(0, 3).map((template) => {
                const isSelected = selectedTemplateId === template.id
                return (
                  <motion.button
                    key={template.id}
                    onClick={() => {
                      if (isSelected) {
                        handleApplyTemplate(template.id)
                      } else {
                        setSelectedTemplateId(template.id)
                      }
                    }}
                    className="w-full rounded-xl p-4 text-left transition-all"
                    style={{
                      background: isSelected
                        ? theme.components.card.background
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? theme.colors.primary : 'rgba(255,255,255,0.1)'}`,
                    }}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black mb-1" style={{ color: theme.colors.text }}>
                          {template.name}
                        </div>
                        <div className="text-xs mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                          {template.description}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {template.values.slice(0, 4).map((value) => {
                            const Icon = VALUE_ICON_OPTIONS[value.iconId]
                            return (
                              <div
                                key={value.id}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{
                                  background: 'rgba(0,0,0,0.06)',
                                  color: theme.colors.textSecondary,
                                }}
                              >
                                {Icon && <Icon size={10} />}
                                {value.name}
                              </div>
                            )
                          })}
                          {template.values.length > 4 && (
                            <div
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              +{template.values.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: theme.colors.primary,
                            color: '#ffffff',
                          }}
                        >
                          <Sparkles size={14} strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 pt-3 border-t"
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplyTemplate(template.id)
                            }}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-black"
                            style={{
                              background: theme.gradients.button,
                              color: '#000000',
                            }}
                          >
                            {currentCount === 0 ? 'Use This Template' : 'Add These Areas'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTemplateId(null)
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-semibold"
                            style={{
                              background: 'rgba(0,0,0,0.06)',
                              color: theme.colors.text,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

