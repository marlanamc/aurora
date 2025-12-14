'use client'

import { motion } from 'framer-motion'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon } from '@/lib/tauri'
import { Rocket, Lightbulb, BookOpen, Folder, type IconComponent } from '@/lib/icons'

interface ClusterTileProps {
  clusterName: string
  files: FileInfo[]
  icon?: string
  color?: string
  onClick?: (clusterName: string) => void
}

const clusterConfig: Record<string, { icon: IconComponent; gradient: string }> = {
  'In Progress': {
    icon: Rocket,
    gradient: 'from-blue-200 via-indigo-100 to-purple-100',
  },
  'Ideas I Started': {
    icon: Lightbulb,
    gradient: 'from-yellow-200 via-amber-100 to-orange-100',
  },
  'Unfinished Projects': {
    icon: BookOpen,
    gradient: 'from-purple-200 via-pink-100 to-rose-100',
  },
  'Recent Downloads': {
    icon: Folder,
    gradient: 'from-green-200 via-emerald-100 to-teal-100',
  },
}

export function ClusterTile({ clusterName, files, icon, color, onClick }: ClusterTileProps) {
  // Use theme colors but distinct icons for each type
  const iconMap: Record<string, IconComponent> = {
    'In Progress': Rocket,
    'Ideas I Started': Lightbulb,
    'Unfinished Projects': BookOpen,
    'Recent Downloads': Folder,
  }

  const Icon = iconMap[clusterName] || Folder

  const handleClick = () => {
    console.log('Cluster clicked:', clusterName)
    onClick?.(clusterName)
  }

  return (
    <motion.div
      className="
        relative rounded-xl p-5 cursor-pointer
        shadow-lg hover:shadow-xl
        transition-all duration-300
        group overflow-hidden
        min-h-[140px] file-tile-hover
      "
      style={{
        // Use the global card background from the theme
        background: 'var(--aurora-card-bg-default)',
        border: '1px solid var(--aurora-card-border, rgba(255, 255, 255, 0.2))',
        backdropFilter: 'var(--aurora-glass-backdrop, blur(10px))',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Decorative gradient overlay (very subtle) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
        style={{
          background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Cluster Icon and Name */}
        <div className="flex items-center gap-3 mb-3">
          <Icon size={40} style={{ color: 'var(--aurora-primary)' }} />
          <h3
            className="text-base font-bold transition-colors"
            style={{
              color: 'var(--aurora-text)',
              fontFamily: 'var(--font-display, inherit)'
            }}
          >
            {clusterName}
          </h3>
        </div>

        {/* File Count and Preview */}
        <div className="mt-auto">
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--aurora-text-secondary)' }}>
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </p>

          {/* File icon previews */}
          {files.length > 0 && (
            <div className="flex gap-2">
              {files.slice(0, 3).map((file, index) => (
                <div
                  key={file.path}
                  className="text-2xl transform group-hover:scale-110 transition-transform duration-200"
                  style={{
                    transitionDelay: `${index * 50}ms`,
                    color: 'var(--aurora-text)'
                  }}
                >
                  {getFileIcon(file.file_type)}
                </div>
              ))}
              {files.length > 3 && (
                <div
                  className="text-xs font-semibold px-2 py-1 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--aurora-surface-hover)',
                    color: 'var(--aurora-text-secondary)'
                  }}
                >
                  +{files.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
