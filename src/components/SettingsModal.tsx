'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Reorder, useDragControls, type DragControls } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import { RESURFACING_THEMES, type ThemeId } from '@/lib/resurfacing-themes'
import { type GlobalTheme } from '@/lib/global-themes'
import { Archive, GripVertical, Settings as SettingsIcon, X, Palette, LayoutGrid, Folder, User } from '@/lib/icons'
import { type ThemePreference } from '@/lib/useThemeMode'
import { type AuroraSettings } from '@/lib/settings'
import { open } from '@tauri-apps/plugin-dialog'
import { VALUE_ICON_OPTIONS, type ValueIconId } from '@/lib/value-icons'
import { CoreValuesEditor, type CoreValue, type CoreValueDraft } from '@/components/settings/CoreValuesEditor'
import { QuickStartSection } from '@/components/settings/QuickStartSection'

const MAX_CORE_VALUES = 12

type Props = {
  isOpen: boolean
  onClose: () => void
  theme: GlobalTheme
  settings: AuroraSettings
  updateSettings: (partial: Partial<AuroraSettings>) => void
  themePreference: ThemePreference
  setThemePreference: (pref: ThemePreference) => void
  onReset: () => void
  onScanNow?: () => void
  onApplyTemplate?: (values: import('@/lib/starter-templates').TemplateCoreValue[], mode: 'replace' | 'add') => void
}

