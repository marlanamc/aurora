'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { QuestRewardAnimation } from './QuestRewardAnimation'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'
import { FileText, Sparkles, Save, Users, Zap, CheckCircle2, Plus, X, type IconComponent } from '@/lib/icons'

export interface Quest {
  id: string
  title: string
  description: string
  timeEstimate: string
  theme: 'apply' | 'refresh' | 'save' | 'connect'
  completed: boolean
  reward: string
}

interface DailyQuestSystemProps {
  onUpdate?: (quests: Quest[]) => void
  quests?: Quest[]
}

const themeConfig: Record<string, { icon: IconComponent; gradient: string; color: string; label: string }> = {
  apply: {
    icon: FileText,
    gradient: 'from-blue-400 to-purple-500',
    color: 'text-blue-700',
    label: 'Deep Work',
  },
  refresh: {
    icon: Sparkles,
    gradient: 'from-purple-400 to-pink-500',
    color: 'text-purple-700',
    label: 'Refresh',
  },
  save: {
    icon: Save,
    gradient: 'from-green-400 to-teal-500',
    color: 'text-green-700',
    label: 'Admin',
  },
  connect: {
    icon: Users,
    gradient: 'from-orange-400 to-red-500',
    color: 'text-orange-700',
    label: 'Connect',
  },
}

export function DailyQuestSystem({ onUpdate, quests: initialQuests }: DailyQuestSystemProps) {
  const quests = initialQuests ?? []
  const [showReward, setShowReward] = useState<Quest | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // New quest form state
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('5m')
  const [newTheme, setNewTheme] = useState<keyof typeof themeConfig>('apply')

  const handleQuestClick = (quest: Quest) => {
    if (quest.completed) return

    const next = quests.map(q =>
      q.id === quest.id ? { ...q, completed: true } : q
    )

    // Notify parent
    onUpdate?.(next)

    // Show reward animation
    setShowReward(quest)
    setTimeout(() => setShowReward(null), 3000)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const next = quests.filter(q => q.id !== id)
    onUpdate?.(next)
  }

  const handleAddQuest = () => {
    if (!newTitle.trim()) return

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: 'Custom quest', // Simplified for quick entry
      timeEstimate: newTime,
      theme: newTheme as 'apply' | 'refresh' | 'save' | 'connect',
      completed: false,
      reward: 'Momentum',
    }

    onUpdate?.([...quests, newQuest])
    setIsAdding(false)
    setNewTitle('')
    setNewTime('5m')
  }

  const completedCount = quests.filter((q) => q.completed).length
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0

  return (
    <UnifiedCard fullHeight>
      {/* Header */}
      <UnifiedCardHeader
        icon={Zap}
        title="One Small Thing"
        subtitle="One small thing you might do today, if it feels right."
        action={
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold" style={{ color: 'var(--aurora-text-secondary)' }}>
              {completedCount}/{quests.length}
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Add Quest"
            >
              {isAdding ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>
        }
      />

      {/* Progress Bar */}
      {quests.length > 0 && (
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: 'var(--aurora-card-border)' }}>
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Quest title..."
                className="w-full px-3 py-2 rounded-lg bg-transparent border border-black/10 dark:border-white/10 outline-none text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuest()}
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-transparent border border-black/10 dark:border-white/10 text-xs outline-none"
                >
                  <option value="2m">2m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="25m">25m</option>
                </select>
                <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
                  {(Object.keys(themeConfig) as Array<keyof typeof themeConfig>).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setNewTheme(theme)}
                      className={`
                        px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        border transition-all
                        ${newTheme === theme
                          ? 'border-current bg-current text-white dark:text-black opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-100'
                        }
                      `}
                      style={{ color: newTheme === theme ? undefined : 'var(--aurora-text-secondary)' }}
                    >
                      {themeConfig[theme].label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddQuest}
                  disabled={!newTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quests Grid */}
      {quests.length === 0 && !isAdding ? (
        <div className="text-sm flex flex-col items-center justify-center py-8 text-center" style={{ color: 'var(--aurora-text-secondary)' }}>
          <p>No quests active.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-blue-500 hover:underline mt-1 font-medium"
          >
            Create one?
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {quests.map((quest, index) => {
              const theme = themeConfig[quest.theme]

              return (
                <motion.div
                  key={quest.id}
                  layout
                  className={`
                    relative rounded-lg p-3 cursor-pointer
                    bg-gradient-to-br ${theme.gradient}
                    border-2 ${quest.completed ? 'border-white/80' : 'border-white/40'}
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                    ${quest.completed ? 'opacity-60' : 'opacity-100'}
                    overflow-hidden group
                  `}
                  onClick={() => handleQuestClick(quest)}
                  whileHover={quest.completed ? {} : { scale: 1.02, y: -2 }}
                  whileTap={quest.completed ? {} : { scale: 0.98 }}
                  initial={false}
                  animate={false}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Delete Button (visible on hover) */}
                  <button
                    onClick={(e) => handleDelete(e, quest.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-500"
                    title="Delete Quest"
                  >
                    <X size={12} />
                  </button>

                  {/* Completion Checkmark */}
                  {quest.completed && (
                    <motion.div
                      className="absolute top-2 right-2 z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 size={24} className="text-white" strokeWidth={2} />
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-2 mb-2">
                      <theme.icon size={24} className="text-white" strokeWidth={2} />
                      <div className="flex-1 pr-4">
                        <h3 className={`text-sm font-semibold text-white mb-0.5 leading-snug ${quest.completed ? 'line-through' : ''}`}>
                          {quest.title}
                        </h3>
                      </div>
                    </div>

                    {/* Time Estimate */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded">
                        {quest.timeEstimate}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <QuestRewardAnimation quest={showReward} />
        )}
      </AnimatePresence>
    </UnifiedCard>
  )
}
