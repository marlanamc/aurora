'use client'

import { useMemo, useState, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { TrendingUp } from '@/lib/icons'
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
  items: Array<{ id: string; text: string; done: boolean }>
}

type WeeklyCalendarProps = {
  value: WeeklyCalendarValue
  onChange: (partial: Partial<WeeklyCalendarValue>) => void
  showAppleCalendar?: boolean
}

function createItemId() {
  const cryptoObj = globalThis.crypto as Crypto | undefined
  return cryptoObj?.randomUUID?.() ?? `wk_${Date.now()}_${Math.random().toString(16).slice(2)}`
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

  const [draftItem, setDraftItem] = useState('')

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader icon={TrendingUp} title="This Week" subtitle={rangeLabel} />

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

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
            Intention
          </div>
          <textarea
            value={value.note}
            onChange={(e) => onChange({ note: e.target.value })}
            className="w-full min-h-[80px] rounded-xl px-3 py-2 text-sm outline-none resize-none"
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'var(--aurora-text)',
            }}
            placeholder="What would make this week feel supportive?"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs font-semibold" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.72))' }}>
              Tiny list
            </div>
            <div className="flex items-center gap-2">
              <input
                value={draftItem}
                onChange={(e) => setDraftItem(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: 'var(--aurora-text)',
                  width: 200,
                }}
                placeholder="Add item…"
              />
              <button
                type="button"
                onClick={() => {
                  const text = draftItem.trim()
                  if (!text) return
                  onChange({ items: [...value.items, { id: createItemId(), text, done: false }] })
                  setDraftItem('')
                }}
                className="px-3 py-2 rounded-xl text-sm font-semibold"
                style={{
                  background: 'rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: 'var(--aurora-text)',
                }}
              >
                Add
              </button>
            </div>
          </div>

          {value.items.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
              Nothing here yet.
            </div>
          ) : (
            <div className="space-y-2">
              {value.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)' }}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => {
                      const next = value.items.map((it) => (it.id === item.id ? { ...it, done: e.target.checked } : it))
                      onChange({ items: next })
                    }}
                    className="h-4 w-4"
                  />
                  <div
                    className="text-sm flex-1"
                    style={{
                      color: 'var(--aurora-text)',
                      textDecoration: item.done ? 'line-through' : 'none',
                      opacity: item.done ? 0.7 : 1,
                    }}
                  >
                    {item.text}
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ items: value.items.filter((it) => it.id !== item.id) })}
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
                    title="Remove"
                  >
                    Remove
                  </button>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </UnifiedCard>
  )
}
