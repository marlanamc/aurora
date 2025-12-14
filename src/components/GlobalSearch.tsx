'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, CornerDownLeft, X } from '@/lib/icons'
import { dbSearchFiles, openFile, type FileInfo, getFileIcon, formatFileSize, formatDate } from '@/lib/tauri'
import type { GlobalTheme } from '@/lib/global-themes'

interface GlobalSearchProps {
    isOpen: boolean
    onClose: () => void
    theme: GlobalTheme
}

export function GlobalSearch({ isOpen, onClose, theme }: GlobalSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<FileInfo[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setResults([])
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Search effect
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            try {
                const hits = await dbSearchFiles(query)
                setResults(hits)
                setSelectedIndex(0)
            } catch (e) {
                console.error('Search failed:', e)
            }
        }, 150) // Debounce

        return () => clearTimeout(timer)
    }, [query])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(i => Math.min(i + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(i => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (results[selectedIndex]) {
                    openFile(results[selectedIndex].path)
                    onClose()
                }
            } else if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex, onClose])

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
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl flex flex-col pointer-events-auto rounded-2xl overflow-hidden shadow-2xl"
                            style={{
                                background: theme.components.card.background,
                                border: `1px solid ${theme.colors.border}`,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            {/* Search Bar */}
                            <div className="flex items-center px-4 py-4 border-b" style={{ borderColor: theme.colors.border }}>
                                <Search size={24} className="opacity-50 mr-4" style={{ color: theme.colors.text }} />
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search files..."
                                    className="flex-1 bg-transparent outline-none text-xl font-medium placeholder:opacity-40"
                                    style={{ color: theme.colors.text }}
                                />
                                {query && (
                                    <button onClick={() => setQuery('')} className="p-1 rounded opacity-50 hover:opacity-100" style={{ color: theme.colors.text }}>
                                        <X size={18} />
                                    </button>
                                )}
                                <div className="ml-4 px-2 py-1 rounded text-xs font-semibold opacity-50 border" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>
                                    ESC
                                </div>
                            </div>

                            {/* Results List */}
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {results.length === 0 && query ? (
                                    <div className="p-12 text-center opacity-50">
                                        <p>No results found for &quot;{query}&quot;</p>
                                    </div>
                                ) : results.length === 0 && !query ? (
                                    <div className="p-12 text-center opacity-40">
                                        <p>Type to search your indexed files</p>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {results.map((file, index) => {
                                            const isSelected = index === selectedIndex
                                            return (
                                                <button
                                                    key={file.id}
                                                    onClick={() => {
                                                        openFile(file.path)
                                                        onClose()
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left group ${isSelected ? 'bg-white/10' : ''}`}
                                                    style={{
                                                        background: isSelected ? theme.colors.surfaceHover : 'transparent'
                                                    }}
                                                >
                                                    {/* Icon */}
                                                    <div className="shrink-0 opacity-80" style={{ color: theme.colors.text }}>
                                                        {getFileIcon(file.file_type, { size: 24 })}
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium truncate" style={{ color: theme.colors.text }}>
                                                                {file.name}
                                                            </span>
                                                            <span className="text-xs opacity-50 shrink-0" style={{ color: theme.colors.textSecondary }}>
                                                                {formatFileSize(file.size)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs truncate opacity-60" style={{ color: theme.colors.textSecondary }}>
                                                            {file.path}
                                                        </div>
                                                    </div>

                                                    {/* Selection Indicator */}
                                                    {isSelected && (
                                                        <div className="shrink-0 flex items-center gap-2 text-xs font-semibold opacity-60" style={{ color: theme.colors.text }}>
                                                            Open
                                                            <CornerDownLeft size={14} />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div
                                className="px-4 py-2 border-t text-[10px] flex justify-between items-center opacity-50"
                                style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary, background: theme.colors.surface }}
                            >
                                <div>
                                    {results.length} results
                                </div>
                                <div className="flex gap-4">
                                    <span>Use arrow keys to navigate</span>
                                    <span>Enter to open</span>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
