'use client'

import { motion } from 'framer-motion'
import { Folder, Sparkles, Settings as SettingsIcon, ArrowRight } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

type Props = {
  theme: GlobalTheme
  onOpenSettings: () => void
  hasScanSources: boolean
}

export function EmptyState({ theme, onOpenSettings, hasScanSources }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] px-6 py-12"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-8"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: theme.gradients.hero,
            boxShadow: theme.effects.shadow,
          }}
        >
          <Sparkles size={48} strokeWidth={2} style={{ color: '#ffffff' }} />
        </div>
      </motion.div>

      <h2
        className="text-3xl font-black mb-3 text-center"
        style={{
          fontFamily: theme.fonts.display,
          color: theme.colors.text,
        }}
      >
        {hasScanSources ? 'Ready to Index!' : 'Welcome to Aurora OS ✨'}
      </h2>

      <p
        className="text-base mb-8 text-center max-w-md"
        style={{ color: theme.colors.textSecondary }}
      >
        {hasScanSources
          ? 'Your folders are configured. Click below to start indexing your files and bring them to life.'
          : 'Aurora transforms your files into a visual, emotionally intuitive memory layer. Start by adding folders to index.'}
      </p>

      <div className="space-y-4 w-full max-w-md">
        {!hasScanSources && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl"
            style={{
              background: theme.components.card.background,
              border: theme.components.card.border,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: theme.colors.primary + '20' }}>
                <Folder size={20} style={{ color: theme.colors.primary }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>
                  Step 1: Add Folders
                </div>
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  Choose which folders Aurora should watch and index. Common choices: Documents, Desktop, Downloads.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={onOpenSettings}
          className="w-full p-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
          style={{
            background: theme.gradients.button,
            color: '#ffffff',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <SettingsIcon size={20} />
            <span>{hasScanSources ? 'Start Indexing' : 'Open Settings'}</span>
            <ArrowRight size={18} />
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: theme.gradients.glow }}
          />
        </motion.button>

        {hasScanSources && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-center italic"
            style={{ color: theme.colors.textSecondary }}
          >
            Tip: You can also drag and drop folders onto Aurora to add them quickly
          </motion.p>
        )}
      </div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl"
      >
        {[
          {
            icon: Sparkles,
            title: 'Visual Memory',
            description: 'Files become colorful, recognizable tiles',
          },
          {
            icon: Folder,
            title: 'Smart Resurfacing',
            description: 'Forgotten files come back when they matter',
          },
          {
            icon: SettingsIcon,
            title: 'Emotional Tags',
            description: 'Organize by mood, season, vibe—not just folders',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="p-4 rounded-xl text-center"
              style={{
                background: theme.components.card.background,
                border: theme.components.card.border,
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: theme.colors.primary + '15' }}>
                <Icon size={20} style={{ color: theme.colors.primary }} />
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>
                {feature.title}
              </div>
              <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                {feature.description}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
