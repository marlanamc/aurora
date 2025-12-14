'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { X, LayoutGrid, Search, Plus, type IconComponent } from '@/lib/icons'
import type { GlobalTheme } from '@/lib/global-themes'
import { WIDGET_DEFINITIONS, WIDGET_CATEGORY_LABELS, type WidgetCategory, type WidgetType, type WidgetDefinition } from '@/lib/widgets'
import { AuroraSettings } from '@/lib/settings'

interface WidgetGalleryProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (type: WidgetType) => void
    theme: GlobalTheme
    presentTypes: Set<WidgetType>
    settings: AuroraSettings
}

// Widget examples/previews
const WIDGET_EXAMPLES: Record<WidgetType, { preview: string; useCase?: string }> = {
    'heatmap': {
        preview: 'Visual grid showing your progress over time',
        useCase: 'Track daily habits, job applications, or any recurring activity'
    },
    'daily-quests': {
        preview: 'One small, gentle task suggestion for today',
        useCase: 'Break down big goals into tiny, manageable steps'
    },
    'resistance-selector': {
        preview: 'Choose your resistance type and get micro-actions',
        useCase: 'When you feel stuck, overwhelmed, or paralyzed'
    },
    'remember-this': {
        preview: 'Files that resurface based on time and context',
        useCase: 'Rediscover important files when you need them'
    },
    'emotional-worlds': {
        preview: 'Grouped files by mood, season, or vibe',
        useCase: 'Organize files by how they make you feel'
    },
    'pinned-items': {
        preview: 'Quick access to your most important files',
        useCase: 'Keep frequently used folders and files at hand'
    },
    'relevant-files': {
        preview: 'Smart file matches based on your core values',
        useCase: 'See files related to your current focus area'
    },
    'brain-dump': {
        preview: 'Free-form text area for thoughts and ideas',
        useCase: 'Capture thoughts without structure or judgment'
    },
    'weekly-calendar': {
        preview: '7-day view with optional Apple Calendar integration',
        useCase: 'Plan your week and see upcoming events'
    },
    'monthly-calendar': {
        preview: 'Full month calendar view',
        useCase: 'Get a bird\'s eye view of your schedule'
    },
    'recent-activity': {
        preview: 'Recently opened files and folders',
        useCase: 'Quickly return to what you were working on'
    },
    'breathing': {
        preview: 'Guided breathing exercise with visual timer',
        useCase: 'Take a moment to center yourself and regulate'
    },
    'affirmation': {
        preview: 'Daily quote or affirmation tailored to your values',
        useCase: 'Start your day with gentle encouragement'
    },
    'pomodoro': {
        preview: 'Work session timer (25/5 minute intervals)',
        useCase: 'Focus for short bursts, then take breaks'
    },
    'scratchpad': {
        preview: 'Quick notes area with lined paper effect',
        useCase: 'Jot down ideas, reminders, or thoughts'
    },
    'apple-calendar': {
        preview: 'Today\'s events from your Apple Calendar',
        useCase: 'See your schedule without leaving Aurora'
    },
    'quick-search': {
        preview: 'Fast file search with recent search history',
        useCase: 'Find files instantly with autocomplete'
    },
    'file-type-breakdown': {
        preview: 'Visual breakdown of your file types and sizes',
        useCase: 'Understand what types of files you have most'
    },
    'energy-tracker': {
        preview: 'Log your energy levels throughout the day',
        useCase: 'Notice patterns in how you feel over time'
    },
    'notebook': {
        preview: 'Folders styled as colorful notebook covers',
        useCase: 'Quick access to your favorite folders'
    },
}

