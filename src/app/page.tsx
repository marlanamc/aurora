'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { listen } from '@tauri-apps/api/event'
import { greet, scanDirectories, dbGetAllFiles, dbGetFileCount, watchSetPaths, onFileCreated, onFileModified, onFileRemoved, type FileInfo } from '@/lib/tauri'
import { RecentActivitySidebar } from '@/components/RecentActivitySidebar'
import { QuickAccessPanel } from '@/components/QuickAccessPanel'
import { ValuesIntegration } from '@/components/ValuesIntegration'
import { ValueDashboard } from '@/components/ValueDashboard'
import { SettingsModal } from '@/components/SettingsModal'
import { getGlobalTheme, type GlobalTheme } from '@/lib/global-themes'
import { type ThemeId } from '@/lib/resurfacing-themes'
import { Search, Sun, Moon, Settings as SettingsIcon, Home, X, RefreshCw, Palette } from '@/lib/icons'
import { useThemeMode } from '@/lib/useThemeMode'
import { useHasMounted } from '@/lib/useHasMounted'
import { useTimeBasedUI } from '@/lib/useTimeBasedUI'
import { useAuroraSettings } from '@/lib/settings'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'
import { createWidgetId } from '@/lib/widgets'
import { MonthlyCalendar } from '@/components/MonthlyCalendar'
import { GlobalSearch } from '@/components/GlobalSearch'
import { WelcomeOnboarding, hasCompletedWelcome } from '@/components/WelcomeOnboarding'
import { QuickCapture } from '@/components/QuickCapture'

const VALUE_PALETTE = [
  ['#10B981', '#34D399'],
  ['#3B82F6', '#60A5FA'],
  ['#A855F7', '#C084FC'],
  ['#EF4444', '#F87171'],
  ['#F59E0B', '#FBBF24'],
  ['#EC4899', '#F472B6'],
  ['#14B8A6', '#2DD4BF'],
  ['#6366F1', '#818CF8'],
] as const

