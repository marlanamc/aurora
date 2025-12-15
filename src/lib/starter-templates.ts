'use client'

import type { ValueIconId } from '@/lib/value-icons'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'

export type StarterTemplateValue = {
  id: string
  name: string
  iconId: ValueIconId
  purpose: string
  tone: string
  searchQuery?: string
}

export type StarterTemplate = {
  id: string
  name: string
  description: string
  values: StarterTemplateValue[]
}

export type TemplateCoreValue = StarterTemplateValue & {
  colorPair: readonly [string, string]
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'gentle-starter',
    name: 'Gentle Starter',
    description: 'A small set of areas to reduce overwhelm. You can rename anything later.',
    values: [
      {
        id: 'work',
        name: 'Projects',
        iconId: 'target',
        purpose: 'Steady progress without pressure.',
        tone: 'Tiny steps, clear next actions.',
      },
      {
        id: 'home',
        name: 'Life Admin',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'health',
        name: 'Body',
        iconId: 'flame',
        purpose: 'Support your body gently.',
        tone: 'Compassion over perfection.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'classic-aurora',
    name: 'Classic Aurora',
    description: 'The full set of everyday life areas: work, people, home, money, learning, and support.',
    values: [
      {
        id: 'work',
        name: 'Projects',
        iconId: 'target',
        purpose: 'Steady progress without pressure.',
        tone: 'Tiny steps, clear next actions.',
      },
      {
        id: 'health',
        name: 'Body',
        iconId: 'flame',
        purpose: 'Support your body gently.',
        tone: 'Compassion over perfection.',
      },
      {
        id: 'relationships',
        name: 'People',
        iconId: 'heart',
        purpose: 'Stay connected without guilt.',
        tone: 'Warm, light, and human.',
      },
      {
        id: 'home',
        name: 'Home Base',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'money',
        name: 'Money Admin',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'learning',
        name: 'Curiosity',
        iconId: 'scale',
        purpose: 'Curiosity and nourishment, not productivity.',
        tone: 'Playful, low-pressure exploration.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'workday-focus',
    name: 'Workday Focus',
    description: 'Clear lanes for getting things done (plus admin + recovery).',
    values: [
      {
        id: 'deep-work',
        name: 'Deep Work',
        iconId: 'target',
        purpose: 'Make meaningful progress with fewer context switches.',
        tone: 'Pick the next right chunk.',
        searchQuery: 'spec OR draft OR design OR roadmap OR proposal OR implementation OR code OR review',
      },
      {
        id: 'meetings-notes',
        name: 'Meetings & Notes',
        iconId: 'scale',
        purpose: 'Capture the important bits so your brain can let go.',
        tone: 'Notes now, clarity later.',
        searchQuery: 'meeting OR notes OR agenda OR minutes OR \"1:1\" OR retro OR sync OR standup',
      },
      {
        id: 'inbox-to-sort',
        name: 'Inbox / To Sort',
        iconId: 'sparkles',
        purpose: 'A gentle holding zone for loose files and downloads.',
        tone: 'No shame—just a parking lot.',
        searchQuery: 'download OR downloads OR screenshot OR untitled OR scan OR \"new file\"',
      },
      {
        id: 'home',
        name: 'Admin',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'money',
        name: 'Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'student-semester',
    name: 'Student Semester',
    description: 'Classes, assignments, research, and the “life stuff” that surrounds it.',
    values: [
      {
        id: 'learning',
        name: 'Classes',
        iconId: 'scale',
        purpose: 'Stay oriented to what you’re learning right now.',
        tone: 'One lecture at a time.',
      },
      {
        id: 'assignments',
        name: 'Assignments',
        iconId: 'trophy',
        purpose: 'Make deadlines less scary by making next steps visible.',
        tone: 'Start tiny. Start messy.',
        searchQuery: 'assignment OR homework OR essay OR lab OR \"problem set\" OR due OR rubric',
      },
      {
        id: 'research',
        name: 'Research',
        iconId: 'sparkles',
        purpose: 'Collect sources and ideas without losing them.',
        tone: 'Capture first. Organize later.',
        searchQuery: 'research OR paper OR sources OR bibliography OR journal OR study OR citation',
      },
      {
        id: 'relationships',
        name: 'People',
        iconId: 'heart',
        purpose: 'Stay connected without guilt.',
        tone: 'Warm, light, and human.',
      },
      {
        id: 'home',
        name: 'Life Admin',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'A home for creative work, inspiration, publishing, and the business bits.',
    values: [
      {
        id: 'creative-work',
        name: 'Create',
        iconId: 'sparkles',
        purpose: 'Protect time for making things that matter to you.',
        tone: 'Play first. Polish later.',
        searchQuery: 'design OR draft OR concept OR sketch OR \"mood board\" OR figma OR procreate OR photoshop',
      },
      {
        id: 'inspiration',
        name: 'Inspiration',
        iconId: 'gem',
        purpose: 'Collect references you’ll actually remember you saved.',
        tone: 'Curate, don’t hoard.',
        searchQuery: 'inspiration OR reference OR palette OR style OR \"mood board\" OR collection',
      },
      {
        id: 'publish',
        name: 'Publish',
        iconId: 'star',
        purpose: 'Ship your work in a way that feels doable.',
        tone: 'Done is allowed.',
        searchQuery: 'publish OR release OR upload OR post OR newsletter OR captions OR launch',
      },
      {
        id: 'community',
        name: 'Community',
        iconId: 'heart',
        purpose: 'Keep collaboration and connection lightweight.',
        tone: 'Reach out without pressure.',
        searchQuery: 'collab OR collaboration OR meetup OR community OR messages OR contact OR \"coffee chat\"',
      },
      {
        id: 'business',
        name: 'Business',
        iconId: 'dollarSign',
        purpose: 'Keep the money/admin bits from leaking into everything.',
        tone: 'Small upkeep beats big resets.',
        searchQuery: 'invoice OR contract OR client OR proposal OR budget OR taxes OR payment',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'freelance-business',
    name: 'Freelance / Clients',
    description: 'Clients, deliverables, money, and simple systems that keep it all moving.',
    values: [
      {
        id: 'clients',
        name: 'Clients',
        iconId: 'target',
        purpose: 'Keep client work clear and contained.',
        tone: 'One client at a time.',
        searchQuery: 'client OR contract OR call OR kickoff OR feedback OR revisions',
      },
      {
        id: 'deliverables',
        name: 'Deliverables',
        iconId: 'trophy',
        purpose: 'Track what you’re shipping and what’s next.',
        tone: 'Finish one thing.',
        searchQuery: 'final OR export OR deliverable OR \"version\" OR \"v1\" OR \"v2\" OR submission',
      },
      {
        id: 'marketing',
        name: 'Marketing',
        iconId: 'star',
        purpose: 'Lightweight visibility without burning out.',
        tone: 'Tiny outreach counts.',
        searchQuery: 'marketing OR website OR copy OR promo OR \"case study\" OR social OR content',
      },
      {
        id: 'money',
        name: 'Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'home',
        name: 'Admin',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'learning',
        name: 'Skills',
        iconId: 'scale',
        purpose: 'Learn what supports your work (not what “should” be learned).',
        tone: 'Curiosity over pressure.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'job-search',
    name: 'Job Search Sprint',
    description: 'Applications, interviews, portfolio, and support for the emotional load.',
    values: [
      {
        id: 'applications',
        name: 'Applications',
        iconId: 'target',
        purpose: 'Keep applications moving with tiny, repeatable steps.',
        tone: 'One submission at a time.',
        searchQuery: 'application OR resume OR \"cover letter\" OR submission OR role OR position',
      },
      {
        id: 'interviews',
        name: 'Interviews',
        iconId: 'trophy',
        purpose: 'Prep without spiraling.',
        tone: 'Good enough is allowed.',
        searchQuery: 'interview OR prep OR questions OR recruiter OR \"phone screen\" OR \"onsite\"',
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        iconId: 'gem',
        purpose: 'Keep your best work easy to find.',
        tone: 'Show, don’t overthink.',
        searchQuery: 'portfolio OR \"case study\" OR samples OR website OR github OR demo',
      },
      {
        id: 'networking',
        name: 'Networking',
        iconId: 'heart',
        purpose: 'Stay connected without pressure.',
        tone: 'Low-stakes outreach counts.',
        searchQuery: 'network OR outreach OR linkedin OR referral OR \"coffee chat\" OR intro',
      },
      {
        id: 'money',
        name: 'Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'home-family',
    name: 'Home & Family',
    description: 'Home life, logistics, and care—without making it a second job.',
    values: [
      {
        id: 'home',
        name: 'Home',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'family',
        name: 'Family',
        iconId: 'heart',
        purpose: 'Keep family logistics visible and gentle.',
        tone: 'Support over perfection.',
        searchQuery: 'school OR kid OR kids OR family OR daycare OR pediatric OR permission',
      },
      {
        id: 'health',
        name: 'Body',
        iconId: 'flame',
        purpose: 'Support your body gently.',
        tone: 'Compassion over perfection.',
      },
      {
        id: 'money',
        name: 'Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'plans',
        name: 'Plans',
        iconId: 'star',
        purpose: 'Keep plans lightweight and easy to revisit.',
        tone: 'Flexible is a feature.',
        searchQuery: 'plan OR trip OR schedule OR reservation OR invite OR calendar',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'wellbeing-energy',
    name: 'Wellbeing & Energy',
    description: 'Sleep, movement, food, appointments, and gentle check-ins.',
    values: [
      {
        id: 'sleep',
        name: 'Sleep',
        iconId: 'dove',
        purpose: 'Support your rest without guilt.',
        tone: 'Notice patterns, not failures.',
        searchQuery: 'sleep OR bedtime OR \"sleep log\" OR rest OR nap OR routine',
      },
      {
        id: 'movement',
        name: 'Movement',
        iconId: 'flame',
        purpose: 'Move in ways that feel supportive.',
        tone: 'Consistency over intensity.',
        searchQuery: 'workout OR run OR yoga OR walk OR stretch OR gym',
      },
      {
        id: 'food',
        name: 'Food',
        iconId: 'heart',
        purpose: 'Make eating easier and less stressful.',
        tone: 'Fed is best.',
        searchQuery: 'meal OR recipe OR grocery OR groceries OR nutrition OR snacks',
      },
      {
        id: 'appointments',
        name: 'Appointments',
        iconId: 'scale',
        purpose: 'Keep appointments and health admin from slipping.',
        tone: 'Reminders are care.',
        searchQuery: 'doctor OR appointment OR therapy OR dentist OR checkup OR refill',
      },
      {
        id: 'mind',
        name: 'Mind',
        iconId: 'sparkles',
        purpose: 'A place for journaling, feelings, and mental clarity.',
        tone: 'Curiosity, not judgment.',
        searchQuery: 'journal OR mindfulness OR meditation OR therapy OR feelings OR reflection',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'life-admin',
    name: 'Life Admin Overhaul',
    description: 'Paperwork, bills, scheduling, and an inbox to tame the chaos.',
    values: [
      {
        id: 'paperwork',
        name: 'Paperwork',
        iconId: 'scale',
        purpose: 'Track important forms and documents without losing them.',
        tone: 'One tiny filing action counts.',
        searchQuery: 'form OR contract OR insurance OR warranty OR policy OR \"id\" OR passport',
      },
      {
        id: 'bills',
        name: 'Bills & Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
        searchQuery: 'bill OR invoice OR receipt OR tax OR budget OR bank OR statement OR payment',
      },
      {
        id: 'home',
        name: 'Home Stuff',
        iconId: 'doorOpen',
        purpose: 'Keep life running with less friction.',
        tone: 'Small upkeep beats big resets.',
      },
      {
        id: 'scheduling',
        name: 'Scheduling',
        iconId: 'star',
        purpose: 'Keep dates and deadlines visible and calm.',
        tone: 'Future-you will thank you.',
        searchQuery: 'calendar OR schedule OR appointment OR booking OR reservation OR deadline',
      },
      {
        id: 'inbox',
        name: 'Inbox',
        iconId: 'sparkles',
        purpose: 'A gentle holding zone for “I’ll deal with it later.”',
        tone: 'No shame—just a parking lot.',
        searchQuery: 'download OR downloads OR screenshot OR untitled OR scan OR \"new file\"',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'moving-transition',
    name: 'Moving / Transition',
    description: 'For big life shifts: moving, paperwork, money, and staying connected.',
    values: [
      {
        id: 'moving',
        name: 'Moving',
        iconId: 'doorOpen',
        purpose: 'Keep the move from exploding into a million tabs.',
        tone: 'One box at a time.',
        searchQuery: 'move OR moving OR address OR lease OR landlord OR storage OR utilities',
      },
      {
        id: 'paperwork',
        name: 'Paperwork',
        iconId: 'scale',
        purpose: 'Track important forms and documents without losing them.',
        tone: 'One tiny filing action counts.',
        searchQuery: 'form OR contract OR insurance OR warranty OR policy OR \"change\" OR \"address\"',
      },
      {
        id: 'money',
        name: 'Money',
        iconId: 'dollarSign',
        purpose: 'Money clarity without spiraling.',
        tone: 'Gentle visibility, simple choices.',
      },
      {
        id: 'home',
        name: 'Home Setup',
        iconId: 'star',
        purpose: 'Turn an empty space into a usable home, slowly.',
        tone: 'Good enough is home.',
        searchQuery: 'setup OR furniture OR wifi OR \"internet\" OR \"router\" OR \"address\"',
      },
      {
        id: 'relationships',
        name: 'People',
        iconId: 'heart',
        purpose: 'Stay connected without guilt.',
        tone: 'Warm, light, and human.',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
  {
    id: 'learning-sprint',
    name: 'Learning Sprint',
    description: 'Learn fast without burning out: notes, reading, practice, and community.',
    values: [
      {
        id: 'learning',
        name: 'Learn',
        iconId: 'scale',
        purpose: 'Curiosity and nourishment, not productivity.',
        tone: 'Playful, low-pressure exploration.',
      },
      {
        id: 'notes',
        name: 'Notes',
        iconId: 'sparkles',
        purpose: 'Capture what matters while it’s fresh.',
        tone: 'Messy notes are still notes.',
        searchQuery: 'notes OR summary OR outline OR notebook OR zettel OR \"study\"',
      },
      {
        id: 'practice-projects',
        name: 'Practice Projects',
        iconId: 'target',
        purpose: 'Build tiny things to make learning stick.',
        tone: 'Small demos count.',
        searchQuery: 'project OR exercise OR kata OR tutorial OR build OR demo',
      },
      {
        id: 'reading',
        name: 'Reading',
        iconId: 'gem',
        purpose: 'Keep reading material easy to find and revisit.',
        tone: 'A little at a time.',
        searchQuery: 'book OR article OR reading OR paper OR pdf OR \"chapter\"',
      },
      {
        id: 'community',
        name: 'Community',
        iconId: 'heart',
        purpose: 'Stay connected without pressure.',
        tone: 'Ask one small question.',
        searchQuery: 'discord OR slack OR community OR meetup OR forum OR discussion',
      },
      {
        id: 'support',
        name: 'Reset',
        iconId: 'dove',
        purpose: 'A soft place to land when your brain is loud.',
        tone: 'Validation first. Then one tiny step.',
      },
    ],
  },
]

export function getStarterTemplate(id: string): StarterTemplate | null {
  return STARTER_TEMPLATES.find((t) => t.id === id) ?? null
}

export function buildCoreValuesFromStarterTemplate(template: StarterTemplate): TemplateCoreValue[] {
  return template.values.map((value, idx) => ({
    ...value,
    colorPair: CORE_VALUE_PALETTE[idx % CORE_VALUE_PALETTE.length],
  }))
}

