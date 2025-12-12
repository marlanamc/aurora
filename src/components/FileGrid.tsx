'use client'

import { FixedSizeGrid as Grid } from 'react-window'
import { useState, useEffect } from 'react'
import type { FileInfo } from '@/lib/tauri'
import { FileTile } from './FileTile'

interface FileGridProps {
  files: FileInfo[]
}

export function FileGrid({ files }: FileGridProps) {
  // Calculate grid dimensions based on window size
  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 600,
    columnCount: 4,
  })

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth - 400 // Account for sidebar
      const height = window.innerHeight - 300 // Account for header/carousel

      // Calculate how many columns fit
      const tileWidth = 220 // Width of each tile + gap
      const columnCount = Math.max(2, Math.floor(width / tileWidth))

      setDimensions({ width, height, columnCount })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate row count
  const rowCount = Math.ceil(files.length / dimensions.columnCount)

  // Cell renderer for react-window
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * dimensions.columnCount + columnIndex

    // Check if this cell has a file
    if (index >= files.length) {
      return null
    }

    const file = files[index]

    return (
      <div style={style} className="p-2">
        <FileTile file={file} />
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <Grid
        columnCount={dimensions.columnCount}
        columnWidth={220}
        height={dimensions.height}
        rowCount={rowCount}
        rowHeight={220}
        width={dimensions.width}
        className="scrollbar-thin"
      >
        {Cell}
      </Grid>
    </div>
  )
}
