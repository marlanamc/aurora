'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Quest } from './DailyQuestSystem'
import { Trophy, Sparkles } from '@/lib/icons'

interface QuestRewardAnimationProps {
  quest: Quest
}

export function QuestRewardAnimation({ quest }: QuestRewardAnimationProps) {
  // Removed confetti generation for performance


  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti Particles */}
      {/* Confetti Particles (Removed for performance) */}


      {/* Reward Message */}
      <motion.div
        className="liquid-glass rounded-2xl p-8 text-center max-w-md"
        style={{
          ['--aurora-glass-bg' as any]: 'var(--aurora-card-bg-glass, rgba(255, 255, 255, 0.8))',
          ['--aurora-glass-border' as any]: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
          ['--aurora-glass-shadow' as any]: '0 24px 90px rgba(0,0,0,0.25)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.div
          className="flex justify-center mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 0.3,
          }}
        >
          <Trophy size={96} className="text-yellow-500" />
        </motion.div>

        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--aurora-text, #111827)' }}>
          Quest Complete!
        </h3>

        <p className="text-lg font-semibold mb-1" style={{ color: 'var(--aurora-primary, #7C3AED)' }}>
          {quest.reward}
        </p>

        <p className="text-sm" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
          {quest.title}
        </p>

        {/* Progress Indicator */}
        <motion.div
          className="mt-4 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles size={48} style={{ color: 'var(--aurora-secondary, #5B21B6)' }} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
