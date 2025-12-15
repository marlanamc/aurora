'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { VALUE_ICON_OPTIONS, type ValueIconId } from '@/lib/value-icons'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'
import { createPortal } from 'react-dom'

type AddFocusAreaDialogProps = {
  isOpen: boolean
  onClose: () => void
  theme: GlobalTheme
  onAdd: (name: string, iconId: ValueIconId, colorPair: readonly [string, string]) => void
}

const COMMON_ICONS: ValueIconId[] = ['sparkles', 'target', 'heart', 'flame', 'dove', 'scale', 'doorOpen', 'dollarSign']

export function AddFocusAreaDialog({ isOpen, onClose, theme, onAdd }: AddFocusAreaDialogProps) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<ValueIconId>('sparkles')
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!name.trim()) return
    
    const colorPair = CORE_VALUE_PALETTE[selectedColorIndex % CORE_VALUE_PALETTE.length]
    onAdd(name.trim(), selectedIcon, colorPair)
    setName('')
    setSelectedIcon('sparkles')
    setSelectedColorIndex(0)
    onClose()
  }

  const canPortal = typeof document !== 'undefined' && mounted

  if (!canPortal || !isOpen) return null

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl p-6"
              style={{
                background: theme.components.card.background,
                border: theme.components.card.border,
                boxShadow: theme.effects.shadowHover,
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black mb-1" style={{ color: theme.colors.text }}>
                    Add Focus Area
                  </h3>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    Give it a name
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    ref={inputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Work, Health, Creativity"
                    className="w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-current"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: name.trim() ? theme.gradients.button : 'rgba(0,0,0,0.1)',
                      color: name.trim() ? '#000000' : theme.colors.textSecondary,
                      boxShadow: name.trim() ? theme.effects.shadow : 'none',
                    }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      color: theme.colors.text,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(dialogContent, document.body)
}

