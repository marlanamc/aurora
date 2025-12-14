/**
 * Aurora OS - Global Theme System
 *
 * Comprehensive theming for the entire application
 * Extends resurfacing themes to all components
 */

import { type ThemeId, RESURFACING_THEMES } from './resurfacing-themes'
import { type IconComponent, Flower2, Sun, Leaf, Snowflake, Rainbow, Moon, Sparkles, Scroll } from './icons'

export type ThemeMode = 'light' | 'dark'

export interface GlobalTheme {
  id: ThemeId
  name: string
  icon: IconComponent

  // Typography
  fonts: {
    display: string
    body: string
    mono: string
  }

  // Core colors
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    textSecondary: string
    background: string
    surface: string
    surfaceHover: string
    border: string
    success: string
    warning: string
    error: string
    info: string
  }

  // Gradients
  gradients: {
    background: string
    hero: string
    card: string
    button: string
    glow: string
  }

  // Effects
  effects: {
    blur: string
    shadow: string
    shadowHover: string
    borderRadius: string
    backgroundPattern?: string
    particleColor?: string
  }

  // Component-specific styles
  components: {
    header: {
      background: string
      borderColor: string
    }
    sidebar: {
      background: string
      borderColor: string
    }
    card: {
      background: string
      border: string
      hover: string
    }
  }
}

