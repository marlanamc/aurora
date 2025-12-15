'use client'

import { useState, useMemo, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { Search, X, Clock, FileText } from '@/lib/icons'
import { dbSearchFiles, openFile, type FileInfo } from '@/lib/tauri'
import { type GlobalTheme } from '@/lib/global-themes'
import { motion, AnimatePresence } from 'framer-motion'

type SearchHistoryItem = {
  query: string
  timestamp: number
}

type QuickSearchData = {
  history: SearchHistoryItem[]
}

export function QuickSearchWidget({
  theme,
  widgetId,
  files,
  getWidgetData,
  mergeWidgetData,
}: {
  theme: GlobalTheme
  widgetId: string
  files: FileInfo[]
  getWidgetData: <T,>(id: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FileInfo[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const raw = getWidgetData<QuickSearchData | SearchHistoryItem[]>(widgetId, { history: [] } as QuickSearchData)
  const history = useMemo<SearchHistoryItem[]>(() => {
    if (Array.isArray(raw)) return raw
    return Array.isArray(raw.history) ? raw.history : []
  }, [raw])

  const recentSearches = useMemo(() => {
    return [...history]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map((h) => h.query)
      .filter((q, idx, arr) => arr.indexOf(q) === idx) // unique
  }, [history])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const searchResults = await dbSearchFiles(searchQuery)
      setResults(searchResults.slice(0, 5))
      
      // Save to history
      const newHistory: SearchHistoryItem[] = [
        ...history.filter((h) => h.query !== searchQuery),
        { query: searchQuery, timestamp: Date.now() },
      ].slice(-10) // Keep last 10
      
      mergeWidgetData<QuickSearchData>(widgetId, { history: newHistory }, { history: [] })
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleSelectHistory = (histQuery: string) => {
    setQuery(histQuery)
    setShowHistory(false)
  }

  const clearHistory = () => {
    mergeWidgetData<QuickSearchData>(widgetId, { history: [] }, { history: [] })
  }

  return (
    <UnifiedCard padding="md">
      <UnifiedCardHeader
        icon={Search}
        title="Quick Search"
        subtitle="Search across all your files"
        action={
          recentSearches.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: theme.colors.textSecondary,
              }}
            >
              History
            </button>
          )
        }
      />

      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.colors.textSecondary }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="What are you looking for?"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
            style={{
              background: theme.components.card.background,
              border: theme.components.card.border,
              color: theme.colors.text,
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:opacity-70"
              style={{ color: theme.colors.textSecondary }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* History Dropdown */}
        <AnimatePresence>
          {showHistory && recentSearches.length > 0 && !query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary }}>
                  Recent
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs hover:opacity-70"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((histQuery, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectHistory(histQuery)}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
                  style={{
                    background: theme.components.card.background,
                    border: theme.components.card.border,
                  }}
                >
                  <Clock size={14} style={{ color: theme.colors.textSecondary }} />
                  <span className="text-sm flex-1 truncate" style={{ color: theme.colors.text }}>
                    {histQuery}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        {isSearching && (
          <div className="text-sm py-4 text-center" style={{ color: theme.colors.textSecondary }}>
            Searching...
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-1">
            {results.map((file) => (
              <button
                key={file.path}
                onClick={async () => {
                  try {
                    await openFile(file.path)
                  } catch (error) {
                    console.error('Failed to open file:', error)
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-transform"
                style={{
                  background: theme.components.card.background,
                  border: theme.components.card.border,
                }}
              >
                <FileText size={14} style={{ color: theme.colors.textSecondary }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>
                    {file.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                    {file.path}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!isSearching && query && results.length === 0 && (
          <div className="text-sm py-4 text-center" style={{ color: theme.colors.textSecondary }}>
            No results found
          </div>
        )}
      </div>
    </UnifiedCard>
  )
}
