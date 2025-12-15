'use client'

import { motion } from 'framer-motion'
import { VALUE_ICON_OPTIONS, type ValueIconId } from '@/lib/value-icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { Sparkles } from '@/lib/icons'

interface FocusArea {
  id: string
  name: string
  iconId: ValueIconId
  colorPair?: readonly [string, string]
  lastActivity?: number // timestamp
}

interface FocusAreaBarProps {
  focusAreas: FocusArea[]
  selectedId: string | null
  onSelect: (area: FocusArea) => void
  onLogProgress?: (areaId: string) => void
  theme: GlobalTheme
}

type ActivityStatus = 'active' | 'recent' | 'dormant' | 'forgotten'

function getActivityStatus(lastActivity?: number): ActivityStatus {
  if (!lastActivity) return 'forgotten'

  const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)

  if (daysSince <= 1) return 'active'      // Last 24h
  if (daysSince <= 7) return 'recent'      // This week
  if (daysSince <= 30) return 'dormant'    // This month
  return 'forgotten'                       // Older
}

function getStatusStyles(status: ActivityStatus, isSelected: boolean, primaryColor: string) {
  const baseStyles = {
    background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10)`,
    border: `1px solid ${primaryColor}40`,
  }

  // Size based on status
  const size = status === 'active' ? 'w-8 h-8' :
               status === 'recent' ? 'w-7 h-7' :
               status === 'dormant' ? 'w-6 h-6' : 'w-5 h-5'

  // Opacity based on status
  const opacity = status === 'active' ? 1.0 :
                  status === 'recent' ? 0.9 :
                  status === 'dormant' ? 0.7 : 0.5

  return { size, opacity, baseStyles }
}

export function FocusAreaBar({ focusAreas, selectedId, onSelect, onLogProgress, theme }: FocusAreaBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
      {focusAreas.map((area) => {
        const Icon = VALUE_ICON_OPTIONS[area.iconId] ?? Sparkles
        const [primaryColor] = area.colorPair || [theme.colors.primary]
        const status = getActivityStatus(area.lastActivity)
        const isSelected = area.id === selectedId
        const { size, opacity, baseStyles } = getStatusStyles(status, isSelected, primaryColor)

        return (
          <div key={area.id} className="group flex flex-col items-center gap-1">
            <motion.button
              onClick={() => onSelect(area)}
              className={`rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${size}
                         ${isSelected ? 'ring-2 ring-offset-1' : 'hover:ring-1 hover:ring-offset-1'}`}
              style={{
                ...baseStyles,
                opacity,
                color: primaryColor,
                ['--tw-ring-color' as any]: primaryColor,
                ['--tw-ring-offset-color' as any]: theme.colors.background,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`${area.name} (${status})`}
              aria-label={`Switch to ${area.name} focus area`}
            >
              <Icon size={isSelected ? 16 : 14} strokeWidth={2} />
            </motion.button>

            {/* Quick progress button */}
            {onLogProgress && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  onLogProgress(area.id)
                }}
                className="w-4 h-4 rounded-full bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={`Log progress on ${area.name}`}
                aria-label={`Log progress on ${area.name}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              </motion.button>
            )}
          </div>
        )
      })}
    </div>
  )
}