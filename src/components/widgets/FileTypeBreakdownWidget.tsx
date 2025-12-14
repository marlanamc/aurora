'use client'

import { useMemo } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { FileText } from '@/lib/icons'
import { type FileInfo } from '@/lib/tauri'
import { type GlobalTheme } from '@/lib/global-themes'

type FileTypeStats = {
  type: string
  count: number
  totalSize: number
  percentage: number
}

export function FileTypeBreakdownWidget({
  files,
  theme,
}: {
  files: FileInfo[]
  theme: GlobalTheme
}) {
  const stats = useMemo(() => {
    const typeMap = new Map<string, { count: number; totalSize: number }>()

    files.forEach((file) => {
      const type = file.file_type || 'other'
      const existing = typeMap.get(type) || { count: 0, totalSize: 0 }
      typeMap.set(type, {
        count: existing.count + 1,
        totalSize: existing.totalSize + file.size,
      })
    })

    const total = files.length
    const statsArray: FileTypeStats[] = Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type: type || 'other',
        count: data.count,
        totalSize: data.totalSize,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    return statsArray
  }, [files])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  if (files.length === 0) {
    return (
      <UnifiedCard padding="md">
        <UnifiedCardHeader icon={FileText} title="File Types" subtitle="No files indexed" />
        <div className="text-sm py-4" style={{ color: theme.colors.textSecondary }}>
          Index some files to see breakdown
        </div>
      </UnifiedCard>
    )
  }

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={FileText}
        title="File Types"
        subtitle={`${files.length} files total`}
      />

      <div className="space-y-2 mt-4">
        {stats.map((stat, idx) => {
          const colors = [
            theme.colors.primary,
            theme.colors.secondary,
            theme.colors.accent,
            '#10B981',
            '#3B82F6',
            '#A855F7',
            '#EF4444',
            '#F59E0B',
          ]
          const color = colors[idx % colors.length]

          return (
            <div key={stat.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: color }}
                  />
                  <span style={{ color: theme.colors.text }}>
                    {stat.type || 'other'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {stat.count}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                    {stat.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: theme.colors.surface }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: color,
                    width: `${stat.percentage}%`,
                  }}
                />
              </div>
              <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                {formatSize(stat.totalSize)}
              </div>
            </div>
          )
        })}
      </div>

      {stats.length === 0 && (
        <div className="text-sm py-4 text-center" style={{ color: theme.colors.textSecondary }}>
          No file type data available
        </div>
      )}
    </UnifiedCard>
  )
}
