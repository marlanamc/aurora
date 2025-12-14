'use client'

import { useEffect, useState } from 'react'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { Timer, Zap, RefreshCw } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'

// 25 minutes in seconds
const WORK_TIME = 25 * 60

export function PomodoroWidget({
    theme,
}: {
    theme: GlobalTheme
}) {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        if (!isRunning) return
        if (timeLeft <= 0) {
            setIsRunning(false)
            // Could play a sound here
            return
        }

        const interval = setInterval(() => {
            setTimeLeft((t) => t - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, timeLeft])

    const toggleTimer = () => setIsRunning(!isRunning)
    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(WORK_TIME)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const progress = 1 - (timeLeft / WORK_TIME)
    const size = 120
    const strokeWidth = 6
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - progress * circumference

    return (
        <UnifiedCard>
            <UnifiedCardHeader
                icon={Timer}
                title="Work Session"
                subtitle="25m Sprint"
                action={
                    <button
                        onClick={resetTimer}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        title="Reset Timer"
                    >
                        <RefreshCw size={14} style={{ color: theme.colors.textSecondary }} />
                    </button>
                }
            />

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative flex items-center justify-center">
                    {/* SVG Progress Ring */}
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Track */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke={theme.colors.surfaceHover}
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke={theme.colors.primary}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span
                            className="text-3xl font-bold tabular-nums tracking-wider"
                            style={{ color: theme.colors.text }}
                        >
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={toggleTimer}
                    className="mt-6 px-6 py-2 rounded-full font-semibold transition-transform active:scale-95 flex items-center gap-2"
                    style={{
                        background: isRunning ? theme.colors.surfaceHover : theme.colors.primary,
                        color: isRunning ? theme.colors.text : '#ffffff',
                        boxShadow: theme.effects.shadow
                    }}
                >
                    {isRunning ? (
                        'Pause'
                    ) : (
                        <>
                            <Zap size={16} />
                            <span>Start Focus</span>
                        </>
                    )}
                </button>
            </div>
        </UnifiedCard>
    )
}
