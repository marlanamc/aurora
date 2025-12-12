// ============================================================================
// FILE WATCHER MODULE - Real-time file system monitoring
// ============================================================================
//
// HOW IT WORKS:
// macOS has a system called FSEvents (File System Events)
// It notifies apps when files change, are created, moved, or deleted
// This is MUCH more efficient than constantly re-scanning directories!
//
// The "notify" crate gives us cross-platform access to FSEvents
//
// ============================================================================

use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher, Event, EventKind};
use notify_debouncer_full::{new_debouncer, Debouncer, FileIdMap};
// Debouncer prevents event spam
// When you save a file, your editor might trigger 10 events in 1 second
// The debouncer waits a bit and only notifies us once

use std::path::Path;
use std::time::Duration;
use tauri::{AppHandle, Manager};

// ============================================================================
// FILE WATCHER SETUP
// ============================================================================

pub async fn start_watching(app_handle: AppHandle) {
    println!("👀 Starting file system watcher...");

    // The directories we want to watch (from your requirements)
    let watch_paths = vec![
        "/Users/marlanacreed/Downloads/Projects",
        "/Users/marlanacreed/Documents/My Folders",
    ];

    // RUST ASYNC PATTERN:
    // Spawn this on a separate thread so it doesn't block
    // Like running a background worker in JavaScript
    tokio::task::spawn_blocking(move || {
        // "move" captures app_handle by value (takes ownership)

        // Create a debouncer
        // Debounce for 2 seconds (wait 2s after last event before notifying)
        let mut debouncer = match new_debouncer(
            Duration::from_secs(2),  // Wait time
            None,  // No separate queue thread
            move |result: Result<Vec<Event>, Vec<notify::Error>>| {
                // CLOSURE (like arrow function in JS):
                // This runs whenever file events happen

                match result {
                    Ok(events) => {
                        // Process the events
                        for event in events {
                            handle_file_event(&app_handle, event);
                        }
                    }
                    Err(errors) => {
                        for error in errors {
                            eprintln!("❌ File watch error: {:?}", error);
                        }
                    }
                }
            },
        ) {
            Ok(debouncer) => debouncer,
            Err(e) => {
                eprintln!("❌ Failed to create file watcher: {}", e);
                return;
            }
        };

        // Watch each directory recursively
        for path in watch_paths {
            let path_obj = Path::new(path);

            if !path_obj.exists() {
                eprintln!("⚠️  Path does not exist: {}", path);
                continue;
            }

            match debouncer.watcher().watch(path_obj, RecursiveMode::Recursive) {
                // RecursiveMode::Recursive means: watch this directory AND all subdirectories

                Ok(_) => println!("✅ Watching: {}", path),
                Err(e) => eprintln!("❌ Failed to watch {}: {}", path, e),
            }
        }

        println!("👀 File watcher active!");

        // Keep the watcher alive
        // Without this, the watcher would be dropped and stop working
        // In Rust, when a value goes out of scope, it's dropped (deallocated)
        loop {
            std::thread::sleep(Duration::from_secs(60));
            // Sleep for 60 seconds, then loop again
            // This keeps the thread (and watcher) alive
        }
    });
}

// ============================================================================
// EVENT HANDLING
// ============================================================================

fn handle_file_event(app_handle: &AppHandle, event: Event) {
    // PATTERN MATCHING on event kind
    // Different event types require different actions

    match event.kind {
        EventKind::Create(_) => {
            // New file created!
            println!("📝 File created: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Extract file metadata
            // 2. Insert into database
            // 3. Emit event to frontend to update UI

            // Emit to frontend
            app_handle.emit("file-created", event.paths.clone()).ok();
            // .ok() converts Result to Option (we don't care if emit fails)
        }

        EventKind::Modify(_) => {
            // File modified!
            println!("✏️  File modified: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Update modified_at timestamp in database
            // 2. Regenerate thumbnail if needed
            // 3. Emit event to frontend

            app_handle.emit("file-modified", event.paths.clone()).ok();
        }

        EventKind::Remove(_) => {
            // File deleted!
            println!("🗑️  File removed: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Remove from database
            // 2. Delete cached thumbnail
            // 3. Emit event to frontend

            app_handle.emit("file-removed", event.paths.clone()).ok();
        }

        _ => {
            // Other events (access, etc.) - we don't care about these for now
        }
    }
}

// ============================================================================
// TAURI EVENTS - Sending data to frontend
// ============================================================================
//
// EVENTS are one-way messages from Rust -> JavaScript
// They're different from COMMANDS (which are JavaScript -> Rust)
//
// In your Next.js app, you can listen for events like:
//
// import { listen } from '@tauri-apps/api/event'
//
// listen('file-created', (event) => {
//   console.log('New file:', event.payload)
//   // Update your UI!
// })
//
// This is perfect for real-time updates without polling!
//
// ============================================================================

// ============================================================================
// RUST CONCEPTS IN THIS FILE:
// ============================================================================
//
// 1. CLOSURES: |parameters| { body }
//    - Like arrow functions in JavaScript
//    - Can capture variables from outer scope
//    - "move" keyword transfers ownership into closure
//
// 2. THREADING:
//    - tokio::task::spawn_blocking() runs code on a thread pool
//    - std::thread::sleep() pauses the thread
//    - Prevents blocking the main UI thread
//
// 3. PATTERN MATCHING:
//    - match lets you handle different event types
//    - EventKind::Create vs EventKind::Modify, etc.
//
// 4. OWNERSHIP & BORROWING:
//    - app_handle.clone() creates a new reference
//    - "move" in closure takes ownership
//    - This is Rust's way of ensuring thread safety!
//
// 5. LIFETIMES:
//    - Variables must outlive their references
//    - The loop keeps the debouncer alive
//    - Otherwise it would be "dropped" (deallocated)
//
// 6. EVENTS:
//    - app_handle.emit() sends events to frontend
//    - Payload can be any serializable type
//    - Frontend listens with @tauri-apps/api/event
//
// ============================================================================
//
// NEXT STEPS:
// In Phase 3, we'll connect these events to actual database operations
// For now, they just log and emit to frontend
//
// ============================================================================
