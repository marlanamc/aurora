'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ExternalLink } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

type Props = {
  theme: GlobalTheme
  permissionType: 'full-disk' | 'calendar' | 'automation'
  onDismiss: () => void
}

const PERMISSION_GUIDES = {
  'full-disk': {
    title: 'Full Disk Access Required',
    description: 'Aurora needs Full Disk Access to scan and index your files.',
    steps: [
      'Open System Settings',
      'Go to Privacy & Security → Full Disk Access',
      'Click the lock icon and enter your password',
      'Click "+" and add Aurora OS',
      'Enable the toggle for Aurora OS',
    ],
    link: 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles',
  },
  calendar: {
    title: 'Calendar Access',
    description: 'Allow Aurora to show your Apple Calendar events.',
    steps: [
      'macOS will prompt you automatically',
      'Or go to System Settings → Privacy & Security → Calendars',
      'Enable Aurora OS',
    ],
    link: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Calendars',
  },
  automation: {
    title: 'Automation Permission',
    description: 'Required for Calendar integration to work.',
    steps: [
      'macOS will prompt you when Aurora accesses Calendar',
      'Or go to System Settings → Privacy & Security → Automation',
      'Enable Aurora OS → Calendar',
    ],
    link: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Automation',
  },
} as const

export function PermissionHelper({ theme, permissionType, onDismiss }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const guide = PERMISSION_GUIDES[permissionType]

  const openSystemSettings = () => {
    // Try to open macOS System Settings to the specific pane
    if (guide.link) {
      window.open(guide.link, '_blank')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 rounded-xl overflow-hidden"
        style={{
          background: theme.components.card.background,
          border: `2px solid ${theme.colors.primary}40`,
          backdropFilter: theme.effects.blur,
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: theme.colors.primary + '20' }}>
              <AlertCircle size={20} style={{ color: theme.colors.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>
                {guide.title}
              </h3>
              <p className="text-xs mb-3" style={{ color: theme.colors.textSecondary }}>
                {guide.description}
              </p>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mb-3">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: theme.colors.primary + '20',
                              color: theme.colors.primary,
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            {idx + 1}
                          </div>
                          <span style={{ color: theme.colors.textSecondary }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: isExpanded ? theme.colors.surfaceHover : 'transparent',
                    color: theme.colors.primary,
                  }}
                >
                  {isExpanded ? 'Hide Steps' : 'Show Steps'}
                </button>
                {guide.link && (
                  <button
                    onClick={openSystemSettings}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    style={{
                      background: theme.gradients.button,
                      color: '#ffffff',
                    }}
                  >
                    <span>Open Settings</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ color: theme.colors.textSecondary }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
