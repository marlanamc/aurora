/**
 * Aurora OS - Resurfacing Theme System
 *
 * Theme configurations for the "Remember This?" section
 * Each theme embodies different seasonal and emotional states,
 * aligned with ADHD-friendly visual memory and sensory encoding
 */

import {
  type IconComponent,
  Flower2,
  Sun,
  Leaf,
  Snowflake,
  Rainbow,
  Moon,
  Sparkles,
  Scroll,
  Sprout,
  Flame,
  Clock,
  Dove,
  Cloud,
  Star,
  Zap,
  FileText,
} from './icons'

export type ThemeId =
  | 'spring-bloom'
  | 'summer-radiance'
  | 'autumn-ember'
  | 'winter-quiet'
  | 'neon-dreams'
  | 'soft-focus'
  | 'cosmic-void'
  | 'paper-ink'

export interface ResurfacingTheme {
  id: ThemeId
  name: string
  icon: IconComponent
  description: string

  // Typography
  fonts: {
    display: string // For headers
    body: string    // For content
  }

  // Color palette
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    textSecondary: string
    background: string
  }

  // Gradients
  gradients: {
    background: string      // Section background gradient
    card: string           // Card background gradient
    glow: string           // Hover glow effect
  }

  // Visual effects
  effects: {
    backgroundPattern?: string
    particleColor?: string
    shadowColor?: string
    borderStyle?: string
  }

  // Messaging
  messaging: {
    title: string
    subtitle: string
  }

  // Card reason overrides
  reasonStyles: {
    'Forgotten': {
      icon: IconComponent
      gradient: string
      accentColor: string
    }
    'Seasonal Echo': {
      icon: IconComponent
      gradient: string
      accentColor: string
    }
    'Random Delight': {
      icon: IconComponent
      gradient: string
      accentColor: string
    }
  }
}

