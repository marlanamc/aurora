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

type Props = {
    activeValues: CoreValue[]
    archivedValues: CoreValue[]
    theme: GlobalTheme
    onUpdate: (id: string, partial: Partial<CoreValue>) => void
    onAdd: (name: string) => void
    onArchive: (id: string) => void
    onRestore: (id: string) => void
    onRemove: (id: string) => void
    onReorder: (values: CoreValue[]) => void
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

    const handleAdd = () => {
        if (activeValues.length >= MAX_CORE_VALUES) {
            window.alert(`You can have up to ${MAX_CORE_VALUES} values.`)
            return
        }
        const name = window.prompt('Name a core value (example: Creativity):')
        if (name?.trim()) {
            onAdd(name.trim())
        }
    }

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm opacity-70">
                    {activeValues.length}/{MAX_CORE_VALUES} active values
                </div>
                <button
                    onClick={handleAdd}
                    disabled={activeValues.length >= MAX_CORE_VALUES}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                    style={{ background: theme.gradients.button }}
                >
                    <span className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add Value</span>
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
}: {
    value: CoreValue
    theme: GlobalTheme
    isExpanded: boolean
    onToggleExpand: () => void
    onUpdate: (id: string, partial: Partial<CoreValue>) => void
    onArchive: (id: string) => void
    onRemove: (id: string) => void
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

                    <div className="flex-1 flex items-center gap-3">
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

                        {/* Purpose */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Purpose</label>
                            <textarea
                                value={value.purpose ?? ''}
                                onChange={(e) => onUpdate(value.id, { purpose: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-current transition-all"
                                rows={2}
                                placeholder="What does this value mean to you?"
                                style={{ fontFamily: theme.fonts.body }}
                            />
                            <p className="text-[10px] opacity-50">Example: &quot;Compassion over perfection.&quot;</p>
                        </div>

                        {/* Tone */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold opacity-70 uppercase tracking-wider">Tone</label>
                            <textarea
                                value={value.tone ?? ''}
                                onChange={(e) => onUpdate(value.id, { tone: e.target.value })}
                                className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-current transition-all"
                                rows={2}
                                placeholder="How should this value feel?"
                                style={{ fontFamily: theme.fonts.body }}
                            />
                            <p className="text-[10px] opacity-50">Example: &quot;Warm, light, and human.&quot;</p>
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
                </div>
            </div>
        </Reorder.Item>
    )
}
