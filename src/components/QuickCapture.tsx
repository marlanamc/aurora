'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ExternalLink as LinkIcon, FileText, Star, Clock, type IconComponent } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { createPortal } from 'react-dom'

type CaptureType = 'link' | 'note' | 'pin' | 'reminder' | null

type QuickCaptureProps = {
  theme: GlobalTheme
  onCaptureLink?: (url: string) => void
  onCaptureNote?: (text: string) => void
  onCapturePin?: () => void
  onCaptureReminder?: (text: string, time?: Date) => void
  currentFocusAreaId?: string | null
}

export function QuickCapture({
  theme,
  onCaptureLink,
  onCaptureNote,
  onCapturePin,
  onCaptureReminder,
  currentFocusAreaId,
}: QuickCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [captureType, setCaptureType] = useState<CaptureType>(null)
  const [inputValue, setInputValue] = useState('')
  const [mounted, setMounted] = useState(false)
  
  // Only render after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const canPortal = typeof document !== 'undefined' && mounted

  // Keyboard shortcut: Cmd+Shift+N or Ctrl+Shift+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setCaptureType(null)
        setInputValue('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleCapture = () => {
    if (!inputValue.trim()) return

    switch (captureType) {
      case 'link':
        onCaptureLink?.(inputValue.trim())
        break
      case 'note':
        onCaptureNote?.(inputValue.trim())
        break
      case 'reminder':
        onCaptureReminder?.(inputValue.trim())
        break
    }

    setIsOpen(false)
    setCaptureType(null)
    setInputValue('')
  }

  const captureOptions: Array<{
    type: CaptureType
    label: string
    icon: IconComponent
    placeholder: string
    description: string
  }> = [
    {
      type: 'link',
      label: 'Add Link',
      icon: LinkIcon,
      placeholder: 'Paste a URL...',
      description: 'Save a link to your Links widget',
    },
    {
      type: 'note',
      label: 'Quick Note',
      icon: FileText,
      placeholder: 'What\'s on your mind?',
      description: 'Add to Brain Dump',
    },
    {
      type: 'pin',
      label: 'Pin File',
      icon: Star,
      placeholder: 'Select a file to pin...',
      description: 'Pin to current focus area',
    },
    {
      type: 'reminder',
      label: 'Reminder',
      icon: Clock,
      placeholder: 'What do you want to remember?',
      description: 'Add to calendar',
    },
  ]

  const quickCaptureContent = (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: theme.colors.primary,
          color: '#ffffff',
          boxShadow: `0 4px 20px ${theme.colors.primary}40`,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Quick Capture (⌘⇧N)"
        aria-label="Quick Capture"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Capture Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[200] flex items-center justify-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                setCaptureType(null)
                setInputValue('')
              }}
            >
              <motion.div
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                  background: theme.components.card.background,
                  border: theme.components.card.border,
                  boxShadow: theme.effects.shadowHover,
                }}
                initial={{ y: 20, scale: 0.96, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 20, scale: 0.96, opacity: 0 }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 300,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {!captureType ? (
                  // Option Selection
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-black" style={{ color: theme.colors.text }}>
                          Quick Capture
                        </h2>
                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                          What do you want to save?
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setCaptureType(null)
                          setInputValue('')
                        }}
                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: theme.colors.text }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {captureOptions.map((option) => {
                        const Icon = option.icon
                        const isDisabled = option.type === 'pin' && !currentFocusAreaId
                        return (
                          <motion.button
                            key={option.type}
                            onClick={() => {
                              if (option.type === 'pin') {
                                onCapturePin?.()
                                setIsOpen(false)
                              } else {
                                setCaptureType(option.type)
                              }
                            }}
                            disabled={isDisabled}
                            className="p-4 rounded-xl text-left transition-all relative group"
                            style={{
                              background: isDisabled
                                ? 'rgba(0,0,0,0.02)'
                                : theme.components.card.background,
                              border: `1px solid ${theme.colors.border}`,
                              opacity: isDisabled ? 0.5 : 1,
                            }}
                            whileHover={!isDisabled ? { y: -2, scale: 1.02 } : {}}
                            whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          >
                            <div className="flex items-start gap-3">
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
                                  {option.label}
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  // Input Form
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-black" style={{ color: theme.colors.text }}>
                          {captureOptions.find((o) => o.type === captureType)?.label}
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                          {captureOptions.find((o) => o.type === captureType)?.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCaptureType(null)
                          setInputValue('')
                        }}
                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: theme.colors.text }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <input
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCapture()
                        }
                      }}
                      placeholder={captureOptions.find((o) => o.type === captureType)?.placeholder}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-4"
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text,
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCapture}
                        disabled={!inputValue.trim()}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: inputValue.trim() ? theme.colors.primary : 'rgba(0,0,0,0.1)',
                          color: inputValue.trim() ? '#ffffff' : theme.colors.textSecondary,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          setCaptureType(null)
                          setInputValue('')
                        }}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: 'rgba(0,0,0,0.04)',
                          color: theme.colors.text,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )

  // Don't render anything during SSR
  if (!mounted || !canPortal) return null
  
  return createPortal(quickCaptureContent, document.body)
}

