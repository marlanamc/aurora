# Widget Recommendations & Improvements

## 📊 Current Widget Status

### ✅ Fully Functional Widgets
1. **Resurfacing (Remember This)** - ✅ Connected to DB, working well
2. **Emotional Worlds** - ✅ Real data from file scan
3. **Relevant Files** - ✅ Real filtering, works great
4. **File Spotlight** - ✅ Fully functional
5. **Brain Dump** - ✅ Persists to localStorage
6. **Monthly Calendar** - ✅ Works, no external data needed
7. **Recent Activity** - ✅ Real data from file scan
8. **Breathing Widget** - ✅ Fully functional, beautiful UI
9. **Affirmation Widget** - ✅ Works, but could be improved
10. **Pomodoro Widget** - ✅ Functional timer
11. **Scratchpad Widget** - ✅ Basic functionality

### ⚠️ Needs Improvement

#### 1. **Daily Quests** 🔴 High Priority
**Current State**: Component exists but "not wired yet" (no persistence)
**Issues**:
- No data persistence (quests reset on refresh)
- No connection to value-specific goals
- No completion tracking over time

**Recommendations**:
- Add persistence via `settings.widgetData`
- Connect to value-specific quest templates
- Add streak tracking
- Show completion history
- Allow custom quest creation per value

#### 2. **Heat Map** 🟡 Medium Priority
**Current State**: Works but too specific (job applications)
**Issues**:
- Hardcoded to "job applications" concept
- Not generic enough for other values
- Limited customization

**Recommendations**:
- Make it generic: "Momentum Tracker" or "Consistency Heat Map"
- Allow custom labels (e.g., "Worked on Projects", "Exercised", "Applied")
- Support multiple trackers per value
- Add goal setting (e.g., "3x per week")
- Visual improvements: better color gradients, hover details

#### 3. **Resistance Selector** 🟡 Medium Priority
**Current State**: Uses mock data, no persistence
**Issues**:
- Actions are static/hardcoded
- No tracking of which actions help
- No personalization

**Recommendations**:
- Add action effectiveness tracking
- Allow users to customize micro-actions
- Track which resistance types appear most
- Add "favorite actions" that worked before
- Connect to Daily Quests (suggest quests based on resistance)

#### 4. **Weekly Calendar** 🟡 Medium Priority
**Current State**: Requires manual data entry
**Issues**:
- No integration with Apple Calendar
- Manual entry only
- Limited functionality

**Recommendations**:
- Integrate with Apple Calendar (already have the API!)
- Show both Apple Calendar events + user intentions
- Add quick intention setting (drag to create)
- Color-code by value/category
- Add week-over-week comparison

#### 5. **Affirmation Widget** 🟢 Low Priority
**Current State**: Works but basic
**Issues**:
- Static quote list
- No personalization
- No value-specific affirmations

**Recommendations**:
- Allow custom affirmations per value
- Add value-specific quote sets
- Track which affirmations resonate
- Add daily rotation with persistence
- Connect to resistance types

## 🆕 Missing Widgets (High Value)

### 1. **Apple Calendar Widget** 🔴 High Priority
**Why**: You already have the integration! Just need to expose it as a widget.
**Features**:
- Today's events (already working in sidebar)
- Upcoming events (next 7 days)
- Week view with calendar events
- Quick event creation (opens Calendar app)
- Value-based event filtering (if events have tags/notes)

**Implementation**: 
- Extract `AppleCalendarAgenda` into a widget
- Add to widget registry
- Make it configurable (today vs week view)

### 2. **Quick Search Widget** 🔴 High Priority
**Why**: Global search exists but not as a widget
**Features**:
- Compact search bar
- Recent searches
- Quick filters (by type, date, tag)
- Value-specific search
- Search suggestions

**Implementation**:
- Create `QuickSearchWidget` component
- Connect to existing `dbSearchFiles` command
- Add search history to `settings.widgetData`

### 3. **File Type Breakdown** 🟡 Medium Priority
**Why**: Visual insight into what you're working with
**Features**:
- Pie chart or bar chart of file types
- Counts by extension (PDFs, images, code, etc.)
- Size breakdown
- Recent additions by type
- Value-specific breakdown

**Implementation**:
- Analyze `files` array
- Group by `file_type`
- Use a simple chart library or custom SVG
- Add to discovery category

### 4. **Energy/Mood Tracker** 🟡 Medium Priority
**Why**: ADHD brains benefit from tracking energy patterns
**Features**:
- Simple 1-5 energy scale
- Quick log (morning/afternoon/evening)
- Weekly pattern visualization
- Connect to file activity (high energy = more files opened?)
- Value-specific energy tracking

**Implementation**:
- Simple logging interface
- Store in `settings.widgetData`
- Basic chart visualization
- Add to regulation category

