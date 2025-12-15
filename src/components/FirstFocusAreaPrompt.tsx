'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { AddFocusAreaDialog } from './AddFocusAreaDialog'
import type { ValueIconId } from '@/lib/value-icons'

type FirstFocusAreaPromptProps = {
  theme?: GlobalTheme
  onOpenSettings: () => void
  onAddFocusArea: (name: string, iconId: ValueIconId, colorPair: readonly [string, string]) => void
}

export function FirstFocusAreaPrompt({ theme, onOpenSettings, onAddFocusArea }: FirstFocusAreaPromptProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
          background: theme ? `${theme.colors.primary}15` : 'rgba(59, 130, 246, 0.15)',
          border: `2px dashed ${theme?.colors.primary ?? 'var(--aurora-primary, #3B82F6)'}40`,
        }}
      >
        <Sparkles size={32} style={{ color: theme?.colors.primary ?? 'var(--aurora-primary, #3B82F6)' }} strokeWidth={2} />
      </motion.div>

      <h2
        className="text-3xl font-black mb-8 text-center"
        style={{ color: theme?.colors.text ?? 'var(--aurora-text, #111827)' }}
      >
        Welcome to Aurora
      </h2>

      <motion.button
        onClick={() => setIsDialogOpen(true)}
        className="px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2"
        style={{
          background: theme?.gradients.button ?? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#000000',
          boxShadow: theme?.effects.shadow ?? '0 4px 12px rgba(0,0,0,0.15)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Your First Focus Area
      </motion.button>

      <p
        className="text-xs mt-6 text-center max-w-sm opacity-60"
        style={{ color: theme?.colors.textSecondary ?? 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}
      >
        Aurora learns from how you use it. Start simple—let it grow with you.
      </p>

      {theme && (
        <AddFocusAreaDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          theme={theme}
          onAdd={onAddFocusArea}
        />
      )}
    </motion.div>
  )
}

