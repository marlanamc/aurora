'use client'

import { useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { BookOpen, Plus, X, Folder, Star } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { open } from '@tauri-apps/plugin-dialog'
import { openFile } from '@/lib/tauri'

type Notebook = {
  id: string
  path: string
  name: string
  color: string
  createdAt: number
}

const NOTEBOOK_COLORS = [
  '#D97757', // Terracotta/Red
  '#C9A961', // Orange-brown
  '#E8D5A3', // Pastel yellow
  '#6B7F5A', // Olive green
  '#7A8FA3', // Dusty blue
  '#A89BB0', // Light violet
  '#FF6B6B', // Bright red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#98D8C8', // Mint
]

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `Today at ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }
}

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
  const data = getWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: [] })
  const notebooks = Array.isArray(data?.notebooks) ? data.notebooks : []
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
        createdAt: Date.now(),
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
      <div className="p-4">
        {notebooks.length === 0 ? (
          <div className="text-center py-12 text-sm opacity-60" style={{ color: theme.colors.textSecondary }}>
            No notebooks yet. Add a folder to get started.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
              {notebooks.map((notebook, index) => (
                <motion.div
                  key={notebook.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  {/* Notebook Cover - Vertical Portrait Style */}
                  <div
                    className="relative w-full aspect-[3/4] rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl active:scale-95 overflow-hidden"
                    style={{
                      background: notebook.color,
                      boxShadow: `0 4px 12px ${notebook.color}40, 0 2px 4px rgba(0,0,0,0.1)`,
                    }}
                    onClick={() => openNotebook(notebook.path)}
                  >
                    {/* Spine/Binding - Darker vertical strip on left */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2"
                      style={{
                        background: `linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.15))`,
                      }}
                    />

                    {/* Star Icon - Top Right */}
                    <div className="absolute top-2 right-2 z-10">
                      <Star 
                        size={16} 
                        className="opacity-60"
                        style={{ 
                          fill: 'rgba(255,255,255,0.3)',
                          stroke: 'rgba(255,255,255,0.5)',
                          strokeWidth: 1.5,
                        }}
                      />
                    </div>

                    {/* Folder Title on Cover */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-3 py-2">
                      <div
                        className="text-center break-words"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.85)',
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          letterSpacing: '0.3px',
                          transform: 'rotate(-1deg)',
                          lineHeight: '1.4',
                          maxWidth: '100%',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                        }}
                      >
                        {notebook.name}
                      </div>
                    </div>

                    {/* Subtle Pattern/Watermark */}
                    <div
                      className="absolute inset-0 opacity-5 pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 8px,
                          rgba(0,0,0,0.1) 8px,
                          rgba(0,0,0,0.1) 9px
                        )`,
                      }}
                    />

                    {/* Color Picker Button - Hidden until hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowColorPicker(showColorPicker === notebook.id ? null : notebook.id)
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Change color"
                    >
                      <div
                        className="w-3 h-3 rounded border"
                        style={{
                          background: notebook.color,
                          borderColor: 'rgba(255,255,255,0.5)',
                        }}
                      />
                    </button>

                    {/* Remove Button - Hidden until hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotebook(notebook.id)
                      }}
                      className="absolute top-2 left-2 p-1 rounded-md bg-red-500/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Remove notebook"
                    >
                      <X size={12} className="text-white" />
                    </button>

                    {/* Color Picker Dropdown */}
                    {showColorPicker === notebook.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full right-0 mb-2 p-2 rounded-lg z-20"
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
                              className="w-6 h-6 rounded border-2 transition-all hover:scale-110"
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

                  {/* Label Below Notebook - Just show date */}
                  <div className="mt-2 text-center">
                    <div
                      className="text-xs opacity-60"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {formatDate(notebook.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add New Notebook Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: notebooks.length * 0.05 }}
              className="relative group"
            >
              <button
                onClick={addNotebook}
                className="relative w-full aspect-[3/4] rounded-lg border-2 border-dashed transition-all hover:border-solid hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center overflow-hidden"
                style={{
                  borderColor: theme.colors.primary,
                  color: theme.colors.primary,
                }}
              >
                <Plus size={32} strokeWidth={2} />
              </button>
              <div className="mt-2 text-center">
                <div
                  className="text-xs font-medium"
                  style={{ color: theme.colors.primary }}
                >
                  New...
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </UnifiedCard>
  )
}
