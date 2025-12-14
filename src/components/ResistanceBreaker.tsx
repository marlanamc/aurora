'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { createElement, useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'
import { Waves, Frown, Meh, HelpCircle, IceCream, Shield, Sparkles, type IconComponent } from '@/lib/icons'

type ResistanceType = 'Overwhelm' | 'Fear' | 'Boredom' | 'Imposter Syndrome' | 'Paralysis' | 'Perfectionism'

interface ResistanceBreakerProps {
  onActionSelected?: (resistanceType: string, action: string, helpful: boolean) => void
  favorites?: Record<string, string[]> // resistanceType -> favorite actions
}

const resistanceConfig: Record<ResistanceType, {
  icon: IconComponent
  color: string
  gradient: string
  microActions: string[]
}> = {
  'Overwhelm': {
    icon: Waves,
    color: 'text-blue-700',
    gradient: 'from-blue-100 to-cyan-100',
    microActions: [
      'Ignore the big picture. Find the first 2-minute physical action.',
      'Hide every window except the one you need.',
      'Write a "vomit draft" — quality is forbidden.',
      'Set a timer for 5 minutes. You are allowed to quit when it rings.',
    ],
  },
  'Fear': {
    icon: Frown,
    color: 'text-red-700',
    gradient: 'from-red-100 to-pink-100',
    microActions: [
      'What is the catastrophic outcome? Write it down to dismiss it.',
      'Permit yourself to waste the next hour fitting.',
      'Do the work in a throwaway file first.',
      'Lower your standards to the floor. Just ship garbage.',
    ],
  },
  'Boredom': {
    icon: Meh,
    color: 'text-yellow-700',
    gradient: 'from-yellow-100 to-orange-100',
    microActions: [
      'Speedrun: How much can you do in exactly 60 seconds?',
      'Put on high-bpm video game music (e.g. Mario Kart).',
      'Do the fun part first, even if it’s "out of order".',
      'Dictate the work out loud like an evil villain.',
    ],
  },
  'Imposter Syndrome': {
    icon: HelpCircle,
    color: 'text-purple-700',
    gradient: 'from-purple-100 to-indigo-100',
    microActions: [
      'You are researching/learning, not performing.',
      'Look at your "done" list. You have solved hard things before.',
      'Adopt a persona. How would a confident expert do this?',
      'Nobody actually knows what they are doing. You are fine.',
    ],
  },
  'Paralysis': {
    icon: IceCream,
    color: 'text-teal-700',
    gradient: 'from-teal-100 to-cyan-100',
    microActions: [
      'Do not "work". Just open the file and look at it.',
      'Type one sentence. Then you can stop.',
      'Stand up. Walk around the room once. Sit back down.',
      'Close your eyes and visualize the very first step.',
    ],
  },
  'Perfectionism': {
    icon: Sparkles,
    color: 'text-indigo-700',
    gradient: 'from-indigo-100 to-purple-100',
    microActions: [
      'Your goal is B-minus work. Do not aim higher.',
      'Intentionally leave one typo in the first draft.',
      'Quantity over quality. Fill the page.',
      'Draft in Comic Sans to force playfulness.',
    ],
  },
}

