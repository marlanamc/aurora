'use client'

import { useEffect, useMemo, useState } from 'react'
import { RESURFACING_THEMES, type ThemeId } from '@/lib/resurfacing-themes'
import { VALUE_ICON_OPTIONS, type ValueIconId } from '@/lib/value-icons'
import { getValueTemplate } from '@/lib/value-templates'
import type { ValueLayout } from '@/lib/widgets'

export type AuroraSettings = {
  displayName: string
  themeId: ThemeId
  showRememberThis: boolean
  scanSources: string[]
  pinnedByValue: Record<string, Array<{ path: string; kind: 'file' | 'folder' }>>
  coreValues: Array<{
    id: string
    name: string
    iconId: ValueIconId
    purpose?: string
    tone?: string
    searchQuery?: string
    colorPair?: readonly [string, string]
  }>
  archivedValueIds: string[]
  valueLayouts: Record<string, ValueLayout>
  brainDumps: Record<string, string>
  widgetData: Record<string, unknown>
}

const SETTINGS_STORAGE_KEY = 'aurora-settings-v1'

const DEFAULT_SETTINGS: AuroraSettings = {
  displayName: 'Aurora User',
  themeId: 'spring-bloom',
  showRememberThis: true,
  scanSources: [],
  pinnedByValue: {},
  coreValues: [
    { id: 'work', name: 'Projects', iconId: 'target' },
    { id: 'health', name: 'Body', iconId: 'flame' },
    { id: 'relationships', name: 'People', iconId: 'heart' },
    { id: 'home', name: 'Home Base', iconId: 'doorOpen' },
    { id: 'money', name: 'Money Admin', iconId: 'dollarSign' },
    { id: 'learning', name: 'Curiosity', iconId: 'scale' },
    { id: 'support', name: 'Reset', iconId: 'dove' },
  ],
  archivedValueIds: [],
  valueLayouts: {},
  brainDumps: {},
  widgetData: {},
}

function readStoredSettings(): AuroraSettings | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<AuroraSettings> | null
    if (!parsed || typeof parsed !== 'object') return null

    const displayName =
      typeof parsed.displayName === 'string' && parsed.displayName.trim().length > 0
        ? parsed.displayName
        : DEFAULT_SETTINGS.displayName

    const themeIdCandidate = typeof parsed.themeId === 'string' ? parsed.themeId : ''
    const themeId = (themeIdCandidate in RESURFACING_THEMES ? themeIdCandidate : DEFAULT_SETTINGS.themeId) as ThemeId
    const showRememberThis = typeof parsed.showRememberThis === 'boolean' ? parsed.showRememberThis : DEFAULT_SETTINGS.showRememberThis
    const scanSources = Array.isArray(parsed.scanSources)
      ? parsed.scanSources.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      : DEFAULT_SETTINGS.scanSources

    const pinnedByValue: AuroraSettings['pinnedByValue'] =
      parsed.pinnedByValue && typeof parsed.pinnedByValue === 'object'
        ? Object.fromEntries(
          Object.entries(parsed.pinnedByValue as Record<string, unknown>).map(([key, value]) => {
            if (!Array.isArray(value)) return [key, []]
            const normalized = value
              .map((item) => {
                const obj = (item ?? {}) as { path?: unknown; kind?: unknown }
                const path = typeof obj.path === 'string' ? obj.path.trim() : ''
                const kind = obj.kind === 'folder' ? 'folder' : 'file'
                if (!path) return null
                return { path, kind } as const
              })
              .filter((v): v is NonNullable<typeof v> => Boolean(v))
            return [key, normalized]
          })
        )
        : DEFAULT_SETTINGS.pinnedByValue
    const coreValues = Array.isArray(parsed.coreValues)
      ? parsed.coreValues
        .map((item) => {
          const obj = (item ?? {}) as { id?: unknown; name?: unknown; iconId?: unknown }
          const id = typeof obj.id === 'string' && obj.id.trim().length > 0 ? obj.id : ''
          const name = typeof obj.name === 'string' && obj.name.trim().length > 0 ? obj.name : ''
          const iconIdCandidate = typeof obj.iconId === 'string' ? obj.iconId : ''
          const iconId = (iconIdCandidate in VALUE_ICON_OPTIONS ? iconIdCandidate : 'sparkles') as ValueIconId

          let purpose = typeof (obj as any).purpose === 'string' ? (obj as any).purpose : undefined
          let tone = typeof (obj as any).tone === 'string' ? (obj as any).tone : undefined
          let searchQuery = typeof (obj as any).searchQuery === 'string' ? (obj as any).searchQuery : undefined
          let colorPair = Array.isArray((obj as any).colorPair) && (obj as any).colorPair.length === 2 ? (obj as any).colorPair : undefined

          // Migration: If purpose is missing, copy from template
          if (!purpose) {
            const tmpl = getValueTemplate(id)
            if (tmpl) {
              purpose = tmpl.purpose
              tone = tmpl.tone
              searchQuery = tmpl.searchQuery
            }
          }

          if (!id || !name) return null
          return { id, name, iconId, purpose, tone, searchQuery, colorPair }
        })
        .filter((v): v is NonNullable<typeof v> => Boolean(v))
      : DEFAULT_SETTINGS.coreValues.map(v => {
        // Ensure default values also get the template data if starting fresh
        const tmpl = getValueTemplate(v.id)
        return {
          ...v,
          purpose: tmpl?.purpose,
          tone: tmpl?.tone,
          searchQuery: tmpl?.searchQuery
        }
      })

    const archivedValueIds = Array.isArray(parsed.archivedValueIds)
      ? parsed.archivedValueIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : DEFAULT_SETTINGS.archivedValueIds

    const valueLayouts =
      parsed.valueLayouts && typeof parsed.valueLayouts === 'object' ? (parsed.valueLayouts as Record<string, ValueLayout>) : {}
    const brainDumps =
      parsed.brainDumps && typeof parsed.brainDumps === 'object' ? (parsed.brainDumps as Record<string, string>) : {}
    const widgetData =
      parsed.widgetData && typeof parsed.widgetData === 'object' ? (parsed.widgetData as Record<string, unknown>) : {}

    return { displayName, themeId, showRememberThis, scanSources, pinnedByValue, coreValues, archivedValueIds, valueLayouts, brainDumps, widgetData }
  } catch {
    return null
  }
}

export function useAuroraSettings() {
  // Avoid hydration mismatch: initial render must be deterministic (server === client),
  // then load localStorage after mount.
  const [settings, setSettings] = useState<AuroraSettings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredSettings()
    if (stored) setSettings(stored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [hydrated, settings])

  const api = useMemo(() => {
    const updateSettings = (partial: Partial<AuroraSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }))
    }

    const resetSettings = () => {
      setSettings(DEFAULT_SETTINGS)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SETTINGS_STORAGE_KEY)
      }
    }

    return { updateSettings, resetSettings }
  }, [])

  return [settings, api.updateSettings, api.resetSettings] as const
}
