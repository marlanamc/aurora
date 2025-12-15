'use client'

import { useMemo, useState, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { TrendingUp, X, PenTool } from '@/lib/icons'
import { appleCalendarListEvents, isTauri, type AppleCalendarEvent } from '@/lib/tauri'

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

export type WeeklyCalendarValue = {
  note: string
}

type WeeklyCalendarProps = {
  value: WeeklyCalendarValue
  onChange: (partial: Partial<WeeklyCalendarValue>) => void
  showAppleCalendar?: boolean
}

export function WeeklyCalendar({ value, onChange, showAppleCalendar = false }: WeeklyCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const weekStart = useMemo(() => startOfWeekSunday(today), [today])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekday = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const [calendarEvents, setCalendarEvents] = useState<AppleCalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (showAppleCalendar && isTauri()) {
      setLoadingEvents(true)
      appleCalendarListEvents(weekStart.getTime(), weekEnd.getTime() + 24 * 60 * 60 * 1000)
        .then((events) => {
          setCalendarEvents(events)
          setLoadingEvents(false)
        })
        .catch(() => {
          setLoadingEvents(false)
        })
    }
  }, [showAppleCalendar, weekStart, weekEnd])

  const getEventsForDay = (date: Date): AppleCalendarEvent[] => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return calendarEvents.filter((ev) => {
      const evStart = new Date(ev.start_ms)
      return evStart >= dayStart && evStart <= dayEnd
    })
  }

  const rangeLabel = useMemo(() => {
    const startLabel = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const endLabel = addDays(weekStart, 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return `${startLabel} – ${endLabel}`
  }, [weekStart])

  const [isEditing, setIsEditing] = useState(!value.note)
  const [draftNote, setDraftNote] = useState(value.note)

  const handleSet = () => {
    if (draftNote.trim()) {
      onChange({ note: draftNote.trim() })
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setDraftNote(value.note)
    setIsEditing(true)
  }

  const handleClear = () => {
    onChange({ note: '' })
    setDraftNote('')
    setIsEditing(true)
  }

  // Color palette for chips
  const chipColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff' },
    // Cyan gradients need dark text in light mode for contrast
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#0B1220' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#000000' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#000000' },
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#ffffff' },
  ]
  const chipColor = chipColors[weekStart.getDate() % chipColors.length]

  return (
    <UnifiedCard padding="sm">
      <div className="-mb-2">
        <UnifiedCardHeader icon={TrendingUp} title="This Week" subtitle={rangeLabel} />
      </div>

      {/* Intention Chip - shown when set */}
      {!isEditing && value.note && (
        <div className="mb-3">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{
              background: chipColor.bg,
              color: chipColor.text,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span className="text-sm font-semibold flex-1">{value.note}</span>
            <button
              type="button"
              onClick={handleEdit}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors"
              style={{ color: chipColor.text }}
              title="Edit intention"
            >
              <PenTool size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors"
              style={{ color: chipColor.text }}
              title="Clear intention"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

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

        {days.map((d) => {
          const isToday = isSameDay(d, today)
          const dayEvents = showAppleCalendar ? getEventsForDay(d) : []

          return (
            <div
              key={d.toISOString()}
              className="h-10 rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative"
              style={{
                color: isToday ? '#ffffff' : 'var(--aurora-text, #111827)',
                background: isToday ? 'var(--aurora-primary, #3B82F6)' : 'transparent',
                border: isToday
                  ? '1px solid rgba(255,255,255,0.35)'
                  : '1px solid var(--aurora-card-border, rgba(255,255,255,0.28))',
                boxShadow: isToday ? '0 10px 30px rgba(0,0,0,0.18)' : 'none',
                backdropFilter: isToday ? 'blur(8px)' : undefined,
              }}
              title={d.toLocaleDateString() + (dayEvents.length > 0 ? ` (${dayEvents.length} events)` : '')}
            >
              <div className="text-[10px]" style={{ color: isToday ? 'rgba(255,255,255,0.88)' : 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
                {d.toLocaleDateString(undefined, { month: 'short' })}
              </div>
              <div className="text-sm leading-none">{d.getDate()}</div>
              {dayEvents.length > 0 && (
                <div
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{
                    background: isToday ? '#ffffff' : 'var(--aurora-primary, #3B82F6)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Input and Set button - shown when editing */}
      {isEditing && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <input
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'var(--aurora-text)',
              }}
              placeholder="What would make this week feel supportive?"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSet()
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSet}
              disabled={!draftNote.trim()}
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--aurora-primary, #3B82F6)',
                color: '#ffffff',
              }}
            >
              Set
            </button>
          </div>
        </div>
      )}
    </UnifiedCard>
  )
}
