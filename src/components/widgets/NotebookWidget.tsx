'use client'

import { useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { BookOpen, Plus, X, Folder } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { open } from '@tauri-apps/plugin-dialog'
import { openFile } from '@/lib/tauri'

type Notebook = {
  id: string
  path: string
  name: string
  color: string
}

const NOTEBOOK_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B88B', // Peach
  '#90EE90', // Light Green
]

export function NotebookWidget({
  theme,
  widgetId,
  getWidgetData,
  mergeWidgetData,
}: {
  theme: GlobalTheme
  widgetId: string
  getWidgetData: <T,>(id: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
  const notebooks = getWidgetData<Notebook[]>(widgetId, [])
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

  const addNotebook = async () => {
    try {
      const selected = await open({ directory: true, multiple: false })
      if (!selected || typeof selected !== 'string') return

      const path = selected
      const name = path.split('/').pop() || 'Untitled Folder'
      const newNotebook: Notebook = {
        id: `nb_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        path,
        name,
        color: NOTEBOOK_COLORS[notebooks.length % NOTEBOOK_COLORS.length],
      }

      const updated = [...notebooks, newNotebook]
      mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
    } catch (error) {
      console.error('Failed to select folder:', error)
    }
  }

  const removeNotebook = (id: string) => {
    const updated = notebooks.filter((nb) => nb.id !== id)
    mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
  }

  const updateNotebookColor = (id: string, color: string) => {
    const updated = notebooks.map((nb) => (nb.id === id ? { ...nb, color } : nb))
    mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
    setShowColorPicker(null)
  }

  const openNotebook = async (path: string) => {
    try {
      await openFile(path)
    } catch (error) {
      console.error('Failed to open folder:', error)
    }
  }

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader
        icon={BookOpen}
        title="Notebooks"
        subtitle="Your folders, styled like notebooks"
      />
      <div className="p-4 space-y-3">
        {notebooks.length === 0 ? (
          <div className="text-center py-8 text-sm opacity-60" style={{ color: theme.colors.textSecondary }}>
            No notebooks yet. Add a folder to get started.
          </div>
        ) : (
          <AnimatePresence>
            {notebooks.map((notebook, index) => (
              <motion.div
                key={notebook.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                {/* Notebook Card */}
                <div
                  className="relative rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${notebook.color}15, ${notebook.color}08)`,
                    border: `2px solid ${notebook.color}40`,
                    boxShadow: `0 2px 8px ${notebook.color}20`,
                  }}
                  onClick={() => openNotebook(notebook.path)}
                >
                  {/* Notebook Spine Effect */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ background: notebook.color }}
                  />

                  {/* Notebook Lines (ruled paper effect) */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10 rounded-lg"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        transparent,
                        transparent 2px,
                        ${notebook.color} 2px,
                        ${notebook.color} 4px
                      )`,
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="p-2 rounded-lg shrink-0"
                        style={{
                          background: `${notebook.color}20`,
                          color: notebook.color,
                        }}
                      >
                        <Folder size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold text-sm truncate"
                          style={{ color: theme.colors.text }}
                        >
                          {notebook.name}
                        </div>
                        <div
                          className="text-xs truncate opacity-60"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {notebook.path}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Color Picker Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowColorPicker(showColorPicker === notebook.id ? null : notebook.id)
                        }}
                        className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Change color"
                      >
                        <div
                          className="w-4 h-4 rounded border-2"
                          style={{
                            background: notebook.color,
                            borderColor: theme.colors.textSecondary,
                          }}
                        />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotebook(notebook.id)
                        }}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove notebook"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Color Picker Dropdown */}
                  {showColorPicker === notebook.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 p-2 rounded-lg z-20"
                      style={{
                        background: theme.components.card.background,
                        border: theme.components.card.border,
                        boxShadow: theme.effects.shadow,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-5 gap-2">
                        {NOTEBOOK_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateNotebookColor(notebook.id, color)}
                            className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                            style={{
                              background: color,
                              borderColor: notebook.color === color ? theme.colors.primary : 'transparent',
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Add Notebook Button */}
        <button
          onClick={addNotebook}
          className="w-full p-3 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-2"
          style={{
            borderColor: theme.colors.textSecondary,
            color: theme.colors.textSecondary,
          }}
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add Notebook</span>
        </button>
      </div>
    </UnifiedCard>
  )
}
