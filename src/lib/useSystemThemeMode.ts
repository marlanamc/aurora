'use client'

import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

export function useSystemThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const update = () => setMode(media.matches ? 'dark' : 'light')
    update()

    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return mode
}

