'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { Quote, RefreshCw } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

const GENERAL_QUOTES = [
    "The best way to output is to input.",
    "Rest is not a reward, it's a requirement.",
    "You are allowed to be a beginner.",
    "Progress sits on a pile of failures.",
    "Clarity comes from engagement, not thought.",
    "Systems > Willpower.",
    "One step at a time.",
    "Focus on the next right action.",
    "Your potential is infinite.",
    "Be gentle with yourself."
]

const VALUE_QUOTES: Record<string, string[]> = {
    work: [
        "Done is better than perfect.",
        "Small progress is still progress.",
        "You've solved hard problems before.",
        "One task at a time.",
        "Your work matters.",
    ],
    health: [
        "Your body is your home.",
        "Movement is medicine.",
        "Rest is productive.",
        "Small steps build big changes.",
        "You deserve to feel good.",
    ],
    relationships: [
        "Connection takes courage.",
        "You are worthy of love.",
        "Small gestures matter.",
        "Be present, not perfect.",
        "Your people see you.",
    ],
    home: [
        "Home is where you recharge.",
        "Your space reflects your peace.",
        "Small improvements add up.",
        "Comfort is not laziness.",
        "You deserve a safe space.",
    ],
    money: [
        "Financial peace is possible.",
        "Small steps build wealth.",
        "You're learning, not failing.",
        "Progress over perfection.",
        "Your future self will thank you.",
    ],
    learning: [
        "Curiosity is your superpower.",
        "Not knowing is the first step.",
        "Mistakes are data, not failure.",
        "You're always learning.",
        "Questions are brave.",
    ],
    support: [
        "It's okay to need help.",
        "Rest is resistance.",
        "You don't have to do it alone.",
        "Healing isn't linear.",
        "You're doing better than you think.",
    ],
}

export function AffirmationWidget({
    theme,
    valueId,
    widgetId,
    getWidgetData,
    mergeWidgetData,
}: {
    theme: GlobalTheme
    valueId?: string
    widgetId?: string
    getWidgetData?: <T,>(id: string, fallback: T) => T
    mergeWidgetData?: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
    const quotes = valueId && VALUE_QUOTES[valueId] ? VALUE_QUOTES[valueId] : GENERAL_QUOTES
    
    // Get saved quote index or random
    const savedIndex = widgetId && getWidgetData ? getWidgetData<number>(widgetId, -1) : -1
    const [index, setIndex] = useState(savedIndex >= 0 && savedIndex < quotes.length ? savedIndex : 0)

    // Hydration safety since random
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        if (savedIndex < 0 || savedIndex >= quotes.length) {
            setIndex(Math.floor(Math.random() * quotes.length))
        }
        setMounted(true)
    }, [])

    const nextQuote = () => {
        const next = (index + 1) % quotes.length
        setIndex(next)
        // Save current quote index
        if (widgetId && mergeWidgetData) {
            mergeWidgetData(widgetId, { quoteIndex: next }, { quoteIndex: 0 })
        }
    }

    if (!mounted) return null

    return (
        <UnifiedCard>
            <UnifiedCardHeader
                icon={Quote}
                title="Daily Word"
                subtitle="Some inspiration"
                action={
                    <button
                        onClick={nextQuote}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="New Quote"
                    >
                        <RefreshCw size={14} style={{ color: theme.colors.textSecondary }} />
                    </button>
                }
            />

            <div
                className="flex-1 flex flex-col items-center justify-center p-6 text-center"
                onClick={nextQuote}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p
                            className="text-lg font-medium leading-relaxed italic"
                            style={{ color: theme.colors.text, fontFamily: theme.fonts.display }}
                        >
                            &quot;{QUOTES[index]}&quot;
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </UnifiedCard>
    )
}
