'use client'

import { motion } from 'framer-motion'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon, formatFileSize, formatDate, openFile } from '@/lib/tauri'
import { getBestTagSuggestion } from '@/lib/smartFileTagging'
import { useAuroraSettings } from '@/lib/settings'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'
import { Sparkles } from '@/lib/icons'

interface FileTileProps {
  file: FileInfo
  showSmartTags?: boolean
}

export function FileTile({ file, showSmartTags = true }: FileTileProps) {
  const [settings] = useAuroraSettings()

  // Get smart tag suggestion
  const smartSuggestion = showSmartTags && settings.showSmartTagging ?
    getBestTagSuggestion(
      {
        name: file.name,
        path: file.path,
        extension: file.file_type ? `.${file.file_type}` : undefined,
        size: Number(file.size),
        modifiedAt: file.modified_at
      },
      settings.coreValues || []
    ) : null
  const handleClick = async () => {
    try {
      await openFile(file.path)
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  }

  return (
    <motion.div
      className="macos-card h-48 p-4 cursor-pointer group relative overflow-hidden"
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* File Icon */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-3">
          {getFileIcon(file.file_type)}
        </div>

        {/* File Name */}
        <h3 className="text-sm font-medium text-macos-gray-900 text-center line-clamp-2 mb-1">
          {file.name}
        </h3>

        {/* File Metadata */}
        <div className="text-xs text-macos-gray-500 text-center space-y-0.5">
          <p>{formatFileSize(file.size)}</p>
          <p>{formatDate(file.modified_at)}</p>
        </div>

        {/* Smart Tag Suggestion */}
        {smartSuggestion && smartSuggestion.confidence > 0.4 && (
          <div className="mt-2 flex items-center gap-1">
            <Sparkles size={10} className="text-yellow-500" />
            <div className="px-2 py-0.5 text-xs rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              Suggest: {settings.coreValues?.find(v => v.id === smartSuggestion.focusAreaId)?.name}
            </div>
          </div>
        )}

        {/* Finder Tags (if any) */}
        {file.finder_tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {file.finder_tags.slice(0, 3).map((tag, i) => (
              <div
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-macos-gray-100 text-macos-gray-700"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-macos-blue bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
    </motion.div>
  )
}