export const GLOBAL_THEMES: Record<ThemeId, GlobalTheme> = {
  'spring-bloom': {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    icon: Flower2,

    fonts: {
      display: 'var(--font-libre-baskerville), Georgia, serif',
      body: 'var(--font-crimson-pro), Georgia, serif',
      mono: '"JetBrains Mono", monospace',
    },

    colors: {
      primary: '#FF9ECD', // Brighter pink - cherry blossom
      secondary: '#B4F8C8', // Fresh mint green - new growth
      accent: '#FBE7C6', // Soft peach - spring warmth
      text: '#2D4739', // Deep forest green - grounded
      textSecondary: '#5B7566', // Muted sage
      background: '#FFFBF8', // Warmer, creamier white
      surface: '#FFFFFF',
      surfaceHover: '#FFF9F5',
      border: 'rgba(255, 158, 205, 0.25)',
      success: '#B4F8C8',
      warning: '#FBE7C6',
      error: '#FF9ECD',
      info: '#B8CADA',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFFBF8 0%, #FFF0F5 25%, #F0FFF4 50%, #FFF8E7 75%, #FFFBF8 100%)',
      hero: 'linear-gradient(to right, rgba(255, 158, 205, 0.18), rgba(180, 248, 200, 0.18))',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,250,248,0.9))',
      button: 'linear-gradient(135deg, #FF9ECD, #FFB8DD)',
      glow: 'radial-gradient(circle, rgba(255, 158, 205, 0.35), rgba(180, 248, 200, 0.25))',
    },

    effects: {
      blur: 'blur(16px)',
      shadow: '0 4px 20px rgba(74, 59, 50, 0.08)',
      shadowHover: '0 8px 30px rgba(74, 59, 50, 0.12)',
      borderRadius: '20px',
      backgroundPattern: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"), radial-gradient(circle at 80% 20%, rgba(212, 127, 166, 0.1) 0%, transparent 40%)`,
      particleColor: 'rgba(212, 127, 166, 0.4)',
    },

    components: {
      header: {
        background: 'rgba(249, 245, 241, 0.85)',
        borderColor: 'rgba(212, 127, 166, 0.15)',
      },
      sidebar: {
        background: 'rgba(249, 245, 241, 0.9)',
        borderColor: 'rgba(212, 127, 166, 0.15)',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(212, 127, 166, 0.2)',
        hover: 'rgba(255, 252, 250, 1)',
      },
    },
  },

  'summer-radiance': {
    id: 'summer-radiance',
    name: 'Summer Radiance',
    icon: Sun,

    fonts: {
      display: 'var(--font-fraunces), "Playfair Display", serif',
      body: 'var(--font-manrope), system-ui, sans-serif',
      mono: '"Fira Code", monospace',
    },

    colors: {
      primary: '#FFB800', // Bright golden yellow - sunshine
      secondary: '#FF6B35', // Vibrant coral - sunset
      accent: '#FED766', // Warm yellow - beach sand
      text: '#2B2D42', // Deep navy - ocean depth
      textSecondary: '#4A4E69', // Muted navy
      background: '#FFFAF0', // Warm cream - sand
      surface: '#FFFFFF',
      surfaceHover: '#FFF7ED',
      border: 'rgba(255, 184, 0, 0.3)',
      success: '#FED766',
      warning: '#FF6B35',
      error: '#EF4444',
      info: '#3B82F6',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFFAF0 0%, #FFF4DB 25%, #FFE8CC 50%, #FFD4A3 75%, #FFC47E 100%)',
      hero: 'linear-gradient(to right, rgba(255, 184, 0, 0.15), rgba(255, 107, 53, 0.15))',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,251,235,0.9))',
      button: 'linear-gradient(135deg, #FFB800, #FFC933)',
      glow: 'radial-gradient(circle, rgba(255, 184, 0, 0.4), rgba(255, 107, 53, 0.3))',
    },

    effects: {
      blur: 'blur(12px)',
      shadow: '0 4px 16px rgba(67, 20, 7, 0.08)',
      shadowHover: '0 8px 24px rgba(67, 20, 7, 0.12)',
      borderRadius: '24px',
      backgroundPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      particleColor: 'rgba(217, 119, 6, 0.5)',
    },

    components: {
      header: {
        background: 'rgba(255, 251, 235, 0.9)',
        borderColor: 'rgba(217, 119, 6, 0.15)',
      },
      sidebar: {
        background: 'rgba(255, 251, 235, 0.95)',
        borderColor: 'rgba(217, 119, 6, 0.15)',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        hover: 'rgba(255, 253, 245, 1)',
      },
    },
  },

  'autumn-ember': {
    id: 'autumn-ember',
    name: 'Autumn Ember',
    icon: Leaf,

    fonts: {
      display: 'var(--font-spectral), "Lora", serif',
      body: 'var(--font-source-sans-3), system-ui, sans-serif',
      mono: '"Inconsolata", monospace',
    },

    colors: {
      primary: '#D97642', // Rich terracotta - autumn leaves
      secondary: '#8B4513', // Deep sienna - tree bark
      accent: '#E8A87C', // Warm peach - pumpkin
      text: '#3E2723', // Deep brown - earth
      textSecondary: '#5D4037', // Muted brown
      background: '#FFF8F3', // Warm cream - cozy
      surface: '#FFFFFF',
      surfaceHover: '#FFF5ED',
      border: 'rgba(217, 118, 66, 0.25)',
      success: '#8B7355',
      warning: '#E8A87C',
      error: '#C85A54',
      info: '#7B9FA3',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFF8F3 0%, #FFE4D1 25%, #FFD4B8 50%, #FFBC9F 75%, #FFA586 100%)',
      hero: 'linear-gradient(to right, rgba(217, 118, 66, 0.18), rgba(139, 69, 19, 0.12))',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,248,243,0.9))',
      button: 'linear-gradient(135deg, #D97642, #E89055)',
      glow: 'radial-gradient(circle, rgba(217, 118, 66, 0.35), rgba(139, 69, 19, 0.25))',
    },

    effects: {
      blur: 'blur(8px)',
      shadow: '0 4px 12px rgba(67, 20, 7, 0.08)',
      shadowHover: '0 8px 20px rgba(67, 20, 7, 0.14)',
      borderRadius: '12px',
      backgroundPattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C4221' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
      particleColor: 'rgba(156, 66, 33, 0.4)',
    },

    components: {
      header: {
        background: 'rgba(250, 250, 249, 0.9)',
        borderColor: 'rgba(156, 66, 33, 0.15)',
      },
      sidebar: {
        background: 'rgba(250, 250, 249, 0.95)',
        borderColor: 'rgba(156, 66, 33, 0.15)',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(156, 66, 33, 0.15)',
        hover: 'rgba(252, 252, 250, 1)',
      },
    },
  },

  'winter-quiet': {
    id: 'winter-quiet',
    name: 'Winter Quiet',
    icon: Snowflake,

    fonts: {
      display: 'var(--font-eb-garamond), Georgia, serif',
      body: 'var(--font-karla), system-ui, sans-serif',
      mono: '"Source Code Pro", monospace',
    },

    colors: {
      primary: '#7FB3D5', // Soft sky blue - winter sky
      secondary: '#A8DADC', // Pale turquoise - ice
      accent: '#C9E4EA', // Light blue - frost
      text: '#1D3557', // Deep navy - midnight
      textSecondary: '#457B9D', // Muted blue
      background: '#F8FBFD', // Cool white - snow
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      border: 'rgba(127, 179, 213, 0.25)',
      success: '#A8DADC',
      warning: '#CBD5E1',
      error: '#E63946',
      info: '#7FB3D5',
    },

    gradients: {
      background: 'linear-gradient(135deg, #F8FBFD 0%, #EDF6F9 25%, #E3F4F8 50%, #D4EDF4 75%, #C4E5EF 100%)',
      hero: 'linear-gradient(to right, rgba(127, 179, 213, 0.18), rgba(168, 218, 220, 0.18))',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,251,253,0.9))',
      button: 'linear-gradient(135deg, #7FB3D5, #95C4E0)',
      glow: 'radial-gradient(circle, rgba(127, 179, 213, 0.3), rgba(168, 218, 220, 0.25))',
    },

    effects: {
      blur: 'blur(20px)',
      shadow: '0 4px 20px rgba(100, 116, 139, 0.08)',
      shadowHover: '0 8px 30px rgba(100, 116, 139, 0.15)',
      borderRadius: '16px',
      backgroundPattern: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
      particleColor: 'rgba(148, 163, 184, 0.5)',
    },

    components: {
      header: {
        background: 'rgba(248, 249, 250, 0.8)',
        borderColor: 'rgba(100, 116, 139, 0.15)',
      },
      sidebar: {
        background: 'rgba(248, 249, 250, 0.9)',
        borderColor: 'rgba(100, 116, 139, 0.15)',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(100, 116, 139, 0.15)',
        hover: 'rgba(241, 245, 249, 0.95)',
      },
    },
  },

  'neon-dreams': {
    id: 'neon-dreams',
    name: 'Neon Dreams',
    icon: Rainbow,

    fonts: {
      display: 'var(--font-outfit), "Lexend", sans-serif',
      body: 'var(--font-dm-sans), system-ui, sans-serif',
      mono: '"Space Mono", monospace',
    },

    colors: {
      primary: '#FF006E', // Hot pink - neon sign
      secondary: '#00F5FF', // Electric cyan - neon glow
      accent: '#FFBE0B', // Bright yellow - neon highlight
      text: '#0D0D0D', // Deep black - night
      textSecondary: '#3A3A3A', // Dark gray
      background: '#0A0A0A', // Deep black - dark mode feel even in light
      surface: '#1A1A1A', // Dark gray
      surfaceHover: '#252525', // Lighter gray
      border: 'rgba(255, 0, 110, 0.4)',
      success: '#00F5FF',
      warning: '#FFBE0B',
      error: '#FF006E',
      info: '#8B5CF6',
    },

    gradients: {
      background: 'linear-gradient(135deg, #120458 0%, #000000 25%, #1A1A2E 50%, #16213E 75%, #0F3460 100%)',
      hero: 'linear-gradient(to right, rgba(255, 0, 110, 0.25), rgba(0, 245, 255, 0.25))',
      card: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(37,37,37,0.95))',
      button: 'linear-gradient(135deg, #FF006E, #FF4E9A)',
      glow: 'radial-gradient(circle, rgba(255, 0, 110, 0.5), rgba(0, 245, 255, 0.4))',
    },

    effects: {
      blur: 'blur(30px)',
      shadow: '0 0 30px rgba(255, 0, 110, 0.4)',
      shadowHover: '0 0 50px rgba(255, 0, 110, 0.6)',
      borderRadius: '12px',
      backgroundPattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 0, 110, 0.03) 10px, rgba(255, 0, 110, 0.03) 20px)',
      particleColor: 'rgba(255, 0, 110, 0.85)',
    },

    components: {
      header: {
        background: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(244, 63, 94, 0.2)',
      },
      sidebar: {
        background: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(244, 63, 94, 0.2)',
      },
      card: {
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(244, 63, 94, 0.2)',
        hover: 'rgba(255, 255, 255, 1)',
      },
    },
  },

  'soft-focus': {
    id: 'soft-focus',
    name: 'Soft Focus',
    icon: Moon,

    fonts: {
      display: 'var(--font-abhaya-libre), Georgia, serif',
      body: 'var(--font-nunito-sans), system-ui, sans-serif',
      mono: '"Overpass Mono", monospace',
    },

    colors: {
      primary: '#E8C4C4',
      secondary: '#D4B5B0',
      accent: '#F4E4D7',
      text: '#4A403A',
      textSecondary: '#6B625A',
      background: '#FAF7F5',
      surface: '#FFFFFF',
      surfaceHover: '#FFF9F5',
      border: 'rgba(188, 143, 143, 0.2)',
      success: '#D4B5B0',
      warning: '#F4E4D7',
      error: '#D8A7A7',
      info: '#C0C0C0',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFF9F5 0%, #FFF0E8 25%, #FFE8DC 50%, #FFE0D1 75%, #FFD8C5 100%)',
      hero: 'linear-gradient(to right, rgba(232,196,196,0.2), rgba(212,181,176,0.15))',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,249,245,0.9))',
      button: 'linear-gradient(135deg, #E8C4C4, #F0CFCF)',
      glow: 'radial-gradient(circle, rgba(232,196,196,0.35), rgba(212,181,176,0.28))',
    },

    effects: {
      blur: 'blur(25px)',
      shadow: '0 4px 20px rgba(212,181,176,0.12)',
      shadowHover: '0 8px 30px rgba(212,181,176,0.2)',
      borderRadius: '24px',
      backgroundPattern: 'radial-gradient(ellipse at 50% 50%, rgba(232,196,196,0.06) 0%, transparent 70%)',
      particleColor: 'rgba(232,196,196,0.5)',
    },

    components: {
      header: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,249,245,0.7))',
        borderColor: 'rgba(232,196,196,0.2)',
      },
      sidebar: {
        background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,249,245,0.6))',
        borderColor: 'rgba(232,196,196,0.2)',
      },
      card: {
        background: 'rgba(255,255,255,0.85)',
        border: '2px solid rgba(232,196,196,0.2)',
        hover: 'rgba(255,249,245,0.95)',
      },
    },
  },

  'cosmic-void': {
    id: 'cosmic-void',
    name: 'Cosmic Void',
    icon: Sparkles,

    fonts: {
      display: 'var(--font-bebas-neue), "Teko", sans-serif',
      body: 'var(--font-barlow), system-ui, sans-serif',
      mono: '"Roboto Mono", monospace',
    },

    colors: {
      primary: '#B794F6', // Purple nebula
      secondary: '#4FD1C5', // Cyan starlight
      accent: '#F687B3', // Pink cosmic dust
      text: '#E2E8F0', // Light gray - stars
      textSecondary: '#A0AEC0', // Muted gray
      background: '#0F0F23', // Deep space black
      surface: '#1A1A2E', // Dark space gray
      surfaceHover: '#24243A', // Lighter space
      border: 'rgba(183,148,246,0.4)',
      success: '#4FD1C5',
      warning: '#F6AD55',
      error: '#F687B3',
      info: '#B794F6',
    },

    gradients: {
      background: [
        'radial-gradient(circle at 16% 22%, rgba(183,148,246,0.25) 0%, transparent 56%)',
        'radial-gradient(circle at 78% 66%, rgba(79,209,197,0.20) 0%, transparent 58%)',
        'radial-gradient(circle at 55% 12%, rgba(246,135,179,0.15) 0%, transparent 50%)',
        'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #0F0F23 100%)',
      ].join(', '),
      hero: 'linear-gradient(to right, rgba(183,148,246,0.25), rgba(79,209,197,0.20))',
      card: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(36,36,58,0.95))',
      button: 'linear-gradient(135deg, #B794F6, #C8ABFF)',
      glow: 'radial-gradient(circle, rgba(183,148,246,0.4), rgba(79,209,197,0.35))',
    },

    effects: {
      blur: 'blur(28px)',
      shadow: '0 0 30px rgba(183,148,246,0.3)',
      shadowHover: '0 0 50px rgba(183,148,246,0.45)',
      borderRadius: '16px',
      backgroundPattern:
        'radial-gradient(circle at 20% 80%, rgba(183,148,246,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(79,209,197,0.08) 0%, transparent 50%)',
      particleColor: 'rgba(183,148,246,0.75)',
    },

    components: {
      header: {
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(36,36,58,0.9))',
        borderColor: 'rgba(183,148,246,0.3)',
      },
      sidebar: {
        background: 'linear-gradient(180deg, rgba(26,26,46,0.95), rgba(15,15,35,0.95))',
        borderColor: 'rgba(183,148,246,0.3)',
      },
      card: {
        background: 'rgba(26,26,46,0.9)',
        border: '2px solid rgba(183,148,246,0.3)',
        hover: 'rgba(36,36,58,0.95)',
      },
    },
  },

  'paper-ink': {
    id: 'paper-ink',
    name: 'Paper & Ink',
    icon: Scroll,

    fonts: {
      display: 'var(--font-merriweather), Georgia, serif',
      body: 'var(--font-ibm-plex-sans), system-ui, sans-serif',
      mono: '"IBM Plex Mono", monospace',
    },

    colors: {
      primary: '#2C2C2C',
      secondary: '#4F4F4F',
      accent: '#8C8C8C',
      text: '#1A1A1A',
      textSecondary: '#5C5C5C',
      background: '#FEFEFE',
      surface: '#FDFBF7',
      surfaceHover: '#FFFFFF',
      border: 'rgba(44,44,44,0.15)',
      success: '#4F4F4F',
      warning: '#8C8C8C',
      error: '#2C2C2C',
      info: '#5C5C5C',
    },

    gradients: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 25%, #F0F0F0 50%, #F5F5F5 75%, #FAFAFA 100%)',
      hero: 'linear-gradient(to right, rgba(44,44,44,0.05), rgba(79,79,79,0.05))',
      card: 'linear-gradient(135deg, rgba(255,255,255,1), rgba(248,248,248,1))',
      button: 'linear-gradient(135deg, #2C2C2C, #3A3A3A)',
      glow: 'radial-gradient(circle, rgba(44,44,44,0.12), rgba(79,79,79,0.08))',
    },

    effects: {
      blur: 'blur(12px)',
      shadow: '0 2px 16px rgba(44,44,44,0.1)',
      shadowHover: '0 4px 24px rgba(44,44,44,0.15)',
      borderRadius: '8px',
      backgroundPattern: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(44,44,44,0.01) 50px, rgba(44,44,44,0.01) 52px)',
      particleColor: 'rgba(44,44,44,0.25)',
    },

    components: {
      header: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,248,248,0.95))',
        borderColor: 'rgba(44,44,44,0.1)',
      },
      sidebar: {
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,248,248,0.9))',
        borderColor: 'rgba(44,44,44,0.1)',
      },
      card: {
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(44,44,44,0.12)',
        hover: 'rgba(248,248,248,1)',
      },
    },
  },
}

