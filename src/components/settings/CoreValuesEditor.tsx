'use client'

import { useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Archive, GripVertical, Plus, ChevronDown, ChevronRight, X, Sparkles } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { VALUE_ICON_OPTIONS, type ValueIconId } from '@/lib/value-icons'

import { CORE_VALUE_PALETTE } from '@/lib/value-colors'

const MAX_CORE_VALUES = 12

export type CoreValue = {
    id: string
    name: string
    iconId: ValueIconId
    purpose?: string
    tone?: string
    searchQuery?: string
    colorPair?: readonly [string, string]
}

export type CoreValueDraft = Omit<CoreValue, 'id'>

type Props = {
    activeValues: CoreValue[]
    archivedValues: CoreValue[]
    theme: GlobalTheme
    onUpdate: (id: string, partial: Partial<CoreValue>) => void
    onAdd: (draft: CoreValueDraft) => string | null | undefined
    onArchive: (id: string) => void
    onRestore: (id: string) => void
    onRemove: (id: string) => void
    onReorder: (values: CoreValue[]) => void
}

function keywordsToSearchQuery(raw: string): string {
    const parts = raw
        .split(/[,\n]/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12)

    const normalized = parts.map((p) => (/\s/.test(p) ? `"${p.replace(/\"/g, '')}"` : p))
    return normalized.join(' OR ')
}

