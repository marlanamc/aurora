'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FileInfo } from '@/lib/tauri'
import { formatDate, openFile } from '@/lib/tauri'
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
import { WidgetGallery } from './WidgetGallery'
import { Reorder, useDragControls, type DragControls } from 'framer-motion'
import { LayoutGrid, Plus, X, FileText, Scroll, Sparkles, GripVertical, Clock } from '@/lib/icons'
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
}

const EMPTY_WIDGETS: WidgetInstance[] = []
type PinnedItem = { path: string; kind: 'file' | 'folder' }

function setLayout(settings: AuroraSettings, valueId: string, widgets: WidgetInstance[]) {
  return {
    ...settings.valueLayouts,
    [valueId]: { widgets },
  }
}

export function ValueDashboard({ valueId, files, theme, settings, updateSettings, isEditing, setIsEditing, isPickerOpen, setIsPickerOpen }: Props) {
  const layout = settings.valueLayouts[valueId] ?? null
  const fallbackLayoutRef = useRef<Record<string, { widgets: WidgetInstance[] }>>({})
  const fallbackLayout = useMemo(() => {
    if (!valueId) return null
    if (!fallbackLayoutRef.current[valueId]) {
      fallbackLayoutRef.current[valueId] = buildDefaultLayout(valueId)
    }
    return fallbackLayoutRef.current[valueId]
  }, [valueId])

  useEffect(() => {
    if (!valueId) return
    if (layout) return
    updateSettings({ valueLayouts: { ...settings.valueLayouts, [valueId]: fallbackLayout ?? buildDefaultLayout(valueId) } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueId])

  useEffect(() => {
    if (!valueId || valueId === '__homebase__') return
    const existing = settings.valueLayouts[valueId]?.widgets
    if (!existing || existing.length === 0) return
    if (existing.some((w) => w.type === 'pinned-items')) return
    const def = WIDGET_DEFINITIONS.find((w) => w.type === 'pinned-items')
    if (!def) return
    const next = [...existing, { id: createWidgetId(def.type), type: def.type, span: def.defaultSpan }]
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueId])

  const widgets = useMemo(
    () => layout?.widgets ?? fallbackLayout?.widgets ?? EMPTY_WIDGETS,
    [layout?.widgets, fallbackLayout?.widgets]
  )

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

    const next = [...widgets, { id: createWidgetId(type), type, span: def.defaultSpan }]
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
      return { ...w, span }
    })
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
  }

  const reorderWidgets = (next: WidgetInstance[]) => {
    if (!isEditing) return
    updateSettings({ valueLayouts: setLayout(settings, valueId, next) })
  }

  const updateBrainDump = (nextText: string) => {
    updateSettings({ brainDumps: { ...settings.brainDumps, [valueId]: nextText } })
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



  return (
    <div className="space-y-4 pb-24">
      <Reorder.Group
        as="div"
        values={widgets}
        onReorder={reorderWidgets}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {widgets.map((widget) => (
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
        ))}
      </Reorder.Group>

      {/* Pinned controls */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
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
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={widget}
      as="div"
      className={widget.span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}
      dragListener={false}
      dragControls={controls}
    >
      <WidgetShell
        dragControls={controls}
        onRemove={onRemove}
        onToggleSpan={onToggleSpan}
        span={widget.span ?? 1}
        isEditing={isEditing}
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
    </Reorder.Item>
  )
}

function WidgetShell({
  render,
  onRemove,
  onToggleSpan,
  span,
  dragControls,
  isEditing,
}: {
  render: () => JSX.Element | null
  onRemove: () => void
  onToggleSpan: () => void
  span: 1 | 2
  dragControls: DragControls
  isEditing: boolean
}) {
  const content = render()
  if (!content) return null

  return (
    <div className="relative">
      {isEditing && (
        <>
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute left-3 top-3 z-20 p-2 rounded-xl cursor-grab active:cursor-grabbing"
            style={{
              background: 'rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
            }}
            title="Drag to reorder"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <button
            type="button"
            onClick={onToggleSpan}
            className="absolute left-12 top-3 z-20 px-2.5 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              color: 'var(--aurora-text, #111827)',
            }}
            title={span === 2 ? 'Set narrow' : 'Set wide'}
            aria-label={span === 2 ? 'Set narrow' : 'Set wide'}
          >
            {span === 2 ? 'Narrow' : 'Wide'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-3 top-3 z-20 p-2 rounded-xl"
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
      return <ScratchpadWidget widgetId={widget.id} theme={theme} />
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
  const start = addDays(today, -89)

  const days: Array<{ date: Date; count: number; urgency: 'safe' | 'slipping' | 'concerning' | 'meltdown' }> = []
  let lastActiveKey: string | null = null
  for (let i = 0; i < 90; i++) {
    const date = addDays(start, i)
    const key = toDayKey(date)
    const count = data.byDay[key] ?? 0
    if (count > 0) lastActiveKey = key
    days.push({ date, count, urgency: 'safe' })
  }

  const lastActiveIndex = lastActiveKey ? days.findIndex((d) => toDayKey(d.date) === lastActiveKey) : -1
  const daysSinceActive = lastActiveIndex >= 0 ? days.length - 1 - lastActiveIndex : 999

  for (let i = 0; i < days.length; i++) {
    const daysSince = days[i].count > 0 ? 0 : Math.max(0, daysSinceActive - (days.length - 1 - i))
    let urgency: (typeof days)[number]['urgency'] = 'safe'
    if (daysSince > 7) urgency = 'meltdown'
    else if (daysSince > 4) urgency = 'concerning'
    else if (daysSince > 2) urgency = 'slipping'
    days[i].urgency = urgency
  }

  const todayKey = toDayKey(today)
  return { days, todayCount: data.byDay[todayKey] ?? 0 }
}

type HeatMapConfig = {
  label: string // e.g., "Applied", "Exercised", "Worked"
  goalPerWeek?: number // Optional goal (e.g., 3x per week)
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

  return (
    <JobApplicationHeatMap
      theme={theme}
      days={days}
      onAddAction={incrementToday}
      todayCount={todayCount}
      actionLabel={config.label}
      goalPerWeek={config.goalPerWeek}
    />
  )
}

type WeeklyData = {
  note: string
  items: Array<{ id: string; text: string; done: boolean }>
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
  const data = getWidgetData<WeeklyData>(widgetId, { note: '', items: [] })
  const config = getWidgetData<{ showAppleCalendar?: boolean }>(widgetId, { showAppleCalendar: false })

  const update = (partial: Partial<WeeklyData>) => mergeWidgetData<WeeklyData>(widgetId, partial, { note: '', items: [] })
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
  pinned,
  onPin,
  onUnpin,
}: {
  files: FileInfo[]
  valueId: string
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
      const template = getValueTemplate(valueId)
      if (!template?.searchQuery) return

      try {
        const results = await dbSearchFiles(template.searchQuery)
        if (active && results.length > 0) {
          setMatches(results.slice(0, 6))
        }
      } catch (e) {
        console.error('Smart widget search failed:', e)
      }
    }
    load()
    return () => { active = false }
  }, [valueId]) // Re-run when value changes

  const displayFiles = matches.length > 0 ? matches : syncMatches
  const pinnedPaths = useMemo(() => new Set(pinned.filter((p) => p.kind === 'file').map((p) => p.path)), [pinned])

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader icon={FileText} title="Relevant Files" subtitle="Smart matches from your files" />
      {displayFiles.length === 0 ? (
        <div className="text-sm p-4 text-center opacity-60" style={{ color: 'var(--aurora-text-secondary)' }}>
          Nothing matched yet. Add folders in Settings or use keywords like &quot;tax&quot;, &quot;project&quot;, etc.
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
                  title="Unpin"
                >
                  Unpin
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPin(f.path)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--aurora-text)' }}
                  title="Pin"
                >
                  Pin
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

  const addPinned = async (kind: 'file' | 'folder') => {
    let selectedPaths: string[] = []
    try {
      const selected = await open({ directory: kind === 'folder', multiple: true })
      selectedPaths = (Array.isArray(selected) ? selected : selected ? [selected] : []).filter(
        (p): p is string => typeof p === 'string' && p.trim().length > 0
      )
    } catch {
      const manual = window.prompt(`Paste a ${kind} path to pin:`)
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
        title="Pinned"
        subtitle="Hand-picked files and folders for this value"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addPinned('file')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
            >
              Pin file
            </button>
            <button
              type="button"
              onClick={() => addPinned('folder')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)', color: 'var(--aurora-text)' }}
            >
              Pin folder
            </button>
          </div>
        }
      />

      {pinned.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
          Pin the few things that matter here. You can also pin from “Relevant Files”.
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
                className="w-full rounded-xl flex items-center justify-between gap-0 overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)' }}
              >
                <button
                  type="button"
                  className="text-left min-w-0 flex-1 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => openFile(item.path)}
                  title={item.path}
                >
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text)' }}>
                    {label}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--aurora-text-secondary)' }}>
                    {meta}
                  </div>
                </button>
                <div className="pr-2 pl-1 py-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePinned(item)
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    style={{ color: 'var(--aurora-text)' }}
                    title="Unpin"
                  >
                    Remove
                  </button>
                </div>
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
      <UnifiedCardHeader icon={Scroll} title="Brain Dump" subtitle="No structure required" />
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
