# **Aurora OS ✨**

*A visual memory layer and behavior engine for ADHD, built on top of your Mac.*

Aurora OS reimagines your file system as something alive, visible, and emotionally intuitive. Instead of losing files in deep folder hierarchies or forgetting projects that mattered, Aurora brings your digital world back into view using color, context, emotional metadata, resurfacing, and micro-behavior loops.

This is not a prettier Finder.
It is a **cognitive scaffold** designed for how ADHD brains store, recall, and act on information.

---

## 🌈 **What Is Aurora OS?**

Aurora OS transforms your existing Mac directories into a dynamic, visually rich dashboard that mirrors the way ADHD memory actually works. Your files appear as tiles, clusters, emotional worlds, resurfaced memories, and ongoing quests that reinforce momentum.

It’s part Finder, part memory prosthetic, part motivational engine.

---

## ✨ **Core Features (MVP)**

### **1. File Indexing Engine**

Automatically scans selected directories and stores metadata, thumbnails, tags, and timestamps.

### **2. Visual Tile Home Screen**

Files become large, colorful, glanceable tiles instead of text rows.

### **3. “Remember This?” Resurfacing Engine**

Daily resurfacing of forgotten or seasonally relevant files, using:

* Forgotten Score
* Seasonal Echo
* Random Delight triggers

### **4. Emotional Metadata Layer**

Files can hold emotional tags (mood, season, vibe, place).
Your brain remembers emotion before filename—Aurora uses that.

### **5. Recency Feed**

A clean sidebar showing your latest file interactions.

### **6. Visual Clusters**

Not folder-based, but meaning-based:

* In Progress
* Ideas I Started
* Unfinished Projects
* Downloads I Forgot

### **7. Finder-Compatible**

Open any tile directly in Finder or its default application.

### **8. Apple Calendar (Read-only, macOS)**

Aurora can display your **today** events from Apple Calendar inside the app. The first time you load it, macOS will ask for **Automation** permission to allow Aurora to control Calendar (read-only is enforced by Aurora by not writing any events).

---

## 🧠 **Vision Features (Coming Soon)**

These aren’t included in MVP but guide the design philosophy.

### **• Core Values Mapping**

Tie daily micro-actions to values like *Financial Stability*, *Law School*, *Peace*, or *Leaving Hospitality*.

### **• Application Heat Map**

A visual behavior tracker for job applications or other daily habits.

### **• Resistance Selector**

Choose: Overwhelm, Fear, Boredom, Paralysis, Imposter Syndrome.
Aurora responds with a micro-action tailored to your emotional state.

These form the backbone of Aurora as a **behavior engine**.

---

## 🛠️ **Tech Stack**

* **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion
* **Desktop Shell:** Tauri 2.0 (Rust)
* **Database:** SQLite + FTS5 for full-text search
* **Design:** macOS-inspired visual language

---

## 🚀 **Getting Started**

> **New to Aurora?** Check out [USER_GUIDE.md](./USER_GUIDE.md) for a complete user guide with step-by-step instructions, tips, and troubleshooting.

### **Prerequisites**

#### 1. Rust (required for Tauri)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### 2. Node.js (v18+)

Download from [https://nodejs.org/](https://nodejs.org/)

#### 3. Xcode Command Line Tools

```bash
xcode-select --install
```

---

## 📦 **Installation**

Clone the repo, then install dependencies:

```bash
npm install
```

Install the Tauri CLI:

```bash
cargo install tauri-cli@^2.0.0
```

---

## 🧪 **Development**

Run Aurora in dev mode:

```bash
npm run tauri:dev
```

This boots:

* Next.js frontend at `http://localhost:3000`
* Rust backend
* The Aurora OS desktop shell

---

## 🏗️ **Build for Production**

```bash
npm run tauri:build
```

Your macOS app bundle will appear in:

```
src-tauri/target/release/bundle/
```

---

## 📁 **Project Structure**

```
aurora/
├── src/                          
│   ├── app/                      
│   │   ├── layout.tsx           
│   │   ├── page.tsx             
│   │   └── globals.css          
│   ├── components/               
│   │   ├── FileGrid.tsx         
│   │   ├── FileTile.tsx         
│   │   ├── ResurfaceCarousel.tsx 
│   │   └── RecentsPanel.tsx     
│   └── lib/
│       └── tauri.ts             
├── src-tauri/                    
│   ├── src/
│   │   ├── main.rs              
│   │   ├── commands.rs          
│   │   ├── db.rs                
│   │   └── file_watcher.rs      
│   ├── Cargo.toml               
│   └── tauri.conf.json          
└── tailwind.config.js           
```

---

## 🧩 **How Aurora Works**

### **Rust ↔ JS Bridge**

Tauri exposes Rust functions to the frontend via commands.

**JavaScript:**

```ts
import { invoke } from '@tauri-apps/api/core'

await invoke('scan_directories', {
  directories: ['/Users/me/Documents']
})
```

**Rust:**

```rust
#[tauri::command]
pub async fn scan_directories(dirs: Vec<String>) -> Result<Vec<FileInfo>, String> {
  // ...scan and return
}
```

---

## 📡 **Real-Time File Watching**

Aurora uses macOS FSEvents (via `notify` crate) to track:

* File creation
* Deletion
* Renames
* Tag changes

These updates instantly push to the UI.

No polling. No refresh button.

---

## 🗄️ **Database Schema (Simplified)**

SQLite tables:

* `files` — canonical file metadata
* `file_metadata` — emotional tags, resurfacing scores
* `clusters` — visual groupings
* `finder_tags` — macOS tags
* `files_fts` — searchable index (FTS5)

---

## 🛣️ **Development Roadmap**

* [x] Project setup & architecture
* [ ] SQLite schema & migrations
* [ ] Indexing engine
* [ ] Real-time file watching
* [ ] File tile grid
* [ ] Resurfacing logic
* [ ] Emotional metadata UI
* [ ] Search & performance
* [ ] macOS polish
* [ ] Packaging & distribution

---

## 📘 Learning Resources

### **Rust Essentials**

* Ownership & borrowing
* `Result<T, E>` for errors
* `Option<T>` for nullable values
* Pattern matching
* Async/await

### **Tauri Concepts**

* Commands
* Events
* Plugins
* State management

---

## 🧰 Troubleshooting

### Rust not found

```bash
source $HOME/.cargo/env
```

### File access issues

Enable Full Disk Access:
**System Settings → Privacy & Security → Full Disk Access**

### Build errors

Update Xcode tools:

```bash
xcode-select --install
```

---

## 🤝 Contributing

This is an ADHD-native personal tool, but forks and PRs are welcome.

---

## ❤️ Built for ADHD Brains

Aurora is based on cognitive principles that make information stick:

* Visual memory over text
* Movement over lists
* Emotion over category
* Serendipity over discipline
* Resurfacing over searching

Your files don’t disappear here.
Your ideas don’t die here.
Nothing gets lost.