// Hand-crafted dark themes for superior contrast and vibe
const DARK_THEME_OVERRIDES: Record<ThemeId, Partial<GlobalTheme>> = {
  'spring-bloom': {
    colors: {
      primary: '#FF9ECD',
      secondary: '#B4F8C8',
      accent: '#FBE7C6',
      text: '#E8F5E9',
      textSecondary: '#A5D6A7',
      background: '#051A10', // Deep forest green
      surface: '#0A2618',
      surfaceHover: '#0F3322',
      border: 'rgba(180, 248, 200, 0.2)',
      success: '#B4F8C8',
      warning: '#FBE7C6',
      error: '#FF9ECD',
      info: '#C8E6F5',
    },
    gradients: {
      background: 'linear-gradient(135deg, #051A10 0%, #072215 50%, #051A10 100%)',
      hero: 'linear-gradient(to right, rgba(255,158,205,0.15), rgba(180,248,200,0.15))',
      card: 'linear-gradient(135deg, rgba(10,38,24,0.9), rgba(15,51,34,0.9))',
      button: 'linear-gradient(135deg, #FF9ECD, #FFB8DD)',
      glow: 'radial-gradient(circle, rgba(255,158,205,0.2), rgba(180,248,200,0.15))',
    },
    effects: {
      blur: 'blur(20px)',
      shadow: '0 8px 32px rgba(0,0,0,0.4)',
      shadowHover: '0 12px 40px rgba(0,0,0,0.5)',
      borderRadius: '16px',
      backgroundPattern: 'radial-gradient(circle at 20% 80%, rgba(180, 248, 200, 0.05) 0%, transparent 50%)',
      particleColor: 'rgba(180, 248, 200, 0.4)',
    },
    components: {
      header: {
        background: 'rgba(5, 26, 16, 0.8)',
        borderColor: 'rgba(180, 248, 200, 0.15)',
      },
      sidebar: {
        background: 'rgba(5, 26, 16, 0.9)',
        borderColor: 'rgba(180, 248, 200, 0.15)',
      },
      card: {
        background: 'rgba(10, 38, 24, 0.8)',
        border: '1px solid rgba(180, 248, 200, 0.15)',
        hover: 'rgba(15, 51, 34, 0.9)',
      },
    },
  },

  'summer-radiance': {
    colors: {
      primary: '#FFB800',
      secondary: '#FF6B35',
      accent: '#FED766',
      text: '#FFF5E6',
      textSecondary: '#FFD8B3',
      background: '#1A0500', // Deep sunset
      surface: '#2D0F05',
      surfaceHover: '#3A1508',
      border: 'rgba(255, 184, 0, 0.2)',
      success: '#FED766',
      warning: '#FF6B35',
      error: '#FF4E4E',
      info: '#00B4D8',
    },
    gradients: {
      background: 'linear-gradient(135deg, #1A0500 0%, #260A02 50%, #1A0500 100%)',
      hero: 'linear-gradient(to right, rgba(255,184,0,0.15), rgba(255,107,53,0.15))',
      card: 'linear-gradient(135deg, rgba(45,15,5,0.9), rgba(58,21,8,0.9))',
      button: 'linear-gradient(135deg, #FFB800, #FFC933)',
      glow: 'radial-gradient(circle, rgba(255,184,0,0.2), rgba(255,107,53,0.15))',
    },
    effects: {
      blur: 'blur(24px)',
      shadow: '0 8px 32px rgba(0,0,0,0.5)',
      shadowHover: '0 12px 40px rgba(0,0,0,0.6)',
      borderRadius: '20px',
      backgroundPattern: 'repeating-radial-gradient(circle at 30% 30%, transparent 0%, rgba(255,184,0,0.03) 40%, transparent 80%)',
      particleColor: 'rgba(255,184,0,0.4)',
    },
    components: {
      header: {
        background: 'rgba(26, 5, 0, 0.8)',
        borderColor: 'rgba(255, 184, 0, 0.15)',
      },
      sidebar: {
        background: 'rgba(26, 5, 0, 0.9)',
        borderColor: 'rgba(255, 184, 0, 0.15)',
      },
      card: {
        background: 'rgba(45, 15, 5, 0.8)',
        border: '1px solid rgba(255, 184, 0, 0.15)',
        hover: 'rgba(58, 21, 8, 0.9)',
      },
    },
  },

  'autumn-ember': {
    colors: {
      primary: '#D97642',
      secondary: '#8B4513',
      accent: '#E8A87C',
      text: '#F5E6D3',
      textSecondary: '#D4C4B0',
      background: '#120805', // Deep charcoal wood
      surface: '#1E100A',
      surfaceHover: '#291610',
      border: 'rgba(217, 118, 66, 0.2)',
      success: '#8B7355',
      warning: '#E8A87C',
      error: '#C85A54',
      info: '#7B9FA3',
    },
    gradients: {
      background: 'linear-gradient(135deg, #120805 0%, #1A0D08 50%, #120805 100%)',
      hero: 'linear-gradient(to right, rgba(217,118,66,0.15), rgba(139,69,19,0.1))',
      card: 'linear-gradient(135deg, rgba(30,16,10,0.9), rgba(41,22,16,0.9))',
      button: 'linear-gradient(135deg, #D97642, #E89055)',
      glow: 'radial-gradient(circle, rgba(217,118,66,0.25), rgba(139,69,19,0.2))',
    },
    effects: {
      blur: 'blur(22px)',
      shadow: '0 8px 32px rgba(0,0,0,0.5)',
      shadowHover: '0 12px 40px rgba(0,0,0,0.6)',
      borderRadius: '18px',
      backgroundPattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 20 L40 30 L30 40 L20 30 Z\' fill=\'rgba(217,118,66,0.04)\' /%3E%3C/svg%3E")',
      particleColor: 'rgba(217,118,66,0.4)',
    },
    components: {
      header: {
        background: 'rgba(18, 8, 5, 0.8)',
        borderColor: 'rgba(217, 118, 66, 0.15)',
      },
      sidebar: {
        background: 'rgba(18, 8, 5, 0.9)',
        borderColor: 'rgba(217, 118, 66, 0.15)',
      },
      card: {
        background: 'rgba(30, 16, 10, 0.8)',
        border: '1px solid rgba(217, 118, 66, 0.15)',
        hover: 'rgba(41, 22, 16, 0.9)',
      },
    },
  },

  'winter-quiet': {
    colors: {
      primary: '#7FB3D5',
      secondary: '#A8DADC',
      accent: '#C9E4EA',
      text: '#F0F8FF',
      textSecondary: '#B0C4DE',
      background: '#050A14', // Deep midnight
      surface: '#0F172A',
      surfaceHover: '#1E293B',
      border: 'rgba(127, 179, 213, 0.2)',
      success: '#A8DADC',
      warning: '#F1FAEE',
      error: '#E63946',
      info: '#7FB3D5',
    },
    gradients: {
      background: 'linear-gradient(135deg, #050A14 0%, #0A1120 50%, #050A14 100%)',
      hero: 'linear-gradient(to right, rgba(127,179,213,0.15), rgba(168,218,220,0.15))',
      card: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))',
      button: 'linear-gradient(135deg, #7FB3D5, #95C4E0)',
      glow: 'radial-gradient(circle, rgba(127,179,213,0.25), rgba(168,218,220,0.2))',
    },
    effects: {
      blur: 'blur(18px)',
      shadow: '0 8px 32px rgba(0,0,0,0.5)',
      shadowHover: '0 12px 40px rgba(0,0,0,0.6)',
      borderRadius: '14px',
      backgroundPattern: 'radial-gradient(circle at 70% 20%, rgba(127,179,213,0.05) 0%, transparent 60%)',
      particleColor: 'rgba(127,179,213,0.4)',
    },
    components: {
      header: {
        background: 'rgba(5, 10, 20, 0.8)',
        borderColor: 'rgba(127, 179, 213, 0.15)',
      },
      sidebar: {
        background: 'rgba(5, 10, 20, 0.9)',
        borderColor: 'rgba(127, 179, 213, 0.15)',
      },
      card: {
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(127, 179, 213, 0.15)',
        hover: 'rgba(30, 41, 59, 0.9)',
      },
    },
  },

  // Neon Dreams: vibrant, high-contrast dark mode
  'neon-dreams': {
    colors: {
      primary: '#FF006E',
      secondary: '#00F5FF',
      accent: '#FFBE0B',
      text: '#F0F0F0',
      textSecondary: '#B0B0B0',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      surfaceHover: '#252525',
      border: 'rgba(255,0,110,0.5)',
      success: '#00F5FF',
      warning: '#FFBE0B',
      error: '#FF006E',
      info: '#8B5CF6',
    },
    gradients: {
      background: 'linear-gradient(135deg, #120458 0%, #000000 25%, #1A1A2E 50%, #16213E 75%, #0F3460 100%)',
      hero: 'linear-gradient(to right, rgba(255,0,110,0.3), rgba(0,245,255,0.3))',
      card: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(37,37,37,0.95))',
      button: 'linear-gradient(135deg, #FF006E, #FF4E9A)',
      glow: 'radial-gradient(circle, rgba(255,0,110,0.6), rgba(0,245,255,0.5))',
    },
    effects: {
      blur: 'blur(30px)',
      shadow: '0 0 30px rgba(255,0,110,0.4)',
      shadowHover: '0 0 50px rgba(255,0,110,0.6)',
      borderRadius: '12px',
      backgroundPattern:
        'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,110,0.03) 10px, rgba(255,0,110,0.03) 20px)',
      particleColor: 'rgba(255,0,110,0.85)',
    },
    components: {
      header: {
        background: 'linear-gradient(135deg, rgba(26,26,26,0.9), rgba(37,37,37,0.9))',
        borderColor: 'rgba(255,0,110,0.4)',
      },
      sidebar: {
        background: 'linear-gradient(180deg, rgba(26,26,26,0.95), rgba(16,16,16,0.95))',
        borderColor: 'rgba(255,0,110,0.4)',
      },
      card: {
        background: 'rgba(26,26,26,0.9)',
        border: '2px solid rgba(255,0,110,0.4)',
        hover: 'rgba(37,37,37,0.95)',
      },
    },
  },

  'soft-focus': {
    colors: {
      primary: '#E8C4C4',
      secondary: '#D4B5B0',
      accent: '#F4E4D7',
      text: '#F5E6E6',
      textSecondary: '#D4B5B5',
      background: '#1A1518', // Deep mauve/black
      surface: '#261F22',
      surfaceHover: '#33292D',
      border: 'rgba(232, 196, 196, 0.2)',
      success: '#D4B5B0',
      warning: '#F4E4D7',
      error: '#D8A7A7',
      info: '#C8D3D9',
    },
    gradients: {
      background: 'linear-gradient(135deg, #1A1518 0%, #241D21 50%, #1A1518 100%)',
      hero: 'linear-gradient(to right, rgba(232,196,196,0.15), rgba(212,181,176,0.12))',
      card: 'linear-gradient(135deg, rgba(38,31,34,0.9), rgba(51,41,45,0.9))',
      button: 'linear-gradient(135deg, #E8C4C4, #F0CFCF)',
      glow: 'radial-gradient(circle, rgba(232,196,196,0.2), rgba(212,181,176,0.15))',
    },
    effects: {
      blur: 'blur(25px)',
      shadow: '0 8px 32px rgba(0,0,0,0.5)',
      shadowHover: '0 12px 40px rgba(0,0,0,0.6)',
      borderRadius: '24px',
      backgroundPattern: 'radial-gradient(ellipse at 50% 50%, rgba(232,196,196,0.03) 0%, transparent 70%)',
      particleColor: 'rgba(232,196,196,0.3)',
    },
    components: {
      header: {
        background: 'rgba(26, 21, 24, 0.8)',
        borderColor: 'rgba(232, 196, 196, 0.15)',
      },
      sidebar: {
        background: 'rgba(26, 21, 24, 0.9)',
        borderColor: 'rgba(232, 196, 196, 0.15)',
      },
      card: {
        background: 'rgba(38, 31, 34, 0.8)',
        border: '1px solid rgba(232, 196, 196, 0.15)',
        hover: 'rgba(51, 41, 45, 0.9)',
      },
    },
  },

  // Cosmic Void: deep space dark mode
  'cosmic-void': {
    colors: {
      primary: '#B794F6',
      secondary: '#4FD1C5',
      accent: '#F687B3',
      text: '#E2E8F0',
      textSecondary: '#A0AEC0',
      background: '#0F0F23',
      surface: '#1A1A2E',
      surfaceHover: '#24243A',
      border: 'rgba(183,148,246,0.4)',
      success: '#4FD1C5',
      warning: '#F6AD55',
      error: '#F687B3',
      info: '#B794F6',
    },
    gradients: {
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 25%, #0F0F23 50%, #16213E 75%, #0A0E27 100%)',
      hero: 'linear-gradient(to right, rgba(183,148,246,0.2), rgba(79,209,197,0.2))',
      card: 'linear-gradient(135deg, rgba(26,26,46,0.95), rgba(36,36,58,0.95))',
      button: 'linear-gradient(135deg, #B794F6, #C8ABFF)',
      glow: 'radial-gradient(circle, rgba(183,148,246,0.4), rgba(79,209,197,0.35))',
    },
    effects: {
      blur: 'blur(28px)',
      shadow: '0 0 30px rgba(183,148,246,0.3)',
      shadowHover: '0 0 50px rgba(183,148,246,0.45)',
      borderRadius: '16px',
      backgroundPattern:
        'radial-gradient(circle at 20% 80%, rgba(183,148,246,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(79,209,197,0.08) 0%, transparent 50%)',
      particleColor: 'rgba(183,148,246,0.75)',
    },
    components: {
      header: {
        background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(36,36,58,0.9))',
        borderColor: 'rgba(183,148,246,0.3)',
      },
      sidebar: {
        background: 'linear-gradient(180deg, rgba(26,26,46,0.95), rgba(15,15,35,0.95))',
        borderColor: 'rgba(183,148,246,0.3)',
      },
      card: {
        background: 'rgba(26,26,46,0.9)',
        border: '2px solid rgba(183,148,246,0.3)',
        hover: 'rgba(36,36,58,0.95)',
      },
    },
  },

  'paper-ink': {
    colors: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
      accent: '#707070',
      text: '#FAFAFA',
      textSecondary: '#A0A0A0',
      background: '#121212', // Dark gray/black
      surface: '#1E1E1E',
      surfaceHover: '#252525',
      border: 'rgba(255,255,255,0.15)',
      success: '#B0B0B0',
      warning: '#707070',
      error: '#E0E0E0',
      info: '#A0A0A0',
    },
    gradients: {
      background: 'linear-gradient(135deg, #121212 0%, #181818 50%, #121212 100%)',
      hero: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(200,200,200,0.05))',
      card: 'linear-gradient(135deg, rgba(30,30,30,1), rgba(37,37,37,1))',
      button: 'linear-gradient(135deg, #404040, #505050)',
      glow: 'radial-gradient(circle, rgba(255,255,255,0.08), rgba(200,200,200,0.05))',
    },
    effects: {
      blur: 'blur(12px)',
      shadow: '0 4px 16px rgba(0,0,0,0.4)',
      shadowHover: '0 6px 24px rgba(0,0,0,0.5)',
      borderRadius: '8px',
      backgroundPattern: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.02) 50px, rgba(255,255,255,0.02) 52px)',
      particleColor: 'rgba(255,255,255,0.15)',
    },
    components: {
      header: {
        background: 'rgba(18, 18, 18, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
      sidebar: {
        background: 'rgba(18, 18, 18, 0.9)',
        borderColor: 'rgba(255,255,255,0.1)',
      },
      card: {
        background: 'rgba(30, 30, 30, 0.95)',
        border: '1px solid rgba(255,255,255,0.12)',
        hover: 'rgba(37, 37, 37, 1)',
      },
    },
  },
}

