'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { FileInfo } from '@/lib/tauri'
import { formatDate, openFile, getFileIcon } from '@/lib/tauri'
import type { GlobalTheme } from '@/lib/global-themes'
import type { AuroraSettings } from '@/lib/settings'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { ActiveClustersSection } from '@/components/ActiveClustersSection'
import { DailyQuestSystem, type Quest } from '@/components/DailyQuestSystem'
import { JobApplicationHeatMap } from '@/components/JobApplicationHeatMap'
import { ResistanceBreaker } from '@/components/ResistanceBreaker'
import { MonthlyCalendar } from '@/components/MonthlyCalendar'
import { RecentActivitySidebar } from '@/components/RecentActivitySidebar'
import { WeeklyCalendar } from '@/components/WeeklyCalendar'
import { BreathingWidget } from '@/components/widgets/BreathingWidget'
import { AffirmationWidget } from '@/components/widgets/AffirmationWidget'
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget'
import { ScratchpadWidget } from '@/components/widgets/ScratchpadWidget'
import { AppleCalendarWidget } from '@/components/widgets/AppleCalendarWidget'
import { QuickSearchWidget } from '@/components/widgets/QuickSearchWidget'
import { FileTypeBreakdownWidget } from '@/components/widgets/FileTypeBreakdownWidget'
import { EnergyTrackerWidget } from '@/components/widgets/EnergyTrackerWidget'
import { NotebookWidget } from '@/components/widgets/NotebookWidget'
import { LinksWidget } from '@/components/widgets/LinksWidget'
import { TitleWidget } from '@/components/widgets/TitleWidget'
import { filterFilesForValue, getValueTemplate } from '@/lib/value-templates'
import {
  buildDefaultLayout,
  createWidgetId,
  WIDGET_DEFINITIONS,
  WIDGET_CATEGORY_LABELS,
  type WidgetCategory,
  type WidgetInstance,
  type WidgetType,
} from '@/lib/widgets'
import type { WidgetSuggestion } from '@/lib/smart-defaults'
import { WidgetGallery } from './WidgetGallery'
import { WidgetSuggestions } from './WidgetSuggestions'
import { EmptyFocusAreaState } from './EmptyFocusAreaState'
import { FlippableWidget } from './FlippableWidget'
import { DraggableWidgetGrid } from './DraggableWidgetGrid'
import { Plus, X, FileText, Scroll, Sparkles, GripVertical, Clock } from '@/lib/icons'
import { HeatMapSettingsPanel } from './JobApplicationHeatMap'
import { dbGetResurfacedFiles, dbSearchFiles, type ResurfacedFile } from '@/lib/tauri'
import { open } from '@tauri-apps/plugin-dialog'

type Props = {
  valueId: string
  files: FileInfo[]
  theme: GlobalTheme
  settings: AuroraSettings
  updateSettings: (partial: Partial<AuroraSettings>) => void
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  isPickerOpen: boolean
  setIsPickerOpen: (v: boolean) => void
  recordActivity?: () => void
  uiComplexity?: 'simple' | 'normal' | 'detailed'
  isBusyTime?: boolean
}

const EMPTY_WIDGETS: WidgetInstance[] = []
type PinnedItem = { path: string; kind: 'file' | 'folder' }

function setLayout(settings: AuroraSettings, valueId: string, widgets: WidgetInstance[]) {
  return {
    ...settings.valueLayouts,
    [valueId]: { widgets },
  }
}

