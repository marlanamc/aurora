# Widget Inventory (Aurora)

This repo currently has a per-Value “widget dashboard” (customizable per value) plus a right-side “Global panel”.

## Widget framework

- Widget registry + defaults: `src/lib/widgets.ts`
- Per-value layout persistence: `src/lib/settings.ts` (`settings.valueLayouts`, saved to localStorage)
- Widget dashboard renderer + picker + edit/reorder: `src/components/ValueDashboard.tsx`

## Dashboard widgets (available in the widget picker)

| Widget | Type ID | Component | Default span | Default enabled | Data source | Status |
|---|---|---|---:|---|---|---|
| Momentum Heat Map | `heatmap` | `src/components/JobApplicationHeatMap.tsx` + `src/components/ValueDashboard.tsx` (`HeatMapWidget`) | 1 | `work`, `money` | localStorage (`settings.widgetData`) | Data entry (+1 log) |
| Daily Quests | `daily-quests` | `src/components/DailyQuestSystem.tsx` | 1 | All except `learning` | (Not wired yet) | Clean empty state |
| Resistance Selector | `resistance-selector` | `src/components/ResistanceBreaker.tsx` | 2 | All values | In-memory config | Mock data |
| Resurfacing (“Remember This?”) | `remember-this` | `src/components/ValueDashboard.tsx` (`RememberThisWidget`) | 2 | All except `learning` | `dbGetResurfacedFiles(3)` | Real DB hook-up |
| Emotional Worlds | `emotional-worlds` | `src/components/ActiveClustersSection.tsx` | 2 | All values | Finder tags / parent folders | Real (derived from scan) |
| Relevant Files | `relevant-files` | `src/components/ValueDashboard.tsx` (`RelevantFilesWidget`) | 2 | All values | `filterFilesForValue` + `openFile` | Real filtering, depends on scan |
| Brain Dump | `brain-dump` | `src/components/ValueDashboard.tsx` (`BrainDumpWidget`) | 2 | `learning`, `support` | localStorage (`settings.brainDumps`) | Real persistence |
| Weekly Calendar | `weekly-calendar` | `src/components/WeeklyCalendar.tsx` + `src/components/ValueDashboard.tsx` (`WeeklyCalendarWidget`) | 1 | Off by default | localStorage (`settings.widgetData`) | Data entry (intention + list) |
| Monthly Calendar | `monthly-calendar` | `src/components/MonthlyCalendar.tsx` | 1 | `__homebase__` only | Client date math | Real (no external data) |
| Recent Activity | `recent-activity` | `src/components/RecentActivitySidebar.tsx` | 2 | `__homebase__` only | Uses `files` list (from DB scan) | Real (depends on scan) |

## Global panel (also available as widgets)

The right-side Global panel is rendered in `src/app/page.tsx` and currently includes:
- `src/components/MonthlyCalendar.tsx`
- `src/components/RecentActivitySidebar.tsx`

These are also addable to a Value dashboard via the widget picker.

## Supporting UI components (building blocks)

- Card + header wrapper used throughout: `src/components/UnifiedCard.tsx`
- Settings UI (themes, values, scan sources, feature toggles): `src/components/SettingsModal.tsx`
- Value selection UI: `src/components/ValuesIntegration.tsx`

## Widget-adjacent / unused components (present in repo)

These exist as components but are not currently part of the widget registry:
- `src/components/FileGrid.tsx`, `src/components/FileTile.tsx`
- `src/components/ClusterTile.tsx`
- `src/components/RecentsPanel.tsx`
- `src/components/ResurfaceCarousel.tsx`
- `src/components/ResurfacedFileCard.tsx`
- `src/components/RememberThisSection.tsx`
- `src/components/QuestRewardAnimation.tsx` (used by `DailyQuestSystem`)
