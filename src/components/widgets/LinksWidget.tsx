'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import type { GlobalTheme } from '@/lib/global-themes'
import { ExternalLink, X, Plus, PenTool, Check } from '@/lib/icons'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { openUrl } from '@/lib/tauri'

type LinkItem = {
  id: string
  url: string
  label?: string
}

type LinksWidgetData = {
  links: LinkItem[]
}

const DEFAULT_DATA: LinksWidgetData = { links: [] }

function ensureUrl(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function tryParseUrl(url: string) {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function prettyLabel(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, '')
  const path = parsed.pathname.replace(/\/+$/, '')
  if (!path || path === '/') return host
  const last = path.split('/').filter(Boolean).pop() ?? ''
  const cleaned = decodeURIComponent(last).replace(/[-_]+/g, ' ').trim()
  return cleaned ? `${cleaned} — ${host}` : host
}

function faviconUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./, '')
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
}

export function LinksWidget({
  widgetId,
  theme,
  getWidgetData,
  mergeWidgetData,
}: {
  widgetId: string
  theme: GlobalTheme
  getWidgetData: <T,>(widgetId: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(widgetId: string, partial: Partial<T>, fallback: T) => void
}) {
  const data = getWidgetData<LinksWidgetData>(widgetId, DEFAULT_DATA)
  const links = useMemo(() => data.links ?? [], [data.links])

  const [draftUrl, setDraftUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const items = useMemo(() => {
    return links
      .map((l) => {
        const parsed = tryParseUrl(l.url)
        const host = parsed?.hostname.replace(/^www\./, '') ?? ''
        const display = l.label?.trim() ? l.label.trim() : parsed ? prettyLabel(parsed) : l.url
        const sub = host || l.url
        const favicon = parsed ? faviconUrl(parsed) : null
        return { ...l, parsed, display, sub, favicon }
      })
      .filter((l) => l.url.trim().length > 0)
  }, [links])

  const add = () => {
    const nextUrl = ensureUrl(draftUrl)
    const parsed = tryParseUrl(nextUrl)
    if (!parsed) return

    const id = globalThis.crypto?.randomUUID?.() ?? `l_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const next: LinkItem = { id, url: nextUrl }
    mergeWidgetData<LinksWidgetData>(widgetId, { links: [next, ...(links ?? [])] }, DEFAULT_DATA)
    setDraftUrl('')
  }

  const remove = (id: string) => {
    mergeWidgetData<LinksWidgetData>(widgetId, { links: links.filter((l) => l.id !== id) }, DEFAULT_DATA)
  }

  const startEditing = (id: string, currentLabel: string) => {
    setEditingId(id)
    setEditingLabel(currentLabel || '')
  }

  const saveEdit = (id: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, label: editingLabel.trim() || undefined } : l))
    mergeWidgetData<LinksWidgetData>(widgetId, { links: updated }, DEFAULT_DATA)
    setEditingId(null)
    setEditingLabel('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingLabel('')
  }

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  return (
    <UnifiedCard fullHeight>
      <UnifiedCardHeader
        icon={ExternalLink}
        title="Links"
        subtitle="Quick access to what you need"
        action={
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-xl px-2 py-1.5"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              <input
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') add()
                }}
                className="w-48 bg-transparent text-xs outline-none"
                style={{ color: 'var(--aurora-text)' }}
                placeholder="Paste a link or type a URL…"
                aria-label="Add link"
              />
              <button
                type="button"
                onClick={add}
                className="p-1 rounded-lg"
                style={{ color: 'var(--aurora-text)' }}
                title="Add link"
                aria-label="Add link"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
          Add links you use often—your tools, dashboards, or anything you need quick access to.
        </div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 12).map((item) => {
            const accent = theme.colors.primary
            const isEditing = editingId === item.id
            const currentLabel = item.label?.trim() || ''
            
            return (
              <div
                key={item.id}
                className="w-full rounded-xl flex items-center justify-between gap-0 overflow-hidden group"
                style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.22)' }}
              >
                <button
                  type="button"
                  className="text-left min-w-0 flex-1 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => !isEditing && openUrl(item.url)}
                  title={item.url}
                  disabled={isEditing}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${accent}22, transparent)`,
                        border: `1px solid ${accent}33`,
                      }}
                    >
                      {item.favicon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.favicon} alt="" className="w-5 h-5" />
                      ) : (
                        <ExternalLink size={16} style={{ color: accent }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              saveEdit(item.id)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              cancelEdit()
                            }
                          }}
                          onBlur={() => saveEdit(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-sm font-semibold bg-transparent outline-none border-b-2 focus:border-current px-1 -mx-1"
                          style={{ 
                            color: 'var(--aurora-text)',
                            borderColor: accent
                          }}
                          placeholder={item.display}
                        />
                      ) : (
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text)' }}>
                          {item.display}
                        </div>
                      )}
                      <div className="text-xs truncate" style={{ color: 'var(--aurora-text-secondary)' }}>
                        {item.sub}
                      </div>
                    </div>
                  </div>
                </button>
                <div className="pr-2 pl-1 py-1 flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          saveEdit(item.id)
                        }}
                        className="p-2 rounded-lg hover:bg-green-500/10 hover:text-green-500 transition-colors"
                        style={{ color: 'var(--aurora-text)' }}
                        title="Save changes"
                        aria-label="Save changes"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEdit()
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        style={{ color: 'var(--aurora-text)' }}
                        title="Cancel editing"
                        aria-label="Cancel editing"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          startEditing(item.id, currentLabel)
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                        style={{ color: 'var(--aurora-text)' }}
                        title="Edit title"
                        aria-label="Edit title"
                      >
                        <PenTool size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(item.id)
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        style={{ color: 'var(--aurora-text)' }}
                        title="Remove link"
                        aria-label="Remove link"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {items.length > 12 ? (
            <div className="text-[11px]" style={{ color: 'var(--aurora-text-secondary)' }}>
              +{items.length - 12} more…
            </div>
          ) : null}
        </div>
      )}
    </UnifiedCard>
  )
}