### 5. **Habit Tracker** 🟡 Medium Priority
**Why**: More flexible than heat map, supports multiple habits
**Features**:
- Multiple habits per value
- Custom frequency (daily, weekly, etc.)
- Visual progress (checkmarks, streaks)
- Reminders/notifications
- Habit templates

**Implementation**:
- Similar to heat map but more flexible
- Store in `settings.widgetData`
- Add templates for common habits
- Connect to Daily Quests

### 6. **Quick Capture Widget** 🟢 Low Priority
**Why**: ADHD brains need quick capture for ideas
**Features**:
- One-line quick notes
- Voice-to-text (future)
- Auto-categorize by value
- Convert to Brain Dump or file
- Keyboard shortcut integration

**Implementation**:
- Simple text input
- Store in `settings.widgetData`
- Add "convert to..." actions
- Keyboard shortcut (Cmd+N?)

### 7. **Storage Usage Widget** 🟢 Low Priority
**Why**: Visual understanding of disk usage
**Features**:
- Total indexed files size
- Breakdown by folder/scan source
- Largest files list
- Storage trends over time
- Cleanup suggestions

**Implementation**:
- Calculate from `files` array
- Group by scan source
- Sort by size
- Add to discovery category

### 8. **Tag Cloud Widget** 🟢 Low Priority
**Why**: Visual discovery of file tags
**Features**:
- Visual tag cloud (size = frequency)
- Click to filter files
- Most used tags
- Value-specific tags
- Tag suggestions

**Implementation**:
- Analyze `files` for `finder_tags`
- Create visual cloud
- Connect to file filtering
- Add to discovery category

### 9. **Time Tracker Widget** 🟢 Low Priority
**Why**: Track time spent on value-specific work
**Features**:
- Simple start/stop timer
- Track time per value
- Daily/weekly totals
- Connect to Pomodoro widget
- Export time logs

**Implementation**:
- Timer component
- Store in `settings.widgetData`
- Basic time aggregation
- Add to momentum category

### 10. **Goal Progress Widget** 🟢 Low Priority
**Why**: Visual progress toward value-specific goals
**Features**:
- Set goals per value
- Progress bars/circles
- Milestone tracking
- Connect to Daily Quests completion
- Celebration animations

**Implementation**:
- Goal setting interface
- Progress calculation
- Store in `settings.widgetData`
- Connect to quest completion
- Add to momentum category

## 🎨 UI/UX Improvements

### Widget Consistency
- **Issue**: Some widgets use different card styles
- **Fix**: Ensure all use `UnifiedCard` component consistently

### Widget Loading States
- **Issue**: Some widgets don't show loading states
- **Fix**: Add skeleton loaders for async widgets

### Widget Empty States
- **Issue**: Some widgets show nothing when empty
- **Fix**: Add helpful empty states with CTAs

### Widget Error Handling
- **Issue**: Errors aren't handled gracefully
- **Fix**: Add error boundaries and user-friendly messages

### Widget Customization
- **Issue**: Limited customization options
- **Fix**: Add settings per widget (colors, sizes, data ranges)

## 📈 Priority Recommendations

### Phase 1 (Quick Wins)
1. ✅ **Apple Calendar Widget** - Extract existing component
2. ✅ **Daily Quests Persistence** - Wire up localStorage
3. ✅ **Heat Map Genericization** - Make it configurable

### Phase 2 (Medium Effort)
4. ✅ **Quick Search Widget** - Create new component
5. ✅ **Resistance Selector Tracking** - Add persistence
6. ✅ **Weekly Calendar Integration** - Connect to Apple Calendar

### Phase 3 (Nice to Have)
7. ✅ **File Type Breakdown** - New visualization
8. ✅ **Energy Tracker** - New widget
9. ✅ **Habit Tracker** - Enhanced heat map

## 🔧 Technical Improvements

### Widget Data Management
- **Current**: Mixed storage (localStorage, in-memory, DB)
- **Recommendation**: Standardize on `settings.widgetData` with schema

### Widget Performance
- **Issue**: Some widgets re-render unnecessarily
- **Fix**: Add React.memo, useMemo where needed

### Widget Testing
- **Issue**: No widget tests
- **Fix**: Add basic component tests

### Widget Documentation
- **Issue**: Widget behavior not documented
- **Fix**: Add JSDoc comments, usage examples

## 💡 Creative Ideas

1. **Widget Templates**: Pre-configured widget sets per value type
2. **Widget Marketplace**: Share widget configurations
3. **Widget Automation**: Auto-add widgets based on file patterns
4. **Widget Insights**: Analytics on widget usage
5. **Widget Shortcuts**: Keyboard shortcuts to focus on specific widgets