// Get global theme by ID
function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return { r, g, b }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const to = (n: number) => n.toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function mixHex(a: string, b: string, weightB: number) {
  const w = clamp01(weightB)
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  if (!ra || !rb) return a
  return rgbToHex({
    r: Math.round(ra.r * (1 - w) + rb.r * w),
    g: Math.round(ra.g * (1 - w) + rb.g * w),
    b: Math.round(ra.b * (1 - w) + rb.b * w),
  })
}

function hexToRgba(hex: string, alpha: number) {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(255,255,255,${clamp01(alpha)})`
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${clamp01(alpha)})`
}

function toDarkPastelTheme(theme: GlobalTheme): GlobalTheme {
  const deep = '#070A10'
  const slate = '#0F172A'
  const slate2 = '#111C33'

  // Special-case: Winter Quiet should feel like a soft nebula
  // (deep indigo + lilac + faint cyan glow) while still pastel.
  const isWinterNebula = theme.id === 'winter-quiet'

  const winterNebulaPrimaryBase = '#A78BFA' // lilac
  const winterNebulaSecondaryBase = '#67E8F9' // soft cyan

  const primaryLift = mixHex(
    isWinterNebula ? mixHex(theme.colors.primary, winterNebulaPrimaryBase, 0.62) : theme.colors.primary,
    '#FFFFFF',
    0.12
  )
  const secondaryLift = mixHex(
    isWinterNebula ? mixHex(theme.colors.secondary, winterNebulaSecondaryBase, 0.55) : theme.colors.secondary,
    '#FFFFFF',
    0.12
  )

  const backgroundBase = mixHex(deep, theme.colors.primary, isWinterNebula ? 0.16 : 0.10)
  const surfaceBase = mixHex(slate, theme.colors.secondary, isWinterNebula ? 0.12 : 0.06)
  const surfaceHover = mixHex(slate2, theme.colors.primary, isWinterNebula ? 0.14 : 0.08)

  const text = '#EAF2F7'
  const textSecondary = 'rgba(234,242,247,0.78)'

  const winterNebulaBackground = [
    `radial-gradient(circle at 18% 22%, ${hexToRgba(primaryLift, 0.32)} 0%, transparent 52%)`,
    `radial-gradient(circle at 76% 64%, ${hexToRgba(secondaryLift, 0.22)} 0%, transparent 56%)`,
    `radial-gradient(circle at 55% 18%, ${hexToRgba(mixHex(primaryLift, secondaryLift, 0.35), 0.18)} 0%, transparent 48%)`,
    // subtle starfield-ish speckle
    `radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`,
    `linear-gradient(135deg, ${deep} 0%, ${mixHex('#0B1020', primaryLift, 0.14)} 100%)`,
  ].join(', ')

  const gradients = isWinterNebula
    ? {
      ...theme.gradients,
      background: winterNebulaBackground,
      hero: `linear-gradient(to right, ${hexToRgba(primaryLift, 0.22)}, ${hexToRgba(secondaryLift, 0.18)})`,
      card: `linear-gradient(135deg, ${hexToRgba('#0B1022', 0.82)}, ${hexToRgba('#111A3A', 0.74)})`,
      button: `linear-gradient(135deg, ${primaryLift}, ${secondaryLift})`,
      glow: `radial-gradient(circle, ${hexToRgba(primaryLift, 0.38)}, ${hexToRgba(secondaryLift, 0.28)})`,
    }
    : {
      ...theme.gradients,
      background: [
        `radial-gradient(circle at 18% 22%, ${hexToRgba(primaryLift, 0.22)} 0%, transparent 55%)`,
        `radial-gradient(circle at 82% 68%, ${hexToRgba(secondaryLift, 0.18)} 0%, transparent 60%)`,
        `linear-gradient(135deg, ${deep} 0%, ${backgroundBase} 100%)`,
      ].join(', '),
      hero: `linear-gradient(to right, ${hexToRgba(primaryLift, 0.18)}, ${hexToRgba(secondaryLift, 0.16)})`,
      card: `linear-gradient(135deg, ${hexToRgba(slate, 0.82)}, ${hexToRgba(slate2, 0.72)})`,
      button: `linear-gradient(135deg, ${primaryLift}, ${secondaryLift})`,
      glow: `radial-gradient(circle, ${hexToRgba(primaryLift, 0.26)}, ${hexToRgba(secondaryLift, 0.18)})`,
    }

  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: primaryLift,
      secondary: secondaryLift,
      text,
      textSecondary,
      background: backgroundBase,
      surface: surfaceBase,
      surfaceHover,
      border: 'rgba(255,255,255,0.12)',
      info: mixHex(theme.colors.info, '#FFFFFF', 0.10),
      success: mixHex(theme.colors.success, '#FFFFFF', 0.10),
      warning: mixHex(theme.colors.warning, '#FFFFFF', 0.10),
      error: mixHex(theme.colors.error, '#FFFFFF', 0.10),
    },
    gradients,
    effects: {
      ...theme.effects,
      shadow: '0 14px 60px rgba(0,0,0,0.55)',
      shadowHover: '0 18px 80px rgba(0,0,0,0.65)',
      particleColor: isWinterNebula ? hexToRgba(secondaryLift, 0.42) : hexToRgba(primaryLift, 0.35),
      backgroundPattern: isWinterNebula
        ? 'radial-gradient(circle at 60% 30%, rgba(167,139,250,0.12) 0%, transparent 60%), radial-gradient(circle at 20% 70%, rgba(103,232,249,0.10) 0%, transparent 55%)'
        : theme.effects.backgroundPattern
          ? theme.effects.backgroundPattern.replace(/rgba\(([^)]+),\s*0\.(0?\d+)\)/g, (m) => m)
          : theme.effects.backgroundPattern,
    },
    components: {
      ...theme.components,
      header: {
        background: isWinterNebula
          ? `linear-gradient(135deg, ${hexToRgba('#070A14', 0.76)}, ${hexToRgba('#11103A', 0.62)})`
          : `linear-gradient(135deg, ${hexToRgba(deep, 0.72)}, ${hexToRgba(slate, 0.62)})`,
        borderColor: 'rgba(255,255,255,0.12)',
      },
      sidebar: {
        background: isWinterNebula
          ? `linear-gradient(180deg, ${hexToRgba('#070A14', 0.76)}, ${hexToRgba('#11103A', 0.62)})`
          : `linear-gradient(180deg, ${hexToRgba(deep, 0.72)}, ${hexToRgba(slate, 0.62)})`,
        borderColor: 'rgba(255,255,255,0.10)',
      },
      card: {
        background: isWinterNebula ? hexToRgba('#0B1022', 0.62) : hexToRgba(slate, 0.60),
        border: '1px solid rgba(255,255,255,0.10)',
        hover: isWinterNebula ? hexToRgba('#111A3A', 0.74) : hexToRgba(slate2, 0.72),
      },
    },
  }
}

