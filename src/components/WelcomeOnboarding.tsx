'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Sparkles, CalendarDays, Search, X, ArrowRight, Check } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { open } from '@tauri-apps/plugin-dialog'

type Props = {
  theme: GlobalTheme
  onComplete: (scanSources: string[]) => void
  onSkip: () => void
}

const WELCOME_STORAGE_KEY = 'aurora-welcome-completed'

export function WelcomeOnboarding({ theme, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0)
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])

  const steps = [
    {
      title: 'Welcome to Aurora OS ✨',
      description: 'A visual memory layer designed for ADHD brains. Your files become alive, visible, and emotionally intuitive.',
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
            Aurora transforms your file system into something you can <em>feel</em> and <em>remember</em>—not just search.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: theme.colors.primary + '20' }}>
                <Check size={14} style={{ color: theme.colors.primary }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: theme.colors.text }}>Visual Memory</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Files appear as colorful tiles you can recognize at a glance</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: theme.colors.secondary + '20' }}>
                <Check size={14} style={{ color: theme.colors.secondary }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: theme.colors.text }}>Resurfacing Engine</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Forgotten files come back when they matter</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: theme.colors.accent + '20' }}>
                <Check size={14} style={{ color: theme.colors.accent }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: theme.colors.text }}>Emotional Metadata</div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>Tag files by mood, season, vibe—how your brain remembers</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Folders to Index',
      description: 'Select the folders you want Aurora to watch and remember. You can add more later in Settings.',
      icon: Folder,
      content: (
        <div className="space-y-4">
          <div className="text-sm leading-relaxed text-left" style={{ color: theme.colors.textSecondary }}>
            Aurora will scan these folders and create a visual index of your files. Everything stays local—nothing is uploaded anywhere.
          </div>
          
          {selectedFolders.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-left" style={{ color: theme.colors.textSecondary }}>Selected folders:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedFolders.map((path, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg text-left text-xs"
                    style={{
                      background: theme.components.card.background,
                      border: theme.components.card.border,
                    }}
                  >
                    <span className="truncate flex-1" style={{ color: theme.colors.text }}>{path}</span>
                    <button
                      onClick={() => setSelectedFolders(selectedFolders.filter((_, i) => i !== idx))}
                      className="ml-2 p-1 rounded hover:opacity-70"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={async () => {
              try {
                const selected = await open({ directory: true, multiple: true })
                const paths = (Array.isArray(selected) ? selected : selected ? [selected] : [])
                  .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
                if (paths.length > 0) {
                  setSelectedFolders([...selectedFolders, ...paths])
                }
              } catch (err) {
                console.error('Failed to select folders:', err)
              }
            }}
            className="w-full p-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
            style={{
              background: theme.components.card.background,
              border: `2px solid ${theme.colors.primary}`,
              color: theme.colors.text,
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Folder size={20} />
              <span>Add Folders</span>
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: theme.gradients.glow }}
            />
          </button>

          {selectedFolders.length === 0 && (
            <p className="text-xs italic" style={{ color: theme.colors.textSecondary }}>
              Tip: Start with Documents or Desktop to see Aurora in action
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'macOS Permissions',
      description: 'Aurora needs a few permissions to work properly. macOS will ask you to grant them.',
      icon: CalendarDays,
      content: (
        <div className="space-y-4 text-left">
          <div className="space-y-3">
            <div className="p-3 rounded-lg" style={{ background: theme.components.card.background, border: theme.components.card.border }}>
              <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>Full Disk Access</div>
              <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Required to scan and index your files. Go to <strong>System Settings → Privacy & Security → Full Disk Access</strong> and enable Aurora OS.
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: theme.components.card.background, border: theme.components.card.border }}>
              <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>Calendar Access (Optional)</div>
              <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Allows Aurora to show your Apple Calendar events. You can skip this if you don&apos;t want calendar integration.
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: theme.components.card.background, border: theme.components.card.border }}>
              <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>Automation (Optional)</div>
              <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Needed for calendar integration. macOS will prompt you when Aurora tries to access Calendar.
              </div>
            </div>
          </div>
          <p className="text-xs italic pt-2" style={{ color: theme.colors.textSecondary }}>
            All data stays on your Mac. Nothing is uploaded or synced to the cloud.
          </p>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const Icon = currentStep.icon

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    }
    onComplete(selectedFolders)
  }

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true')
    }
    onSkip()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden relative"
          style={{
            background: theme.components.card.background,
            border: `2px solid ${theme.colors.primary}40`,
            backdropFilter: theme.effects.blur,
            boxShadow: theme.effects.shadow,
          }}
        >
          {/* Progress bar */}
          <div className="h-1" style={{ background: theme.colors.surface }}>
            <motion.div
              className="h-full"
              style={{ background: theme.gradients.hero }}
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: theme.gradients.hero,
                  }}
                >
                  <Icon size={32} strokeWidth={2} style={{ color: '#ffffff' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-black mb-1"
                    style={{
                      fontFamily: theme.fonts.display,
                      color: theme.colors.text,
                    }}
                  >
                    {currentStep.title}
                  </h2>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Step {step + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: theme.colors.textSecondary }}
                title="Skip setup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="text-base mb-6" style={{ color: theme.colors.textSecondary }}>
              {currentStep.description}
            </p>

            {/* Content */}
            <div className="mb-8">{currentStep.content}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={step > 0 ? () => setStep(step - 1) : handleSkip}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={{
                  background: theme.components.card.background,
                  border: theme.components.card.border,
                  color: theme.colors.textSecondary,
                }}
              >
                {step > 0 ? 'Back' : 'Skip'}
              </button>

              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: idx === step ? theme.colors.primary : theme.colors.surface,
                      opacity: idx === step ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={step === 1 && selectedFolders.length === 0}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: step === 1 && selectedFolders.length === 0
                    ? theme.components.card.background
                    : theme.gradients.button,
                  border: step === 1 && selectedFolders.length === 0
                    ? theme.components.card.border
                    : 'none',
                  color: step === 1 && selectedFolders.length === 0
                    ? theme.colors.textSecondary
                    : '#ffffff',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {step === steps.length - 1 ? 'Get Started' : 'Next'}
                  {step < steps.length - 1 && <ArrowRight size={18} />}
                </span>
                {step !== 1 && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: theme.gradients.glow }}
                  />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function hasCompletedWelcome(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(WELCOME_STORAGE_KEY) === 'true'
}
