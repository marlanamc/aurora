'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon, formatDate } from '@/lib/tauri'

interface ResurfaceCarouselProps {
  files: FileInfo[]
}

export function ResurfaceCarousel({ files }: ResurfaceCarouselProps) {
  const [resurfacedFiles, setResurfacedFiles] = useState<FileInfo[]>([])

  useEffect(() => {
    // Select 3 random files for resurfacing
    // In later phases, we'll use smart algorithms:
    // 1. Forgotten files (14-60 days untouched)
    // 2. Seasonal echoes (files from same time last year)
    // 3. Random delight (pure serendipity)

    if (files.length > 0) {
      const shuffled = [...files].sort(() => Math.random() - 0.5)
      setResurfacedFiles(shuffled.slice(0, 3))
    }
  }, [files])

  if (resurfacedFiles.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-macos-purple/10 to-macos-blue/10 rounded-macos-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-macos-gray-900">
          ✨ Remember This?
        </h2>
        <p className="text-sm text-macos-gray-600">
          Files you might have forgotten
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence>
          {resurfacedFiles.map((file, index) => (
            <motion.div
              key={file.path}
              className="macos-card p-4 cursor-pointer hover:shadow-macos-hover transition-shadow"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{getFileIcon(file.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-macos-gray-900 truncate">
                    {file.name}
                  </h3>
                  <p className="text-xs text-macos-gray-500">
                    {formatDate(file.modified_at)}
                  </p>
                </div>
              </div>

              {/* Reason badge */}
              <div className="inline-block px-2 py-1 text-xs rounded-full bg-macos-purple/10 text-macos-purple font-medium">
                {index === 0 && '🕐 Forgotten'}
                {index === 1 && '🌸 Seasonal Echo'}
                {index === 2 && '✨ Random Delight'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