export function CoreValuesEditor({
    activeValues,
    archivedValues,
    theme,
    onUpdate,
    onAdd,
    onArchive,
    onRestore,
    onRemove,
    onReorder,
}: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [draftName, setDraftName] = useState('')
    const [draftIconId, setDraftIconId] = useState<ValueIconId>('sparkles')
    const [draftKeywords, setDraftKeywords] = useState('')
    const [draftPaletteIndex, setDraftPaletteIndex] = useState(0)

    const openAdd = () => {
        if (activeValues.length >= MAX_CORE_VALUES) {
            window.alert(`You can have up to ${MAX_CORE_VALUES} values.`)
            return
        }
        setDraftName('')
        setDraftIconId('sparkles')
        setDraftKeywords('')
        setDraftPaletteIndex(0)
        setIsAddOpen(true)
    }

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    return (
        <div className="space-y-6">
            {/* Add Value Dialog */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.45)' }}
                        onClick={() => setIsAddOpen(false)}
                        aria-label="Close add focus area dialog"
                    />
                    <div
                        className="relative w-full max-w-xl rounded-2xl p-5"
                        style={{
                            background: theme.components.card.background,
                            border: theme.components.card.border,
                            boxShadow: theme.effects.shadowHover,
                            backdropFilter: theme.effects.blur,
                        }}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="text-lg font-black">Add a Focus Area</div>
                                <div className="text-xs opacity-70 mt-1">
                                    Give it a title, pick a color + icon, then add a few keywords so Aurora can surface relevant files.
                                </div>
                            </div>
                            <button
                                type="button"
                                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                onClick={() => setIsAddOpen(false)}
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Title</label>
                                <input
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current bg-black/5 dark:bg-white/5"
                                    placeholder="e.g. Curiosity"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">Color</div>
                                    <div className="flex flex-wrap gap-2">
                                        {CORE_VALUE_PALETTE.map((pair, idx) => (
                                            <button
                                                key={`${pair[0]}-${pair[1]}`}
                                                type="button"
                                                className="w-9 h-9 rounded-xl border transition-transform active:scale-95"
                                                style={{
                                                    borderColor: idx === draftPaletteIndex ? theme.colors.primary : 'rgba(255,255,255,0.18)',
                                                    background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
                                                }}
                                                onClick={() => setDraftPaletteIndex(idx)}
                                                aria-label={`Select color palette ${idx + 1}`}
                                                title={`${pair[0]} → ${pair[1]}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">Icon</div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-10 w-10 rounded-xl flex items-center justify-center"
                                            style={{ background: `${CORE_VALUE_PALETTE[draftPaletteIndex][0]}20` }}
                                        >
                                            {(() => {
                                                const Icon = VALUE_ICON_OPTIONS[draftIconId] ?? Sparkles
                                                return <Icon size={20} style={{ color: CORE_VALUE_PALETTE[draftPaletteIndex][0] }} />
                                            })()}
                                        </div>
                                        <select
                                            value={draftIconId}
                                            onChange={(e) => setDraftIconId(e.target.value as ValueIconId)}
                                            className="flex-1 rounded-xl px-3 py-2 text-sm bg-black/5 dark:bg-white/5"
                                        >
                                            {Object.keys(VALUE_ICON_OPTIONS).map((id) => (
                                                <option key={id} value={id}>
                                                    {id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Keywords (optional)</label>
                                <textarea
                                    value={draftKeywords}
                                    onChange={(e) => setDraftKeywords(e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-current bg-black/5 dark:bg-white/5 resize-none"
                                    rows={2}
                                    placeholder="e.g. lesson plans, esol, reading, curriculum"
                                />
                                <div className="text-[10px] opacity-60">
                                    These become a Smart Search query like: <span className="font-mono">word1 OR word2</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    className="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
                                    onClick={() => setIsAddOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-xl text-sm font-black text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: theme.gradients.button }}
                                    disabled={draftName.trim().length === 0}
                                    onClick={() => {
                                        const name = draftName.trim()
                                        const colorPair = CORE_VALUE_PALETTE[draftPaletteIndex]
                                        const searchQuery = keywordsToSearchQuery(draftKeywords)
                                        const createdId = onAdd({
                                            name,
                                            iconId: draftIconId,
                                            colorPair,
                                            ...(searchQuery ? { searchQuery } : {}),
                                        })
                                        if (createdId) {
                                            setExpandedId(createdId)
                                            setRecentlyAddedId(createdId)
                                        }
                                        setIsAddOpen(false)
                                    }}
                                >
                                    Create area
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm opacity-70">
                    {activeValues.length}/{MAX_CORE_VALUES} active areas
                </div>
                <button
                    type="button"
                    onClick={openAdd}
                    disabled={activeValues.length >= MAX_CORE_VALUES}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                    style={{ background: theme.gradients.button }}
                >
                    <span className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add Area</span>
                    </span>
                </button>
            </div>

            {/* Active Values List */}
            <Reorder.Group as="div" values={activeValues} onReorder={onReorder} className="space-y-3">
                {activeValues.map((value) => (
                    <CoreValueRow
                        key={value.id}
                        value={value}
                        theme={theme}
                        isExpanded={expandedId === value.id}
                        onToggleExpand={() => toggleExpand(value.id)}
                        onUpdate={onUpdate}
                        onArchive={onArchive}
                        onRemove={onRemove}
                        showGuide={recentlyAddedId === value.id && expandedId === value.id}
                    />
                ))}
            </Reorder.Group>

            {/* Archived Values */}
            {archivedValues.length > 0 && (
                <div className="pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold opacity-50 mb-4">Archived</h4>
                    <div className="space-y-2">
                        {archivedValues.map((value) => (
                            <div
                                key={value.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: value.colorPair ? value.colorPair[0] : 'gray' }}
                                    />
                                    <div className="text-sm font-medium">{value.name}</div>
                                    <div className="text-xs opacity-50">({value.purpose || 'No purpose defined'})</div>
                                </div>
                                <button
                                    onClick={() => onRestore(value.id)}
                                    className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                                >
                                    Restore
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function CoreValueRow({
    value,
    theme,
    isExpanded,
    onToggleExpand,
    onUpdate,
    onArchive,
    onRemove,
    showGuide,
}: {
    value: CoreValue
    theme: GlobalTheme
    isExpanded: boolean
    onToggleExpand: () => void
    onUpdate: (id: string, partial: Partial<CoreValue>) => void
    onArchive: (id: string) => void
    onRemove: (id: string) => void
    showGuide: boolean
}) {
    const controls = useDragControls()
    const Icon = VALUE_ICON_OPTIONS[value.iconId] ?? Sparkles
    const currentColor = value.colorPair?.[0] ?? theme.colors.primary

    return (
        <Reorder.Item value={value} dragListener={false} dragControls={controls} as="div">
            <div
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                    background: theme.components.card.background,
                    border: theme.components.card.border,
                    boxShadow: isExpanded ? theme.effects.shadow : 'none'
                }}
            >
                {/* Row Header */}
                <div className="flex items-center gap-2 p-2 pr-3 group">
                    <button
                        type="button"
                        onPointerDown={(e) => controls.start(e)}
                        className="h-10 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 hover:bg-white/5 rounded-lg transition-all"
                    >
                        <GripVertical size={16} />
                    </button>

                    <div className="flex-1 flex items-center gap-3 min-w-0">
                        {/* Icon Picker */}
                        <div className="relative group/icon">
                            <div
                                className="relative h-10 w-10 flex items-center justify-center rounded-lg transition-colors"
                                style={{ background: value.colorPair ? `${value.colorPair[0]}15` : 'rgba(128,128,128,0.1)' }}
                            >
                                <Icon size={20} style={{ color: value.colorPair ? value.colorPair[0] : theme.colors.text }} />
                            </div>
                            <select
                                value={value.iconId}
                                onChange={(e) => onUpdate(value.id, { iconId: e.target.value as ValueIconId })}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            >
                                {Object.entries(VALUE_ICON_OPTIONS).map(([id, IconComponent]) => (
                                    <option key={id} value={id}>
                                        {id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="min-w-0 flex-1">
                            <label className="block text-[10px] font-semibold opacity-60 uppercase tracking-wider mb-1">
                                Title
                            </label>
                            <input
                                value={value.name}
                                onChange={(e) => onUpdate(value.id, { name: e.target.value })}
                                className="w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-current bg-black/5 dark:bg-white/5 truncate"
                                placeholder="Value name"
                            />
                        </div>

                        {/* Expand / Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={onToggleExpand}
                                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                title={isExpanded ? 'Collapse' : 'Edit details'}
                            >
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => onArchive(value.id)}
                                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                title="Archive"
                            >
                                <Archive size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`Delete “${value.name}”? This can't be undone.`)) onRemove(value.id)
                                }}
                                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Delete"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-4 pt-2 space-y-4 border-t border-white/10">
                        {showGuide && (
                            <div
                                className="p-3 rounded-xl text-xs"
                                style={{
                                    background: `${currentColor}12`,
                                    border: `1px solid ${currentColor}35`,
                                }}
                            >
                                <div className="font-bold mb-1">Next steps</div>
                                <ol className="list-decimal pl-4 space-y-1 opacity-80">
                                    <li>Pick a color + icon you’ll recognize fast.</li>
                                    <li>Add a few keywords so “Relevant Files” can auto-surface matches.</li>
                                    <li>Go to Homebase → open this value → add widgets + pin your essentials.</li>
                                </ol>
                            </div>
                        )}

                        {/* Color Palette */}
                        <div className="space-y-2">
                            <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">Color</div>
                            <div className="flex flex-wrap gap-2">
                                {CORE_VALUE_PALETTE.map((pair) => {
                                    const isActive = value.colorPair?.[0] === pair[0] && value.colorPair?.[1] === pair[1]
                                    return (
                                        <button
                                            key={`${pair[0]}-${pair[1]}`}
                                            type="button"
                                            className="w-9 h-9 rounded-xl border transition-transform active:scale-95"
                                            style={{
                                                borderColor: isActive ? currentColor : 'rgba(255,255,255,0.18)',
                                                background: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
                                            }}
                                            onClick={() => onUpdate(value.id, { colorPair: pair })}
                                            title={`${pair[0]} → ${pair[1]}`}
                                            aria-label="Select color"
                                        />
                                    )
                                })}
                            </div>
                        </div>

                        {/* Purpose */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Purpose (optional)</label>
                            <textarea
                                value={value.purpose ?? ''}
                                onChange={(e) => onUpdate(value.id, { purpose: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-current transition-all"
                                rows={2}
                                placeholder="What does this value mean to you?"
                                style={{ fontFamily: theme.fonts.body }}
                            />
                        </div>

                        {/* Tone */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Tone (optional)</label>
                            <textarea
                                value={value.tone ?? ''}
                                onChange={(e) => onUpdate(value.id, { tone: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-current transition-all"
                                rows={2}
                                placeholder="How should this value feel?"
                                style={{ fontFamily: theme.fonts.body }}
                            />
                        </div>

                        {/* Search Query */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">File Keywords (Smart Search)</label>
                            <input
                                value={value.searchQuery ?? ''}
                                onChange={(e) => onUpdate(value.id, { searchQuery: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-current transition-all"
                                placeholder="e.g. gym OR health OR nutrition"
                            />
                            <p className="text-[10px] opacity-50">
                                Files matching these words will automatically appear in &quot;Relevant Files&quot;.
                                Use &quot;OR&quot; to separate words.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Reorder.Item>
    )
}