export function getGlobalTheme(themeId: ThemeId, mode: ThemeMode = 'light'): GlobalTheme {
  const base = GLOBAL_THEMES[themeId]

  if (mode === 'dark') {
    // Check for overrides first
    const override = DARK_THEME_OVERRIDES[themeId]
    if (override && Object.keys(override).length > 0) {
      return {
        ...base,
        ...override,
        colors: { ...base.colors, ...override.colors },
        gradients: { ...base.gradients, ...override.gradients },
        effects: { ...base.effects, ...override.effects },
        components: {
          header: { ...base.components.header, ...override.components?.header },
          sidebar: { ...base.components.sidebar, ...override.components?.sidebar },
          card: { ...base.components.card, ...override.components?.card },
        },
      }
    }

    // Fallback to algorithmic generation for any others
    return toDarkPastelTheme(base)
  }

  return base
}

// Theme context hook
export function useThemeStyles(themeId: ThemeId, mode: ThemeMode = 'light') {
  const theme = getGlobalTheme(themeId, mode)

  return {
    theme,
    styles: {
      fontDisplay: { fontFamily: theme.fonts.display },
      fontBody: { fontFamily: theme.fonts.body },
      fontMono: { fontFamily: theme.fonts.mono },
      textPrimary: { color: theme.colors.text },
      textSecondary: { color: theme.colors.textSecondary },
      bgPrimary: { background: theme.colors.background },
      bgSurface: { background: theme.colors.surface },
    },
  }
}
