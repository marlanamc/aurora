export const CORE_VALUE_PALETTE = [
    ['#10B981', '#34D399'], // Emerald
    ['#3B82F6', '#60A5FA'], // Blue
    ['#A855F7', '#C084FC'], // Purple
    ['#EF4444', '#F87171'], // Red
    ['#F59E0B', '#FBBF24'], // Amber
    ['#EC4899', '#F472B6'], // Pink
    ['#14B8A6', '#2DD4BF'], // Teal
    ['#6366F1', '#818CF8'], // Indigo
    ['#84CC16', '#A3E635'], // Lime
    ['#06B6D4', '#22D3EE'], // Cyan
    ['#F43F5E', '#FB7185'], // Rose
    ['#D946EF', '#E879F9'], // Fuchsia
] as const

export type ColorPair = typeof CORE_VALUE_PALETTE[number]