export const RESURFACING_THEMES: Record<ThemeId, ResurfacingTheme> = {
  'spring-bloom': {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    icon: Flower2,
    description: 'Cherry blossoms, fresh mint, gentle renewal',

    fonts: {
      display: '"Libre Baskerville", Georgia, serif',
      body: '"Crimson Pro", Georgia, serif',
    },

    colors: {
      primary: '#FF9ECD',
      secondary: '#B4F8C8',
      accent: '#FBE7C6',
      text: '#2D4739',
      textSecondary: '#5B7566',
      background: '#FDFCFB',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFE5F1 0%, #FFF8E7 25%, #E8F9F0 50%, #FFF5EB 75%, #FFE5F1 100%)',
      card: 'linear-gradient(135deg, rgba(255,158,205,0.12) 0%, rgba(180,248,200,0.12) 50%, rgba(251,231,198,0.12) 100%)',
      glow: 'radial-gradient(circle at center, rgba(255,158,205,0.4), rgba(180,248,200,0.3))',
    },

    effects: {
      backgroundPattern: 'radial-gradient(circle at 20% 80%, rgba(255,158,205,0.08) 0%, transparent 50%)',
      particleColor: 'rgba(255,158,205,0.6)',
      shadowColor: 'rgba(255,158,205,0.25)',
      borderStyle: '2px solid rgba(255,158,205,0.3)',
    },

    messaging: {
      title: 'Seeds Returning to Bloom',
      subtitle: 'Ideas awakening from their winter sleep',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Sprout,
        gradient: 'from-emerald-100 via-green-50 to-teal-50',
        accentColor: 'text-emerald-700',
      },
      'Seasonal Echo': {
        icon: Flower2,
        gradient: 'from-pink-100 via-rose-50 to-fuchsia-50',
        accentColor: 'text-pink-700',
      },
      'Random Delight': {
        icon: Sparkles,
        gradient: 'from-violet-100 via-purple-50 to-pink-50',
        accentColor: 'text-violet-700',
      },
    },
  },

  'summer-radiance': {
    id: 'summer-radiance',
    name: 'Summer Radiance',
    icon: Sun,
    description: 'Golden sunshine, coral sunsets, beach warmth',

    fonts: {
      display: '"Fraunces", "Playfair Display", serif',
      body: '"Manrope", system-ui, sans-serif',
    },

    colors: {
      primary: '#FFB800',
      secondary: '#FF6B35',
      accent: '#FED766',
      text: '#2B2D42',
      textSecondary: '#4A4E69',
      background: '#FFFAF0',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFF4DB 0%, #FFE8CC 25%, #FFD4A3 50%, #FFC47E 75%, #FFB967 100%)',
      card: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,107,53,0.15) 100%)',
      glow: 'radial-gradient(circle at center, rgba(255,184,0,0.5), rgba(255,107,53,0.4))',
    },

    effects: {
      backgroundPattern: 'repeating-radial-gradient(circle at 30% 30%, transparent 0%, rgba(255,184,0,0.05) 40%, transparent 80%)',
      particleColor: 'rgba(255,184,0,0.7)',
      shadowColor: 'rgba(255,107,53,0.3)',
      borderStyle: '3px solid rgba(255,184,0,0.4)',
    },

    messaging: {
      title: 'Sun-Kissed Memories',
      subtitle: 'Bright moments returning with warmth',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Flame,
        gradient: 'from-orange-100 via-amber-50 to-yellow-50',
        accentColor: 'text-orange-700',
      },
      'Seasonal Echo': {
        icon: Sun,
        gradient: 'from-yellow-100 via-amber-50 to-orange-50',
        accentColor: 'text-yellow-700',
      },
      'Random Delight': {
        icon: Sparkles,
        gradient: 'from-amber-100 via-yellow-50 to-lime-50',
        accentColor: 'text-amber-700',
      },
    },
  },

  'autumn-ember': {
    id: 'autumn-ember',
    name: 'Autumn Ember',
    icon: Leaf,
    description: 'Terracotta leaves, pumpkin spice, cozy fireside',

    fonts: {
      display: '"Spectral", "Lora", serif',
      body: '"Source Sans 3", system-ui, sans-serif',
    },

    colors: {
      primary: '#D97642',
      secondary: '#8B4513',
      accent: '#E8A87C',
      text: '#3E2723',
      textSecondary: '#5D4037',
      background: '#FFF8F3',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFF0E6 0%, #FFE4D1 25%, #FFD4B8 50%, #FFBC9F 75%, #FFA586 100%)',
      card: 'linear-gradient(135deg, rgba(217,118,66,0.18) 0%, rgba(139,69,19,0.12) 50%, rgba(232,168,124,0.15) 100%)',
      glow: 'radial-gradient(circle at center, rgba(217,118,66,0.45), rgba(139,69,19,0.35))',
    },

    effects: {
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 20 L40 30 L30 40 L20 30 Z\' fill=\'rgba(217,118,66,0.06)\' /%3E%3C/svg%3E")',
      particleColor: 'rgba(217,118,66,0.65)',
      shadowColor: 'rgba(139,69,19,0.28)',
      borderStyle: '2px solid rgba(217,118,66,0.35)',
    },

    messaging: {
      title: 'Harvested Remembrances',
      subtitle: 'Gathering what grew in quieter seasons',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Leaf,
        gradient: 'from-orange-100 via-red-50 to-amber-50',
        accentColor: 'text-orange-800',
      },
      'Seasonal Echo': {
        icon: Leaf,
        gradient: 'from-amber-100 via-orange-50 to-yellow-50',
        accentColor: 'text-amber-800',
      },
      'Random Delight': {
        icon: Sprout,
        gradient: 'from-yellow-100 via-amber-50 to-orange-50',
        accentColor: 'text-yellow-800',
      },
    },
  },

  'winter-quiet': {
    id: 'winter-quiet',
    name: 'Winter Quiet',
    icon: Snowflake,
    description: 'Frosty skies, ice crystals, serene stillness',

    fonts: {
      display: '"EB Garamond", Georgia, serif',
      body: '"Karla", system-ui, sans-serif',
    },

    colors: {
      primary: '#7FB3D5',
      secondary: '#A8DADC',
      accent: '#C9E4EA',
      text: '#1D3557',
      textSecondary: '#457B9D',
      background: '#F8FBFD',
    },

    gradients: {
      background: 'linear-gradient(135deg, #EDF6F9 0%, #E3F4F8 25%, #D4EDF4 50%, #C4E5EF 75%, #B5DEEB 100%)',
      card: 'linear-gradient(135deg, rgba(127,179,213,0.14) 0%, rgba(168,218,220,0.12) 50%, rgba(201,228,234,0.16) 100%)',
      glow: 'radial-gradient(circle at center, rgba(127,179,213,0.38), rgba(168,218,220,0.32))',
    },

    effects: {
      backgroundPattern: 'radial-gradient(circle at 70% 20%, rgba(127,179,213,0.08) 0%, transparent 60%)',
      particleColor: 'rgba(127,179,213,0.55)',
      shadowColor: 'rgba(127,179,213,0.22)',
      borderStyle: '2px solid rgba(127,179,213,0.28)',
    },

    messaging: {
      title: 'Crystallized Stillness',
      subtitle: 'Quiet moments preserved in frost',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Snowflake,
        gradient: 'from-blue-100 via-cyan-50 to-sky-50',
        accentColor: 'text-blue-700',
      },
      'Seasonal Echo': {
        icon: Cloud,
        gradient: 'from-cyan-100 via-blue-50 to-indigo-50',
        accentColor: 'text-cyan-700',
      },
      'Random Delight': {
        icon: Star,
        gradient: 'from-sky-100 via-blue-50 to-cyan-50',
        accentColor: 'text-sky-700',
      },
    },
  },

  'neon-dreams': {
    id: 'neon-dreams',
    name: 'Neon Dreams',
    icon: Rainbow,
    description: 'Electric pink, cyan glow, night city energy',

    fonts: {
      display: '"Outfit", "Lexend", sans-serif',
      body: '"DM Sans", system-ui, sans-serif',
    },

    colors: {
      primary: '#FF006E',
      secondary: '#00F5FF',
      accent: '#FFBE0B',
      text: '#0D0D0D',
      textSecondary: '#3A3A3A',
      background: '#0A0A0A',
    },

    gradients: {
      background: 'linear-gradient(135deg, #120458 0%, #000000 25%, #1A1A2E 50%, #16213E 75%, #0F3460 100%)',
      card: 'linear-gradient(135deg, rgba(255,0,110,0.18) 0%, rgba(0,245,255,0.18) 50%, rgba(255,190,11,0.18) 100%)',
      glow: 'radial-gradient(circle at center, rgba(255,0,110,0.6), rgba(0,245,255,0.5))',
    },

    effects: {
      backgroundPattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,110,0.03) 10px, rgba(255,0,110,0.03) 20px)',
      particleColor: 'rgba(255,0,110,0.85)',
      shadowColor: 'rgba(255,0,110,0.5)',
      borderStyle: '3px solid rgba(255,0,110,0.6)',
    },

    messaging: {
      title: 'Electric Resurrections',
      subtitle: 'Amplified memories pulse back to life',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Zap,
        gradient: 'from-fuchsia-900 via-purple-800 to-pink-900',
        accentColor: 'text-fuchsia-400',
      },
      'Seasonal Echo': {
        icon: Rainbow,
        gradient: 'from-cyan-900 via-blue-800 to-purple-900',
        accentColor: 'text-cyan-400',
      },
      'Random Delight': {
        icon: Sparkles,
        gradient: 'from-yellow-900 via-orange-800 to-red-900',
        accentColor: 'text-yellow-400',
      },
    },
  },

  'soft-focus': {
    id: 'soft-focus',
    name: 'Soft Focus',
    icon: Moon,
    description: 'Gentle warmth, cozy softness, dreamy comfort',

    fonts: {
      display: '"Abhaya Libre", Georgia, serif',
      body: '"Nunito Sans", system-ui, sans-serif',
    },

    colors: {
      primary: '#E8C4C4',
      secondary: '#D4B5B0',
      accent: '#F4E4D7',
      text: '#4A4238',
      textSecondary: '#6B625A',
      background: '#FAF7F5',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0E8 25%, #FFE8DC 50%, #FFE0D1 75%, #FFD8C5 100%)',
      card: 'linear-gradient(135deg, rgba(232,196,196,0.2) 0%, rgba(212,181,176,0.15) 50%, rgba(244,228,215,0.18) 100%)',
      glow: 'radial-gradient(circle at center, rgba(232,196,196,0.35), rgba(212,181,176,0.28))',
    },

    effects: {
      backgroundPattern: 'radial-gradient(ellipse at 50% 50%, rgba(232,196,196,0.06) 0%, transparent 70%)',
      particleColor: 'rgba(232,196,196,0.5)',
      shadowColor: 'rgba(212,181,176,0.2)',
      borderStyle: '2px solid rgba(232,196,196,0.25)',
    },

    messaging: {
      title: 'Tender Recollections',
      subtitle: 'Memories wrapped in warmth and care',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Moon,
        gradient: 'from-rose-100 via-pink-50 to-orange-50',
        accentColor: 'text-rose-700',
      },
      'Seasonal Echo': {
        icon: Dove,
        gradient: 'from-orange-100 via-amber-50 to-yellow-50',
        accentColor: 'text-orange-700',
      },
      'Random Delight': {
        icon: Cloud,
        gradient: 'from-amber-100 via-yellow-50 to-orange-50',
        accentColor: 'text-amber-700',
      },
    },
  },

  'cosmic-void': {
    id: 'cosmic-void',
    name: 'Cosmic Void',
    icon: Sparkles,
    description: 'Purple nebulas, cyan starlight, deep space mystery',

    fonts: {
      display: '"Bebas Neue", "Teko", sans-serif',
      body: '"Barlow", system-ui, sans-serif',
    },

    colors: {
      primary: '#B794F6',
      secondary: '#4FD1C5',
      accent: '#F687B3',
      text: '#E2E8F0',
      textSecondary: '#A0AEC0',
      background: '#0F0F23',
    },

    gradients: {
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 25%, #0F0F23 50%, #16213E 75%, #0A0E27 100%)',
      card: 'linear-gradient(135deg, rgba(183,148,246,0.15) 0%, rgba(79,209,197,0.12) 50%, rgba(246,135,179,0.13) 100%)',
      glow: 'radial-gradient(circle at center, rgba(183,148,246,0.4), rgba(79,209,197,0.35))',
    },

    effects: {
      backgroundPattern: 'radial-gradient(circle at 20% 80%, rgba(183,148,246,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(79,209,197,0.08) 0%, transparent 50%)',
      particleColor: 'rgba(183,148,246,0.75)',
      shadowColor: 'rgba(183,148,246,0.35)',
      borderStyle: '2px solid rgba(183,148,246,0.4)',
    },

    messaging: {
      title: 'Constellation of Forgotten Stars',
      subtitle: 'Lost fragments drifting back from the cosmos',
    },

    reasonStyles: {
      'Forgotten': {
        icon: Star,
        gradient: 'from-purple-900 via-indigo-800 to-blue-900',
        accentColor: 'text-purple-300',
      },
      'Seasonal Echo': {
        icon: Sparkles,
        gradient: 'from-indigo-900 via-purple-800 to-pink-900',
        accentColor: 'text-indigo-300',
      },
      'Random Delight': {
        icon: Sparkles,
        gradient: 'from-blue-900 via-cyan-800 to-teal-900',
        accentColor: 'text-blue-300',
      },
    },
  },

  'paper-ink': {
    id: 'paper-ink',
    name: 'Paper & Ink',
    icon: Scroll,
    description: 'Editorial refinement, timeless minimalism, focused clarity',

    fonts: {
      display: '"Merriweather", Georgia, serif',
      body: '"IBM Plex Sans", system-ui, sans-serif',
    },

    colors: {
      primary: '#2C2C2C',
      secondary: '#4F4F4F',
      accent: '#8C8C8C',
      text: '#1A1A1A',
      textSecondary: '#5C5C5C',
      background: '#FEFEFE',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 25%, #F0F0F0 50%, #F5F5F5 75%, #FAFAFA 100%)',
      card: 'linear-gradient(135deg, rgba(44,44,44,0.03) 0%, rgba(79,79,79,0.02) 50%, rgba(140,140,140,0.04) 100%)',
      glow: 'radial-gradient(circle at center, rgba(44,44,44,0.12), rgba(79,79,79,0.08))',
    },

    effects: {
      backgroundPattern: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(44,44,44,0.01) 50px, rgba(44,44,44,0.01) 52px)',
      particleColor: 'rgba(44,44,44,0.25)',
      shadowColor: 'rgba(44,44,44,0.15)',
      borderStyle: '1px solid rgba(44,44,44,0.15)',
    },

    messaging: {
      title: 'Archive Reawakening',
      subtitle: 'Timeless documents returning to the surface',
    },

    reasonStyles: {
      'Forgotten': {
        icon: FileText,
        gradient: 'from-gray-100 via-slate-50 to-zinc-50',
        accentColor: 'text-gray-700',
      },
      'Seasonal Echo': {
        icon: Scroll,
        gradient: 'from-slate-100 via-gray-50 to-stone-50',
        accentColor: 'text-slate-700',
      },
      'Random Delight': {
        icon: FileText,
        gradient: 'from-zinc-100 via-neutral-50 to-gray-50',
        accentColor: 'text-zinc-700',
      },
    },
  },
}

// Helper function to get theme by ID
export function getTheme(themeId: ThemeId): ResurfacingTheme {
  return RESURFACING_THEMES[themeId]
}

// Helper to get all theme IDs
export function getAllThemeIds(): ThemeId[] {
  return Object.keys(RESURFACING_THEMES) as ThemeId[]
}

// Helper to get theme list for UI selection
export function getThemeList(): Array<{ id: ThemeId; name: string; icon: IconComponent; description: string }> {
  return getAllThemeIds().map(id => {
    const theme = RESURFACING_THEMES[id]
    return {
      id: theme.id,
      name: theme.name,
      icon: theme.icon,
      description: theme.description,
    }
  })
}
