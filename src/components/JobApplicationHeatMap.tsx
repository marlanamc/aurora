'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'
import { Flame, RefreshCw, Minus } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

interface HeatMapDay {
  date: Date
  count: number // Small actions / check-ins
  urgency: 'safe' | 'slipping' | 'concerning' | 'meltdown'
}

interface JobApplicationHeatMapProps {
  widgetId?: string
  onDayClick?: (date: Date) => void
  theme?: GlobalTheme
  days?: HeatMapDay[]
  onAddAction?: () => void
  onRemoveAction?: () => void // Decrease today's count
  onReset?: () => void // Reset all data
  todayCount?: number
  actionLabel?: string // Custom label for the action (e.g., "Job apps", "Exercises")
  goalPerDay?: number // Optional daily goal (e.g., 5 jobs apps per day)
  onConfigChange?: (config: { label: string; goalPerDay?: number }) => void
}

const urgencyLabels = {
  safe: 'On track',
  slipping: 'Slipping',
  concerning: 'Concerning',
  meltdown: 'High-friction zone',
}

// Export settings panel component for use in flippable widget
export function HeatMapSettingsPanel({
  theme,
  settingsLabel,
  setSettingsLabel,
  settingsGoal,
  setSettingsGoal,
  onSave,
}: {
  theme?: GlobalTheme
  settingsLabel: string
  setSettingsLabel: (v: string) => void
  settingsGoal: string
  setSettingsGoal: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: theme?.colors.text }}>
          Settings
        </h3>
        <p className="text-xs" style={{ color: theme?.colors.textSecondary }}>
          Configure your tracking
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: theme?.colors.textSecondary }}>
            Label
          </label>
          <input
            value={settingsLabel}
            onChange={(e) => setSettingsLabel(e.target.value)}
            placeholder="e.g. Job apps, Exercises"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1px solid ${theme?.colors.border || 'rgba(255,255,255,0.2)'}`,
              color: theme?.colors.text,
            }}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: theme?.colors.textSecondary }}>
            Daily Goal (optional)
          </label>
          <input
            type="number"
            min="1"
            value={settingsGoal}
            onChange={(e) => setSettingsGoal(e.target.value)}
            placeholder="e.g. 5"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1px solid ${theme?.colors.border || 'rgba(255,255,255,0.2)'}`,
              color: theme?.colors.text,
            }}
          />
          <p className="text-xs mt-1" style={{ color: theme?.colors.textSecondary }}>
            Leave empty for no daily goal
          </p>
        </div>

        <div className="pt-4 mt-auto">
          <button
            onClick={onSave}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: theme?.gradients.button || 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#000000',
              boxShadow: theme?.effects.shadow || '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export function JobApplicationHeatMap({
  widgetId,
  onDayClick,
  theme,
  days,
  onAddAction,
  onRemoveAction,
  onReset,
  todayCount,
  actionLabel = 'Action',
  goalPerDay,
  onConfigChange,
}: JobApplicationHeatMapProps) {
  const [settingsLabel, setSettingsLabel] = useState(actionLabel)
  const [settingsGoal, setSettingsGoal] = useState(goalPerDay?.toString() || '')

  // Update settings state when props change
  useEffect(() => {
    setSettingsLabel(actionLabel)
    setSettingsGoal(goalPerDay?.toString() || '')
  }, [actionLabel, goalPerDay])
  // Dynamic colors based on theme
  const getUrgencyColor = (urgency: 'safe' | 'slipping' | 'concerning' | 'meltdown') => {
    if (!theme) return { bg: '#10B981', hover: '#059669' } // fallback green

    switch (urgency) {
      case 'safe':
        return { bg: theme.colors.success, hover: theme.colors.success }
      case 'slipping':
        return { bg: theme.colors.warning, hover: theme.colors.warning }
      case 'concerning':
        return { bg: theme.colors.error, hover: theme.colors.error }
      case 'meltdown':
        return { bg: theme.colors.primary, hover: theme.colors.primary }
      default:
        return { bg: theme.colors.primary, hover: theme.colors.primary }
    }
  }
  const heatMapData = days ?? []
  const [hoveredDay, setHoveredDay] = useState<HeatMapDay | null>(null)

  // Calculate stats
  const totalActions = heatMapData.reduce((sum, day) => sum + day.count, 0)
  const currentStreak = calculateStreak(heatMapData)
  const currentUrgency = heatMapData[heatMapData.length - 1]?.urgency || 'safe'
  const hasActivity = totalActions > 0

  const cellSizePx = 14
  const showGrid = heatMapData.length > 0 && hasActivity // Only show grid if there's activity

  const handleSaveSettings = () => {
    if (onConfigChange) {
      const goalValue = settingsGoal.trim()
      const parsedGoal = goalValue ? parseInt(goalValue, 10) : undefined
      onConfigChange({
        label: settingsLabel.trim() || 'Action',
        goalPerDay: parsedGoal && !isNaN(parsedGoal) ? parsedGoal : undefined,
      })
    }
  }

  // Settings panel component - exported for use in flippable widget
  const settingsPanel = onConfigChange ? (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: theme?.colors.text }}>
          Settings
        </h3>
        <p className="text-xs" style={{ color: theme?.colors.textSecondary }}>
          Configure your tracking
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: theme?.colors.textSecondary }}>
            Label
          </label>
          <input
            value={settingsLabel}
            onChange={(e) => setSettingsLabel(e.target.value)}
            placeholder="e.g. Job apps, Exercises"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1px solid ${theme?.colors.border || 'rgba(255,255,255,0.2)'}`,
              color: theme?.colors.text,
            }}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: theme?.colors.textSecondary }}>
            Daily Goal (optional)
          </label>
          <input
            type="number"
            min="1"
            value={settingsGoal}
            onChange={(e) => setSettingsGoal(e.target.value)}
            placeholder="e.g. 5"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1px solid ${theme?.colors.border || 'rgba(255,255,255,0.2)'}`,
              color: theme?.colors.text,
            }}
          />
          <p className="text-xs mt-1" style={{ color: theme?.colors.textSecondary }}>
            Leave empty for no daily goal
          </p>
        </div>

        <div className="pt-4 mt-auto">
          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: theme?.gradients.button || 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#000000',
              boxShadow: theme?.effects.shadow || '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  ) : undefined

  const todayProgress = goalPerDay && typeof todayCount === 'number' 
    ? `${todayCount} / ${goalPerDay}` 
    : typeof todayCount === 'number' && todayCount > 0 
    ? todayCount.toString() 
    : null

  return (
    <UnifiedCard fullHeight padding="sm">
      {/* Header */}
      <UnifiedCardHeader
        icon={Flame}
        title="Small Steps"
        action={
          <div className="flex items-center gap-2 pr-12">
            {onReset && hasActivity && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Reset all ${actionLabel.toLowerCase()} data? This can't be undone.`)) {
                    onReset()
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                style={{ color: theme?.colors.error || '#EF4444' }}
                title="Reset all data"
              >
                <RefreshCw size={14} strokeWidth={2} />
              </button>
            )}
            {showGrid && onAddAction && (
              <div 
                className="flex items-center rounded-full overflow-hidden"
                style={{
                  background: theme?.gradients.button || 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: theme?.effects.shadow || '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                {onRemoveAction && typeof todayCount === 'number' && todayCount > 0 && (
                  <button
                    type="button"
                    onClick={onRemoveAction}
                    className="px-2.5 py-1.5 flex items-center justify-center transition-all hover:bg-black/10 active:bg-black/20"
                    style={{ color: '#000000' }}
                    title={`Remove one ${actionLabel.toLowerCase()} from today`}
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                )}
                <div 
                  className="px-3 py-1.5 text-xs font-semibold flex items-center justify-center border-x"
                  style={{ 
                    color: '#000000',
                    borderColor: 'rgba(0,0,0,0.15)',
                  }}
                >
                  {todayProgress || (typeof todayCount === 'number' ? todayCount : 0)}
                </div>
                <button
                  type="button"
                  onClick={onAddAction}
                  className="px-2.5 py-1.5 flex items-center justify-center transition-all hover:bg-black/10 active:bg-black/20"
                  style={{ color: '#000000' }}
                  title={`Add one ${actionLabel.toLowerCase()} today`}
                >
                  <span className="text-base leading-none">+</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Stats - only show if there's activity */}
      {hasActivity && (
        <div className="flex gap-3 mb-3">
          <div
            className="flex-1 rounded-lg p-2 backdrop-blur-sm"
            style={{
              background: 'var(--aurora-card-bg-subtle, rgba(255, 255, 255, 0.6))',
              border: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
            }}
          >
            <div className="text-xl font-bold leading-none" style={{ color: 'var(--aurora-text, #111827)' }}>
              {totalActions}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
              This week
            </div>
          </div>
          {goalPerDay && typeof todayCount === 'number' ? (
            <div
              className="flex-1 rounded-lg p-2 backdrop-blur-sm"
              style={{
                background: 'var(--aurora-card-bg-subtle, rgba(255, 255, 255, 0.6))',
                border: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
              }}
            >
              <div className="text-xl font-bold leading-none" style={{ color: 'var(--aurora-text, #111827)' }}>
                {todayCount} / {goalPerDay}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
                Today&apos;s goal
              </div>
            </div>
          ) : currentStreak > 0 ? (
            <div
              className="flex-1 rounded-lg p-2 backdrop-blur-sm"
              style={{
                background: 'var(--aurora-card-bg-subtle, rgba(255, 255, 255, 0.6))',
                border: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
              }}
            >
              <div className="text-xl font-bold leading-none" style={{ color: 'var(--aurora-text, #111827)' }}>
                {currentStreak}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
                Day streak
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Heat Map Grid */}
      {showGrid ? (
        <div className="mb-4 overflow-x-auto">
          <div className="grid gap-1.5 min-w-max" style={{ gridTemplateColumns: `repeat(14, ${cellSizePx}px)` }}>
            {heatMapData.map((day, index) => {
              const intensity = day.count > 0 ? Math.min(day.count / 3, 1) : 0
              const colors = getUrgencyColor(day.urgency)

              return (
                <motion.div
                  key={index}
                  className="rounded-[3px] cursor-pointer transition-all duration-150"
                  style={{
                    width: cellSizePx,
                    height: cellSizePx,
                    background: day.count > 0 ? colors.bg : 'transparent',
                    border: day.count > 0 ? 'none' : `1px solid ${theme?.colors.border || '#E5E7EB'}40`,
                    opacity: day.count > 0 ? 0.7 + intensity * 0.3 : 0.15,
                    boxShadow: intensity > 0 ? `0 1px 3px ${colors.bg}30` : 'none',
                  }}
                  whileHover={{
                    scale: 1.8,
                    zIndex: 10,
                    background: day.count > 0 ? colors.hover : theme?.colors.border || '#D1D5DB',
                  }}
                  onHoverStart={() => setHoveredDay(day)}
                  onHoverEnd={() => setHoveredDay(null)}
                  onClick={() => onDayClick?.(day.date)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.002 }}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <div className="text-sm mb-2" style={{ color: theme?.colors.textSecondary || 'var(--aurora-text-secondary)' }}>
            Ready to start?
          </div>
          {onAddAction && (
            <button
              type="button"
              onClick={onAddAction}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: theme?.gradients.button || 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000000',
                boxShadow: theme?.effects.shadow || '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Log your first {actionLabel.toLowerCase()}
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      {showGrid && (
        <div className="flex items-center gap-3 text-[11px]" style={{ color: theme?.colors.textSecondary }}>
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[2px]" style={{ background: theme?.colors.border || '#E5E7EB' }} />
            <div className="w-3 h-3 rounded-[2px]" style={{ background: getUrgencyColor('safe').bg }} />
            <div className="w-3 h-3 rounded-[2px]" style={{ background: getUrgencyColor('slipping').bg }} />
            <div className="w-3 h-3 rounded-[2px]" style={{ background: getUrgencyColor('concerning').bg }} />
            <div className="w-3 h-3 rounded-[2px]" style={{ background: getUrgencyColor('meltdown').bg }} />
          </div>
          <span>More</span>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredDay && (
        <motion.div
          className="fixed text-xs rounded-lg px-3 py-2 z-50 pointer-events-none liquid-glass"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--aurora-text, #111827)',
            ['--aurora-glass-bg' as any]: 'var(--aurora-card-bg-default, rgba(255, 255, 255, 0.85))',
            ['--aurora-glass-border' as any]: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
            ['--aurora-glass-shadow' as any]: '0 12px 40px rgba(0,0,0,0.25)',
          }}
        >
          <div className="font-semibold">
            {hoveredDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
            {hoveredDay.count} {hoveredDay.count === 1 ? actionLabel.toLowerCase() : `${actionLabel.toLowerCase()}s`}
          </div>
        </motion.div>
      )}

    </UnifiedCard>
  )
}

function calculateStreak(days: HeatMapDay[]): number {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}
