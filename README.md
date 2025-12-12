# Aurora OS 🌟

A dynamic, ADHD-native "living Finder" that keeps your files visible, memorable, and emotionally anchored.

## What is Aurora OS?

Aurora OS is a visual memory layer that sits on top of your existing Mac file system. It transforms your everyday files into an interactive, colorful, dynamic dashboard that matches the way your ADHD brain actually stores and retrieves information.

### Key Features (MVP)

1. **File Indexing Engine** - Automatically scans and indexes your selected directories
2. **Tile-Based Home Screen** - Large, visual tiles representing your files
3. **Daily Resurfacing** - "Remember This?" carousel shows forgotten files
4. **Emotional Metadata** - Tag files with mood, season, vibe, location
5. **Recents Feed** - Always see your latest activity
6. **Tile Clusters** - Visual groupings like "Ideas I Started", "In Progress"
7. **Direct Finder Integration** - Click to open in Finder or default app

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Desktop**: Tauri 2.0 (Rust)
- **Database**: SQLite with FTS5 (full-text search)
- **Styling**: macOS-native design language

## Getting Started

### Prerequisites

1. **Rust** (for Tauri backend)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

2. **Node.js** (v18 or higher)
   - Download from https://nodejs.org/

3. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

### Installation

1. Clone this repository (or you're already here!)

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Install Tauri CLI:
   ```bash
   cargo install tauri-cli@^2.0.0
   ```

### Development

Run the development server:

```bash
npm run tauri:dev
```

This will:
- Start the Next.js frontend (http://localhost:3000)
- Compile the Rust backend
- Launch the Aurora OS desktop app

### Building for Production

```bash
npm run tauri:build
```

The built app will be in `src-tauri/target/release/bundle/`

## Project Structure

```
aurora/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/               # React components
│   │   ├── FileGrid.tsx         # Virtual grid of file tiles
│   │   ├── FileTile.tsx         # Individual file tile
│   │   ├── ResurfaceCarousel.tsx # Daily resurfacing UI
│   │   └── RecentsPanel.tsx     # Recent files sidebar
│   └── lib/
│       └── tauri.ts             # Tauri API utilities
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # App entry point
│   │   ├── commands.rs          # Tauri commands (callable from JS)
│   │   ├── db.rs                # SQLite database
│   │   └── file_watcher.rs      # File system monitoring
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── package.json
├── next.config.js               # Next.js config (SSG mode)
└── tailwind.config.js           # Tailwind config (macOS theme)
```

## How It Works

### Rust ↔ JavaScript Bridge

Aurora uses Tauri to create a bridge between Rust (backend) and Next.js (frontend):

1. **Rust Commands**: Functions marked with `#[tauri::command]` can be called from JavaScript
2. **Invoke**: Frontend calls `invoke('command_name', { args })` to execute Rust code
3. **Events**: Rust emits events like `file-created` that the frontend can listen to

Example:

```typescript
// JavaScript (Next.js)
import { invoke } from '@tauri-apps/api/core'

const files = await invoke('scan_directories', {
  directories: ['/Users/you/Documents']
})
```

```rust
// Rust (Tauri)
#[tauri::command]
pub async fn scan_directories(directories: Vec<String>) -> Result<Vec<FileInfo>, String> {
  // Scan files and return results
}
```

### File Watching

Aurora uses macOS FSEvents (via the `notify` Rust crate) to monitor file changes in real-time:
- When files are created, modified, or deleted
- Aurora automatically updates the database
- The frontend receives events and updates the UI

No polling. No manual refreshing. Just live updates.

### Database Schema

SQLite stores:
- **files** - All indexed files with metadata
- **finder_tags** - macOS Finder tags
- **file_tags** - Many-to-many relationship
- **file_metadata** - Your emotional tags (mood, season, vibe)
- **clusters** - Visual groupings
- **files_fts** - Full-text search index (FTS5)

## Development Roadmap

- [x] **Phase 1**: Environment setup & project structure
- [ ] **Phase 2**: SQLite database implementation
- [ ] **Phase 3**: File indexing engine
- [ ] **Phase 4**: macOS-native tile grid UI
- [ ] **Phase 5**: macOS deep integration (tags, thumbnails)
- [ ] **Phase 6**: Resurfacing algorithms
- [ ] **Phase 7**: Emotional metadata & clustering
- [ ] **Phase 8**: Search & performance optimization
- [ ] **Phase 9**: Polish & animations
- [ ] **Phase 10**: Testing & distribution

## Learning Resources

### Rust Concepts
- **Ownership**: Rust tracks who owns each piece of data
- **Borrowing**: `&variable` lets you "borrow" without taking ownership
- **Result Type**: `Result<T, E>` for error handling (no exceptions!)
- **Option Type**: `Option<T>` for nullable values
- **Pattern Matching**: `match` for handling all cases
- **Async/Await**: Similar to JavaScript promises

### Tauri Concepts
- **Commands**: Rust functions callable from JavaScript
- **Events**: One-way messages from Rust → JavaScript
- **Plugins**: Pre-built functionality (fs, sql, opener)
- **State**: Shared state across the app

## Troubleshooting

### "Command not found: cargo"
Make sure Rust is in your PATH:
```bash
source $HOME/.cargo/env
```

### Permission errors when accessing files
Aurora needs Full Disk Access. Go to:
**System Settings > Privacy & Security > Full Disk Access**
Add Aurora OS to the list.

### Build errors
Make sure you have the latest Xcode Command Line Tools:
```bash
xcode-select --install
```

## Contributing

This is a personal project, but feel free to fork and adapt for your own needs!

## License

MIT

---

**Built with ❤️ for ADHD brains**

Aurora OS is designed around how your brain actually works:
- Visual memory > text lists
- Movement > static pages
- Emotion > category
- Serendipity > discipline