export function WidgetGallery({ isOpen, onClose, onAdd, theme, presentTypes, settings }: WidgetGalleryProps) {
    const [query, setQuery] = useState('')
    const [expandedWidget, setExpandedWidget] = useState<WidgetType | null>(null)

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setExpandedWidget(null)
        }
    }, [isOpen])

    // Filter widgets
    const filteredWidgets = useMemo(() => {
        const q = query.trim().toLowerCase()

        // Start with all widgets that are NOT already on the dashboard
        const available = WIDGET_DEFINITIONS.filter(w => !presentTypes.has(w.type))

        if (!q) return available

        return available.filter(w =>
            w.name.toLowerCase().includes(q) ||
            w.description.toLowerCase().includes(q) ||
            WIDGET_CATEGORY_LABELS[w.category].toLowerCase().includes(q) ||
            WIDGET_EXAMPLES[w.type]?.preview.toLowerCase().includes(q) ||
            WIDGET_EXAMPLES[w.type]?.useCase?.toLowerCase().includes(q)
        )
    }, [query, presentTypes])

    // Group by category
    const groups = useMemo(() => {
        const map = new Map<WidgetCategory, WidgetDefinition[]>()
        for (const w of filteredWidgets) {
            if (!map.has(w.category)) map.set(w.category, [])
            map.get(w.category)!.push(w)
        }

        const order: WidgetCategory[] = ['regulation', 'momentum', 'calendar', 'memory', 'discovery']
        return order
            .map(cat => ({ id: cat, label: WIDGET_CATEGORY_LABELS[cat], items: map.get(cat) ?? [] }))
            .filter(g => g.items.length > 0)
    }, [filteredWidgets])

    // Close on escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    const getCategoryColor = (category: WidgetCategory) => {
        switch (category) {
            case 'regulation': return theme.colors.accent
            case 'momentum': return theme.colors.primary
            case 'calendar': return theme.colors.secondary
            case 'memory': return theme.colors.warning
            case 'discovery': return theme.colors.success
            default: return theme.colors.text
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-5xl max-h-[90vh] flex flex-col pointer-events-auto rounded-3xl overflow-hidden shadow-2xl"
                            style={{
                                background: theme.components.card.background,
                                border: `1px solid ${theme.colors.border}`,
                                boxShadow: theme.effects.shadow,
                            }}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center justify-between px-8 py-6 border-b"
                                style={{ borderColor: theme.colors.border }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: theme.gradients.button, color: '#000' }}
                                    >
                                        <LayoutGrid size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold" style={{ color: theme.colors.text, fontFamily: theme.fonts.display }}>
                                            Widget Gallery
                                        </h2>
                                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                                            Browse and add widgets to customize your dashboard
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div
                                        className="relative flex items-center px-4 py-2.5 rounded-xl min-w-[240px]"
                                        style={{ background: theme.colors.surfaceHover }}
                                    >
                                        <Search size={18} className="mr-3 opacity-50" />
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            placeholder="Search widgets..."
                                            className="bg-transparent outline-none text-sm w-full"
                                            style={{ color: theme.colors.text }}
                                            autoFocus
                                        />
                                        {query && (
                                            <button onClick={() => setQuery('')} className="ml-2 opacity-50 hover:opacity-100">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-3 rounded-xl transition-transform hover:scale-105 active:scale-95"
                                        style={{ background: theme.colors.surfaceHover, color: theme.colors.textSecondary }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {groups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                        <Search size={48} className="mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No results found</p>
                                        <p className="text-sm">Try a different search term</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {groups.map(group => (
                                            <div key={group.id}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <h3
                                                        className="text-lg font-bold tracking-tight"
                                                        style={{ color: getCategoryColor(group.id as WidgetCategory) }}
                                                    >
                                                        {group.label}
                                                    </h3>
                                                    <div className="h-px flex-1 opacity-20" style={{ background: theme.colors.textSecondary }} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {group.items.map(widget => (
                                                        <WidgetCard
                                                            key={widget.type}
                                                            widget={widget}
                                                            theme={theme}
                                                            settings={settings}
                                                            onAdd={() => onAdd(widget.type)}
                                                            isExpanded={expandedWidget === widget.type}
                                                            onToggleExpand={() => setExpandedWidget(expandedWidget === widget.type ? null : widget.type)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

function WidgetCard({ widget, theme, settings, onAdd, isExpanded, onToggleExpand }: {
    widget: WidgetDefinition,
    theme: GlobalTheme,
    settings: AuroraSettings
    onAdd: () => void
    isExpanded: boolean
    onToggleExpand: () => void
}) {
    const Icon = widget.icon
    const showEnableHint = widget.type === 'remember-this' && !settings.showRememberThis
    const example = WIDGET_EXAMPLES[widget.type]

    return (
        <motion.div
            className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 w-full"
            style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`
            }}
            whileHover={{ y: -2 }}
        >
            <motion.button
                onClick={onToggleExpand}
                className="flex flex-col items-start p-5 text-left w-full"
                whileTap={{ scale: 0.98 }}
            >
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: theme.gradients.glow, pointerEvents: 'none' }}
                />

                <div className="relative z-10 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                            style={{ background: theme.gradients.button, color: '#000' }}
                        >
                            <Icon size={24} strokeWidth={2} />
                        </div>
                        <span
                            className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                            style={{
                                background: theme.colors.surfaceHover,
                                color: theme.colors.textSecondary
                            }}
                        >
                            {widget.defaultSpan === 2 ? 'Wide' : 'Narrow'}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold mb-1" style={{ color: theme.colors.text }}>
                        {widget.name}
                    </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: theme.colors.textSecondary }}>
                        {widget.description}
                    </p>

                    {showEnableHint && (
                        <div className="mb-3 text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500 font-medium inline-block">
                            Enables &quot;Remember This&quot;
                        </div>
                    )}

                    {/* Example Preview */}
                    {example && (
                        <div className="mb-3 p-3 rounded-lg text-xs" style={{ background: theme.colors.surfaceHover }}>
                            <div className="font-semibold mb-1 opacity-80" style={{ color: theme.colors.text }}>
                                Preview:
                            </div>
                            <div className="opacity-70 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                                {example.preview}
                            </div>
                        </div>
                    )}
                </div>
            </motion.button>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && example && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        style={{ borderTop: `1px solid ${theme.colors.border}` }}
                    >
                        <div className="p-5 pt-4">
                            {example.useCase && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold mb-1.5 opacity-80" style={{ color: theme.colors.text }}>
                                        Best for:
                                    </div>
                                    <div className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                                        {example.useCase}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={onAdd}
                                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: theme.gradients.button,
                                    color: '#000',
                                    boxShadow: theme.effects.shadow,
                                }}
                            >
                                <Plus size={16} />
                                Add to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Button (when not expanded) */}
            {!isExpanded && (
                <div className="px-5 pb-5">
                    <button
                        onClick={onAdd}
                        className="w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                        style={{ background: theme.colors.surfaceHover, color: theme.colors.text }}
                    >
                        <Plus size={16} />
                        Add Widget
                    </button>
                </div>
            )}
        </motion.div>
    )
}
