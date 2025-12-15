'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import type { WidgetType } from '@/lib/widgets'
import { WIDGET_DEFINITIONS, WIDGET_CATEGORY_LABELS } from '@/lib/widgets'
import { suggestWidgetsForFocusArea, getSuggestionMessage } from '@/lib/smart-defaults'

type WidgetSuggestionsProps = {
  theme: GlobalTheme
  areaName: string
  areaId: string
  currentWidgets: WidgetType[]
  onAddWidget: (type: WidgetType) => void
  onDismiss: () => void
}

export function WidgetSuggestions({
  theme,
  areaName,
  areaId,
  currentWidgets,
  onAddWidget,
  onDismiss,
}: WidgetSuggestionsProps) {
  const suggestions = suggestWidgetsForFocusArea(areaName, areaId)
  const availableSuggestions = suggestions.filter((s) => !currentWidgets.includes(s.type))
  
  if (availableSuggestions.length === 0) return null

  const topSuggestions = availableSuggestions.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl p-4 mb-4"
      style={{
        background: `${theme.colors.primary}10`,
        border: `1px solid ${theme.colors.primary}30`,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${theme.colors.primary}20`,
              color: theme.colors.primary,
            }}
          >
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold mb-1" style={{ color: theme.colors.text }}>
              Smart suggestions
            </div>
            <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {getSuggestionMessage(topSuggestions)}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
          style={{ color: theme.colors.textSecondary }}
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {topSuggestions.map((suggestion) => {
          const widgetDef = WIDGET_DEFINITIONS.find((w) => w.type === suggestion.type)
          if (!widgetDef) return null

          return (
            <button
              key={suggestion.type}
              onClick={() => {
                onAddWidget(suggestion.type)
                onDismiss()
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
              style={{
                background: theme.components.card.background,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
              }}
            >
              <widgetDef.icon size={14} />
              {widgetDef.name}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

