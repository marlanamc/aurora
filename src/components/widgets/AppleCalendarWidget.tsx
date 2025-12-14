'use client'

import { useEffect, useMemo, useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { CalendarDays, RefreshCw } from '@/lib/icons'
import { appleCalendarListEvents, isTauri, type AppleCalendarEvent } from '@/lib/tauri'
import { type GlobalTheme } from '@/lib/global-themes'

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

type ViewMode = 'today' | 'week'

export function AppleCalendarWidget({
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
  const viewMode = getWidgetData<ViewMode>(widgetId, 'today')
  const today = useMemo(() => new Date(), [])
  const [events, setEvents] = useState<AppleCalendarEvent[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const startDate = useMemo(() => {
    if (viewMode === 'today') return startOfDay(today)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    return startOfDay(weekStart)
  }, [today, viewMode])

  const endDate = useMemo(() => {
    if (viewMode === 'today') return endOfDay(today)
    const weekEnd = new Date(startDate)
    weekEnd.setDate(startDate.getDate() + 6)
    return endOfDay(weekEnd)
  }, [today, startDate, viewMode])

  const refresh = async () => {
    if (!isTauri()) {
      setError('Apple Calendar is only available in the macOS desktop app.')
      return
    }

    setStatus('loading')
    setError('')
    try {
      const data = await appleCalendarListEvents(startDate.getTime(), endDate.getTime())
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
  }, [viewMode])

  const toggleView = () => {
    const nextMode: ViewMode = viewMode === 'today' ? 'week' : 'today'
    mergeWidgetData(widgetId, { viewMode: nextMode }, { viewMode: 'today' })
  }

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={CalendarDays}
        title="Apple Calendar"
        subtitle={viewMode === 'today' ? 'Today' : 'This Week'}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleView}
              className="px-2 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'var(--aurora-text)',
              }}
              title={`Switch to ${viewMode === 'today' ? 'week' : 'today'} view`}
            >
              {viewMode === 'today' ? 'Week' : 'Today'}
            </button>
            <button
              type="button"
              onClick={refresh}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: theme.colors.textSecondary }}
              disabled={status === 'loading'}
              title="Refresh"
            >
              <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {error ? (
        <div className="text-sm p-3 rounded-lg" style={{ background: theme.colors.error + '15', color: theme.colors.error }}>
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-sm py-4" style={{ color: 'var(--aurora-text-secondary)' }}>
          {viewMode === 'today' ? 'No events today.' : 'No events this week.'}
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, viewMode === 'today' ? 8 : 12).map((ev) => (
            <div
              key={`${ev.calendar}:${ev.uid}:${ev.start_ms}`}
              className="rounded-xl px-3 py-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.22)',
              }}
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
          {events.length > (viewMode === 'today' ? 8 : 12) && (
            <div className="text-[11px] pt-2" style={{ color: 'var(--aurora-text-secondary)' }}>
              +{events.length - (viewMode === 'today' ? 8 : 12)} more…
            </div>
          )}
        </div>
      )}
    </UnifiedCard>
  )
}
