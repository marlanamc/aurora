'use client'

import { useState, useEffect } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { PenTool } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

// Simple debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function ScratchpadWidget({
    widgetId,
    theme,
    initialText = '',
    onSave
}: {
    widgetId: string
    theme: GlobalTheme
    initialText?: string
    onSave?: (text: string) => void
}) {
    const [text, setText] = useState(initialText)
    const debouncedText = useDebounce(text, 1000)

    // Persist locally if no onSave provided (or also)
    useEffect(() => {
        if (onSave) {
            onSave(debouncedText)
        }
        // Also save to localStorage as backup
        localStorage.setItem(`scratchpad_${widgetId}`, debouncedText)
    }, [debouncedText, widgetId, onSave])

    // Load from local storage on mount if empty
    useEffect(() => {
        if (!initialText) {
            const saved = localStorage.getItem(`scratchpad_${widgetId}`)
            if (saved) setText(saved)
        }
    }, [initialText, widgetId])

    return (
        <UnifiedCard fullHeight>
            <UnifiedCardHeader icon={PenTool} title="Scratchpad" subtitle="Quick notes" />
            <div className="flex-1 p-0 relative">
                <textarea
                    className="w-full h-full bg-transparent resize-none p-4 text-sm focus:outline-none"
                    style={{
                        color: theme.colors.text,
                        fontFamily: theme.fonts.body,
                        lineHeight: 1.6
                    }}
                    placeholder="Type anything here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                {/* Lines Decoration */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(transparent 95%, ${theme.colors.text} 95%)`,
                        backgroundSize: '100% 1.6em',
                        backgroundPosition: '0 1.2em'
                    }}
                />
            </div>
        </UnifiedCard>
    )
}