export default function HomePage() {
  const HOMEBASE_LAYOUT_ID = '__homebase__'
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const [greeting, setGreeting] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hasAutoIndexedRef = useRef(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const [settings, updateSettings, resetSettings, recordFocusAreaActivity] = useAuroraSettings()
  const [selectedValueId, setSelectedValueId] = useState<string>('')
  const currentTheme = settings.themeId
  const initialDisplayNameRef = useRef(settings.displayName)

  const activeCoreValues = useMemo(() => {
    const archived = new Set(settings.archivedValueIds ?? [])
    return (settings.coreValues ?? []).filter((v) => !archived.has(v.id))
  }, [settings.archivedValueIds, settings.coreValues])

  const [themeMode, setThemeMode, themePreference] = useThemeMode()

  const hasMounted = useHasMounted()
  const theme: GlobalTheme = useMemo(() => getGlobalTheme(currentTheme, themeMode), [currentTheme, themeMode])
  const { complexity: uiComplexity, isBusyTime } = useTimeBasedUI()

  // File Drag & Drop
  useEffect(() => {
    let unlistenDragEnter: () => void;
    let unlistenDragLeave: () => void;
    let unlistenDrop: () => void;

    const setupListeners = async () => {
      unlistenDragEnter = await listen('tauri://drag-enter', () => {
        setIsDragging(true)
      })

      unlistenDragLeave = await listen('tauri://drag-leave', () => {
        setIsDragging(false)
      })

      unlistenDrop = await listen('tauri://drop', async (event) => {
        setIsDragging(false)
        if (Array.isArray(event.payload)) {
          const paths = event.payload as string[]
          if (paths.length > 0) {
            setScanning(true)
            try {
              await scanDirectories(paths)
              await loadFilesFromDatabase()
            } catch (error) {
              console.error('Failed to index dropped files:', error)
            } finally {
              setScanning(false)
            }
          }
        }
      })
    }

    setupListeners()

    return () => {
      unlistenDragEnter?.()
      unlistenDragLeave?.()
      unlistenDrop?.()
    }
  }, [])

  useEffect(() => {
    // Reset editing state when switching values
    setIsEditing(false)
    setIsPickerOpen(false)
  }, [selectedValueId])

  useEffect(() => {
    const activeIds = new Set(activeCoreValues.map((v) => v.id))
    if (!selectedValueId) return
    if (activeIds.has(selectedValueId)) return
    setSelectedValueId('')
  }, [activeCoreValues, selectedValueId])

  const selectValue = (id: string) => {
    setSelectedValueId(id)
    if (id !== '') {
      recordFocusAreaActivity(id)
    }
  }
  const goHomebase = () => setSelectedValueId('')

  const activeValue = useMemo(
    () => activeCoreValues.find((v) => v.id === selectedValueId) ?? null,
    [activeCoreValues, selectedValueId]
  )

  const activeValueColors = useMemo(() => {
    if (!activeValue) return null
    const idx = activeCoreValues.findIndex((v) => v.id === activeValue.id)
    const paletteIndex = Math.max(0, idx) % VALUE_PALETTE.length
    const [primary, secondary] = VALUE_PALETTE[paletteIndex]
    return { primary, secondary }
  }, [activeCoreValues, activeValue])

  const breadcrumbLabel = useMemo(() => {
    if (!selectedValueId) return 'Homebase'
    return `Homebase / ${activeValue?.name ?? 'Focus Area'}`
  }, [activeValue?.name, selectedValueId])

  const VALUE_PANEL_WIDTH_PX = 288 // tailwind w-72
  const GLOBAL_PANEL_WIDTH_PX = 320 // tailwind w-80

  const [isValuePanelOpen, setIsValuePanelOpen] = useState(false)
  const valuePanelRef = useRef<HTMLDivElement | null>(null)

  const [isGlobalPanelOpen, setIsGlobalPanelOpen] = useState(false)
  const globalPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isValuePanelOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (valuePanelRef.current?.contains(target)) return
      setIsValuePanelOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsValuePanelOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isValuePanelOpen])

  useEffect(() => {
    if (!isGlobalPanelOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (globalPanelRef.current?.contains(target)) return
      setIsGlobalPanelOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsGlobalPanelOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isGlobalPanelOpen])

  // Test the Rust connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const message = await greet(initialDisplayNameRef.current)
        setGreeting(message)
        console.log('✅ Rust connection working:', message)
      } catch (error) {
        console.error('❌ Failed to connect to Rust:', error)
      }
    }

    testConnection()
  }, [])

  // Check if welcome should be shown on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasCompletedWelcome()) {
      setShowWelcome(true)
    }
  }, [])

  // Load files from database on mount
  useEffect(() => {
    loadFilesFromDatabase()
  }, [])

  // If the user already picked folders but the DB is empty, auto-run the first index scan.
  useEffect(() => {
    if (hasAutoIndexedRef.current) return
    if (loading || scanning) return
    const sources = settings.scanSources ?? []
    if (sources.length === 0) return
    if (fileCount > 0) return

    hasAutoIndexedRef.current = true
    rescanDirectories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileCount, loading, scanning, settings.scanSources])

  // Configure Rust file watcher based on settings
  useEffect(() => {
    watchSetPaths(settings.scanSources ?? [])
  }, [settings.scanSources])

  // Live updates from Rust file watcher
  useEffect(() => {
    const timerRef = { id: null as ReturnType<typeof setTimeout> | null }

    const scheduleReload = () => {
      if (timerRef.id) return
      timerRef.id = setTimeout(async () => {
        timerRef.id = null
        await loadFilesFromDatabase()
      }, 400)
    }

    let unlistenCreated: (() => void) | null = null
    let unlistenModified: (() => void) | null = null
    let unlistenRemoved: (() => void) | null = null

    const start = async () => {
      try {
        unlistenCreated = await onFileCreated(() => scheduleReload())
        unlistenModified = await onFileModified(() => scheduleReload())
        unlistenRemoved = await onFileRemoved(() => scheduleReload())
      } catch {
        // Not running inside Tauri (or events not available)
      }
    }

    start()

    return () => {
      if (timerRef.id) clearTimeout(timerRef.id)
      if (unlistenCreated) unlistenCreated()
      if (unlistenModified) unlistenModified()
      if (unlistenRemoved) unlistenRemoved()
    }
  }, [])

  // Global Search Shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load files from database
  async function loadFilesFromDatabase() {
    setLoading(true)
    try {
      const dbFiles = await dbGetAllFiles()
      const count = await dbGetFileCount()

      console.log(`📂 Loaded ${dbFiles.length} files from database`)
      setFiles(dbFiles)
      setFileCount(count)

      if (dbFiles.length === 0) {
        console.log('💡 No files in database yet - run a scan!')
      }
    } catch (error) {
      console.error('Failed to load files from database:', error)
    } finally {
      setLoading(false)
    }
  }

  // Scan directories and save to database
  async function rescanDirectories() {
    const sources = settings.scanSources ?? []
    if (sources.length === 0) {
      setIsSettingsOpen(true)
      console.log('💡 Add folders to index in Settings → Content & Files')
      return
    }

    setScanning(true)
    try {
      const scannedFiles = await scanDirectories(sources)

      console.log(`📁 Scanned ${scannedFiles.length} files`)
      await loadFilesFromDatabase()
    } catch (error) {
      console.error('Failed to scan files:', error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden relative ${themeMode === 'dark' ? 'dark' : ''}`}
      style={useMemo(() => ({
        background: theme.gradients.background,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        ['--aurora-text' as any]: theme.colors.text,
        ['--aurora-text-secondary' as any]: theme.colors.textSecondary,
        ['--aurora-primary' as any]: theme.colors.primary,
        ['--aurora-secondary' as any]: theme.colors.secondary,
        ['--aurora-accent' as any]: theme.colors.accent,
        ['--aurora-surface' as any]: theme.colors.surface,
        ['--aurora-surface-hover' as any]: theme.colors.surfaceHover,
        ['--aurora-card-bg-default' as any]: theme.components.card.background,
        ['--aurora-card-bg-subtle' as any]: theme.components.card.background,
        ['--aurora-card-bg-glass' as any]: theme.components.card.background,
        ['--aurora-card-border' as any]: theme.components.card.border,
        ['--aurora-card-shadow' as any]: theme.effects.shadow,
        ['--aurora-glass-backdrop' as any]: `saturate(180%) ${theme.effects.blur}`,
        ['--aurora-glass-specular' as any]: themeMode === 'dark' ? 0.65 : 0.9,
        ['--aurora-glass-noise' as any]: themeMode === 'dark' ? 0.05 : 0.06,
        ['--aurora-card-pattern' as any]: theme.effects.backgroundPattern,
        ['--aurora-card-pattern-size' as any]: theme.id === 'autumn-ember' ? '60px 60px' : '100% 100%',
      }), [theme, themeMode])}
    >
      {/* Massive animated background effect */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={useMemo(() => ({
          backgroundImage: theme.effects.backgroundPattern,
          backgroundSize: '100px 100px',
        }), [theme.effects.backgroundPattern])}
      />

      {/* Global noise texture overlay */}
      <div className="noise-overlay" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* DRAMATIC HEADER */}
        <motion.header
          className="relative overflow-hidden"
          style={{
            background: theme.components.header.background,
            backdropFilter: theme.effects.blur,
            borderBottom: `1px solid ${theme.components.header.borderColor}`,
          }}
        >
          {/* macOS titlebar overlay drag region */}
          {/* macOS titlebar overlay drag region - FULL HEADER COVERAGE */}
          <div
            data-tauri-drag-region
            className="absolute inset-0 z-0"
          // style={{ height: 'var(--aurora-titlebar-height)' }} // Removed restricted height
          />

          {/* Header background gradient overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: theme.gradients.hero,
            }}
          />

          <div
            className="relative z-10 px-6 pb-2 pointer-events-none" // Added pointer-events-none, reduced pb-5 to pb-2
            style={{ paddingTop: 'calc(0.5rem + var(--aurora-titlebar-height))' }} // Reduced 1.25rem to 0.5rem
          >
            <div className="max-w-6xl mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-4">
              {/* Left: Branding */}
              {/* Left: Branding */}
              <motion.button
                type="button"
                onClick={goHomebase}
                className="text-left pointer-events-auto" // Added pointer-events-auto
                title="Go to Homebase"
                aria-label="Go to Homebase"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="text-3xl"> {/* Larger icon */}
                    <theme.icon size="1em" strokeWidth={2} />
                  </div>

                  <div>
                    <h1
                      className="text-3xl sm:text-4xl font-black leading-none mb-1"
                      style={{
                        fontFamily: theme.fonts.display,
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: theme.effects.shadow,
                      }}
                    >
                      Aurora OS
                    </h1>
                    <p
                      className="text-xs sm:text-sm font-medium tracking-wide"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {breadcrumbLabel}
                    </p>
                  </div>
                </div>
              </motion.button>

              {/* Active Value (inline, centered) */}
              {/* Active Value (inline, centered) */}
              <div className="justify-self-center min-w-[200px] h-16 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {activeValue && (() => {
                    const Icon = VALUE_ICON_OPTIONS[activeValue.iconId]
                    const iconColor = activeValueColors?.primary ?? theme.colors.primary
                    const secondaryColor = activeValueColors?.secondary ?? theme.colors.secondary

                    return (
                      <motion.div
                        key={activeValue.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative group cursor-default pointer-events-auto"
                      >
                        {/* Ambient Glow */}
                        <div 
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 rounded-full opacity-20 blur-xl pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                          style={{ background: iconColor }}
                        />

                        <div className="flex items-center gap-3 relative z-10">
                          {/* Icon Container */}
                          <div 
                            className="relative"
                          >
                              <div 
                                className="absolute inset-0 blur-md opacity-40"
                                style={{ background: iconColor }}
                              />
                              {Icon && (
                                <Icon 
                                  size={28} 
                                  strokeWidth={2.5} 
                                  className="relative z-10"
                                  style={{ 
                                    color: iconColor,
                                    filter: `drop-shadow(0 2px 4px ${iconColor}40)`
                                  }} 
                                />
                              )}
                          </div>

                          {/* Text with Gradient */}
                          <div className="flex flex-col">
                            <span 
                              className="text-2xl font-bold tracking-tight leading-none"
                              style={{ 
                                // fontFamily: theme.fonts.display, // Use body font to match other headers
                                background: `linear-gradient(135deg, ${iconColor}, ${secondaryColor})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: `drop-shadow(0 2px 10px ${iconColor}20)`
                              }}
                            >
                              {activeValue.name}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })()}
                </AnimatePresence>
              </div>

              {/* Right: Actions */}
              <motion.div
                className="flex items-center gap-4 pointer-events-auto" // Added pointer-events-auto
              >
                {/* Settings */}
                <motion.button
                  onClick={() => setIsSettingsOpen(true)}
                  className="relative p-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden group"
                  style={{
                    background: theme.components.card.background,
                    border: theme.components.card.border,
                    color: theme.colors.text,
                    backdropFilter: theme.effects.blur,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Settings"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <SettingsIcon size={20} strokeWidth={2} />
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: theme.gradients.glow }}
                  />
                </motion.button>

                {/* Theme Mode Toggle */}
                <motion.button
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  className="relative p-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden group"
                  style={{
                    background: theme.components.card.background,
                    border: theme.components.card.border,
                    color: theme.colors.text,
                    backdropFilter: theme.effects.blur,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <motion.span
                    className="relative z-10 flex items-center justify-center"
                    animate={{ rotate: themeMode === 'dark' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {themeMode === 'dark' ? (
                      <Moon size={20} strokeWidth={2} />
                    ) : (
                      <Sun size={20} strokeWidth={2} />
                    )}
                  </motion.span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: theme.gradients.glow }}
                  />
                </motion.button>

                {/* Quick actions toggle */}
                <motion.button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden group"
                  style={{
                    background: theme.components.card.background,
                    border: theme.components.card.border,
                    color: theme.colors.text,
                    backdropFilter: theme.effects.blur,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Palette size={18} />
                    <span>Customize</span>
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: theme.gradients.glow }}
                  />
                </motion.button>

              </motion.div>
            </div>
          </div>

          {/* Quick Actions Dropdown */}
          <AnimatePresence initial={false}>
            {showQuickActions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="px-6 pb-6"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${theme.colors.background}20)`,
                  }}
                >
                  <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      <button
                        onClick={() => {
                          setIsSearchOpen(true)
                          setShowQuickActions(false)
                        }}
                        className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        style={{ background: theme.components.card.background, border: theme.components.card.border, color: theme.colors.text }}
                      >
                        <Search size={24} />
                        <span className="text-xs font-semibold">Global Search</span>
                      </button>
                      <button
                        onClick={() => {
                          // Ensure we're on a dashboard that can have widgets
                          // If no value is selected, stay on homebase (it has its own dashboard)
                          setIsEditing(true)
                          setIsPickerOpen(true)
                          setShowQuickActions(false)
                        }}
                        className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        style={{ background: theme.components.card.background, border: theme.components.card.border, color: theme.colors.text }}
                      >
                        <SettingsIcon size={24} />
                        <span className="text-xs font-semibold">Add Widget</span>
                      </button>
                      <button
                        onClick={rescanDirectories}
                        className="p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        style={{ background: theme.components.card.background, border: theme.components.card.border, color: theme.colors.text }}
                      >
                        <RefreshCw size={24} className={scanning ? 'animate-spin' : ''} />
                        <span className="text-xs font-semibold">{scanning ? 'Scanning...' : 'Rescan Files'}</span>
                      </button>
                    </div>

                    <p className="text-sm font-semibold mb-3 px-1" style={{ color: theme.colors.textSecondary }}>
                      Choose a theme:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: 'spring-bloom' as ThemeId, emoji: '🌸', name: 'Spring Bloom' },
                        { id: 'summer-radiance' as ThemeId, emoji: '☀️', name: 'Summer' },
                        { id: 'autumn-ember' as ThemeId, emoji: '🍂', name: 'Autumn' },
                        { id: 'winter-quiet' as ThemeId, emoji: '❄️', name: 'Winter' },
                        { id: 'neon-dreams' as ThemeId, emoji: '🌈', name: 'Neon' },
                        { id: 'soft-focus' as ThemeId, emoji: '🌙', name: 'Soft Focus' },
                        { id: 'cosmic-void' as ThemeId, emoji: '🌌', name: 'Cosmic' },
                        { id: 'paper-ink' as ThemeId, emoji: '📜', name: 'Paper' },
                      ].map((themeOption, i) => (
                        <motion.button
                          key={themeOption.id}
                          onClick={() => {
                            updateSettings({ themeId: themeOption.id })
                            setShowQuickActions(false)
                          }}
                          className="p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden"
                          style={{
                            background: currentTheme === themeOption.id
                              ? theme.gradients.glow
                              : theme.components.card.background,
                            border: currentTheme === themeOption.id
                              ? `2px solid ${theme.colors.primary}`
                              : theme.components.card.border,
                          }}
                          whileHover={{
                            scale: 1.05,
                            y: -2,
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl leading-none">{themeOption.emoji}</span>
                            <span className="text-xs font-semibold" style={{ color: theme.colors.text }}>
                              {themeOption.name}
                            </span>
                          </div>
                          {currentTheme === themeOption.id && (
                            <div
                              className="absolute top-2 right-2 w-2 h-2 rounded-full"
                              style={{ background: theme.colors.primary }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Universal Drop Zone */}
          <AnimatePresence initial={false}>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center"
                style={{ 
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="absolute inset-4 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-6" style={{ borderColor: theme.colors.primary }}>
                  <div className="p-8 rounded-full bg-white/10">
                    <RefreshCw size={64} style={{ color: theme.colors.primary }} />
                  </div>
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-2">Drop to Index</h2>
                    <p className="text-white/60 text-lg">Add these files to your Aurora database</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>


        {/* Dashboard Content - Unified Layout */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="max-w-6xl mx-auto h-full">
            {showWelcome ? (
              <WelcomeOnboarding
                theme={theme}
                onComplete={(scanSources) => {
                  if (scanSources.length > 0) {
                    updateSettings({ scanSources })
                  }
                  setShowWelcome(false)
                  if (scanSources.length > 0) {
                    setTimeout(() => {
                      rescanDirectories()
                    }, 500)
                  }
                }}
                onSkip={() => {
                  setShowWelcome(false)
                }}
              />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-9xl mb-6">
                  <Search size={32} style={{ color: theme.colors.primary }} strokeWidth={2} />
                </div>
                <p
                  className="text-2xl font-semibold"
                  style={{
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.display,
                  }}
                >
                  Scanning your files...
                </p>
              </div>
            ) : fileCount === 0 ? (
              <div className="text-center py-20 px-6">
                <p
                  className="text-xl font-semibold mb-4"
                  style={{ color: theme.colors.text }}
                >
                  No files indexed yet
                </p>
                <p
                  className="text-sm mb-6 opacity-70"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {(settings.scanSources ?? []).length === 0
                    ? 'Add folders in Settings to get started'
                    : 'Files are being scanned...'}
                </p>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true)
                    if ((settings.scanSources ?? []).length > 0) {
                      setTimeout(() => {
                        rescanDirectories()
                      }, 300)
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                  style={{
                    background: theme.gradients.button,
                    color: '#000000',
                    boxShadow: theme.effects.shadow,
                  }}
                >
                  Open Settings
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primary Focus Areas - Unified Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Homebase: Focus Areas (default) */}
                  {!selectedValueId && (
                    <motion.div
                      className="lg:col-span-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <ValuesIntegration
                        coreValues={activeCoreValues}
                        selectedValueId={null}
                        theme={theme}
                        onValueSelect={(value) => selectValue(value.id)}
                        onAddFocusArea={(name, iconId, colorPair) => {
                          const cryptoObj = globalThis.crypto as Crypto | undefined
                          const id = cryptoObj?.randomUUID?.() ?? `cv_${Date.now()}_${Math.random().toString(16).slice(2)}`
                          const next = [
                            ...(settings.coreValues ?? []),
                            { id, name, iconId, colorPair },
                          ]
                          updateSettings({ coreValues: next })
                        }}
                        onApplyTemplate={(templateValues, mode) => {
                          const MAX_ACTIVE = 12
                          if (mode === 'replace') {
                            updateSettings({ coreValues: templateValues, archivedValueIds: [] })
                            return
                          }

                          const existing = settings.coreValues ?? []
                          const archived = new Set(settings.archivedValueIds ?? [])
                          const activeCount = existing.filter((v) => !archived.has(v.id)).length
                          let slots = MAX_ACTIVE - activeCount
                          if (slots <= 0) {
                            window.alert(`You already have ${MAX_ACTIVE} active focus areas. Archive one first, then try adding a template.`)
                            return
                          }

                          const existingById = new Map(existing.map((v) => [v.id, v] as const))
                          const restoreCandidatesInOrder = templateValues
                            .map((v) => v.id)
                            .filter((id) => archived.has(id) && existingById.has(id))
                          const restoreNow = restoreCandidatesInOrder.slice(0, slots)
                          slots -= restoreNow.length

                          const existingIds = new Set(existing.map((v) => v.id))
                          const additions = templateValues
                            .filter((v) => !existingIds.has(v.id))
                            .slice(0, slots)
                            .map((v, idx) => ({
                              ...v,
                              colorPair: CORE_VALUE_PALETTE[(existing.length + idx) % CORE_VALUE_PALETTE.length],
                            }))

                          const archivedValueIdsNext = (settings.archivedValueIds ?? []).filter((id) => !restoreNow.includes(id))
                          updateSettings({
                            coreValues: [...existing, ...additions],
                            archivedValueIds: archivedValueIdsNext,
                          })
                        }}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                      />
                    </motion.div>
                  )}

                  {/* Homebase: global widgets */}
                  {!selectedValueId && (
                    <motion.div
                      className="lg:col-span-2"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 }}
                    >
                      <ValueDashboard
                        valueId={HOMEBASE_LAYOUT_ID}
                        files={files}
                        theme={theme}
                        settings={settings}
                        updateSettings={updateSettings}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        isPickerOpen={isPickerOpen}
                        setIsPickerOpen={setIsPickerOpen}
                        uiComplexity={uiComplexity}
                        isBusyTime={isBusyTime}
                      />
                    </motion.div>
                  )}

                  {/* Value Dashboard (widgets) */}
                  {selectedValueId && (
                    <motion.div
                      className="lg:col-span-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ValueDashboard
                        valueId={selectedValueId}
                        files={files}
                        theme={theme}
                        settings={settings}
                        updateSettings={updateSettings}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        isPickerOpen={isPickerOpen}
                        setIsPickerOpen={setIsPickerOpen}
                        recordActivity={() => recordFocusAreaActivity(selectedValueId)}
                        uiComplexity={uiComplexity}
                        isBusyTime={isBusyTime}
                      />
                    </motion.div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* Left Sidebar - Focus Areas (toggleable) */}
      <aside
        ref={valuePanelRef}
        id="core-values-panel"
        className="absolute left-0 top-0 h-full w-72 z-40 overflow-hidden flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: theme.components.sidebar.background,
          backdropFilter: theme.effects.blur,
          borderRight: `2px solid ${theme.components.sidebar.borderColor}`,
          transform: isValuePanelOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        aria-label="Focus areas"
      >
        {/* Sidebar gradient overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.primary}20, transparent, ${theme.colors.secondary}20)`,
          }}
        />

        <div className="relative z-10 flex-1 overflow-auto pr-12 pl-4 pt-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home size={18} />
              <div className="text-sm font-black" style={{ color: theme.colors.text, fontFamily: theme.fonts.display }}>
                Homebase
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsValuePanelOpen(false)}
              className="p-2 rounded-xl"
              style={{ color: theme.colors.textSecondary, background: theme.colors.surfaceHover }}
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                goHomebase()
                setIsValuePanelOpen(false)
              }}
              className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left"
              style={{
                background: !selectedValueId ? theme.gradients.hero : theme.components.card.background,
                border: !selectedValueId ? `2px solid ${theme.colors.primary}55` : theme.components.card.border,
                color: theme.colors.text,
              }}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: theme.gradients.button, color: '#ffffff' }}
              >
                <Home size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight">Homebase</div>
                <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  All focus areas
                </div>
              </div>
            </button>

            <div className="h-px my-3" style={{ background: theme.colors.border }} />

            <div className="text-xs font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
              Focus Areas
            </div>

            {activeCoreValues.map((v, idx) => {
              const Icon = VALUE_ICON_OPTIONS[v.iconId]
              const [p, s] = VALUE_PALETTE[idx % VALUE_PALETTE.length]
              const active = v.id === selectedValueId
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    selectValue(v.id)
                    setIsValuePanelOpen(false)
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-transform"
                  style={{
                    background: active ? `linear-gradient(135deg, ${p}18, ${s}12)` : theme.components.card.background,
                    border: active ? `2px solid ${p}55` : theme.components.card.border,
                    color: theme.colors.text,
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${p}, ${s})`, color: '#ffffff' }}
                  >
                    {Icon ? <Icon size={18} strokeWidth={2} /> : null}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-tight truncate">{v.name}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Right Sidebar - Global (toggleable) */}
      <aside
        ref={globalPanelRef}
        id="global-panel"
        className="absolute right-0 top-0 h-full w-80 z-40 overflow-hidden flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: theme.components.sidebar.background,
          backdropFilter: theme.effects.blur,
          borderLeft: `2px solid ${theme.components.sidebar.borderColor}`,
          transform: isGlobalPanelOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
        aria-label="Global panel"
      >
        {/* Sidebar gradient overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.primary}20, transparent, ${theme.colors.secondary}20)`,
          }}
        />

        <div className="relative z-10 flex-1 overflow-auto pl-4 pr-4 pt-5 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black" style={{ color: theme.colors.text, fontFamily: theme.fonts.display }}>
              Panel
            </div>
            <button
              type="button"
              onClick={() => setIsGlobalPanelOpen(false)}
              className="p-2 rounded-xl"
              style={{ color: theme.colors.textSecondary, background: theme.colors.surfaceHover }}
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <MonthlyCalendar />
          <div className="relative">
            <QuickAccessPanel 
              files={files}
              pinnedItems={selectedValueId ? (settings.pinnedByValue?.[selectedValueId] ?? []) : []}
            />
          </div>
        </div>
      </aside>

      {/* Left edge tab (Obsidian-style) */}
      <button
        type="button"
        onClick={() => setIsValuePanelOpen((v) => !v)}
        className="fixed top-1/2 -translate-y-1/2 z-50 cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          left: isValuePanelOpen ? VALUE_PANEL_WIDTH_PX - 10 : 6,
          background: theme.components.card.background,
          border: theme.components.card.border,
          boxShadow: theme.effects.shadow,
          backdropFilter: theme.effects.blur,
          width: 28,
          height: 66,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
        }}
        title={isValuePanelOpen ? 'Hide focus areas' : 'Show focus areas'}
        aria-label={isValuePanelOpen ? 'Hide focus areas' : 'Show focus areas'}
        aria-controls="core-values-panel"
        aria-expanded={isValuePanelOpen}
      >
        <span className="sr-only">Toggle focus areas</span>
        <div
          className="mx-auto my-auto"
          style={{
            width: 12,
            height: 28,
            borderRadius: 7,
            border: `2px solid ${theme.colors.textSecondary}`,
            position: 'relative',
            opacity: 0.85,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 2,
              top: 2,
              bottom: 2,
              width: 3,
              borderRadius: 5,
              background: theme.colors.textSecondary,
              opacity: 0.85,
            }}
          />
        </div>
      </button>

      {/* Right edge tab (Obsidian-style) */}
      <button
        type="button"
        onClick={() => setIsGlobalPanelOpen((v) => !v)}
        className="fixed top-1/2 -translate-y-1/2 z-50 cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          right: isGlobalPanelOpen ? GLOBAL_PANEL_WIDTH_PX - 10 : 6,
          background: theme.components.card.background,
          border: theme.components.card.border,
          boxShadow: theme.effects.shadow,
          backdropFilter: theme.effects.blur,
          width: 28,
          height: 66,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
        title={isGlobalPanelOpen ? 'Hide panel' : 'Show panel'}
        aria-label={isGlobalPanelOpen ? 'Hide panel' : 'Show panel'}
        aria-controls="global-panel"
        aria-expanded={isGlobalPanelOpen}
      >
        <span className="sr-only">Toggle panel</span>
        <div
          className="mx-auto my-auto"
          style={{
            width: 12,
            height: 28,
            borderRadius: 7,
            border: `2px solid ${theme.colors.textSecondary}`,
            position: 'relative',
            opacity: 0.85,
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 2,
              top: 2,
              bottom: 2,
              width: 3,
              borderRadius: 5,
              background: theme.colors.textSecondary,
              opacity: 0.85,
            }}
          />
        </div>
      </button>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        settings={settings}
        updateSettings={updateSettings}
        themePreference={themePreference}
        setThemePreference={setThemeMode}
        onScanNow={rescanDirectories}
        onReset={() => {
          resetSettings()
          setThemeMode('system')
        }}
        onApplyTemplate={(templateValues, mode) => {
          const MAX_ACTIVE = 12
          if (mode === 'replace') {
            updateSettings({ coreValues: templateValues, archivedValueIds: [] })
            return
          }

          const existing = settings.coreValues ?? []
          const archived = new Set(settings.archivedValueIds ?? [])
          const activeCount = existing.filter((v) => !archived.has(v.id)).length
          let slots = MAX_ACTIVE - activeCount
          if (slots <= 0) {
            window.alert(`You already have ${MAX_ACTIVE} active focus areas. Archive one first, then try adding a template.`)
            return
          }

          const existingById = new Map(existing.map((v) => [v.id, v] as const))
          const restoreCandidatesInOrder = templateValues
            .map((v) => v.id)
            .filter((id) => archived.has(id) && existingById.has(id))
          const restoreNow = restoreCandidatesInOrder.slice(0, slots)
          slots -= restoreNow.length

          const newValues = templateValues
            .filter((v) => {
              if (restoreNow.includes(v.id)) {
                return false
              }
              return !existingById.has(v.id)
            })
            .slice(0, slots)

          const nextArchived = new Set(archived)
          restoreNow.forEach((id) => nextArchived.delete(id))

          const next = existing.map((v) => {
            if (restoreNow.includes(v.id)) {
              return { ...v }
            }
            return v
          })

          updateSettings({
            coreValues: [...next, ...newValues],
            archivedValueIds: Array.from(nextArchived),
          })
        }}
      />

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        theme={theme}
      />

      {/* Quick Capture - Always accessible */}
      <QuickCapture
        theme={theme}
        currentFocusAreaId={selectedValueId}
        onCaptureLink={(url) => {
          // Find or create Links widget for current focus area
          if (selectedValueId) {
            const layout = settings.valueLayouts?.[selectedValueId] ?? { widgets: [] }
            const linksWidget = layout.widgets?.find((w) => w.type === 'links')
            
            if (linksWidget) {
              // Add to existing Links widget
              const currentData = settings.widgetData?.[linksWidget.id] as { links: Array<{ id: string; url: string; label?: string }> } | undefined
              const links = currentData?.links ?? []
              const newLink = {
                id: globalThis.crypto?.randomUUID?.() ?? `l_${Date.now()}`,
                url,
              }
              updateSettings({
                widgetData: {
                  ...settings.widgetData,
                  [linksWidget.id]: { links: [newLink, ...links] },
                },
              })
            } else {
              // Create Links widget and add link
              const widgetId = createWidgetId('links')
              updateSettings({
                valueLayouts: {
                  ...settings.valueLayouts,
                  [selectedValueId]: {
                    widgets: [...layout.widgets, { id: widgetId, type: 'links', span: 2 }],
                  },
                },
                widgetData: {
                  ...settings.widgetData,
                  [widgetId]: {
                    links: [{ id: globalThis.crypto?.randomUUID?.() ?? `l_${Date.now()}`, url }],
                  },
                },
              })
            }
          }
        }}
        onCaptureNote={(text) => {
          // Add to Brain Dump for current focus area or homebase
          const targetArea = selectedValueId || '__homebase__'
          const currentDump = settings.brainDumps?.[targetArea] ?? ''
          const newText = currentDump ? `${currentDump}\n\n${text}` : text
          updateSettings({
            brainDumps: {
              ...settings.brainDumps,
              [targetArea]: newText,
            },
          })
        }}
        onCapturePin={() => {
          // Open file picker to pin a file
          if (selectedValueId) {
            // This would ideally open a file picker
            // For now, we'll show a message
            window.alert('File pinning from Quick Capture coming soon! For now, use the file tile\'s pin button.')
          }
        }}
        onCaptureReminder={(text) => {
          // Add to calendar or create a reminder
          // For now, add to Brain Dump with a reminder prefix
          const targetArea = selectedValueId || '__homebase__'
          const currentDump = settings.brainDumps?.[targetArea] ?? ''
          const reminderText = `🔔 REMINDER: ${text}`
          const newText = currentDump ? `${currentDump}\n\n${reminderText}` : reminderText
          updateSettings({
            brainDumps: {
              ...settings.brainDumps,
              [targetArea]: newText,
            },
          })
        }}
      />

    </div>
  )
}
