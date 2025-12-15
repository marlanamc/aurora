'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { UnifiedCard, UnifiedCardHeader } from '@/components/UnifiedCard'
import { VALUE_ICON_OPTIONS } from '@/lib/value-icons'
import { X, Eye, Plus, FileText, Sparkles, Scroll, Zap, LayoutGrid, Target } from '@/lib/icons'
import {
  STARTER_TEMPLATES,
  buildCoreValuesFromStarterTemplate,
  type StarterTemplate,
  type StarterTemplateValue,
  type TemplateCoreValue,
} from '@/lib/starter-templates'
import { CORE_VALUE_PALETTE } from '@/lib/value-colors'

type Props = {
  onApply: (values: TemplateCoreValue[]) => void
  onOpenSettings?: () => void
}

type ViewMode = 'templates' | 'individual'

const SAMPLE_FILES_BY_ID: Record<string, string[]> = {
  work: ['Roadmap_Q1.key', 'Project_Plan.md', 'Spec_v2.pdf', 'Meeting_Notes.txt', 'Design_Mockup.fig'],
  health: ['Workout_Plan.pdf', 'Sleep_Log.csv', 'Doctor_Notes.md', 'Meal_Ideas.txt', 'Therapy_Notes.md'],
  relationships: ['Birthday_Plan.md', 'Trip_Photos.zip', 'Gift_Ideas.txt', 'Contact_List.csv', 'Dinner_Invite.ics'],
  home: ['Lease.pdf', 'Utilities_Bill.pdf', 'Grocery_List.txt', 'Maintenance_Notes.md', 'Warranty_Info.pdf'],
  money: ['Taxes_2024.pdf', 'Budget.xlsx', 'Invoice_1042.pdf', 'Bank_Statement.pdf', 'Receipts.zip'],
  learning: ['Course_Notes.md', 'Reading_List.txt', 'Research_Paper.pdf', 'Flashcards.apkg', 'Lecture_Slides.pdf'],
  support: ['Reset_Routine.md', 'Coping_Tools.txt', 'Medication_Log.csv', 'Therapy_Notes.md', 'Kind_Reminders.txt'],
}

function titleToSampleFiles(title: string) {
  const safe = title.trim().replace(/\s+/g, '_')
  return [`${safe}_Notes.md`, `${safe}_Plan.pdf`, `${safe}_Links.txt`, `${safe}_Checklist.md`, `${safe}_Ideas.txt`]
}

function getTemplateSampleFiles(template: StarterTemplate) {
  const primary = template.values[0]
  if (!primary) return ['Example_File.pdf', 'Example_Notes.md', 'Example_List.txt']
  return SAMPLE_FILES_BY_ID[primary.id] ?? titleToSampleFiles(primary.name)
}

