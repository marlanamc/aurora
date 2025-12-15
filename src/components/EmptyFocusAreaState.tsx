'use client'

import { motion } from 'framer-motion'
import { Plus, Sparkles, LayoutGrid } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { WIDGET_DEFINITIONS } from '@/lib/widgets'
import type { WidgetType } from '@/lib/widgets'

type EmptyFocusAreaStateProps = {
  theme: GlobalTheme
  areaName: string
  onAddWidget: () => void
  onAddSpecificWidget?: (type: WidgetType) => void
  suggestedWidgets?: WidgetType[]
}

export function EmptyFocusAreaState({
  theme,
  areaName,
  onAddWidget,
  onAddSpecificWidget,
  suggestedWidgets = [],
}: EmptyFocusAreaStateProps) {
  // Get top 3 suggested widgets to show
  const topSuggestions = suggestedWidgets.slice(0, 3)
  const suggestionDefs = topSuggestions
    .map((type) => WIDGET_DEFINITIONS.find((w) => w.type === type))
    .filter((def): def is NonNullable<typeof def> => def !== undefined)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 20, stiffness: 200 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `${theme.colors.primary}15`,
          border: `2px dashed ${theme.colors.primary}40`,
        }}
      >
        <LayoutGrid size={32} style={{ color: theme.colors.primary }} strokeWidth={2} />
      </motion.div>

      <h3
        className="text-2xl font-black mb-2 text-center"
        style={{ color: theme.colors.text }}
      >
        {areaName}
      </h3>
      <p
        className="text-sm mb-8 text-center max-w-md"
        style={{ color: theme.colors.textSecondary }}
      >
        Start by adding a widget. You can always add more later.
      </p>

      {suggestionDefs.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: theme.colors.primary }} />
            <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
              Suggested for you
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {suggestionDefs.map((def) => {
              const Icon = def.icon
              return (
                <motion.button
                  key={def.type}
                  onClick={() => {
                    if (onAddSpecificWidget) {
                      onAddSpecificWidget(def.type)
                    } else {
                      onAddWidget()
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all"
                  style={{
                    background: theme.components.card.background,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: theme.colors.text }}>
                      {def.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                      {def.description}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      <motion.button
        onClick={onAddWidget}
        className="px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2"
        style={{
          background: theme.gradients.button,
          color: '#000000',
          boxShadow: theme.effects.shadow,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Widget
      </motion.button>
    </motion.div>
  )
}

