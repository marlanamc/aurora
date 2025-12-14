'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { Wind } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

export function BreathingWidget({
    theme,
}: {
    theme: GlobalTheme
}) {
    const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle')
    const [_cycleCount, setCycleCount] = useState(0)

    useEffect(() => {
        if (phase === 'idle') return

        let timer: NodeJS.Timeout

        if (phase === 'inhale') {
            timer = setTimeout(() => setPhase('hold'), 4000)
        } else if (phase === 'hold') {
            timer = setTimeout(() => setPhase('exhale'), 7000)
        } else if (phase === 'exhale') {
            timer = setTimeout(() => setPhase('inhale'), 8000)
            setCycleCount(c => c + 1)
        }

        return () => clearTimeout(timer)
    }, [phase])

    const toggleBreathing = () => {
        setPhase(p => p === 'idle' ? 'inhale' : 'idle')
    }

    const instructions = {
        idle: 'Tap to breathe',
        inhale: 'Inhale...',
        hold: 'Hold...',
        exhale: 'Exhale...'
    }

    return (
        <UnifiedCard>
            <UnifiedCardHeader icon={Wind} title="Breathing Anchor" subtitle="4-7-8 Relaxation" />
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[160px]">
                <button
                    onClick={toggleBreathing}
                    className="relative flex items-center justify-center focus:outline-none"
                >
                    {/* Outer ripples */}
                    {phase !== 'idle' && (
                        <>
                            <motion.div
                                className="absolute rounded-full opacity-20"
                                style={{ background: theme.colors.primary }}
                                animate={{
                                    scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.55 : 1,
                                    opacity: phase === 'exhale' ? 0 : 0.2
                                }}
                                transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut" }}
                                initial={{ width: 100, height: 100, scale: 1 }}
                            />
                            <motion.div
                                className="absolute rounded-full opacity-10"
                                style={{ background: theme.colors.secondary }}
                                animate={{
                                    scale: phase === 'inhale' ? 2 : phase === 'hold' ? 2.1 : 1,
                                    opacity: phase === 'exhale' ? 0 : 0.1
                                }}
                                transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut" }}
                                initial={{ width: 100, height: 100, scale: 1 }}
                            />
                        </>
                    )}

                    {/* Main circle */}
                    <motion.div
                        className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-lg backdrop-blur-sm border"
                        style={{
                            background: `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.surfaceHover})`,
                            borderColor: theme.components.card.border
                        }}
                        animate={{
                            scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 1.0,
                        }}
                        transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8, ease: "easeInOut" }}
                    >
                        <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                            {instructions[phase]}
                        </span>
                    </motion.div>
                </button>
            </div>
        </UnifiedCard>
    )
}