export function StarterTemplatePicker({ onApply, onOpenSettings }: Props) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('templates')
  const canPortal = typeof document !== 'undefined'

  const previewTemplate = useMemo(
    () => (previewTemplateId ? STARTER_TEMPLATES.find((t) => t.id === previewTemplateId) ?? null : null),
    [previewTemplateId]
  )

  // Extract all unique focus areas from templates
  const individualAreas = useMemo(() => {
    const areaMap = new Map<string, StarterTemplateValue>()
    STARTER_TEMPLATES.forEach((template) => {
      template.values.forEach((value) => {
        if (!areaMap.has(value.id)) {
          areaMap.set(value.id, value)
        }
      })
    })
    return Array.from(areaMap.values())
  }, [])

  return (
    <div className="space-y-5">
      <UnifiedCardHeader
        title="Welcome to Aurora"
        subtitle="Choose a template or pick individual areas. You can always customize later."
        icon={Sparkles}
        action={
          onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: 'var(--aurora-surface, rgba(255,255,255,0.1))',
                border: 'var(--aurora-card-border, 1px solid rgba(255,255,255,0.18))',
                color: 'var(--aurora-text, #111827)',
              }}
              title="Open settings"
            >
              Open Settings
            </button>
          ) : null
        }
      />

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
        <button
          type="button"
          onClick={() => setViewMode('templates')}
          className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: viewMode === 'templates' ? 'var(--aurora-primary, #3B82F6)' : 'transparent',
            color: viewMode === 'templates' ? '#ffffff' : 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <LayoutGrid size={14} />
            Templates
          </div>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('individual')}
          className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: viewMode === 'individual' ? 'var(--aurora-primary, #3B82F6)' : 'transparent',
            color: viewMode === 'individual' ? '#ffffff' : 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Target size={14} />
            Individual Areas
          </div>
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'templates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STARTER_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => setPreviewTemplateId(template.id)}
              onAdd={() => onApply(buildCoreValuesFromStarterTemplate(template))}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {individualAreas.map((area) => {
            const Icon = VALUE_ICON_OPTIONS[area.iconId]
            return (
              <motion.button
                key={area.id}
                type="button"
                onClick={() => {
                  const valueWithColor: TemplateCoreValue = {
                    ...area,
                    colorPair: CORE_VALUE_PALETTE[Math.floor(Math.random() * CORE_VALUE_PALETTE.length)],
                  }
                  onApply([valueWithColor])
                }}
                className="rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {Icon && (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(0,0,0,0.06)',
                        color: 'var(--aurora-text, #111827)',
                      }}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                      {area.name}
                    </div>
                  </div>
                </div>
                <div className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                  {area.purpose}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--aurora-primary, #3B82F6)' }}>
                  <Plus size={12} />
                  Add
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      <div
        className="rounded-2xl p-4 text-sm"
        style={{
          background: 'var(--aurora-surface, rgba(255,255,255,0.08))',
          border: 'var(--aurora-card-border, 1px solid rgba(255,255,255,0.18))',
          color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
        }}
      >
        Want to build your own from scratch? Open Settings → Focus Areas and add as many (or as few) as you want.
      </div>

      {canPortal
        ? createPortal(
          <AnimatePresence>
            {previewTemplate && (
              <motion.div
                className="fixed inset-0 z-[210] flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                aria-modal="true"
                role="dialog"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0"
                  style={{ 
                    background: 'rgba(0,0,0,0.65)', 
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                  aria-label="Close preview"
                  onClick={() => setPreviewTemplateId(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />

                <motion.div
                  className="relative w-full max-w-5xl rounded-3xl overflow-hidden"
                  style={{
                    background: 'var(--aurora-card-bg-default, rgba(255,255,255,0.85))',
                    border: 'var(--aurora-card-border, 1px solid rgba(255,255,255,0.18))',
                    boxShadow: 'var(--aurora-card-shadow, 0 18px 55px rgba(0, 0, 0, 0.14))',
                    willChange: 'transform, opacity',
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  initial={{ y: 20, scale: 0.96, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 20, scale: 0.96, opacity: 0 }}
                  transition={{ 
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                    mass: 0.8,
                  }}
                >
                  <div className="p-6 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider opacity-70">Template Preview</div>
                      <div className="text-2xl font-black truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                        {previewTemplate.name}
                      </div>
                      <div className="text-sm mt-1" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                        {previewTemplate.description}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {previewTemplate.values.map((v) => {
                          const Icon = VALUE_ICON_OPTIONS[v.iconId]
                          return (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                              style={{
                                background: 'rgba(0,0,0,0.06)',
                                border: '1px solid rgba(0,0,0,0.10)',
                                color: 'var(--aurora-text, #111827)',
                              }}
                            >
                              {Icon ? <Icon size={14} strokeWidth={2} /> : null}
                              {v.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onApply(buildCoreValuesFromStarterTemplate(previewTemplate))
                          setPreviewTemplateId(null)
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-black inline-flex items-center gap-2"
                        style={{
                          background: 'var(--aurora-primary, #3B82F6)',
                          color: '#ffffff',
                        }}
                      >
                        <Plus size={16} />
                        Add Template
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTemplateId(null)}
                        className="p-2 rounded-xl"
                        style={{
                          background: 'rgba(0,0,0,0.06)',
                          border: '1px solid rgba(0,0,0,0.10)',
                          color: 'var(--aurora-text, #111827)',
                        }}
                        aria-label="Close"
                        title="Close"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <PreviewWidget title="Daily Quest" icon={Zap}>
                        <div className="text-sm font-semibold" style={{ color: 'var(--aurora-text, #111827)' }}>
                          15 minutes: do the next tiny step
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                          (Aurora suggests a micro-action when you’re stuck.)
                        </div>
                      </PreviewWidget>

                      <PreviewWidget title="Relevant Files" icon={FileText}>
                        <div className="space-y-2">
                          {getTemplateSampleFiles(previewTemplate)
                            .slice(0, 4)
                            .map((name) => (
                              <div
                                key={name}
                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
                                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
                              >
                                <div className="text-sm font-semibold truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
                                  {name}
                                </div>
                                <div className="text-[11px] opacity-60" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
                                  Fake
                                </div>
                              </div>
                            ))}
                        </div>
                      </PreviewWidget>

                      <PreviewWidget title="Resurfacing" icon={Sparkles}>
                        <div className="space-y-2">
                          {['Forgotten (gentle nudge)', 'Seasonal Echo (right time)', 'Random Delight (for joy)'].map((line) => (
                            <div
                              key={line}
                              className="px-3 py-2 rounded-xl text-sm"
                              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', color: 'var(--aurora-text, #111827)' }}
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      </PreviewWidget>

                      <PreviewWidget title="Brain Dump" icon={Scroll}>
                        <div
                          className="rounded-2xl p-3 text-sm whitespace-pre-wrap"
                          style={{
                            background: 'rgba(0,0,0,0.04)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
                            minHeight: 86,
                          }}
                        >
                          {'- what feels hard right now?\n- what’s the smallest next step?\n- what would make this easier?'}
                        </div>
                      </PreviewWidget>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
        : null}
    </div>
  )
}

function TemplateCard({
  template,
  onPreview,
  onAdd,
}: {
  template: StarterTemplate
  onPreview: () => void
  onAdd: () => void
}) {
  const chips = template.values.slice(0, 6)
  const extra = Math.max(0, template.values.length - chips.length)

  return (
    <motion.div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
      }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base font-black truncate" style={{ color: 'var(--aurora-text, #111827)' }}>
            {template.name}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))' }}>
            {template.description}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {chips.map((v) => (
          <span
            key={v.id}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.10)',
              color: 'var(--aurora-text, #111827)',
            }}
          >
            {v.name}
          </span>
        ))}
        {extra > 0 ? (
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: '1px dashed rgba(0,0,0,0.18)',
              color: 'var(--aurora-text-secondary, rgba(17,24,39,0.7))',
            }}
          >
            +{extra}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onPreview}
          className="px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all hover:bg-black/5"
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.10)',
            color: 'var(--aurora-text, #111827)',
          }}
          title="Preview template"
        >
          <Eye size={14} />
          Preview
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--aurora-primary, #3B82F6)', color: '#ffffff' }}
          title="Add all areas from this template"
        >
          <Plus size={14} />
          Add Template
        </button>
      </div>
    </motion.div>
  )
}

function PreviewWidget({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: import('@/lib/icons').IconComponent
  children: ReactNode
}) {
  return (
    <UnifiedCard padding="md" fullHeight>
      <UnifiedCardHeader title={title} icon={Icon} />
      {children}
    </UnifiedCard>
  )
}
