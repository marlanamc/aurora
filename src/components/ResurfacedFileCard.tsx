'use client'

import { motion } from 'framer-motion'
import React from 'react'
import type { FileInfo } from '@/lib/tauri'
import { getFileIcon, formatDate } from '@/lib/tauri'
import type { ResurfacingTheme } from '@/lib/resurfacing-themes'

export type ResurfaceReason = 'Forgotten' | 'Seasonal Echo' | 'Random Delight'

interface ResurfacedFileCardProps {
  file: FileInfo
  reason: ResurfaceReason
  explanation?: string
  onClick?: (file: FileInfo) => void
  theme: ResurfacingTheme
}

export function ResurfacedFileCard({ file, reason, explanation, onClick, theme }: ResurfacedFileCardProps) {
  const reasonStyle = theme.reasonStyles[reason]
  const displayExplanation = explanation || `A ${reason.toLowerCase()} moment`

  const handleClick = () => {
    console.log('Resurfaced file clicked:', file.path)
    onClick?.(file)
  }

  return (
    <motion.div
      className={`
        relative rounded-2xl p-6 cursor-pointer
        bg-gradient-to-br ${reasonStyle.gradient}
        shadow-lg hover:shadow-2xl
        transition-all duration-300
        group overflow-hidden
      `}
      style={{
        border: theme.effects.borderStyle,
        fontFamily: theme.fonts.body,
      }}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
    >
      {/* Decorative background pattern with theme awareness */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: theme.effects.backgroundPattern,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Animated glow orb on hover */}
      <motion.div
        className="absolute w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: reasonStyle.gradient,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* File Icon - Large and prominent with enhanced animation */}
        <motion.div
          className="text-7xl mb-4"
          whileHover={{
            scale: 1.15,
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{
            scale: { duration: 0.3 },
            rotate: { duration: 0.5 },
          }}
        >
          {getFileIcon(file.file_type)}
        </motion.div>

        {/* File Name */}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2 group-hover:scale-105 transition-transform duration-300 origin-left"
          style={{
            color: theme.colors.text,
            fontFamily: theme.fonts.display,
          }}
        >
          {file.name}
        </h3>

        {/* Date with enhanced styling */}
        <p
          className="text-sm mb-3"
          style={{ color: theme.colors.textSecondary }}
        >
          {formatDate(file.modified_at)}
        </p>

        {/* Emotional Explanation with theme-aware styling */}
        <p
          className="text-sm mb-4 italic leading-relaxed"
          style={{
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.body,
          }}
        >
          &ldquo;{displayExplanation}&rdquo;
        </p>

        {/* Reason Badge with enhanced design */}
        <motion.div
          className={`
            mt-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full
            ${reasonStyle.accentColor} font-medium text-sm
            shadow-md
          `}
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}25, ${theme.colors.secondary}20)`,
            border: `1.5px solid ${theme.colors.primary}40`,
            backdropFilter: 'blur(8px)',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className="text-lg"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {React.createElement(reasonStyle.icon, { size: 18 })}
          </motion.span>
          <span>{reason}</span>
        </motion.div>
      </div>

      {/* Hover glow effect with theme colors */}
      <div
        className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br ${reasonStyle.gradient}
          opacity-0 group-hover:opacity-20
          transition-opacity duration-500
          blur-xl -z-10
        `}
        style={{
          filter: `drop-shadow(0 0 20px ${theme.effects.shadowColor})`,
        }}
      />

      {/* Shimmer effect on hover for certain themes */}
      {(theme.id === 'neon-dreams' || theme.id === 'cosmic-void') && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{
            x: '100%',
            transition: {
              duration: 0.8,
              ease: 'easeInOut',
            },
          }}
        />
      )}
    </motion.div>
  )
}
