'use client'

import { motion } from 'framer-motion'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon, formatDate, openFile } from '@/lib/tauri'

interface RecentsPanelProps {
  files: FileInfo[]
}

export function RecentsPanel({ files }: RecentsPanelProps) {
  // Sort by modified date and take the 10 most recent
  const recentFiles = [...files]
    .sort((a, b) => b.modified_at - a.modified_at)
    .slice(0, 10)

  const handleFileClick = async (path: string) => {
    try {
      await openFile(path)
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-macos-gray-900 mb-4">
        Recent Activity
      </h2>

      {recentFiles.length === 0 ? (
        <div className="text-center py-8 text-macos-gray-500 text-sm">
          No recent files yet
        </div>
      ) : (
        <div className="space-y-2">
          {recentFiles.map((file, index) => (
            <motion.div
              key={file.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-macos-gray-100 cursor-pointer transition-colors"
              onClick={() => handleFileClick(file.path)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* File Icon */}
              <div className="text-2xl flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-macos-gray-900 truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-macos-gray-500">
                  {formatDate(file.modified_at)}
                </p>
              </div>

              {/* Indicator dot */}
              <div className="w-2 h-2 rounded-full bg-macos-blue flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Clusters Section (placeholder for Phase 7) */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-macos-gray-900 mb-3">
          Clusters
        </h3>
        <div className="space-y-2">
          {['Ideas I Started', 'In Progress', 'Seasonal Files'].map(
            (cluster) => (
              <div
                key={cluster}
                className="p-2 rounded-lg border border-macos-gray-200 text-sm text-macos-gray-700 hover:bg-macos-gray-50 cursor-pointer transition-colors"
              >
                {cluster}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
