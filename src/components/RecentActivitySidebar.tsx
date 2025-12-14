'use client'

import type { FileInfo } from '@/lib/tauri'
import { RecentFileItem } from './RecentFileItem'

interface RecentActivitySidebarProps {
  files: FileInfo[]
}

export function RecentActivitySidebar({ files }: RecentActivitySidebarProps) {
  // Sort by modified date and take the 8 most recent
  const recentFiles = [...files]
    .sort((a, b) => (b.last_opened_at ?? b.modified_at) - (a.last_opened_at ?? a.modified_at))
    .slice(0, 8)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div 
        className="p-6 pb-4 border-b"
        style={{ borderColor: 'var(--aurora-card-border, rgba(229, 231, 235, 0.5))' }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--aurora-text, #111827)' }}>
          Recent Files
        </h2>
        <p className="text-xs" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
          Your latest file interactions
        </p>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-auto p-4 space-y-1">
        {recentFiles.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--aurora-text-secondary, #9CA3AF)' }}>
            No recent files yet
          </div>
        ) : (
          recentFiles.map((file, index) => (
            <RecentFileItem
              key={file.path}
              file={file}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}
