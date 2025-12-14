'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { FileInfo, ResurfacedFile } from '@/lib/tauri'
import { dbGetResurfacedFiles } from '@/lib/tauri'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'
import { Sparkles, FileText } from '@/lib/icons'

interface RememberThisSectionProps {
  files: FileInfo[]
}

export function RememberThisSection({ files }: RememberThisSectionProps) {
  const [resurfacedFiles, setResurfacedFiles] = useState<ResurfacedFile[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (files.length === 0) {
        setResurfacedFiles([])
        return
      }
      try {
        const next = await dbGetResurfacedFiles(3)
        if (!cancelled) setResurfacedFiles(next)
      } catch {
        if (!cancelled) setResurfacedFiles([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [files.length])

  if (resurfacedFiles.length === 0) {
    return null
  }

  return (
    <UnifiedCard variant="subtle">
      <UnifiedCardHeader
        icon={Sparkles}
        title="Remember This?"
        subtitle="Files resurfacing from the past"
      />

      {/* Simple grid of file cards */}
      <div className="grid grid-cols-3 gap-4">
        {resurfacedFiles.map(({ file, reason, explanation }, index) => (
          <motion.div
            key={file.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className="p-4 rounded-xl border hover:shadow-md transition-shadow"
              style={{
                background: 'var(--aurora-card-bg-subtle, rgba(255, 255, 255, 0.6))',
                borderColor: 'var(--aurora-card-border, rgba(255, 255, 255, 0.28))',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText size={32} className="flex-shrink-0" style={{ color: 'var(--aurora-text, #374151)' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate mb-1" style={{ color: 'var(--aurora-text, #111827)' }}>
                    {file.name}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
                    {new Date(file.modified_at * 1000).toLocaleDateString()}
                  </p>
                  {explanation && (
                    <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--aurora-text-secondary, #6B7280)' }}>
                      {explanation}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {reason}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </UnifiedCard>
  )
}
