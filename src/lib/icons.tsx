// ============================================================================
// ICON SYSTEM - Lucide React Icons
// ============================================================================
// Centralized icon mapping system using Lucide React for consistent,
// professional icons throughout Aurora OS
// ============================================================================

import {
  // File type icons
  FileText,
  FileImage,
  FileCode,
  FileArchive,
  Music,
  Video,
  Palette,
  File,

  // Season/Theme icons
  Flower2,
  Sprout,
  Sun,
  Leaf,
  Snowflake,
  Rainbow,
  Moon,
  Sparkles,
  Scroll,

  // UI/Action icons
  Zap,
  Target,
  Flame,
  Star,
  Trophy,
  Gift,
  LayoutGrid,
  Plus,
  Search,
  RefreshCw,
  Settings,
  X,
  ChevronDown,
  Home,

  // Quest/Activity icons
  CheckCircle2,
  Save,
  Users,
  User,

  // Value icons
  DollarSign,
  Scale,
  Bird as Dove,
  DoorOpen,
  Heart,
  Gem,

  // Resistance icons
  Waves,
  Frown,
  Meh,
  HelpCircle,
  IceCream,
  Shield,

  // Cluster icons
  Rocket,
  Lightbulb,
  BookOpen,
  Folder,

  // Misc
  Archive,
  Clock,
  Cloud,
  GripVertical,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Wind,
  Quote,
  Timer,
  PenTool,
  Check,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'

export type IconComponent = LucideIcon

// ============================================================================
// FILE TYPE ICONS
// ============================================================================

interface FileIconMap {
  [key: string]: IconComponent
}

export const fileTypeIcons: FileIconMap = {
  // Documents
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,

  // Images
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  svg: Palette,
  webp: FileImage,

  // Code files
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  jsx: FileCode,
  py: FileCode,
  rs: FileCode,
  go: FileCode,
  java: FileCode,
  cpp: FileCode,
  c: FileCode,
  html: FileCode,
  css: FileCode,
  scss: FileCode,

  // Archives
  zip: FileArchive,
  rar: FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  '7z': FileArchive,

  // Media
  mp3: Music,
  wav: Music,
  flac: Music,
  mp4: Video,
  mov: Video,
  avi: Video,
  mkv: Video,

  // Design
  psd: Palette,
  ai: Palette,
  sketch: Palette,
  fig: Palette,
  figma: Palette,
  xd: Palette,
}

/**
 * Get icon component for a file type
 * @param fileType - File extension (e.g., 'pdf', 'png')
 * @returns Lucide icon component
 */
export function getFileTypeIcon(fileType: string): IconComponent {
  return fileTypeIcons[fileType.toLowerCase()] || File
}

// ============================================================================
// THEME/SEASON ICONS
// ============================================================================

export const seasonIcons = {
  spring: Flower2,
  summer: Sun,
  autumn: Leaf,
  fall: Leaf,
  winter: Snowflake,
  neon: Rainbow,
  soft: Moon,
  cosmic: Sparkles,
  paper: Scroll,
} as const

export type SeasonName = keyof typeof seasonIcons

/**
 * Get icon component for a season/theme
 */
export function getSeasonIcon(season: SeasonName): IconComponent {
  return seasonIcons[season]
}

// ============================================================================
// QUEST/ACTIVITY ICONS
// ============================================================================

export const questIcons = {
  file: FileText,
  remember: Sparkles,
  save: Save,
  share: Users,
  complete: CheckCircle2,
  energy: Zap,
} as const

// ============================================================================
// VALUE ICONS
// ============================================================================

export const valueIcons = {
  money: DollarSign,
  financial: DollarSign,
  balance: Scale,
  peace: Dove,
  freedom: DoorOpen,
  autonomy: DoorOpen,
  beauty: Sparkles,
  love: Heart,
  connection: Heart,
  gem: Gem,
  quality: Gem,
} as const

// ============================================================================
// RESISTANCE BREAKER ICONS
// ============================================================================

export const resistanceIcons = {
  overwhelmed: Waves,
  anxious: Frown,
  apathetic: Meh,
  confused: HelpCircle,
  frozen: IceCream,
  shield: Shield,
  sparkle: Sparkles,
} as const

// ============================================================================
// CLUSTER ICONS
// ============================================================================

export const clusterIcons = {
  active: Rocket,
  creative: Lightbulb,
  learning: BookOpen,
  default: Folder,
} as const

// ============================================================================
// UI/ACTION ICONS
// ============================================================================

export const uiIcons = {
  search: Search,
  refresh: RefreshCw,
  zap: Zap,
  target: Target,
  flame: Flame,
  star: Star,
  trophy: Trophy,
  gift: Gift,
  clock: Clock,
  trending: TrendingUp,
  sparkles: Sparkles,
  rainbow: Rainbow,
} as const

// ============================================================================
// ICON WRAPPER COMPONENT
// ============================================================================

interface IconProps {
  icon: IconComponent
  size?: number
  className?: string
  color?: string
}

/**
 * Reusable icon wrapper component
 */
export function Icon({ icon: IconComponent, size = 20, className = '', color }: IconProps) {
  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={2}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // File types
  FileText,
  FileImage,
  FileCode,
  FileArchive,
  Music,
  Video,
  Palette,
  File,

  // Seasons
  Flower2,
  Sprout,
  Sun,
  Leaf,
  Snowflake,
  Rainbow,
  Moon,
  Sparkles,
  Scroll,

  // UI
  Zap,
  Target,
  Flame,
  Star,
  Trophy,
  Gift,
  LayoutGrid,
  Plus,
  Search,
  RefreshCw,
  Settings,
  X,
  ChevronDown,
  Home,

  // Quest
  CheckCircle2,
  Save,
  Users,
  User,

  // Values
  DollarSign,
  Scale,
  Dove,
  DoorOpen,
  Heart,
  Gem,

  // Resistance
  Waves,
  Frown,
  Meh,
  HelpCircle,
  IceCream,
  Shield,

  // Cluster
  Rocket,
  Lightbulb,
  BookOpen,
  Folder,

  // Misc
  Archive,
  Clock,
  Cloud,
  GripVertical,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Wind,
  Quote,
  Timer,
  PenTool,
  Check,
  ArrowRight,
  AlertCircle,
  ExternalLink,
}
