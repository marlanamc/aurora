'use client'

import {
  DollarSign,
  Scale,
  Dove,
  DoorOpen,
  Sparkles,
  Heart,
  Gem,
  Star,
  Trophy,
  Target,
  Flame,
  Zap,
  type IconComponent,
} from '@/lib/icons'

export const VALUE_ICON_OPTIONS = {
  dollarSign: DollarSign,
  scale: Scale,
  dove: Dove,
  doorOpen: DoorOpen,
  sparkles: Sparkles,
  heart: Heart,
  gem: Gem,
  star: Star,
  trophy: Trophy,
  target: Target,
  flame: Flame,
  zap: Zap,
} as const satisfies Record<string, IconComponent>

export type ValueIconId = keyof typeof VALUE_ICON_OPTIONS

