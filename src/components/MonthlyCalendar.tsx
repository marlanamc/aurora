'use client'

import { useMemo } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { CalendarDays } from '@/lib/icons'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeekSunday(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function MonthlyCalendar() {
  const today = useMemo(() => new Date(), [])
  const monthStart = useMemo(() => startOfMonth(today), [today])
  const monthEnd = useMemo(() => endOfMonth(today), [today])

  const gridDays = useMemo(() => {
    const start = startOfWeekSunday(monthStart)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [monthStart])

  const monthLabel = useMemo(() => {
    return today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }, [today])

  const weekday = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={CalendarDays}
        title={monthLabel}
        subtitle="Monthly calendar"
      />

      <div className="grid grid-cols-7 gap-1">
        {weekday.map((d) => (
          <div
            key={d}
            className="text-[11px] font-semibold text-center py-1"
            style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}
          >
            {d}
          </div>
        ))}

        {gridDays.map((d) => {
          const inMonth = d.getMonth() === today.getMonth()
          const isToday = isSameDay(d, today)
          const isPast = d < today && !isToday

          return (
            <div
              key={d.toISOString()}
              className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
              style={{
                color: isToday
                  ? '#ffffff'
                  : inMonth
                    ? 'var(--aurora-text, #111827)'
                    : 'var(--aurora-text-secondary, rgba(17,24,39,0.45))',
                background: isToday
                  ? 'var(--aurora-primary, #3B82F6)'
                  : 'transparent',
                border: isToday
                  ? '1px solid rgba(255,255,255,0.35)'
                  : inMonth
                    ? '1px solid var(--aurora-card-border, rgba(255,255,255,0.28))'
                    : '1px solid transparent',
                opacity: inMonth ? 1 : 0.7,
                boxShadow: isToday ? '0 10px 30px rgba(0,0,0,0.18)' : 'none',
                backdropFilter: isToday ? 'blur(8px)' : undefined,
                filter: isPast && inMonth ? 'saturate(0.9)' : undefined,
              }}
              title={d.toLocaleDateString()}
            >
              {d.getDate()}
            </div>
          )
        })}
      </div>
    </UnifiedCard>
  )
}

