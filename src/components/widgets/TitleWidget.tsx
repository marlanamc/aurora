'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { PenTool, ChevronLeft, Minus, ChevronRight, Palette, Check, X, Sparkles } from '@/lib/icons'
import { type GlobalTheme } from '@/lib/global-themes'
import { type AuroraSettings } from '@/lib/settings'
import { HexColorPicker } from 'react-colorful'

interface TitleData extends Record<string, unknown> {
  title: string
  subtitle?: string
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  subtitleSize: 'xs' | 'sm' | 'md'
  alignment: 'left' | 'center' | 'right'
  color: string
  subtitleColor?: string
  fontWeight: 'normal' | 'medium' | 'bold' | 'black'
  showDecoration: boolean
  style: 'minimal' | 'elegant' | 'bold' | 'modern'
  useDynamicContent: boolean
  template: 'custom' | 'value-name' | 'date' | 'greeting' | 'motivational'
}

const FONT_SIZE_OPTIONS = {
  small: { size: '1.25rem', lineHeight: '1.5' },
  medium: { size: '1.75rem', lineHeight: '1.4' },
  large: { size: '2.25rem', lineHeight: '1.3' },
  xlarge: { size: '3rem', lineHeight: '1.2' },
} as const

const SUBTITLE_SIZE_OPTIONS = {
  xs: { size: '0.75rem', lineHeight: '1.4' },
  sm: { size: '0.875rem', lineHeight: '1.5' },
  md: { size: '1rem', lineHeight: '1.5' },
} as const

const FONT_WEIGHT_OPTIONS = [
  { value: 'normal' as const, label: 'Normal' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'bold' as const, label: 'Bold' },
  { value: 'black' as const, label: 'Black' },
]

const ALIGNMENT_OPTIONS = [
  { value: 'left' as const, icon: ChevronLeft, label: 'Left' },
  { value: 'center' as const, icon: Minus, label: 'Center' },
  { value: 'right' as const, icon: ChevronRight, label: 'Right' },
]

const STYLE_PRESETS = {
  minimal: {
    showDecoration: false,
    fontWeight: 'normal' as const,
    fontSize: 'medium' as const,
  },
  elegant: {
    showDecoration: true,
    fontWeight: 'medium' as const,
    fontSize: 'large' as const,
  },
  bold: {
    showDecoration: false,
    fontWeight: 'black' as const,
    fontSize: 'xlarge' as const,
  },
  modern: {
    showDecoration: true,
    fontWeight: 'bold' as const,
    fontSize: 'large' as const,
  },
}

const TEMPLATES = {
  'value-name': {
    title: '{valueName}',
    subtitle: '',
  },
  date: {
    title: '{date}',
    subtitle: '{dayOfWeek}',
  },
  greeting: {
    title: '{greeting}',
    subtitle: '{date}',
  },
  motivational: {
    title: 'Today is your day',
    subtitle: '{date} • {valueName}',
  },
}

// Dynamic content variables
function formatDynamicContent(
  text: string,
  valueName?: string,
  settings?: AuroraSettings
): string {
  const now = new Date()
  const hour = now.getHours()
  
  const replacements: Record<string, string> = {
    '{date}': now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{dayOfWeek}': now.toLocaleDateString('en-US', { weekday: 'long' }),
    '{time}': now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    '{valueName}': valueName || 'Focus Area',
    '{greeting}': hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening',
  }
  
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
  }
  
  return result
}

