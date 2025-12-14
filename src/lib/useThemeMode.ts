'use client'

import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

const THEME_STORAGE_KEY = 'aurora-theme-mode'

export function useThemeMode(): [ThemeMode, (mode: ThemePreference) => void, ThemePreference] {
  // Avoid hydration mismatch: keep initial render deterministic (server === client),
  // then hydrate from localStorage/system preference after mount.
  const [preference, setPreference] = useState<ThemePreference>('system')
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null
    const nextPreference: ThemePreference = stored || 'system'
    setPreference(nextPreference)

    if (nextPreference === 'system') {
      const media = window.matchMedia?.('(prefers-color-scheme: dark)')
      setMode(media?.matches ? 'dark' : 'light')
    } else {
      setMode(nextPreference)
    }
  }, [])

  // Listen to system preference
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const updateSystemMode = () => {
      if (preference === 'system') {
        setMode(media.matches ? 'dark' : 'light')
      }
    }

    updateSystemMode()
    media.addEventListener?.('change', updateSystemMode)
    return () => media.removeEventListener?.('change', updateSystemMode)
  }, [preference])

  // Update mode when preference changes
  useEffect(() => {
    if (preference === 'system') {
      const media = window.matchMedia?.('(prefers-color-scheme: dark)')
      setMode(media?.matches ? 'dark' : 'light')
    } else {
      setMode(preference)
    }
  }, [preference])

  const setThemeMode = (newMode: ThemePreference) => {
    setPreference(newMode)
    localStorage.setItem(THEME_STORAGE_KEY, newMode)
    
    if (newMode === 'system') {
      const media = window.matchMedia?.('(prefers-color-scheme: dark)')
      setMode(media?.matches ? 'dark' : 'light')
    } else {
      setMode(newMode)
    }
  }

  return [mode, setThemeMode, preference]
}