export function ValueDashboard({ valueId, files, theme, settings, updateSettings, isEditing, setIsEditing, isPickerOpen, setIsPickerOpen, recordActivity, uiComplexity = 'normal', isBusyTime = false }: Props) {
  const layout = settings.valueLayouts[valueId] ?? null
  const areaName = useMemo(() => {
    if (valueId === '__homebase__') return 'Homebase'
    return settings.coreValues?.find((v) => v.id === valueId)?.name ?? valueId
  }, [valueId, settings.coreValues])
  
  const fallbackLayoutRef = useRef<Record<string, { widgets: WidgetInstance[] }>>({})
  const fallbackLayout = useMemo(() => {
    if (!valueId) return null
    // Homebase should never use fallbackLayout - always empty
    if (valueId === '__homebase__') return { widgets: [] }
    if (!fallbackLayoutRef.current[valueId]) {
      fallbackLayoutRef.current[valueId] = buildDefaultLayout(valueId, areaName)
    }
    return fallbackLayoutRef.current[valueId]
  }, [valueId, areaName])

  // Initialize empty layout if none exists (but don't auto-create widgets)
  useEffect(() => {
    if (!valueId) return
    
    // Homebase always starts empty - force clear any existing widgets
    if (valueId === '__homebase__') {
      const currentWidgets = layout?.widgets ?? []
      // Always ensure homebase is empty, even if widgets exist
      if (currentWidgets.length > 0) {
        updateSettings({ valueLayouts: { ...settings.valueLayouts, [valueId]: { widgets: [] } } })
      } else if (!layout) {
        // Initialize with empty layout if none exists
        updateSettings({ valueLayouts: { ...settings.valueLayouts, [valueId]: { widgets: [] } } })
      }
      return
    }
    
    if (layout) return
    
    // Only add pinned-items widget if user has pinned files (for focus areas only)
    const pinnedCount = settings.pinnedByValue?.[valueId]?.length ?? 0
    if (pinnedCount > 0) {
      const def = WIDGET_DEFINITIONS.find((w) => w.type === 'pinned-items')
      if (def) {
        updateSettings({ valueLayouts: { ...settings.valueLayouts, [valueId]: { widgets: [{ id: createWidgetId(def.type), type: def.type, span: def.defaultSpan }] } } })
      }
    } else {
      // Initialize with empty layout
      updateSettings({ valueLayouts: { ...settings.valueLayouts, [valueId]: { widgets: [] } } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueId, layout?.widgets?.length])

  useEffect(() => {
    if (!valueId || valueId === '__homebase__') return
    const pinnedCount = settings.pinnedByValue?.[valueId]?.length ?? 0
    if (pinnedCount === 0) return
    const existing = settings.valueLayouts[valueId]?.widgets
    if (!existing) return
    if (existing.some((w) => w.type === 'pinned-items')) return
    const def = WIDGET_DEFINITIONS.find((w) => w.type === 'pinned-items')
    if (!def) return
    const next = [...existing, { id: createWidgetId(def.type), type: def.type, span: def.defaultSpan }]
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueId, settings.pinnedByValue?.[valueId]?.length])

  const widgets = useMemo(() => {
    // Homebase should always start empty - don't use fallbackLayout
    if (valueId === '__homebase__' && !layout) {
      return EMPTY_WIDGETS
    }
    return layout?.widgets ?? fallbackLayout?.widgets ?? EMPTY_WIDGETS
  }, [layout, fallbackLayout?.widgets, valueId])

  const availableWidgetDefs = useMemo(() => WIDGET_DEFINITIONS, [])

  const presentTypes = useMemo(() => new Set(widgets.map((w) => w.type)), [widgets])
  const addableWidgetDefs = useMemo(() => availableWidgetDefs.filter((w) => !presentTypes.has(w.type)), [availableWidgetDefs, presentTypes])

  useEffect(() => {
    if (!isEditing) setIsPickerOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const addWidget = (type: WidgetType) => {
    const def = availableWidgetDefs.find((w) => w.type === type)
    if (!def) return

    // Create new widget with default layout props
    const next = [...widgets, {
      id: createWidgetId(type),
      type,
      span: def.defaultSpan,
      layout: {
        x: 0,
        y: Infinity, // put at bottom
        w: def.defaultSpan,
        h: 4 // default height units
      }
    }]
    
    if (type === 'remember-this' && !settings.showRememberThis) {
      updateSettings({ showRememberThis: true, valueLayouts: setLayout(settings, valueId, next) })
    } else {
      updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
    }
    setIsPickerOpen(false)
  }

  const removeWidget = (id: string) => {
    const next = widgets.filter((w) => w.id !== id)
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
  }

  const toggleWidgetSpan = (id: string) => {
    const next = widgets.map((w) => {
      if (w.id !== id) return w
      const current = w.span ?? 1
      const span: 1 | 2 = current === 2 ? 1 : 2
      // Update layout width too
      const currentW = w.layout?.w ?? span
      const nextW = currentW >= 2 ? 1 : 2

      return {
        ...w,
        span,
        layout: w.layout ? { ...w.layout, w: nextW } : undefined
      }
    })
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
  }


  const updateLayout = (next: WidgetInstance[]) => {
    // This is called by the grid when layout changes (drag/resize)
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
  }

  const updateBrainDump = (nextText: string) => {
    updateSettings({ brainDumps: { ...settings.brainDumps, [valueId]: nextText } })
    recordActivity?.()
  }

  const getWidgetData = <T,>(widgetId: string, fallback: T): T => {
    const raw = settings.widgetData?.[widgetId]
    return (raw as T | undefined) ?? fallback
  }

  const setWidgetData = <T extends Record<string, unknown>>(widgetId: string, next: T) => {
    updateSettings({ widgetData: { ...(settings.widgetData ?? {}), [widgetId]: next } })
  }

  const mergeWidgetData = <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => {
    const prev = getWidgetData<T>(widgetId, fallback)
    setWidgetData(widgetId, { ...prev, ...partial } as T)
  }

  const pinnedByValue = settings.pinnedByValue ?? {}
  const setPinnedForValue = (valueId: string, nextPinned: PinnedItem[]) => {
    updateSettings({ pinnedByValue: { ...pinnedByValue, [valueId]: nextPinned } })
  }



  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get suggested widgets for empty state
  const suggestedWidgets = useMemo(() => {
    if (widgets.length > 0 || valueId === '__homebase__') return []
    try {
      const { suggestWidgetsForFocusArea } = require('@/lib/smart-defaults')
      const suggestions: WidgetSuggestion[] = suggestWidgetsForFocusArea(areaName, valueId)
      return suggestions.slice(0, 3).map((s: WidgetSuggestion) => s.type)
    } catch {
      return []
    }
  }, [areaName, valueId, widgets.length])
  
  const showSuggestions = 
    mounted &&
    !isEditing &&
    widgets.length <= 2 &&
    valueId !== '__homebase__' &&
    !dismissedSuggestions.has(valueId)

  // Show empty state if no widgets (except for homebase)
  if (widgets.length === 0 && valueId !== '__homebase__') {
    return (
      <div className="space-y-4 pb-24">
        <EmptyFocusAreaState
          theme={theme}
          areaName={areaName}
          onAddWidget={() => {
            setIsEditing(true)
            setIsPickerOpen(true)
          }}
          onAddSpecificWidget={(type) => {
            addWidget(type)
            setIsEditing(false)
          }}
          suggestedWidgets={suggestedWidgets}
        />
        <WidgetGallery
          isOpen={isPickerOpen}
          onClose={() => {
            setIsPickerOpen(false)
            setIsEditing(false)
          }}
          onAdd={(type) => {
            addWidget(type)
            setIsEditing(false)
          }}
          theme={theme}
          settings={settings}
          presentTypes={presentTypes}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Smart Widget Suggestions */}
      {showSuggestions && (
        <WidgetSuggestions
          theme={theme}
          areaName={areaName}
          areaId={valueId}
          currentWidgets={widgets.map((w) => w.type)}
          onAddWidget={addWidget}
          onDismiss={() => setDismissedSuggestions((prev) => new Set([...prev, valueId]))}
        />
      )}

      <DraggableWidgetGrid
        widgets={widgets}
        onLayoutChange={updateLayout}
        isEditing={isEditing}
        theme={theme}
        renderWidget={(widget) => (
          <WidgetItem
            key={widget.id}
            widget={widget}
            valueId={valueId}
            files={files}
            theme={theme}
            settings={settings}
            pinnedByValue={pinnedByValue}
            setPinnedForValue={setPinnedForValue}
            isEditing={isEditing}
            onRemove={() => removeWidget(widget.id)}
            onToggleSpan={() => toggleWidgetSpan(widget.id)}
            updateBrainDump={updateBrainDump}
            getWidgetData={getWidgetData}
            mergeWidgetData={mergeWidgetData}
            updateSettings={updateSettings}
          />
        )}
      />


      {/* Widget controls - positioned to the left of Quick Capture button */}
      <div className="fixed bottom-6 right-24 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
              style={{ background: theme.gradients.button, color: '#000000', boxShadow: theme.effects.shadow }}
              title="Add widget"
            >
              <Plus size={16} />
              Add
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: theme.components.card.background,
              color: theme.colors.text,
              border: theme.components.card.border,
              boxShadow: theme.effects.shadow,
              backdropFilter: theme.effects.blur,
            }}
            title={isEditing ? 'Done editing' : 'Edit widgets'}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <WidgetGallery
        isOpen={isEditing && isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onAdd={addWidget}
        theme={theme}
        settings={settings}
        presentTypes={presentTypes}
      />
    </div>
  )
}

function WidgetItem({
  widget,
  valueId,
  files,
  theme,
  settings,
  pinnedByValue,
  setPinnedForValue,
  isEditing,
  onRemove,
  onToggleSpan,
  updateBrainDump,
  getWidgetData,
  mergeWidgetData,
  updateSettings,
}: {
  widget: WidgetInstance
  valueId: string
  files: FileInfo[]
  theme: GlobalTheme
  settings: AuroraSettings
  pinnedByValue: AuroraSettings['pinnedByValue']
  setPinnedForValue: (valueId: string, nextPinned: PinnedItem[]) => void
  isEditing: boolean
  onRemove: () => void
  onToggleSpan: () => void
  updateBrainDump: (text: string) => void
  getWidgetData: <T, >(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
  updateSettings: (partial: Partial<AuroraSettings>) => void
}) {
  return (
      <WidgetShell
        widget={widget}
        onRemove={onRemove}
        onToggleSpan={onToggleSpan}
        span={widget.span ?? 1}
        isEditing={isEditing}
        theme={theme}
        render={() =>
          renderWidget({
            widget,
            valueId,
            files,
            theme,
            settings,
            pinnedByValue,
            setPinnedForValue,
            updateBrainDump,
            getWidgetData,
            mergeWidgetData,
            updateSettings,
          })
        }
      />
  )
}

function WidgetShell({
  widget,
  render,
  onRemove,
  onToggleSpan,
  span,
  isEditing,
  theme,
}: {
  widget: WidgetInstance
  render: () => JSX.Element | null
  onRemove: () => void
  onToggleSpan: () => void
  span: 1 | 2
  isEditing: boolean
  theme: GlobalTheme
}) {
  const content = render()
  if (!content) return null

  // Check if content is a FlippableWidget (it will handle its own editing controls)
  const isFlippable = content && typeof content === 'object' && 'type' in content && (content as any).type === FlippableWidget

  return (
    <div className="relative h-full w-full">
      {isEditing && !isFlippable && (
        <>
          <button
            type="button"
            className="absolute right-2 top-2 z-40 p-2 rounded-xl"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            style={{
              background: 'rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}
            title="Remove widget"
          >
            <X size={16} />
          </button>
        </>
      )}
      {content}
    </div>
  )
}


function renderWidget({
  widget,
  valueId,
  files,
  theme,
  settings,
  pinnedByValue,
  setPinnedForValue,
  updateBrainDump,
  getWidgetData,
  mergeWidgetData,
  updateSettings,
}: {
  widget: WidgetInstance
  valueId: string
  files: FileInfo[]
  theme: GlobalTheme
  settings: AuroraSettings
  pinnedByValue: AuroraSettings['pinnedByValue']
  setPinnedForValue: (valueId: string, nextPinned: PinnedItem[]) => void
  updateBrainDump: (text: string) => void
  getWidgetData: <T, >(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
  updateSettings: (partial: Partial<AuroraSettings>) => void
}) {
  switch (widget.type) {
    case 'heatmap':
      return (
        <HeatMapWidget
          widgetId={widget.id}
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'daily-quests':
      return (
        <DailyQuestWidget
          widgetId={widget.id}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'resistance-selector':
      return (
        <ResistanceBreakerWidget
          widgetId={widget.id}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'emotional-worlds':
      return <ActiveClustersSection files={files} />
    case 'remember-this':
      if (!settings.showRememberThis) return null
      return <RememberThisWidget files={files} />
    case 'relevant-files':
      return (
        <RelevantFilesWidget
          files={files}
          valueId={valueId}
          searchQuery={(settings.coreValues ?? []).find((v) => v.id === valueId)?.searchQuery}
          pinned={settings.pinnedByValue?.[valueId] ?? []}
          onPin={(path) => {
            const current = settings.pinnedByValue?.[valueId] ?? []
            const next = [...current, { kind: 'file', path }] as PinnedItem[]
            updateSettings({
              pinnedByValue: { ...settings.pinnedByValue, [valueId]: next }
            })
          }}
          onUnpin={(path) => {
            const current = settings.pinnedByValue?.[valueId] ?? []
            const next = current.filter(p => !(p.kind === 'file' && p.path === path))
            updateSettings({
              pinnedByValue: { ...settings.pinnedByValue, [valueId]: next }
            })
          }}
        />
      )
    case 'links':
      return <LinksWidget widgetId={widget.id} theme={theme} getWidgetData={getWidgetData} mergeWidgetData={mergeWidgetData} />
    case 'recent-activity':
      return <RecentActivityWidget files={files} />
    case 'pinned-items':
      return (
        <PinnedItemsWidget
          files={files}
          pinned={pinnedByValue[valueId] ?? []}
          onChange={(next) => setPinnedForValue(valueId, next)}
        />
      )
    case 'brain-dump':
      return <BrainDumpWidget valueId={valueId} saved={settings.brainDumps[valueId] ?? ''} onChange={updateBrainDump} />
    case 'monthly-calendar':
      return <MonthlyCalendar />
    case 'recent-activity':
      return <RecentActivitySidebar files={files} />
    case 'weekly-calendar':
      return (
        <WeeklyCalendarWidget widgetId={widget.id} getWidgetData={getWidgetData} mergeWidgetData={mergeWidgetData} />
      )
    case 'breathing':
      return <BreathingWidget theme={theme} />
    case 'affirmation':
      return (
        <AffirmationWidget
          theme={theme}
          valueId={valueId}
          widgetId={widget.id}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'pomodoro':
      return <PomodoroWidget theme={theme} />
    case 'scratchpad':
      return (
        <ScratchpadWidget 
          widgetId={widget.id} 
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'apple-calendar':
      return (
        <AppleCalendarWidget
          widgetId={widget.id}
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'quick-search':
      return (
        <QuickSearchWidget
          widgetId={widget.id}
          theme={theme}
          files={files}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'file-type-breakdown':
      return <FileTypeBreakdownWidget files={files} theme={theme} />
    case 'energy-tracker':
      return (
        <EnergyTrackerWidget
          widgetId={widget.id}
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'notebook':
      return (
        <NotebookWidget
          widgetId={widget.id}
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    case 'title':
      return (
        <TitleWidget
          widgetId={widget.id}
          valueId={valueId}
          settings={settings}
          theme={theme}
          getWidgetData={getWidgetData}
          mergeWidgetData={mergeWidgetData}
        />
      )
    default:
      return null
  }
}

type HeatMapLogData = {
  byDay: Record<string, number>
}

function toDayKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function buildHeatMapDays(data: HeatMapLogData) {
  const today = new Date()
  const todayKey = toDayKey(today)
  
  // Find the first day with activity - start from there, not before
  const allDayKeys = Object.keys(data.byDay ?? {}).filter((key) => (data.byDay[key] ?? 0) > 0)
  const firstActivityKey = allDayKeys.length > 0 ? allDayKeys.sort()[0] : null
  
  // If no activity yet, show empty state (handled in component)
  if (!firstActivityKey) {
    return { days: [], todayCount: data.byDay[todayKey] ?? 0 }
  }

  // Parse first activity date
  const [year, month, day] = firstActivityKey.split('-').map(Number)
  const firstActivityDate = new Date(year, month - 1, day)
  
  // Calculate days from first activity to today
  const daysSinceFirst = Math.floor((today.getTime() - firstActivityDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // If more than 14 days have passed, show the last 14 days (sliding window)
  // Otherwise, show from first activity date - no empty days before you started
  const actualStart = daysSinceFirst >= 14 ? addDays(today, -13) : firstActivityDate
  const daysToShow = Math.min(daysSinceFirst + 1, 14) // +1 to include today, max 14 days
  
  const days: Array<{ date: Date; count: number; urgency: 'safe' | 'slipping' | 'concerning' | 'meltdown' }> = []
  let lastActiveKey: string | null = null
  
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(actualStart, i)
    // Don't show future dates
    if (date > today) break
    
    const key = toDayKey(date)
    const count = data.byDay[key] ?? 0
    if (count > 0) lastActiveKey = key
    days.push({ date, count, urgency: 'safe' })
  }

  // Only calculate urgency if there's been some activity - don't shame empty states
  const hasAnyActivity = days.some((d) => d.count > 0)
  if (hasAnyActivity) {
    const lastActiveIndex = lastActiveKey ? days.findIndex((d) => toDayKey(d.date) === lastActiveKey) : -1
    const daysSinceActive = lastActiveIndex >= 0 ? days.length - 1 - lastActiveIndex : 999

    for (let i = 0; i < days.length; i++) {
      const daysSince = days[i].count > 0 ? 0 : Math.max(0, daysSinceActive - (days.length - 1 - i))
      let urgency: (typeof days)[number]['urgency'] = 'safe'
      // Softer thresholds - less judgmental
      if (daysSince > 5) urgency = 'meltdown'
      else if (daysSince > 3) urgency = 'concerning'
      else if (daysSince > 1) urgency = 'slipping'
      days[i].urgency = urgency
    }
  }

  return { days, todayCount: data.byDay[todayKey] ?? 0 }
}

type HeatMapConfig = {
  label: string // e.g., "Job apps", "Exercises", "Worked"
  goalPerDay?: number // Optional daily goal (e.g., 5 jobs apps per day)
}

function HeatMapWidget({
  widgetId,
  theme,
  getWidgetData,
  mergeWidgetData,
}: {
  widgetId: string
  theme: GlobalTheme
  getWidgetData: <T, >(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
}) {
  const data = getWidgetData<HeatMapLogData>(widgetId, { byDay: {} })
  const config = getWidgetData<HeatMapConfig>(widgetId, { label: 'Action' })
  const { days, todayCount } = useMemo(() => buildHeatMapDays(data), [data])

  const incrementToday = () => {
    const key = toDayKey(new Date())
    const next = { ...(data.byDay ?? {}) }
    next[key] = (next[key] ?? 0) + 1
    mergeWidgetData<HeatMapLogData>(widgetId, { byDay: next }, { byDay: {} })
  }

  const decrementToday = () => {
    const key = toDayKey(new Date())
    const next = { ...(data.byDay ?? {}) }
    const current = next[key] ?? 0
    if (current > 0) {
      next[key] = current - 1
      // Remove the key if it goes to 0 to keep data clean
      if (next[key] === 0) {
        delete next[key]
      }
      mergeWidgetData<HeatMapLogData>(widgetId, { byDay: next }, { byDay: {} })
    }
  }

  const resetAll = () => {
    mergeWidgetData<HeatMapLogData>(widgetId, { byDay: {} }, { byDay: {} })
  }

  const [settingsLabel, setSettingsLabel] = useState(config.label)
  const [settingsGoal, setSettingsGoal] = useState(config.goalPerDay?.toString() || '')

  useEffect(() => {
    setSettingsLabel(config.label)
    setSettingsGoal(config.goalPerDay?.toString() || '')
  }, [config.label, config.goalPerDay])

  const handleSaveSettings = () => {
    const goalValue = settingsGoal.trim()
    const parsedGoal = goalValue ? parseInt(goalValue, 10) : undefined
    mergeWidgetData<HeatMapConfig>(widgetId, {
      label: settingsLabel.trim() || 'Action',
      goalPerDay: parsedGoal && !isNaN(parsedGoal) ? parsedGoal : undefined,
    }, { label: 'Action' })
  }

  const front = (
    <JobApplicationHeatMap
      widgetId={widgetId}
      theme={theme}
      days={days}
      onAddAction={incrementToday}
      onRemoveAction={decrementToday}
      onReset={resetAll}
      todayCount={todayCount}
      actionLabel={config.label}
      goalPerDay={config.goalPerDay}
    />
  )

  const back = (
    <HeatMapSettingsPanel
      theme={theme}
      settingsLabel={settingsLabel}
      setSettingsLabel={setSettingsLabel}
      settingsGoal={settingsGoal}
      setSettingsGoal={setSettingsGoal}
      onSave={handleSaveSettings}
    />
  )

  // Get isEditing from parent context - for now, we'll pass it through props
  // This will be handled by WidgetShell
  return (
    <FlippableWidget
      front={front}
      back={back}
      theme={theme}
    />
  )
}

type WeeklyData = {
  note: string
}

function WeeklyCalendarWidget({
  widgetId,
  getWidgetData,
  mergeWidgetData,
}: {
  widgetId: string
  getWidgetData: <T, >(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
}) {
  const data = getWidgetData<WeeklyData>(widgetId, { note: '' })
  const config = getWidgetData<{ showAppleCalendar?: boolean }>(widgetId, { showAppleCalendar: false })

  const update = (partial: Partial<WeeklyData>) => mergeWidgetData<WeeklyData>(widgetId, partial, { note: '' })
  return <WeeklyCalendar value={data} onChange={update} showAppleCalendar={config.showAppleCalendar} />
}

type DailyQuestData = {
  quests: Quest[]
}

function DailyQuestWidget({
  widgetId,
  getWidgetData,
  mergeWidgetData,
}: {
  widgetId: string
  getWidgetData: <T>(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
}) {
  const data = getWidgetData<DailyQuestData>(widgetId, { quests: [] })

  const update = (quests: Quest[]) => {
    mergeWidgetData<DailyQuestData>(widgetId, { quests }, { quests: [] })
  }

  return <DailyQuestSystem quests={data.quests} onUpdate={update} />
}

type ResistanceTrackerData = {
  logs: Array<{
    timestamp: number
    resistanceType: string
    actionUsed: string
    helpful: boolean
  }>
  favorites: Record<string, string[]> // resistanceType -> favorite actions
}

function ResistanceBreakerWidget({
  widgetId,
  getWidgetData,
  mergeWidgetData,
}: {
  widgetId: string
  getWidgetData: <T>(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
}) {
  const data = getWidgetData<ResistanceTrackerData>(widgetId, { logs: [], favorites: {} })

  const trackAction = (resistanceType: string, action: string, helpful: boolean) => {
    const newLog = {
      timestamp: Date.now(),
      resistanceType,
      actionUsed: action,
      helpful,
    }
    const updatedLogs = [...data.logs, newLog].slice(-100) // Keep last 100

    // Update favorites if helpful
    let updatedFavorites = { ...data.favorites }
    if (helpful) {
      const currentFavorites = updatedFavorites[resistanceType] || []
      if (!currentFavorites.includes(action)) {
        updatedFavorites[resistanceType] = [...currentFavorites, action].slice(-3) // Keep top 3
      }
    }

    mergeWidgetData<ResistanceTrackerData>(widgetId, { logs: updatedLogs, favorites: updatedFavorites }, { logs: [], favorites: {} })
  }

  return <ResistanceBreaker onActionSelected={trackAction} favorites={data.favorites} />
}

function RememberThisWidget({ files }: { files: FileInfo[] }) {
  const [items, setItems] = useState<ResurfacedFile[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (files.length === 0) {
        setItems([])
        return
      }
      try {
        const next = await dbGetResurfacedFiles(3)
        if (!cancelled) setItems(next)
      } catch {
        if (!cancelled) setItems([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [files.length])

  return (
    <UnifiedCard variant="subtle">
      <UnifiedCardHeader
        icon={Sparkles}
        title="Remember This?"
        subtitle={files.length === 0 ? 'Index some folders to get resurfacing.' : 'Files resurfacing from the past'}
      />

      {/* Grid of file cards matches RememberThisSection style */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ file, reason, explanation }) => (
          <button
            key={file.path}
            onClick={() => openFile(file.path)}
            className="flex flex-col items-start p-3 rounded-xl text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
            style={{ border: '1px solid var(--aurora-border, rgba(255,255,255,0.1))' }}
          >
            <div className="mb-2 opacity-80" style={{ color: 'var(--aurora-text)' }}>
              {/* We need to import getFileIcon if we want icons, or just use Sparkles/FileText */}
              <FileText size={24} />
            </div>
            <div className="w-full text-sm font-semibold truncate mb-0.5" style={{ color: 'var(--aurora-text)' }}>
              {file.name}
            </div>
            <div className="text-[10px] opacity-60 mb-2" style={{ color: 'var(--aurora-text-secondary)' }}>
              {explanation || reason}
            </div>
          </button>
        ))}
      </div>
    </UnifiedCard>
  )
}

function RecentActivityWidget({ files }: { files: FileInfo[] }) {
  const recent = useMemo(() => {
    return [...files]
      .sort((a, b) => (b.last_opened_at ?? b.modified_at) - (a.last_opened_at ?? a.modified_at))
      .slice(0, 8)
  }, [files])

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader icon={Clock} title="Recent Files" subtitle="Files you've been working with recently" />
      {recent.length === 0 ? (
        <div className="text-sm p-4 text-center opacity-60" style={{ color: 'var(--aurora-text-secondary)' }}>
          No files yet.
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((f) => (
            <div
              key={f.path}
              className="w-full rounded-xl px-3 py-2 flex items-center justify-between gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ border: '1px solid var(--aurora-border, rgba(255,255,255,0.1))' }}
            >
              <button type="button" className="text-left min-w-0 flex-1" onClick={() => openFile(f.path)} title={f.path}>
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text)' }}>
                  {f.name}
                </div>
                <div className="text-xs opacity-60" style={{ color: 'var(--aurora-text-secondary)' }}>
                  {f.last_opened_at ? `Opened ${formatDate(f.last_opened_at)}` : `Modified ${formatDate(f.modified_at)}`}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </UnifiedCard>
  )
}

function RelevantFilesWidget({
  files,
  valueId,
  searchQuery,
  pinned,
  onPin,
  onUnpin,
}: {
  files: FileInfo[]
  valueId: string
  searchQuery?: string
  pinned: PinnedItem[]
  onPin: (path: string) => void
  onUnpin: (path: string) => void
}) {
  // Sync fallback (instant)
  const syncMatches = useMemo(() => {
    const matches = filterFilesForValue(files, valueId)
    return [...matches].sort((a, b) => b.modified_at - a.modified_at).slice(0, 6)
  }, [files, valueId])

  const [matches, setMatches] = useState<FileInfo[]>(syncMatches)

  // Async smart search
  useEffect(() => {
    let active = true
    const load = async () => {
      const query = searchQuery?.trim() || getValueTemplate(valueId)?.searchQuery
      if (!query) return

      try {
        const results = await dbSearchFiles(query)
        if (active && results.length > 0) {
          setMatches(results.slice(0, 6))
        }
      } catch (e) {
        console.error('Smart widget search failed:', e)
      }
    }
    load()
    return () => { active = false }
  }, [searchQuery, valueId]) // Re-run when value changes

  const displayFiles = matches.length > 0 ? matches : syncMatches
  const pinnedPaths = useMemo(() => new Set(pinned.filter((p) => p.kind === 'file').map((p) => p.path)), [pinned])

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader icon={FileText} title="Relevant Files" subtitle="Files that match this focus area" />
      {displayFiles.length === 0 ? (
        <div className="text-sm p-4 text-center opacity-60" style={{ color: 'var(--aurora-text-secondary)' }}>
          No files matched yet. Add folders in Settings, or we&apos;ll find files as you work.
        </div>
      ) : (
        <div className="space-y-2">
          {displayFiles.map((f) => (
            <div
              key={f.path}
              className="w-full rounded-xl px-3 py-2 flex items-center justify-between gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ border: '1px solid var(--aurora-border, rgba(255,255,255,0.1))' }}
              title={f.path}
            >
              <button type="button" className="text-left min-w-0 flex-1" onClick={() => openFile(f.path)} title={f.path}>
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text)' }}>
                  {f.name}
                </div>
                <div className="text-xs opacity-60" style={{ color: 'var(--aurora-text-secondary)' }}>
                  {formatDate(f.modified_at)}
                </div>
              </button>
              {pinnedPaths.has(f.path) ? (
                <button
                  type="button"
                  onClick={() => onUnpin(f.path)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  style={{ color: 'var(--aurora-text-secondary)' }}
                  title="Remove from Spotlight"
                >
                  Unspotlight
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPin(f.path)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--aurora-text)' }}
                  title="Spotlight"
                >
                  Spotlight
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </UnifiedCard>
  )
}

function PinnedItemsWidget({
  files,
  pinned,
  onChange,
}: {
  files: FileInfo[]
  pinned: PinnedItem[]
  onChange: (next: PinnedItem[]) => void
}) {
  const byPath = useMemo(() => new Map(files.map((f) => [f.path, f])), [files])

  const addToSpotlight = async (kind: 'file' | 'folder') => {
    let selectedPaths: string[] = []
    try {
      const selected = await open({ directory: kind === 'folder', multiple: true })
      selectedPaths = (Array.isArray(selected) ? selected : selected ? [selected] : []).filter(
        (p): p is string => typeof p === 'string' && p.trim().length > 0
      )
    } catch {
      const manual = window.prompt(`Paste a ${kind} path to add to Spotlight:`)
      if (manual && manual.trim().length > 0) selectedPaths = [manual.trim()]
    }

    if (selectedPaths.length === 0) return

    const existing = new Set(pinned.map((p) => `${p.kind}:${p.path}`))
    const additions = selectedPaths
      .map((path) => ({ kind, path }))
      .filter((item) => !existing.has(`${item.kind}:${item.path}`))

    if (additions.length === 0) return

    const next = [...additions, ...pinned]
    onChange(next)
  }

  const removePinned = (item: { kind: 'file' | 'folder'; path: string }) => {
    const next = pinned.filter((p) => !(p.kind === item.kind && p.path === item.path))
    onChange(next)
  }

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader
        icon={FileText}
        title="File Spotlight"
        subtitle="The few files and folders you want close by"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addToSpotlight('file')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
            >
              Add file
            </button>
            <button
              type="button"
              onClick={() => addToSpotlight('folder')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
            >
              Add folder
            </button>
          </div>
        }
      />

      {pinned.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
          Add the few things that matter here. You can also spotlight from “Relevant Files”.
        </div>
      ) : (
        <div className="space-y-2">
          {pinned.slice(0, 10).map((item) => {
            const f = item.kind === 'file' ? byPath.get(item.path) : undefined
            const label = f?.name ?? item.path.split('/').filter(Boolean).pop() ?? item.path
            const meta = item.kind === 'file' && f ? formatDate(f.modified_at) : item.kind === 'folder' ? 'Folder' : item.path

            return (
              <div
                key={`${item.kind}:${item.path}`}
                className="w-full rounded-xl flex items-center gap-3 p-3 group cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{ 
                  background: 'rgba(0,0,0,0.04)', 
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
                onClick={() => openFile(item.path)}
                title={`Click to open: ${item.path}`}
              >
                {/* File Icon Preview */}
                <div className="flex-shrink-0 text-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                  {f ? getFileIcon(f.file_type, { size: 24 }) : <FileText size={24} />}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate group-hover:text-current transition-colors" style={{ color: 'var(--aurora-text)' }}>
                    {label}
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--aurora-text-secondary)' }}>
                    {meta}
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePinned(item)
                  }}
                  className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--aurora-text-secondary)' }}
                  title="Remove from Spotlight"
                >
                  Remove
                </button>
              </div>
            )
          })}
          {pinned.length > 10 ? (
            <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary)' }}>
              +{pinned.length - 10} more…
            </div>
          ) : null}
        </div>
      )}
    </UnifiedCard>
  )
}

function BrainDumpWidget({ valueId, saved, onChange }: { valueId: string; saved: string; onChange: (text: string) => void }) {
  const [draft, setDraft] = useState(saved)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setDraft(saved), [saved, valueId])

  const commit = (next: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), 350)
  }

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader icon={Scroll} title="Brain Dump" subtitle="A safe place to process thoughts—no structure needed" />
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          commit(e.target.value)
        }}
        className="w-full min-h-[180px] rounded-xl px-3 py-2 text-sm outline-none resize-none"
        style={{
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.22)',
          color: 'var(--aurora-text)',
        }}
        placeholder="What’s on your mind?"
      />
    </UnifiedCard>
  )
}