export function TitleWidget({
  theme,
  widgetId,
  valueId,
  settings,
  getWidgetData,
  mergeWidgetData,
}: {
  theme: GlobalTheme
  widgetId: string
  valueId?: string
  settings?: AuroraSettings
  getWidgetData: <T,>(id: string, fallback: T) => T
  mergeWidgetData: <T extends Record<string, unknown>>(id: string, partial: Partial<T>, fallback: T) => void
}) {
  const valueName = useMemo(() => {
    if (!valueId || !settings) return undefined
    if (valueId === '__homebase__') return 'Homebase'
    return settings.coreValues?.find((v) => v.id === valueId)?.name
  }, [valueId, settings])

  const defaultData: TitleData = {
    title: valueName || 'My Title',
    subtitle: '',
    fontSize: 'large',
    subtitleSize: 'sm',
    alignment: 'center',
    color: theme.colors.primary,
    subtitleColor: theme.colors.textSecondary,
    fontWeight: 'bold',
    showDecoration: true,
    style: 'elegant',
    useDynamicContent: false,
    template: 'custom',
  }

  const data = getWidgetData<TitleData>(widgetId, defaultData)

  // Apply template if selected
  useEffect(() => {
    if (data.template !== 'custom' && TEMPLATES[data.template]) {
      const template = TEMPLATES[data.template]
      const currentTitle = formatDynamicContent(template.title, valueName, settings)
      const currentSubtitle = formatDynamicContent(template.subtitle, valueName, settings)
      
      if (data.title !== currentTitle || data.subtitle !== currentSubtitle) {
        mergeWidgetData<TitleData>(
          widgetId,
          {
            title: template.title,
            subtitle: template.subtitle,
            useDynamicContent: true,
          },
          data
        )
      }
    }
  }, [data.template, valueName, settings, widgetId, data, mergeWidgetData])

  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(data.title)
  const [editingSubtitle, setEditingSubtitle] = useState(data.subtitle || '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showSubtitleColorPicker, setShowSubtitleColorPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const subtitleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const saveTitle = () => {
    mergeWidgetData<TitleData>(
      widgetId,
      {
        title: editingTitle.trim() || defaultData.title,
        subtitle: editingSubtitle.trim() || undefined,
      },
      data
    )
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingTitle(data.title)
    setEditingSubtitle(data.subtitle || '')
  }

  const updateSetting = <K extends keyof TitleData>(key: K, value: TitleData[K]) => {
    mergeWidgetData<TitleData>(widgetId, { [key]: value }, data)
  }

  const applyStyle = (style: TitleData['style']) => {
    const preset = STYLE_PRESETS[style]
    mergeWidgetData<TitleData>(widgetId, { style, ...preset }, data)
  }

  const applyTemplate = (template: TitleData['template']) => {
    if (template === 'custom') {
      mergeWidgetData<TitleData>(widgetId, { template, useDynamicContent: false }, data)
      return
    }
    const templateData = TEMPLATES[template]
    mergeWidgetData<TitleData>(
      widgetId,
      {
        template,
        title: templateData.title,
        subtitle: templateData.subtitle,
        useDynamicContent: true,
      },
      data
    )
  }

  const fontSizeStyle = FONT_SIZE_OPTIONS[data.fontSize]
  const subtitleSizeStyle = SUBTITLE_SIZE_OPTIONS[data.subtitleSize]

  // Format display text with dynamic content
  const displayTitle = data.useDynamicContent
    ? formatDynamicContent(data.title, valueName, settings)
    : data.title

  const displaySubtitle = data.subtitle
    ? data.useDynamicContent
      ? formatDynamicContent(data.subtitle, valueName, settings)
      : data.subtitle
    : null

  return (
    <UnifiedCard>
      <UnifiedCardHeader
        icon={PenTool}
        title="Title"
        subtitle="Dynamic titles with style"
        action={
          <div className="flex items-center gap-1 flex-wrap">
            {/* Template Picker */}
            <div className="relative">
              <button
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Choose template"
              >
                <Sparkles size={14} style={{ color: theme.colors.textSecondary }} />
              </button>

              {showTemplatePicker && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowTemplatePicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 p-3 rounded-xl shadow-2xl z-50 min-w-[200px]"
                    style={{
                      background: theme.components.card.background,
                      border: `2px solid ${theme.colors.border}`,
                      boxShadow: theme.effects.shadowHover,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-xs font-medium mb-2" style={{ color: theme.colors.textSecondary }}>
                      Templates
                    </div>
                    {Object.entries(TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => {
                          applyTemplate(key as TitleData['template'])
                          setShowTemplatePicker(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-xs transition-colors ${
                          data.template === key
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="font-medium capitalize">{key.replace('-', ' ')}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {formatDynamicContent(template.title, valueName, settings)}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        applyTemplate('custom')
                        setShowTemplatePicker(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg mt-1 text-xs transition-colors ${
                        data.template === 'custom'
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      Custom
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Style Presets */}
            <select
              value={data.style}
              onChange={(e) => applyStyle(e.target.value as TitleData['style'])}
              className="px-2 py-1 text-xs rounded border bg-transparent"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }}
            >
              {Object.keys(STYLE_PRESETS).map((style) => (
                <option key={style} value={style} className="bg-surface text-text">
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Change title color"
              >
                <div
                  className="w-4 h-4 rounded border border-white/20"
                  style={{ background: data.color }}
                />
              </button>

              {showColorPicker && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 p-4 rounded-xl shadow-2xl z-50"
                    style={{
                      background: theme.components.card.background,
                      border: `2px solid ${theme.colors.border}`,
                      boxShadow: theme.effects.shadowHover,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HexColorPicker
                      color={data.color}
                      onChange={(color) => updateSetting('color', color)}
                      style={{ width: '200px', height: '150px' }}
                    />
                  </motion.div>
                </>
              )}
            </div>

            {/* Font Size */}
            <select
              value={data.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value as TitleData['fontSize'])}
              className="px-2 py-1 text-xs rounded border bg-transparent"
              style={{
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }}
            >
              {Object.keys(FONT_SIZE_OPTIONS).map((size) => (
                <option key={size} value={size} className="bg-surface text-text">
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </option>
              ))}
            </select>

            {/* Alignment */}
            <div className="flex rounded border" style={{ borderColor: theme.colors.border }}>
              {ALIGNMENT_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('alignment', option.value)}
                    className={`p-1.5 transition-colors ${
                      data.alignment === option.value
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-surface-hover'
                    }`}
                    title={option.label}
                  >
                    <Icon size={12} />
                  </button>
                )
              })}
            </div>
          </div>
        }
      />

      <div className="p-8">
        {/* Title Display/Edit */}
        <div className="relative py-2">
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      subtitleInputRef.current?.focus()
                    }
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border bg-transparent outline-none"
                  style={{
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    fontSize: fontSizeStyle.size,
                    fontWeight: data.fontWeight,
                    textAlign: data.alignment,
                    fontFamily: theme.fonts.display,
                  }}
                  placeholder="Enter your title..."
                />
                <button
                  onClick={saveTitle}
                  className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  title="Save"
                >
                  <Check size={16} className="text-green-500" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                  title="Cancel"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={subtitleInputRef}
                  value={editingSubtitle}
                  onChange={(e) => setEditingSubtitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border bg-transparent outline-none text-sm"
                  style={{
                    borderColor: theme.colors.border,
                    color: theme.colors.textSecondary,
                    fontSize: subtitleSizeStyle.size,
                    textAlign: data.alignment,
                  }}
                  placeholder="Subtitle (optional, use {date}, {time}, {valueName}, {dayOfWeek}, {greeting})"
                />
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitleColorPicker(!showSubtitleColorPicker)}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title="Change subtitle color"
                  >
                    <div
                      className="w-3 h-3 rounded border border-white/20"
                      style={{ background: data.subtitleColor || theme.colors.textSecondary }}
                    />
                  </button>
                  {showSubtitleColorPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-50"
                        onClick={() => setShowSubtitleColorPicker(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-12 p-4 rounded-xl shadow-2xl z-50"
                        style={{
                          background: theme.components.card.background,
                          border: `2px solid ${theme.colors.border}`,
                          boxShadow: theme.effects.shadowHover,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HexColorPicker
                          color={data.subtitleColor || theme.colors.textSecondary}
                          onChange={(color) => updateSetting('subtitleColor', color)}
                          style={{ width: '200px', height: '150px' }}
                        />
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
              <div className="text-xs pt-2" style={{ color: theme.colors.textSecondary }}>
                <div className="flex items-center gap-4 flex-wrap">
                  <span>Variables: {'{'}{'date'}{'}'}, {'{'}{'time'}{'}'}, {'{'}{'valueName'}{'}'}, {'{'}{'dayOfWeek'}{'}'}, {'{'}{'greeting'}{'}'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="group cursor-pointer relative"
              onClick={() => {
                setIsEditing(true)
                setEditingTitle(data.title)
                setEditingSubtitle(data.subtitle || '')
              }}
              style={{ textAlign: data.alignment }}
            >
              {/* Decorative elements */}
              {data.showDecoration && (
                <>
                  <div
                    className="absolute -top-3 left-0 right-0 h-[1px] opacity-40"
                    style={{ 
                      background: `linear-gradient(90deg, transparent 0%, ${data.color}60 20%, ${data.color}80 50%, ${data.color}60 80%, transparent 100%)`,
                      filter: `blur(0.5px)`,
                    }}
                  />
                  <div
                    className="absolute -bottom-3 left-0 right-0 h-[1px] opacity-40"
                    style={{ 
                      background: `linear-gradient(90deg, transparent 0%, ${data.color}60 20%, ${data.color}80 50%, ${data.color}60 80%, transparent 100%)`,
                      filter: `blur(0.5px)`,
                    }}
                  />
                  {/* Subtle glow effect */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, ${data.color}20 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                      transform: 'scale(1.2)',
                    }}
                  />
                </>
              )}

              <h1
                className="transition-all group-hover:scale-[1.02] select-none"
                style={{
                  fontSize: fontSizeStyle.size,
                  lineHeight: fontSizeStyle.lineHeight,
                  fontWeight: data.fontWeight,
                  color: data.color,
                  fontFamily: theme.fonts.display,
                  textAlign: data.alignment,
                  letterSpacing: data.fontSize === 'xlarge' ? '-0.02em' : data.fontSize === 'large' ? '-0.01em' : '0',
                  textShadow: data.showDecoration 
                    ? `0 2px 12px ${data.color}20, 0 4px 24px ${data.color}10, 0 1px 2px rgba(0,0,0,0.1)`
                    : `0 1px 3px rgba(0,0,0,0.1)`,
                  marginBottom: displaySubtitle ? '0.75rem' : '0',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                {displayTitle || 'Click to edit title'}
              </h1>

              {displaySubtitle && (
                <div
                  className="transition-all select-none"
                  style={{
                    fontSize: subtitleSizeStyle.size,
                    lineHeight: subtitleSizeStyle.lineHeight,
                    color: data.subtitleColor || theme.colors.textSecondary,
                    textAlign: data.alignment,
                    opacity: 0.85,
                    letterSpacing: '0.01em',
                    fontWeight: 400,
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  {displaySubtitle}
                </div>
              )}

              {/* Edit indicator */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <PenTool size={14} style={{ color: theme.colors.textSecondary }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick Settings */}
        {!isEditing && (
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={data.showDecoration}
                onChange={(e) => updateSetting('showDecoration', e.target.checked)}
                className="rounded"
              />
              <span style={{ color: theme.colors.textSecondary }}>Decorative lines</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={data.useDynamicContent}
                onChange={(e) => updateSetting('useDynamicContent', e.target.checked)}
                className="rounded"
              />
              <span style={{ color: theme.colors.textSecondary }}>Dynamic content</span>
            </label>
            {data.subtitle && (
              <select
                value={data.subtitleSize}
                onChange={(e) => updateSetting('subtitleSize', e.target.value as TitleData['subtitleSize'])}
                className="px-2 py-1 text-xs rounded border bg-transparent"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.keys(SUBTITLE_SIZE_OPTIONS).map((size) => (
                  <option key={size} value={size} className="bg-surface text-text">
                    {size.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </UnifiedCard>
  )
}
