'use client'

import { CalendarDays, Clock, FileText, Flame, Rainbow, Scroll, Shield, Sparkles, TrendingUp, Zap, Wind, Quote, Timer, PenTool, Search, BookOpen, type IconComponent } from '@/lib/icons'

export type WidgetCategory = 'regulation' | 'momentum' | 'calendar' | 'memory' | 'discovery'

export const WIDGET_CATEGORY_LABELS: Record<WidgetCategory, string> = {
  regulation: 'Regulation',
  momentum: 'Momentum',
  calendar: 'Calendar',
  memory: 'Memory',
  discovery: 'Discovery',
}

export type WidgetType =
  | 'heatmap'
  | 'daily-quests'
  | 'resistance-selector'
  | 'remember-this'
  | 'emotional-worlds'
  | 'pinned-items'
  | 'relevant-files'
  | 'brain-dump'
  | 'weekly-calendar'
  | 'monthly-calendar'
  | 'recent-activity'
  | 'breathing'
  | 'affirmation'
  | 'pomodoro'
  | 'scratchpad'
  | 'apple-calendar'
  | 'quick-search'
  | 'file-type-breakdown'
  | 'energy-tracker'
  | 'notebook'

export type WidgetSpan = 1 | 2

export type WidgetInstance = {
  id: string
  type: WidgetType
  span?: WidgetSpan
}

export type ValueLayout = {
  widgets: WidgetInstance[]
}

export type WidgetDefinition = {
  type: WidgetType
  name: string
  description: string
  icon: IconComponent
  category: WidgetCategory
  defaultSpan: WidgetSpan
  isEnabledByDefault?: (valueId: string) => boolean
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: 'heatmap',
    name: 'Heat Map',
    description: 'A tiny momentum visual for consistency.',
    icon: Flame,
    category: 'momentum',
    defaultSpan: 1,
    isEnabledByDefault: (valueId) => valueId === 'work' || valueId === 'money',
  },
  {
    type: 'daily-quests',
    name: 'Daily Quest',
    description: 'One tiny time-boxed action.',
    icon: Zap,
    category: 'momentum',
    defaultSpan: 1,
    isEnabledByDefault: (valueId) => valueId !== 'learning',
  },
  {
    type: 'resistance-selector',
    name: 'Resistance Selector',
    description: 'Overwhelm/Fear/Boredom → micro-action.',
    icon: Shield,
    category: 'regulation',
    defaultSpan: 2,
    isEnabledByDefault: () => true,
  },
  {
    type: 'remember-this',
    name: 'Resurfacing',
    description: 'Gentle resurfacing of forgotten files.',
    icon: Sparkles,
    category: 'memory',
    defaultSpan: 2,
    isEnabledByDefault: (valueId) => valueId !== 'learning',
  },
  {
    type: 'emotional-worlds',
    name: 'Emotional Worlds',
    description: 'Clusters by vibe, not folders.',
    icon: Rainbow,
    category: 'discovery',
    defaultSpan: 2,
    isEnabledByDefault: () => true,
  },
  {
    type: 'pinned-items',
    name: 'Pinned',
    description: 'Your hand-picked files and folders for this value.',
    icon: FileText,
    category: 'discovery',
    defaultSpan: 2,
    isEnabledByDefault: (valueId) => valueId !== '__homebase__',
  },
  {
    type: 'relevant-files',
    name: 'Relevant Files',
    description: 'A quick list of files that match this value.',
    icon: FileText,
    category: 'discovery',
    defaultSpan: 2,
    isEnabledByDefault: () => true,
  },
  {
    type: 'brain-dump',
    name: 'Brain Dump',
    description: 'A simple place to spill thoughts safely.',
    icon: Scroll,
    category: 'regulation',
    defaultSpan: 2,
    isEnabledByDefault: (valueId) => valueId === 'learning' || valueId === 'support',
  },
  {
    type: 'weekly-calendar',
    name: 'Weekly Calendar',
    description: 'A calm week view for what’s right now.',
    icon: TrendingUp,
    category: 'calendar',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'monthly-calendar',
    name: 'Monthly Calendar',
    description: 'A calm month view for gentle grounding.',
    icon: CalendarDays,
    category: 'calendar',
    defaultSpan: 1,
    isEnabledByDefault: (valueId) => valueId === '__homebase__',
  },
  {
    type: 'recent-activity',
    name: 'Recent Files',
    description: 'Files you\'ve been working with recently.',
    icon: Clock,
    category: 'discovery',
    defaultSpan: 2,
    isEnabledByDefault: (valueId) => valueId === '__homebase__',
  },
  {
    type: 'breathing',
    name: 'Breathing Anchor',
    description: '4-7-8 breathing exercise for regulation.',
    icon: Wind,
    category: 'regulation',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'affirmation',
    name: 'Daily Word',
    description: 'Gentle inspiration and affirmations.',
    icon: Quote,
    category: 'momentum',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'pomodoro',
    name: 'Work Session',
    description: 'A timer for work or rest—you choose what feels supportive.',
    icon: Timer,
    category: 'momentum',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'scratchpad',
    name: 'Scratchpad',
    description: 'Top-of-mind notes and temporary ideas.',
    icon: PenTool,
    category: 'discovery',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'apple-calendar',
    name: 'Apple Calendar',
    description: 'Today\'s events from your Apple Calendar.',
    icon: CalendarDays,
    category: 'calendar',
    defaultSpan: 1,
    isEnabledByDefault: (valueId) => valueId === '__homebase__',
  },
  {
    type: 'quick-search',
    name: 'Quick Search',
    description: 'Fast file search with recent searches.',
    icon: Search,
    category: 'discovery',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'file-type-breakdown',
    name: 'File Types',
    description: 'Visual breakdown of your file types.',
    icon: FileText,
    category: 'discovery',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'energy-tracker',
    name: 'Energy Check-In',
    description: 'A gentle way to notice how you\'re feeling, without judgment.',
    icon: Zap,
    category: 'regulation',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
  {
    type: 'notebook',
    name: 'Notebooks',
    description: 'Add folders as colorful notebooks for quick access.',
    icon: BookOpen,
    category: 'discovery',
    defaultSpan: 1,
    isEnabledByDefault: () => false,
  },
]

export function createWidgetId(type: WidgetType) {
  const cryptoObj = globalThis.crypto as Crypto | undefined
  return cryptoObj?.randomUUID?.() ?? `w_${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function buildDefaultLayout(valueId: string): ValueLayout {
  const widgets: WidgetInstance[] = WIDGET_DEFINITIONS.filter((w) => w.isEnabledByDefault?.(valueId) ?? false).map((w) => ({
    id: createWidgetId(w.type),
    type: w.type,
    span: w.defaultSpan,
  }))

  return { widgets }
}
