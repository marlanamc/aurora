'use client'

import { motion } from 'framer-motion'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon, formatDate } from '@/lib/tauri'

interface RecentFileItemProps {
  file: FileInfo
  onClick?: (file: FileInfo) => void
  index?: number
}

export function RecentFileItem({ file, onClick, index = 0 }: RecentFileItemProps) {
  const handleClick = () => {
    console.log('Recent file clicked:', file.path)
    onClick?.(file)
  }

  return (
    <motion.div
      className="
        flex items-center gap-3 p-3 rounded-lg
        backdrop-blur-sm
        cursor-pointer transition-all duration-200
        group
      "
      style={{
        ['--hover-bg' as any]: 'var(--aurora-surface-hover)',
      }}
      onClick={handleClick}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        x: 2,
        backgroundColor: 'var(--aurora-surface-hover)',
      }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      {/* File Icon */}
      <div className="text-xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
        {getFileIcon(file.file_type)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h3 
          className="text-sm font-medium truncate transition-colors"
          style={{ color: 'var(--aurora-text)' }}
        >
          {file.name}
        </h3>
        <p 
          className="text-xs"
          style={{ color: 'var(--aurora-text-secondary)' }}
        >
          {formatDate(file.modified_at)}
        </p>
      </div>

      {/* Subtle indicator */}
      <div 
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
        style={{ backgroundColor: 'var(--aurora-primary)' }} 
      />
    </motion.div>
  )
}

