'use client'

export type ValueTemplate = {
  id: string
  purpose?: string
  tone?: string
  supportsResurfacing?: boolean
  keywords?: RegExp
  searchQuery?: string
}

const TEMPLATES: ValueTemplate[] = [
  {
    id: 'work',
    purpose: 'Steady progress without pressure.',
    tone: 'Tiny steps, clear next actions.',
    supportsResurfacing: true,
    keywords: /(project|plan|proposal|deck|meeting|notes|ticket|jira|spec|roadmap|review|report)/i,
    searchQuery: 'project OR plan OR proposal OR deck OR meeting OR notes OR ticket OR jira OR spec OR roadmap OR review OR report',
  },
  {
    id: 'health',
    purpose: 'Support your body gently.',
    tone: 'Compassion over perfection.',
    supportsResurfacing: true,
    keywords: /(workout|run|yoga|stretch|sleep|health|doctor|therapy|pt|gym|meal|nutrition)/i,
    searchQuery: 'workout OR run OR yoga OR stretch OR sleep OR health OR doctor OR therapy OR pt OR gym OR meal OR nutrition',
  },
  {
    id: 'relationships',
    purpose: 'Stay connected without guilt.',
    tone: 'Warm, light, and human.',
    supportsResurfacing: true,
    keywords: /(friend|friends|family|partner|date|hangout|dinner|birthday|gift|plan|trip|photo|photos)/i,
    searchQuery: 'friend OR family OR partner OR date OR hangout OR dinner OR birthday OR gift OR plan OR trip OR photo',
  },
  {
    id: 'home',
    purpose: 'Keep life running with less friction.',
    tone: 'Small upkeep beats big resets.',
    supportsResurfacing: true,
    keywords: /(rent|lease|utilities|bills?|receipt|warranty|home|apartment|maintenance|clean|laundry|grocery|insurance)/i,
    searchQuery: 'rent OR lease OR utilities OR bill OR receipt OR warranty OR home OR apartment OR maintenance OR clean OR laundry OR grocery OR insurance',
  },
  {
    id: 'money',
    purpose: 'Money clarity without spiraling.',
    tone: 'Gentle visibility, simple choices.',
    supportsResurfacing: true,
    keywords: /(invoice|receipt|tax|budget|bank|statement|payment|credit|rent|salary|income|expense|money)/i,
    searchQuery: 'invoice OR receipt OR tax OR budget OR bank OR statement OR payment OR credit OR rent OR salary OR income OR expense OR money',
  },
  {
    id: 'support',
    purpose: 'A soft place to land when your brain is loud.',
    tone: 'Validation first. Then one tiny step.',
    supportsResurfacing: true,
    keywords: /(adhd|support|meds?|diagnos|coping|executive|shame|overwhelm|accommodat|burnout|regulation)/i,
    searchQuery: 'adhd OR support OR med OR diagnosis OR coping OR executive OR shame OR overwhelm OR accommodation OR burnout OR regulation',
  },
  {
    id: 'learning',
    purpose: 'Curiosity and nourishment, not productivity.',
    tone: 'Playful, low-pressure exploration.',
    supportsResurfacing: false,
    keywords: /(notebook|notes|study|course|tutorial|language|reading|research|book|article)/i,
    searchQuery: 'notebook OR notes OR study OR course OR tutorial OR language OR reading OR research OR book OR article',
  },
]

export function getValueTemplate(id: string | null | undefined): ValueTemplate | null {
  if (!id) return null
  return TEMPLATES.find((t) => t.id === id) ?? null
}

export function filterFilesForValue<T extends { name: string; path: string }>(files: T[], valueId: string): T[] {
  const template = getValueTemplate(valueId)
  const re = template?.keywords
  if (!re) return files
  return files.filter((f) => re.test(f.name) || re.test(f.path))
}
