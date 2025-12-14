'use client'

import { useEffect, useMemo, useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { CalendarDays } from '@/lib/icons'
import { appleCalendarListEvents, isTauri, type AppleCalendarEvent } from '@/lib/tauri'

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function formatTimeRange(event: AppleCalendarEvent) {
  if (event.all_day) return 'All day'
  const start = new Date(event.start_ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const end = new Date(event.end_ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${start}–${end}`
}

export function AppleCalendarAgenda() {
  const today = useMemo(() => new Date(), [])
  const [events, setEvents] = useState<AppleCalendarEvent[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const refresh = async () => {
    setStatus('loading')
    setError('')
    try {
      const startMs = startOfDay(today).getTime()
      const endMs = endOfDay(today).getTime()
      const data = await appleCalendarListEvents(startMs, endMs)
      setEvents(data)
      setStatus('idle')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'Failed to load Apple Calendar events.')
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={CalendarDays}
        title="Apple Calendar"
        subtitle="Today (read-only)"
        action={
          <button
            type="button"
            onClick={refresh}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
            disabled={status === 'loading'}
            title={isTauri() ? 'Refresh' : 'Available in the desktop app'}
          >
            {status === 'loading' ? 'Loading…' : 'Refresh'}
          </button>
        }
      />

      {events.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
          No events today.
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 8).map((ev) => (
            <div
              key={`${ev.calendar}:${ev.uid}:${ev.start_ms}`}
              className="rounded-xl px-3 py-2"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text)' }}>
                  {ev.title || '(Untitled)'}
                </div>
                <div className="text-xs whitespace-nowrap" style={{ color: 'var(--aurora-text-secondary)' }}>
                  {formatTimeRange(ev)}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="text-[11px] truncate" style={{ color: 'var(--aurora-text-secondary)' }}>
                  {ev.calendar}
                </div>
                {ev.location ? (
                  <div className="text-[11px] truncate" style={{ color: 'var(--aurora-text-secondary)' }}>
                    {ev.location}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {events.length > 8 ? (
            <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary)' }}>
              +{events.length - 8} more…
            </div>
          ) : null}
        </div>
      )}
    </UnifiedCard>
  )
}
