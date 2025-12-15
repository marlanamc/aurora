'use client'

import { useState, useRef, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { BookOpen, Plus, X, Star, PenTool, Check } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { open } from '@tauri-apps/plugin-dialog'
import { openFile } from '@/lib/tauri'
import { HexColorPicker } from 'react-colorful'

type Notebook = {
  id: string
  path: string
  name: string
  color: string
  favorite?: boolean
  createdAt?: number
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

function formatDate(timestamp: number | undefined): string | null {
  if (!timestamp || isNaN(timestamp)) return null
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return null
  
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
  // Migrate existing notebooks without createdAt
  const notebooksRaw = Array.isArray(data?.notebooks) ? data.notebooks : []
  const notebooks = notebooksRaw.map((nb) => ({
    ...nb,
    createdAt: nb.createdAt ?? Date.now(),
    favorite: nb.favorite ?? false,
  }))
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  
  // Also allow opening preset picker by clicking the color button
  const handleColorButtonClick = (e: React.MouseEvent, notebookId: string) => {
    e.stopPropagation()
    e.preventDefault()
    setShowColorPicker(showColorPicker === notebookId ? null : notebookId)
  }

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

  const updateNotebookColor = (id: string, color: string, closePicker = false) => {
    const updated = notebooks.map((nb) => (nb.id === id ? { ...nb, color } : nb))
    mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
    if (closePicker) {
      setShowColorPicker(null)
    }
  }

  const toggleNotebookFavorite = (id: string) => {
    const updated = notebooks.map((nb) => (nb.id === id ? { ...nb, favorite: !nb.favorite } : nb))
    mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
  }

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName || '')
    setShowColorPicker(null) // Close color picker if open
  }

  const saveEdit = (id: string) => {
    const trimmed = editingName.trim()
    if (trimmed) {
      const updated = notebooks.map((nb) => (nb.id === id ? { ...nb, name: trimmed } : nb))
      mergeWidgetData<{ notebooks: Notebook[] }>(widgetId, { notebooks: updated }, { notebooks: [] })
    }
    setEditingId(null)
    setEditingName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

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
        subtitle="Your folders, organized visually"
      />
      <div className="p-4 relative">
        {/* Add button (doesn't consume a grid slot) */}
        <button
          onClick={addNotebook}
          className="absolute top-2 right-2 w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
          style={{
            background: theme.components.card.background,
            borderColor: theme.colors.border,
            color: theme.colors.textSecondary,
            boxShadow: theme.effects.shadowHover,
          }}
          title="Add Notebook"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>

        {notebooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-sm opacity-60" style={{ color: theme.colors.textSecondary }}>
              No notebooks yet. Click + to add a folder.
            </div>
          </div>
        ) : (
          <div
            className="relative rounded-2xl p-4"
            style={{
              backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 40%, rgba(90,60,30,0.18) 100%),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 28px)
              `,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.effects.shadowHover,
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%), radial-gradient(100% 70% at 50% 100%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 60%)',
              }}
            />
            <div className="relative grid grid-cols-3 gap-4 items-end">
            <AnimatePresence initial={false}>
              {notebooks.map((notebook, index) => {
                const isEditing = editingId === notebook.id
                return (
                <motion.div
                  key={notebook.id}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="relative group"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('[data-notebook-control]')) return
                    if (!isEditing) openNotebook(notebook.path)
                  }}
                >
                  {/* Notebook Cover - Vertical Portrait Style */}
                  <div
                    className="relative w-full aspect-[3/4] rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl active:scale-95 overflow-hidden"
                    style={{
                      background: notebook.color,
                      boxShadow: `0 4px 12px ${notebook.color}40, 0 2px 4px rgba(0,0,0,0.1)`,
                    }}
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
                      <button
                        type="button"
                        data-notebook-control
                        className="p-1.5 rounded-md bg-white/10 hover:bg-white/25 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 shadow-sm"
                        title={notebook.favorite ? 'Unfavorite' : 'Favorite'}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          toggleNotebookFavorite(notebook.id)
                        }}
                      >
                        <Star
                          size={14}
                          className="transition-all"
                          style={{
                            fill: notebook.favorite ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                            stroke: 'rgba(255,255,255,0.9)',
                            strokeWidth: 2,
                          }}
                        />
                      </button>
                    </div>

                    {/* Folder Title on Cover */}
                    <div className="absolute inset-0 flex items-center justify-center px-3 py-2">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              saveEdit(notebook.id)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              cancelEdit()
                            }
                          }}
                          onBlur={() => saveEdit(notebook.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-center bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-md px-2 py-1 outline-none border-2 focus:border-white/50 transition-all"
                          style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'rgba(0,0,0,0.9)',
                            letterSpacing: '0.3px',
                            transform: 'rotate(-1deg)',
                            borderColor: 'rgba(255,255,255,0.3)',
                          }}
                          placeholder={notebook.name}
                        />
                      ) : (
                        <div
                          className="text-center break-words pointer-events-none"
                          style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'rgba(0,0,0,0.8)',
                            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
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
                      )}
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

                    {/* Edit Button - Appears on hover */}
                    {!isEditing && (
                      <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            startEditing(notebook.id, notebook.name)
                          }}
                          data-notebook-control
                          className="p-2 rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                          title="Edit name"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <PenTool size={14} style={{ color: 'rgba(0,0,0,0.7)' }} />
                        </button>
                      </div>
                    )}

                    {/* Save/Cancel Buttons - When editing */}
                    {isEditing && (
                      <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            saveEdit(notebook.id)
                          }}
                          data-notebook-control
                          className="p-2 rounded-lg bg-green-500/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                          title="Save changes"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Check size={14} className="text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            cancelEdit()
                          }}
                          data-notebook-control
                          className="p-2 rounded-lg bg-red-500/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                          title="Cancel editing"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    )}

                    {/* Color Picker - Single button that opens color picker popup */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <button
                        onClick={(e) => handleColorButtonClick(e, notebook.id)}
                        data-notebook-control
                        className="p-2 rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95"
                        title="Change color"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div
                          className="w-5 h-5 rounded border-2 transition-all"
                          style={{
                            background: notebook.color,
                            borderColor: 'rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>

                    {/* Remove Button - Appears on hover */}
                    <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          removeNotebook(notebook.id)
                        }}
                        data-notebook-control
                        className="p-2 rounded-md bg-red-500/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 active:scale-95 pointer-events-auto"
                        title="Remove notebook"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>

                  </div>

                  {/* Shelf plank under each book */}
                  <div
                    className="mt-2 h-3 w-full rounded-sm"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(110,75,40,0.55) 0%, rgba(85,55,28,0.65) 55%, rgba(60,38,18,0.75) 100%)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 14px rgba(0,0,0,0.22)',
                      border: '1px solid rgba(0,0,0,0.15)',
                    }}
                  />

                  {/* Color Picker Popup - placed outside cover to avoid overflow clipping */}
                  {showColorPicker === notebook.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowColorPicker(null)
                        }}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute bottom-14 right-3 p-3 rounded-xl z-50 shadow-2xl"
                        data-notebook-control
                        style={{
                          background: theme.components.card.background,
                          border: `2px solid ${theme.colors.border}`,
                          boxShadow: theme.effects.shadowHover,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                      >
                        <div className="mb-3">
                          <div
                            className="text-xs font-semibold mb-2 opacity-70"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            Pick any color:
                          </div>
                          <div
                            className="rounded-lg overflow-hidden border-2"
                            style={{ borderColor: theme.colors.border }}
                          >
                            <HexColorPicker
                              color={notebook.color}
                              onChange={(color) => updateNotebookColor(notebook.id, color, false)}
                              style={{ width: '100%', height: '150px' }}
                            />
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs font-semibold mb-2 opacity-70"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            Or choose a preset:
                          </div>
                          <div className="grid grid-cols-5 gap-3">
                            {NOTEBOOK_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                data-notebook-control
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  updateNotebookColor(notebook.id, color, true)
                                }}
                                className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-125 active:scale-110 cursor-pointer shadow-sm"
                                style={{
                                  background: color,
                                  borderColor:
                                    notebook.color === color ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                                  borderWidth: notebook.color === color ? '3px' : '2px',
                                }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* Label Below Notebook - Just show date if available */}
                  {formatDate(notebook.createdAt) && (
                    <div className="mt-2 text-center">
                      <div
                        className="text-xs opacity-60 transition-opacity group-hover:opacity-80"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {formatDate(notebook.createdAt)}
                      </div>
                    </div>
                  )}
                  </motion.div>
                )
              })}
              </AnimatePresence>
            </div>
          </div>
        )}
        
      </div>
    </UnifiedCard>
  )
}
