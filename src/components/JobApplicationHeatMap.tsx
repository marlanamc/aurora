'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'
import { Flame } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

interface HeatMapDay {
  date: Date
  count: number // Small actions / check-ins
  urgency: 'safe' | 'slipping' | 'concerning' | 'meltdown'
}

interface JobApplicationHeatMapProps {
  onDayClick?: (date: Date) => void
  theme?: GlobalTheme
  days?: HeatMapDay[]
  onAddAction?: () => void
  todayCount?: number
  actionLabel?: string // Custom label for the action (e.g., "Applied", "Exercised")
  goalPerWeek?: number // Optional goal per week
}

const urgencyLabels = {
  safe: 'On track',
  slipping: 'Slipping',
  concerning: 'Concerning',
  meltdown: 'High-friction zone',
}

export function JobApplicationHeatMap({
  onDayClick,
  theme,
  days,
  onAddAction,
  todayCount,
  actionLabel = 'Action',
  goalPerWeek,
}: JobApplicationHeatMapProps) {
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

  const cellSizePx = 14
  const showGrid = heatMapData.length > 0

  return (
    <UnifiedCard fullHeight padding="sm">
      {/* Header */}
      <UnifiedCardHeader
        icon={Flame}
        title="Small Steps"
        subtitle="A gentle visual of progress (or not—both are valid)"
        action={
          showGrid ? (
            <div className="flex items-center gap-2">
              {onAddAction && (
                <button
                  type="button"
                  onClick={onAddAction}
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: theme?.colors.surfaceHover || 'rgba(0,0,0,0.06)',
                    border: theme?.components?.card?.border || '1px solid rgba(255,255,255,0.28)',
                    color: theme?.colors.text || 'var(--aurora-text)',
                  }}
                  title={`Log one ${actionLabel.toLowerCase()} today`}
                >
                  +1 {typeof todayCount === 'number' ? `(${todayCount})` : ''}
                </button>
              )}
              <div
                className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{
                  background: getUrgencyColor(currentUrgency).bg,
                }}
              >
                {urgencyLabels[currentUrgency]}
              </div>
            </div>
          ) : (
            <div
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: theme?.colors.border || 'rgba(0,0,0,0.08)',
                color: theme?.colors.textSecondary || 'rgba(17,24,39,0.72)',
              }}
            >
              No data
            </div>
          )
        }
      />

      {/* Stats */}
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
            Total {actionLabel}s
          </div>
        </div>
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
            Streak
          </div>
        </div>
      </div>

      {/* Heat Map Grid */}
      {showGrid ? (
        <div className="mb-4 overflow-x-auto">
          <div className="grid gap-1 min-w-max" style={{ gridTemplateColumns: `repeat(13, ${cellSizePx}px)` }}>
            {heatMapData.map((day, index) => {
              const intensity = day.count > 0 ? Math.min(day.count / 3, 1) : 0
              const colors = getUrgencyColor(day.urgency)

              return (
                <motion.div
                  key={index}
                  className="rounded-[2px] cursor-pointer transition-all duration-150"
                  style={{
                    width: cellSizePx,
                    height: cellSizePx,
                    background: day.count > 0 ? colors.bg : theme?.colors.border || '#E5E7EB',
                    opacity: day.count > 0 ? 0.6 + intensity * 0.4 : 0.3,
                    boxShadow: intensity > 0 ? `0 1px 2px ${theme?.colors.primary}20` : 'none',
                  }}
                  whileHover={{
                    scale: 1.6,
                    zIndex: 10,
                    background: day.count > 0 ? colors.hover : theme?.colors.border || '#D1D5DB',
                  }}
                  onHoverStart={() => setHoveredDay(day)}
                  onHoverEnd={() => setHoveredDay(null)}
                  onClick={() => onDayClick?.(day.date)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.001 }}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-sm mb-4" style={{ color: theme?.colors.textSecondary || 'var(--aurora-text-secondary)' }}>
          No momentum data yet.
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
