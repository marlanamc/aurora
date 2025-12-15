'use client'

import { useMemo } from 'react'
import type { RefObject } from 'react'
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import type { WidgetInstance } from '@/lib/widgets'
import { GlobalTheme } from '@/lib/global-themes'

type Props = {
  widgets: WidgetInstance[]
  onLayoutChange: (widgets: WidgetInstance[]) => void
  isEditing: boolean
  renderWidget: (widget: WidgetInstance) => React.ReactNode
  theme: GlobalTheme
}

export function DraggableWidgetGrid({ widgets, onLayoutChange, isEditing, renderWidget }: Props) {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true })

  const MIN_WIDGET_W = 1

  // Convert widget instances to RGL layout items with improved layout logic
  const layout = useMemo(() => {
    // Sort widgets by their existing y position to maintain order
    const sortedWidgets = [...widgets].sort((a, b) => {
      const aY = a.layout?.y ?? 0
      const bY = b.layout?.y ?? 0
      if (aY !== bY) return aY - bY
      return (a.layout?.x ?? 0) - (b.layout?.x ?? 0)
    })

    return sortedWidgets.map((w, i) => {
      // Use stored layout if available and valid
      if (w.layout && w.layout.x >= 0 && w.layout.y >= 0 && w.layout.w >= MIN_WIDGET_W && w.layout.h >= 1) {
        return {
          i: w.id,
          x: w.layout.x,
          y: w.layout.y,
          w: Math.max(MIN_WIDGET_W, w.layout.w),
          h: Math.max(1, w.layout.h),
          minW: MIN_WIDGET_W,
          maxW: 2, // Max width is 2 columns
        }
      }

      // Improved default layout logic for new items
      const wUnits = Math.max(MIN_WIDGET_W, w.span === 2 ? 2 : 1)
      const hUnits = 4 // Default height units

      // Smart placement: fill columns from left to right, top to bottom
      // This prevents gaps and ensures consistent layout
      const col = i % 2
      const row = Math.floor(i / 2)

      return {
        i: w.id,
        x: col * 1, // 0 for left column, 1 for right column (since each column is 1 unit wide)
        y: row * 4, // Start new rows every 4 units height
        w: wUnits,
        h: hUnits,
        minW: MIN_WIDGET_W,
        maxW: 2,
      }
    })
  }, [widgets])

  // Handle layout changes with improved stability
  const handleLayoutChange = (currentLayout: Layout) => {
    // Create a map for efficient lookup
    const layoutMap = new Map(currentLayout.map(l => [l.i, l]))

    const nextWidgets = widgets.map((w) => {
      const match = layoutMap.get(w.id)
      if (!match) return w

      // Ensure minimum width constraint
      const constrainedW = Math.max(MIN_WIDGET_W, match.w)
      const constrainedH = Math.max(1, match.h) // Minimum height of 1 row

      return {
        ...w,
        layout: {
          x: Math.max(0, match.x), // Ensure non-negative x
          y: Math.max(0, match.y), // Ensure non-negative y
          w: constrainedW,
          h: constrainedH,
        },
        // Sync legacy span for backward compatibility
        span: constrainedW >= 2 ? 2 : 1,
      } as WidgetInstance
    })

    // Only update if there are actual meaningful changes
    const hasChanged = nextWidgets.some((nw, i) => {
      const ow = widgets[i]
      const nwLayout = nw.layout
      const owLayout = ow.layout

      // If old widget has no layout, it's a change
      if (!owLayout) return true

      // If new widget has no layout, skip (shouldn't happen)
      if (!nwLayout) return false

      // Check if layout properties actually changed
      return (
        nwLayout.x !== owLayout.x ||
        nwLayout.y !== owLayout.y ||
        nwLayout.w !== owLayout.w ||
        nwLayout.h !== owLayout.h
      )
    })

    if (hasChanged) {
      onLayoutChange(nextWidgets)
    }
  }

  // Row height is critical. 
  // 100px row height + margin allows decent granularity.
  const ROW_HEIGHT = 80

  return (
    <div
      ref={containerRef as unknown as RefObject<HTMLDivElement>}
      className={`${isEditing ? 'widget-grid-editing' : ''} ${isEditing ? 'drag-mode-active' : ''}`}
    >
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          className="layout"
          layouts={{
            lg: layout,
            md: layout, // Use same layout for medium screens
            sm: layout.map(item => ({ ...item, x: 0, w: Math.min(item.w, 1) })), // Force single column on small screens
            xs: layout.map(item => ({ ...item, x: 0, w: Math.min(item.w, 1) })), // Force single column on extra small screens
            xxs: layout.map(item => ({ ...item, x: 0, w: Math.min(item.w, 1) })) // Force single column on extra extra small screens
          }}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
          cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
          rowHeight={ROW_HEIGHT}
          onLayoutChange={(layout) => handleLayoutChange(layout)}
          margin={[16, 16]}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`relative group ${isEditing ? 'widget-editing' : 'widget-viewing'}`}
              style={{
                transition: isEditing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="h-full w-full overflow-hidden">{renderWidget(widget)}</div>

              {/* Drag Handle Overlay - Only visible when editing */}
              {isEditing && (
                <div
                  className="drag-handle absolute top-0 left-0 right-12 h-12 cursor-grab active:cursor-grabbing z-30 flex items-center justify-center group/drag-handle hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag to move ${widget.type} widget`}
                  onKeyDown={(e) => {
                    // Add keyboard navigation for accessibility
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      // Focus management for drag start
                      e.currentTarget.focus()
                    }
                  }}
                >
                  {/* Drag indicator bar with improved accessibility */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/10 dark:bg-white/15 backdrop-blur-sm border border-white/20 dark:border-black/20 shadow-sm">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-black/70 dark:text-white/70 group-hover/drag-handle:text-blue-600 dark:group-hover/drag-handle:text-blue-400 transition-colors"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                    <span className="text-xs font-medium text-black/70 dark:text-white/70 group-hover/drag-handle:text-black/90 dark:group-hover/drag-handle:text-white/90 transition-colors">
                      Drag to move
                    </span>
                    {/* Keyboard hint */}
                    <span className="text-xs text-black/50 dark:text-white/50 opacity-0 group-hover/drag-handle:opacity-100 transition-opacity">
                      ⌨️
                    </span>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/drag-handle:opacity-100 transition-opacity duration-200 pointer-events-none" />

                  {/* Focus ring for accessibility */}
                  <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500/50 ring-offset-2 ring-offset-transparent opacity-0 focus:opacity-100 transition-opacity pointer-events-none" />
                </div>
              )}

              {/* Editing overlay effects */}
              {isEditing && (
                <div className="absolute inset-0 rounded-lg border-2 border-dashed border-blue-500/30 dark:border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10" />
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
