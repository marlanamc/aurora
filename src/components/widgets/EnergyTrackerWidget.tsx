'use client'

import { useState, useMemo } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { Zap } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { motion } from 'framer-motion'

type EnergyLog = {
  timestamp: number
  level: number // 1-5
  timeOfDay: 'morning' | 'afternoon' | 'evening'
}

type EnergyTrackerData = {
  logs: EnergyLog[]
}

export function EnergyTrackerWidget({
  theme,
  widgetId,
  getWidgetData,
  mergeWidgetData,
}: {
  theme: GlobalTheme
  widgetId: string
  getWidgetData: <T,>(id: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
  const raw = getWidgetData<EnergyTrackerData | EnergyLog[]>(widgetId, { logs: [] } as EnergyTrackerData)
  const logs = useMemo<EnergyLog[]>(() => {
    if (Array.isArray(raw)) return raw
    return Array.isArray(raw.logs) ? raw.logs : []
  }, [raw])
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const todayLogs = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
  }, [logs])

  const currentTimeLog = useMemo(() => {
    const timeOfDay = getTimeOfDay()
    return todayLogs.find((log) => log.timeOfDay === timeOfDay)
  }, [todayLogs])

  const logEnergy = (level: number) => {
    const newLog: EnergyLog = {
      timestamp: Date.now(),
      level,
      timeOfDay: getTimeOfDay(),
    }

    // Replace existing log for this time of day today, or add new
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const updatedLogs = [
      ...logs.filter((log) => {
        const logDate = new Date(log.timestamp)
        logDate.setHours(0, 0, 0, 0)
        const isToday = logDate.getTime() === today.getTime()
        return !isToday || log.timeOfDay !== newLog.timeOfDay
      }),
      newLog,
    ].slice(-30) // Keep last 30 logs

    mergeWidgetData<EnergyTrackerData>(widgetId, { logs: updatedLogs }, { logs: [] })
    setSelectedLevel(null)
  }

  const getLevelColor = (level: number) => {
    const colors = [
      theme.colors.error, // 1 - Very Low
      '#F59E0B', // 2 - Low
      '#FBBF24', // 3 - Medium
      '#10B981', // 4 - High
      theme.colors.success || '#34C759', // 5 - Very High
    ]
    return colors[level - 1] || theme.colors.textSecondary
  }

  const getLevelLabel = (level: number) => {
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
    return labels[level - 1] || 'Unknown'
  }

  const weeklyAverage = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekLogs = logs.filter((log) => log.timestamp >= weekAgo)
    if (weekLogs.length === 0) return null
    const sum = weekLogs.reduce((acc, log) => acc + log.level, 0)
    return (sum / weekLogs.length).toFixed(1)
  }, [logs])

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={Zap}
        title="Energy Check-In"
        subtitle={currentTimeLog ? `${getLevelLabel(currentTimeLog.level)} now` : 'How are you feeling?'}
      />

      <div className="space-y-4 mt-4">
        {/* Current Status */}
        {currentTimeLog && (
          <div className="p-3 rounded-xl" style={{ background: theme.colors.surface }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                {getTimeOfDay().charAt(0).toUpperCase() + getTimeOfDay().slice(1)}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: getLevelColor(currentTimeLog.level) }}
                />
                <span className="text-sm font-bold" style={{ color: getLevelColor(currentTimeLog.level) }}>
                  {currentTimeLog.level}/5
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Energy Level Selector */}
        <div className="space-y-2">
          <div className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
            How&apos;s your energy right now?
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.button
                key={level}
                onClick={() => {
                  setSelectedLevel(level)
                  setTimeout(() => logEnergy(level), 200)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                style={{
                  background:
                    selectedLevel === level
                      ? getLevelColor(level)
                      : currentTimeLog?.level === level
                        ? getLevelColor(level) + '30'
                        : theme.components.card.background,
                  border:
                    currentTimeLog?.level === level
                      ? `2px solid ${getLevelColor(level)}`
                      : theme.components.card.border,
                }}
              >
                <span
                  className="text-lg font-bold"
                  style={{
                    color:
                      selectedLevel === level || currentTimeLog?.level === level
                        ? '#ffffff'
                        : theme.colors.textSecondary,
                  }}
                >
                  {level}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      selectedLevel === level || currentTimeLog?.level === level
                        ? '#ffffff'
                        : getLevelColor(level),
                    opacity: selectedLevel === level || currentTimeLog?.level === level ? 1 : 0.3,
                  }}
                />
              </motion.button>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: theme.colors.textSecondary }}>
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Weekly Average */}
        {weeklyAverage && (
          <div className="pt-2 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: theme.colors.textSecondary }}>7-day average</span>
              <span className="font-semibold" style={{ color: theme.colors.text }}>
                {weeklyAverage}/5
              </span>
            </div>
          </div>
        )}

        {/* Today's Logs */}
        {todayLogs.length > 0 && (
          <div className="pt-2 border-t space-y-1" style={{ borderColor: theme.colors.border }}>
            <div className="text-xs font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
              Today
            </div>
            {['morning', 'afternoon', 'evening'].map((timeOfDay) => {
              const log = todayLogs.find((l) => l.timeOfDay === timeOfDay)
              return (
                <div key={timeOfDay} className="flex items-center justify-between text-xs">
                  <span style={{ color: theme.colors.textSecondary }}>
                    {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                  </span>
                  {log ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: getLevelColor(log.level) }}
                      />
                      <span style={{ color: theme.colors.text }}>{log.level}/5</span>
                    </div>
                  ) : (
                    <span style={{ color: theme.colors.textSecondary }}>—</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </UnifiedCard>
  )
}
