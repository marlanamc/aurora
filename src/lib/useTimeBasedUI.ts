import { useMemo } from 'react'

export type UIComplexity = 'simple' | 'normal' | 'detailed'

/**
 * Hook that determines UI complexity based on time of day
 * - Morning (6-9): Simple (gentle start to day)
 * - Peak focus (9-12, 14-17): Normal (balanced productivity)
 * - Evening (17-21): Detailed (more relaxed, can handle complexity)
 * - Late night (21-6): Simple (reduced cognitive load)
 */
export function useTimeBasedUI(): {
  complexity: UIComplexity
  isBusyTime: boolean
  timeContext: string
} {
  const now = useMemo(() => new Date(), [])

  const { complexity, isBusyTime, timeContext } = useMemo(() => {
    const hour = now.getHours()

    if (hour >= 6 && hour < 9) {
      // Morning - gentle start
      return {
        complexity: 'simple' as UIComplexity,
        isBusyTime: false,
        timeContext: 'morning'
      }
    } else if (hour >= 9 && hour < 12) {
      // Morning peak focus
      return {
        complexity: 'normal' as UIComplexity,
        isBusyTime: true,
        timeContext: 'peak-morning'
      }
    } else if (hour >= 12 && hour < 14) {
      // Lunch break
      return {
        complexity: 'simple' as UIComplexity,
        isBusyTime: false,
        timeContext: 'lunch'
      }
    } else if (hour >= 14 && hour < 17) {
      // Afternoon peak focus
      return {
        complexity: 'normal' as UIComplexity,
        isBusyTime: true,
        timeContext: 'peak-afternoon'
      }
    } else if (hour >= 17 && hour < 21) {
      // Evening - more relaxed
      return {
        complexity: 'detailed' as UIComplexity,
        isBusyTime: false,
        timeContext: 'evening'
      }
    } else {
      // Late night - reduced cognitive load
      return {
        complexity: 'simple' as UIComplexity,
        isBusyTime: false,
        timeContext: 'night'
      }
    }
  }, [now])

  return { complexity, isBusyTime, timeContext }
}