type SettingsTab = 'general' | 'appearance' | 'files' | 'values'

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  settings,
  updateSettings,
  themePreference,
  setThemePreference,
  onReset,
  onScanNow,
  onApplyTemplate,
}: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Memoized values for focus areas
  const archivedIdSet = useMemo(() => new Set(settings.archivedValueIds ?? []), [settings.archivedValueIds])
  const activeValues = useMemo(
    () => (settings.coreValues ?? []).filter((v) => !archivedIdSet.has(v.id)),
    [archivedIdSet, settings.coreValues]
  )
  const archivedValues = useMemo(
    () => (settings.coreValues ?? []).filter((v) => archivedIdSet.has(v.id)),
    [archivedIdSet, settings.coreValues]
  )

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const themeOptions = useMemo(() => {
    return Object.values(RESURFACING_THEMES).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }))
  }, [])

  const addScanSources = async () => {
    try {
      const selected = await open({ directory: true, multiple: true })
      const paths = (Array.isArray(selected) ? selected : selected ? [selected] : [])
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)

      if (paths.length === 0) return

      const next = Array.from(new Set([...(settings.scanSources ?? []), ...paths]))
      updateSettings({ scanSources: next })
    } catch {
      const manual = window.prompt('Paste a folder path to index (example: /Users/you/Documents):')
      if (!manual || manual.trim().length === 0) return
      const next = Array.from(new Set([...(settings.scanSources ?? []), manual.trim()]))
      updateSettings({ scanSources: next })
    }
  }

  const removeScanSource = (path: string) => {
    updateSettings({ scanSources: (settings.scanSources ?? []).filter((p) => p !== path) })
  }

  const createId = () => {
    const cryptoObj = globalThis.crypto as Crypto | undefined
    return cryptoObj?.randomUUID?.() ?? `cv_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }

  const addCoreValue = () => {
    if (activeValues.length >= MAX_CORE_VALUES) {
      window.alert(`You can have up to ${MAX_CORE_VALUES} values. Try removing or renaming one first.`)
      return
    }
    const name = window.prompt('Name a focus area (example: Creativity):')
    if (!name || name.trim().length === 0) return
    const next = [
      ...(settings.coreValues ?? []),
      { id: createId(), name: name.trim(), iconId: 'sparkles' as ValueIconId },
    ]
    updateSettings({ coreValues: next })
  }

  const removeCoreValue = (id: string) => {
    updateSettings({ coreValues: (settings.coreValues ?? []).filter((v) => v.id !== id) })
  }

  const archiveCoreValue = (id: string) => {
    const next = Array.from(new Set([...(settings.archivedValueIds ?? []), id]))
    updateSettings({ archivedValueIds: next })
  }

  const restoreCoreValue = (id: string) => {
    if (activeValues.length >= MAX_CORE_VALUES) {
      window.alert(`You can have up to ${MAX_CORE_VALUES} active values. Archive one first.`)
      return
    }
    updateSettings({ archivedValueIds: (settings.archivedValueIds ?? []).filter((v) => v !== id) })
  }

  const updateCoreValue = (id: string, partial: Partial<CoreValue>) => {
    updateSettings({
      coreValues: (settings.coreValues ?? []).map((v) => (v.id === id ? { ...v, ...partial } : v)),
    })
  }

  const reorderActiveValues = (nextActive: Array<{ id: string; name: string; iconId: ValueIconId }>) => {
    updateSettings({ coreValues: [...nextActive, ...archivedValues] })
  }

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'files', label: 'Content & Files', icon: Folder },
    { id: 'values', label: 'Focus Areas', icon: LayoutGrid },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.button
            type="button"
            aria-label="Close settings"
            className="absolute inset-0 cursor-default"
            style={{ 
              background: 'rgba(0,0,0,0.35)', 
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose()
            }}
          />

          <motion.div
            ref={panelRef}
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex h-[80vh] max-h-[800px]"
            style={{
              background: theme.components.card.background,
              border: theme.components.card.border,
              color: theme.colors.text,
              boxShadow: theme.effects.shadowHover,
              backdropFilter: theme.effects.blur,
              willChange: 'transform, opacity',
              transform: 'translate3d(0, 0, 0)',
            }}
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ background: theme.gradients.glow }}
            />

            {/* Sidebar */}
            <div className="relative z-10 w-64 flex-shrink-0 border-r flex flex-col" style={{ borderColor: `${theme.colors.primary}25`, background: 'rgba(255,255,255,0.03)' }}>
              <div className="p-6 border-b" style={{ borderColor: `${theme.colors.primary}25` }}>
                <h2 className="text-xl font-bold">Settings</h2>
                <div className="text-xs mt-1 opacity-70">Personalize Aurora OS</div>
              </div>
              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white/10 shadow-sm' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                      style={{
                        background: isActive ? theme.gradients.button : 'transparent',
                        color: isActive ? '#fff' : theme.colors.text,
                      }}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="p-4 border-t space-y-2" style={{ borderColor: `${theme.colors.primary}25` }}>
                <button
                  onClick={onReset}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-3 py-2 rounded-xl text-sm font-bold shadow-sm"
                  style={{ background: theme.components.card.background, border: theme.components.card.border }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-black/20">
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto">

                  {/* Header for mobile/context */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h3>
                  </div>

                  {/* GENERAL TAB */}
                  {activeTab === 'general' && (
                    <div className="space-y-8">
                      <section>
                        <label className="block text-sm font-semibold mb-2 opacity-80">Display Name</label>
                        <input
                          value={settings.displayName}
                          onChange={(e) => updateSettings({ displayName: e.target.value })}
                          className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-current"
                          style={{
                            background: theme.components.card.background,
                            border: theme.components.card.border,
                            color: theme.colors.text,
                          }}
                          placeholder="Your name"
                        />
                        <p className="text-xs mt-2 opacity-60">This name appears on the home screen greeting.</p>
                      </section>

                      <section>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                          <div>
                            <div className="text-sm font-bold">Remember This Widget</div>
                            <div className="text-xs opacity-60 mt-1">Show the resurfacing memory section on dashboard</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.showRememberThis}
                            onChange={(e) => updateSettings({ showRememberThis: e.target.checked })}
                            className="h-5 w-5 accent-current"
                            style={{ accentColor: theme.colors.primary }}
                          />
                        </div>
                      </section>
                    </div>
                  )}

                  {/* APPEARANCE TAB */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-8">
                      <section>
                        <label className="block text-sm font-semibold mb-3 opacity-80">Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                          {themeOptions.map((opt) => {
                            const isSelected = settings.themeId === opt.id
                            return (
                              <button
                                key={opt.id}
                                onClick={() => updateSettings({ themeId: opt.id as ThemeId })}
                                className={`p-4 rounded-xl text-left border transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-current' : 'hover:bg-white/5 opacity-80 hover:opacity-100'}`}
                                style={{
                                  background: theme.components.card.background,
                                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                                }}
                              >
                                <div className="font-bold text-sm">{opt.name}</div>
                                <div className="text-xs opacity-60 mt-1 line-clamp-1">{opt.description}</div>
                              </button>
                            )
                          })}
                        </div>
                      </section>

                      <section>
                        <label className="block text-sm font-semibold mb-3 opacity-80">Color Mode</label>
                        <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10">
                          {(['system', 'light', 'dark'] as const).map((pref) => (
                            <button
                              key={pref}
                              onClick={() => setThemePreference(pref)}
                              className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                              style={{
                                background: themePreference === pref ? theme.components.card.background : 'transparent',
                                color: theme.colors.text,
                                boxShadow: themePreference === pref ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                opacity: themePreference === pref ? 1 : 0.6
                              }}
                            >
                              {pref.charAt(0).toUpperCase() + pref.slice(1)}
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* FILES TAB */}
                  {activeTab === 'files' && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <h4 className="font-bold mb-2">Indexed Folders</h4>
                        <p className="text-sm opacity-70 mb-4 max-w-sm mx-auto">Aurora monitors these folders for changes to keep your dashboard up to date.</p>

                        <div className="flex justify-center gap-3">
                          <button
                            onClick={addScanSources}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all"
                            style={{ background: theme.gradients.button }}
                          >
                            + Add Folder
                          </button>
                          <button
                            onClick={() => {
                              if (onScanNow) onScanNow();
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 transition-all"
                          >
                            Scan Now
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(settings.scanSources?.length ?? 0) === 0 ? (
                          <div className="text-center py-8 text-sm opacity-50 border-2 border-dashed rounded-xl border-white/10">
                            No folders added yet.
                          </div>
                        ) : (
                          settings.scanSources?.map((path) => (
                            <div key={path} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <Folder size={20} className="opacity-50 shrink-0" />
                                <span className="text-sm font-mono opacity-80 truncate" title={path}>{path}</span>
                              </div>
                              <button
                                onClick={() => removeScanSource(path)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-xs font-bold bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* VALUES TAB */}
                  {activeTab === 'values' && (
                    <div className="space-y-8">
                      {/* Quick Start Section - only show if user has few/no focus areas */}
                      {activeValues.length <= 2 && onApplyTemplate && (
                        <QuickStartSection
                          theme={theme}
                          currentCount={activeValues.length}
                          onApplyTemplate={onApplyTemplate}
                        />
                      )}
                      
                      <CoreValuesEditor
                        activeValues={activeValues}
                        archivedValues={archivedValues}
                        theme={theme}
                        onUpdate={updateCoreValue}
                        onAdd={(draft: CoreValueDraft) => {
                          const id = createId()
                          const next = [
                            ...(settings.coreValues ?? []),
                            { id, ...draft },
                          ]
                          updateSettings({ coreValues: next })
                          return id
                        }}
                        onArchive={archiveCoreValue}
                        onRestore={restoreCoreValue}
                        onRemove={removeCoreValue}
                        onReorder={(val) => reorderActiveValues(val)}
                      />
                    </div>
                  )}

                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
