/**
 * Smart Defaults - Intelligent widget suggestions based on focus area context
 * Reduces cognitive load by suggesting relevant widgets when creating focus areas
 */

import type { WidgetType } from './widgets'

export type WidgetSuggestion = {
  type: WidgetType
  reason: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Suggest widgets based on focus area name and common patterns
 */
export function suggestWidgetsForFocusArea(
  areaName: string,
  areaId?: string
): WidgetSuggestion[] {
  const name = areaName.toLowerCase()
  const suggestions: WidgetSuggestion[] = []

  // Business/Work patterns
  if (
    name.includes('business') ||
    name.includes('work') ||
    name.includes('project') ||
    name.includes('client') ||
    name.includes('freelance') ||
    areaId === 'work'
  ) {
    suggestions.push(
      { type: 'links', reason: 'Quick access to tools like Stripe, website, scheduler', priority: 'high' },
      { type: 'relevant-files', reason: 'Your project files and documents', priority: 'high' },
      { type: 'apple-calendar', reason: 'Keep track of meetings and deadlines', priority: 'high' },
      { type: 'scratchpad', reason: 'Quick notes and reminders', priority: 'medium' }
    )
  }

  // Health/Body patterns
  if (
    name.includes('health') ||
    name.includes('body') ||
    name.includes('wellness') ||
    name.includes('fitness') ||
    areaId === 'health'
  ) {
    suggestions.push(
      { type: 'apple-calendar', reason: 'Track appointments and checkups', priority: 'high' },
      { type: 'energy-tracker', reason: 'Monitor your energy levels', priority: 'high' },
      { type: 'scratchpad', reason: 'Notes about symptoms or questions for doctor', priority: 'medium' }
    )
  }

  // Learning/Education patterns
  if (
    name.includes('learn') ||
    name.includes('study') ||
    name.includes('course') ||
    name.includes('education') ||
    areaId === 'learning'
  ) {
    suggestions.push(
      { type: 'notebook', reason: 'Organize your course materials', priority: 'high' },
      { type: 'relevant-files', reason: 'Your notes and assignments', priority: 'high' },
      { type: 'scratchpad', reason: 'Quick study notes', priority: 'medium' }
    )
  }

  // Creative patterns
  if (
    name.includes('creative') ||
    name.includes('art') ||
    name.includes('design') ||
    name.includes('write') ||
    name.includes('music')
  ) {
    suggestions.push(
      { type: 'notebook', reason: 'Store your creative projects', priority: 'high' },
      { type: 'links', reason: 'Inspiration and reference links', priority: 'medium' },
      { type: 'relevant-files', reason: 'Your creative work files', priority: 'high' }
    )
  }

  // Money/Finance patterns
  if (
    name.includes('money') ||
    name.includes('finance') ||
    name.includes('budget') ||
    name.includes('tax') ||
    areaId === 'money'
  ) {
    suggestions.push(
      { type: 'relevant-files', reason: 'Your financial documents', priority: 'high' },
      { type: 'links', reason: 'Banking and financial tools', priority: 'medium' },
      { type: 'apple-calendar', reason: 'Important financial deadlines', priority: 'medium' }
    )
  }

  // Home/Admin patterns
  if (
    name.includes('home') ||
    name.includes('admin') ||
    name.includes('life') ||
    name.includes('household') ||
    areaId === 'home'
  ) {
    suggestions.push(
      { type: 'relevant-files', reason: 'Important documents and paperwork', priority: 'high' },
      { type: 'apple-calendar', reason: 'Appointments and reminders', priority: 'medium' },
      { type: 'links', reason: 'Useful home-related links', priority: 'low' }
    )
  }

  // Support/Reset patterns
  if (
    name.includes('reset') ||
    name.includes('support') ||
    name.includes('self-care') ||
    areaId === 'support'
  ) {
    suggestions.push(
      { type: 'brain-dump', reason: 'A safe place to process thoughts', priority: 'high' },
      { type: 'resistance-selector', reason: 'Help when you feel stuck', priority: 'high' },
      { type: 'breathing', reason: 'Quick calming exercises', priority: 'medium' }
    )
  }

  // Relationships/People patterns
  if (
    name.includes('people') ||
    name.includes('relationship') ||
    name.includes('family') ||
    name.includes('friend') ||
    areaId === 'relationships'
  ) {
    suggestions.push(
      { type: 'apple-calendar', reason: 'Important dates and events', priority: 'high' },
      { type: 'relevant-files', reason: 'Photos and memories', priority: 'medium' },
      { type: 'scratchpad', reason: 'Gift ideas and notes', priority: 'low' }
    )
  }

  // Default suggestions (always helpful)
  suggestions.push(
    { type: 'relevant-files', reason: 'Files related to this area', priority: 'medium' },
    { type: 'remember-this', reason: 'Gentle resurfacing of forgotten files', priority: 'low' }
  )

  // Remove duplicates and sort by priority
  const unique = new Map<WidgetType, WidgetSuggestion>()
  for (const suggestion of suggestions) {
    const existing = unique.get(suggestion.type)
    if (!existing || getPriorityWeight(suggestion.priority) > getPriorityWeight(existing.priority)) {
      unique.set(suggestion.type, suggestion)
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return Array.from(unique.values()).sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )
}

function getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
  return priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
}

/**
 * Get a friendly message explaining why these widgets were suggested
 */
export function getSuggestionMessage(suggestions: WidgetSuggestion[]): string {
  if (suggestions.length === 0) return ''
  
  const highPriority = suggestions.filter((s) => s.priority === 'high')
  if (highPriority.length > 0) {
    return `People often add ${highPriority[0].type === 'links' ? 'a Links widget' : `a ${highPriority[0].type} widget`} here.`
  }
  
  return 'Here are some widgets that might be helpful.'
}

