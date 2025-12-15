'use client'

import type { FileInfo } from '@/lib/tauri'
import { openFile } from '@/lib/tauri'
import { Folder, FileText, Star, Clock, Zap, type IconComponent } from '@/lib/icons'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface QuickAccessPanelProps {
  files: FileInfo[]
  pinnedItems?: Array<{ kind: 'file' | 'folder'; path: string }>
  onOpenFile?: (path: string) => void
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function QuickAccessPanel({ files, pinnedItems = [], onOpenFile }: QuickAccessPanelProps) {
  // Get frequently accessed files (opened multiple times, recent)
  const frequentFiles = useMemo(() => {
    const fileMap = new Map<string, FileInfo & { accessCount: number }>()
    
    files.forEach(file => {
      if (file.last_opened_at) {
        const existing = fileMap.get(file.path)
        if (existing) {
          existing.accessCount++
        } else {
          fileMap.set(file.path, { ...file, accessCount: 1 })
        }
      }
    })

    return Array.from(fileMap.values())
      .filter(f => f.accessCount > 1 || (f.last_opened_at && Date.now() - f.last_opened_at < 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => {
        // Sort by access count, then by recency
        if (b.accessCount !== a.accessCount) return b.accessCount - a.accessCount
        return (b.last_opened_at ?? 0) - (a.last_opened_at ?? 0)
      })
      .slice(0, 5)
  }, [files])

  // Get spotlighted files
  const pinnedFiles = useMemo(() => {
    if (!pinnedItems.length) return []
    
    const pinnedPaths = new Set(pinnedItems.map(p => p.path))
    return files
      .filter(f => pinnedPaths.has(f.path))
      .slice(0, 5)
  }, [files, pinnedItems])

  const handleClick = async (path: string) => {
    if (onOpenFile) {
      onOpenFile(path)
    } else {
      try {
        await openFile(path)
      } catch (error) {
        console.error('Failed to open file:', error)
      }
    }
  }

  const getFileIcon = (file: FileInfo): IconComponent => {
    if (file.file_type === 'directory') return Folder
    return FileText
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div 
        className="p-6 pb-4 border-b"
        style={{ borderColor: 'var(--aurora-card-border, rgba(229, 231, 235, 0.5))' }}
      >
        <h2 className="text-lg font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--aurora-text, #111827)' }}>
          <Zap size={18} />
          Quick Access
        </h2>
        <p className="text-xs" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
          Your most important files and folders
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Spotlight */}
        {pinnedFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="opacity-60" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
                Spotlight
              </h3>
            </div>
            <div className="space-y-1">
              {pinnedFiles.map((file, index) => {
                const Icon = getFileIcon(file)
                return (
                  <motion.button
                    key={file.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleClick(file.path)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <Icon size={16} className="opacity-60 shrink-0" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                        {file.name}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Frequently Used */}
        {frequentFiles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="opacity-60" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }} />
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
                Frequently Used
              </h3>
            </div>
            <div className="space-y-1">
              {frequentFiles.map((file, index) => {
                const Icon = getFileIcon(file)
                return (
                  <motion.button
                    key={file.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (pinnedFiles.length + index) * 0.05 }}
                    onClick={() => handleClick(file.path)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <Icon size={16} className="opacity-60 shrink-0" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                        {file.name}
                      </div>
                      {file.last_opened_at && (
                        <div className="text-xs opacity-60" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
                          {formatDate(file.last_opened_at)}
                        </div>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pinnedFiles.length === 0 && frequentFiles.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--aurora-text-secondary, #9CA3AF)' }}>
            <Folder size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium mb-1">No quick access items</p>
            <p className="text-xs opacity-70">Spotlight files or open them frequently to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}