export function ResistanceBreaker({ onActionSelected, favorites }: ResistanceBreakerProps) {
  const [selectedResistance, setSelectedResistance] = useState<ResistanceType | null>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleResistanceSelect = (resistance: ResistanceType) => {
    setSelectedResistance(resistance)
    setSelectedAction(null)
    setShowFeedback(false)
  }

  const handleActionSelect = (action: string) => {
    setSelectedAction(action)
    setShowFeedback(true)
  }

  const handleFeedback = (helpful: boolean) => {
    if (selectedResistance && selectedAction) {
      onActionSelected?.(selectedResistance, selectedAction, helpful)
    }
    // Reset after feedback
    setTimeout(() => {
      setSelectedResistance(null)
      setSelectedAction(null)
      setShowFeedback(false)
    }, 2000)
  }

  const getActionsForResistance = (resistance: ResistanceType): string[] => {
    const favActions = favorites?.[resistance] || []
    const allActions = resistanceConfig[resistance].microActions
    // Show favorites first, then others
    const otherActions = allActions.filter((a) => !favActions.includes(a))
    return [...favActions, ...otherActions]
  }

  return (
    <UnifiedCard>
      {/* Header */}
      <UnifiedCardHeader
        icon={Shield}
        title="Feeling Stuck?"
        subtitle="Pick what it feels like. Aurora gives you one tiny, safe next step."
      />

      {/* Resistance Options */}
      {!selectedResistance ? (
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(resistanceConfig) as ResistanceType[]).map((resistance, index) => {
            const config = resistanceConfig[resistance]

            return (
              <motion.button
                key={resistance}
                className={`
                  rounded-xl p-4 text-left
                  bg-gradient-to-br ${config.gradient}
                  border-2 border-white/60
                  shadow-md hover:shadow-lg
                  transition-all duration-300
                  group
                `}
                onClick={() => handleResistanceSelect(resistance)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <config.icon size={48} className="text-gray-700" />
                  <span className={`font-semibold ${config.color}`}>
                    {resistance}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedResistance}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-4">
              <button
                onClick={() => setSelectedResistance(null)}
                className="text-sm mb-3 flex items-center gap-1 transition-colors"
                style={{ color: 'var(--aurora-text-secondary)' }}
              >
                ← Back
              </button>
              <div className="flex items-center gap-3 mb-4">
                {createElement(resistanceConfig[selectedResistance].icon, { size: 64, className: "text-gray-700" })}
                <h3 className={`text-xl font-bold ${resistanceConfig[selectedResistance].color}`}>
                  {selectedResistance}
                </h3>
              </div>
            </div>

            {/* Micro Actions */}
            {!selectedAction ? (
              <div className="space-y-2">
                {getActionsForResistance(selectedResistance).map((action, index) => {
                  const isFavorite = favorites?.[selectedResistance]?.includes(action)
                  return (
                  <motion.button
                    key={index}
                    className={`
                      w-full rounded-lg p-4 text-left
                      bg-white/80 backdrop-blur-sm
                      border-2 border-white/60
                      shadow-sm hover:shadow-md
                      transition-all duration-200
                      ${resistanceConfig[selectedResistance].color}
                      font-medium
                    `}
                    onClick={() => handleActionSelect(action)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{action}</span>
                      {isFavorite && (
                        <Sparkles size={16} className="text-yellow-500" />
                      )}
                    </div>
                  </motion.button>
                  )
                })}
              </div>
            ) : showFeedback ? (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="rounded-xl p-6 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 text-center">
                  <div className="flex justify-center mb-3">
                    <Sparkles size={80} className="text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-green-800 mb-2">
                    Your Micro-Action:
                  </h4>
                  <p className="text-green-700 font-semibold mb-4">
                    {selectedAction}
                  </p>
                </div>
                <div className="text-sm font-semibold text-center mb-2" style={{ color: 'var(--aurora-text-secondary)' }}>
                  Did this help?
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleFeedback(true)}
                    className="flex-1 py-3 rounded-xl font-semibold text-white"
                    style={{ background: '#10B981' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Yes ✓
                  </motion.button>
                  <motion.button
                    onClick={() => handleFeedback(false)}
                    className="flex-1 py-3 rounded-xl font-semibold"
                    style={{
                      background: 'var(--aurora-card-bg-default)',
                      border: '1px solid var(--aurora-card-border)',
                      color: 'var(--aurora-text)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Not really
                  </motion.button>
                </div>
              </motion.div>
            ) : (
          </motion.div>
        </AnimatePresence>
      )}
    </UnifiedCard>
  )
}
