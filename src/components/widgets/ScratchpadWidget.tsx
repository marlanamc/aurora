'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { PenTool, Eye } from '@/lib/icons'
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

type ScratchpadData = {
    text: string
}

export function ScratchpadWidget({
    widgetId,
    theme,
    getWidgetData,
    mergeWidgetData,
}: {
    widgetId: string
    theme: GlobalTheme
    getWidgetData?: <T,>(id: string, fallback: T) => T
    mergeWidgetData?: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
    const savedData = getWidgetData ? getWidgetData<ScratchpadData>(widgetId, { text: '' }) : { text: '' }
    const [text, setText] = useState(savedData.text)
    const [isPreview, setIsPreview] = useState(false)
    const debouncedText = useDebounce(text, 1000)

    // Load saved data on mount
    useEffect(() => {
        if (savedData.text && !text) {
            setText(savedData.text)
        }
    }, [savedData.text, text])

    // Save to widget data system
    useEffect(() => {
        if (mergeWidgetData && debouncedText !== savedData.text) {
            mergeWidgetData<ScratchpadData>(widgetId, { text: debouncedText }, { text: '' })
        }
    }, [debouncedText, widgetId, mergeWidgetData, savedData.text])

    // Calculate line height to match textarea
    const lineHeight = 1.6
    const fontSize = 14 // text-sm = 14px
    const lineHeightPx = fontSize * lineHeight
    const paddingTop = 16 // p-4 = 16px

    return (
        <UnifiedCard fullHeight>
            <UnifiedCardHeader 
                icon={PenTool} 
                title="Scratchpad"
                action={
                    <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                        style={{ color: theme.colors.textSecondary }}
                        title={isPreview ? 'Edit' : 'Preview'}
                    >
                        {isPreview ? <PenTool size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
                    </button>
                }
            />
            <div className="flex-1 p-0 relative overflow-hidden">
                {isPreview ? (
                    <div 
                        className="w-full h-full overflow-auto p-4 text-sm"
                        style={{
                            color: theme.colors.text,
                            fontFamily: theme.fonts.body,
                            lineHeight: lineHeight,
                        }}
                    >
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                                // Style markdown elements to match theme
                                h1: ({node, ...props}) => <h1 style={{ color: theme.colors.text, fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                                h2: ({node, ...props}) => <h2 style={{ color: theme.colors.text, fontSize: '1.25em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                                h3: ({node, ...props}) => <h3 style={{ color: theme.colors.text, fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' }} {...props} />,
                                p: ({node, ...props}) => <p style={{ color: theme.colors.text, marginBottom: '0.5em' }} {...props} />,
                                ul: ({node, ...props}) => (
                                    <ul style={{ 
                                        color: theme.colors.text, 
                                        marginLeft: '1.5em', 
                                        marginBottom: '0.75em',
                                        marginTop: '0.5em',
                                        paddingLeft: '0.25em',
                                        listStyleType: 'disc',
                                        listStylePosition: 'outside',
                                    }} {...props} />
                                ),
                                ol: ({node, ...props}) => (
                                    <ol style={{ 
                                        color: theme.colors.text, 
                                        marginLeft: '1.5em', 
                                        marginBottom: '0.75em',
                                        marginTop: '0.5em',
                                        paddingLeft: '0.25em',
                                        listStylePosition: 'outside',
                                    }} {...props} />
                                ),
                                li: ({node, ...props}) => (
                                    <li style={{ 
                                        color: theme.colors.text,
                                        marginBottom: '0.25em',
                                        lineHeight: lineHeight,
                                        display: 'list-item',
                                    }} {...props} />
                                ),
                                code: ({node, inline, ...props}: any) => 
                                    inline ? (
                                        <code style={{ 
                                            background: 'rgba(0,0,0,0.1)', 
                                            padding: '0.125em 0.25em', 
                                            borderRadius: '0.25em',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9em'
                                        }} {...props} />
                                    ) : (
                                        <code style={{ 
                                            display: 'block',
                                            background: 'rgba(0,0,0,0.1)', 
                                            padding: '0.5em', 
                                            borderRadius: '0.25em',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9em',
                                            overflow: 'auto',
                                            marginBottom: '0.5em'
                                        }} {...props} />
                                    ),
                                blockquote: ({node, ...props}) => <blockquote style={{ 
                                    borderLeft: `3px solid ${theme.colors.border}`, 
                                    paddingLeft: '1em', 
                                    marginLeft: 0,
                                    marginBottom: '0.5em',
                                    color: theme.colors.textSecondary,
                                    fontStyle: 'italic'
                                }} {...props} />,
                                a: ({node, ...props}: any) => <a style={{ color: theme.colors.primary, textDecoration: 'underline' }} {...props} />,
                            }}
                        >
                            {text || '*Start writing...*'}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <>
                        <textarea
                            className="w-full h-full bg-transparent resize-none p-4 text-sm focus:outline-none relative z-10"
                            style={{
                                color: theme.colors.text,
                                fontFamily: theme.fonts.body,
                                lineHeight: lineHeight,
                                paddingTop: `${paddingTop}px`,
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingBottom: '16px',
                            }}
                            placeholder="What's on your mind? This saves automatically...\n\nYou can use **markdown** for formatting!"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        {/* Lines Decoration - aligned with text */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-10 z-0"
                            style={{
                                backgroundImage: `linear-gradient(transparent ${lineHeightPx - 1}px, ${theme.colors.text} ${lineHeightPx - 1}px, ${theme.colors.text} ${lineHeightPx}px, transparent ${lineHeightPx}px)`,
                                backgroundSize: `100% ${lineHeightPx}px`,
                                backgroundPosition: `0 ${paddingTop}px`,
                                paddingTop: `${paddingTop}px`,
                                paddingLeft: '16px',
                                paddingRight: '16px',
                            }}
                        />
                    </>
                )}
            </div>
        </UnifiedCard>
    )
}
