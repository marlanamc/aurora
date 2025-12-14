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

use notify::{RecursiveMode, Watcher};
use notify_debouncer_full::{new_debouncer, DebouncedEvent};
// Debouncer prevents event spam
// When you save a file, your editor might trigger 10 events in 1 second
// The debouncer waits a bit and only notifies us once

use std::path::Path;
use std::sync::{mpsc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use crate::commands::FileInfo;

// ============================================================================
// FILE WATCHER SETUP
// ============================================================================

#[derive(Default)]
pub struct WatcherState {
    stop_tx: Mutex<Option<mpsc::Sender<()>>>,
}

fn stop_watching_inner(state: &WatcherState) {
    if let Ok(mut guard) = state.stop_tx.lock() {
        if let Some(tx) = guard.take() {
            let _ = tx.send(());
        }
    }
}

fn start_watching_inner(app_handle: AppHandle, watch_paths: Vec<String>) -> mpsc::Sender<()> {
    let (stop_tx, stop_rx) = mpsc::channel::<()>();

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
            move |result: Result<Vec<DebouncedEvent>, Vec<notify::Error>>| {
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
            let path_obj = Path::new(&path);

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

        // Keep the watcher alive until stop is requested.
        loop {
            match stop_rx.recv_timeout(Duration::from_secs(60)) {
                Ok(_) => break,
                Err(mpsc::RecvTimeoutError::Timeout) => {}
                Err(mpsc::RecvTimeoutError::Disconnected) => break,
            }
        }

        println!("👋 File watcher stopped");
    });

    stop_tx
}

#[tauri::command]
pub async fn watch_set_paths(
    app_handle: AppHandle,
    state: State<'_, WatcherState>,
    paths: Vec<String>,
) -> Result<(), String> {
    let mut watch_paths: Vec<String> = paths
        .into_iter()
        .map(|p| p.trim().to_string())
        .filter(|p| !p.is_empty())
        .collect();
    watch_paths.sort();
    watch_paths.dedup();

    stop_watching_inner(&state);

    if watch_paths.is_empty() {
        return Ok(());
    }

    let mut valid_paths: Vec<String> = Vec::new();
    for path in watch_paths {
        let path_obj = Path::new(&path);
        if !path_obj.is_absolute() {
            eprintln!("⚠️  Watch path must be absolute, skipping: {}", path);
            continue;
        }
        if !path_obj.exists() {
            eprintln!("⚠️  Watch path does not exist, skipping: {}", path);
            continue;
        }
        if !path_obj.is_dir() {
            eprintln!("⚠️  Watch path is not a directory, skipping: {}", path);
            continue;
        }
        valid_paths.push(path);
    }

    if valid_paths.is_empty() {
        return Err("No valid watch paths provided".to_string());
    }

    println!("👀 Starting file system watcher for: {:?}", valid_paths);
    let tx = start_watching_inner(app_handle, valid_paths);
    if let Ok(mut guard) = state.stop_tx.lock() {
        *guard = Some(tx);
    }

    Ok(())
}

#[tauri::command]
pub async fn watch_stop(state: State<'_, WatcherState>) -> Result<(), String> {
    stop_watching_inner(&state);
    Ok(())
}

// ============================================================================
// EVENT HANDLING
// ============================================================================

fn handle_file_event(app_handle: &AppHandle, event: DebouncedEvent) {
    // PATTERN MATCHING on event kind
    // Different event types require different actions

    // DebouncedEvent wraps the notify event with additional metadata
    use notify::EventKind;

    match event.event.kind {
        EventKind::Create(_) => {
            // New file created!
            println!("📝 File created: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Extract file metadata
            // 2. Insert into database
            // 3. Emit event to frontend to update UI

            if let Ok(mut conn) = crate::db::get_connection(app_handle) {
                for path in &event.paths {
                    if let Some(file_info) = path_to_file_info(path) {
                        let _ = crate::db::upsert_files(&mut conn, &[file_info]);
                    }
                }
            }

            // Emit to frontend
            let paths: Vec<String> = event.paths.iter()
                .map(|p| p.to_string_lossy().to_string())
                .collect();
            app_handle.emit("file-created", paths).ok();
            // .ok() converts Result to Option (we don't care if emit fails)
        }

        EventKind::Modify(_) => {
            // File modified!
            println!("✏️  File modified: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Update modified_at timestamp in database
            // 2. Regenerate thumbnail if needed
            // 3. Emit event to frontend

            if let Ok(mut conn) = crate::db::get_connection(app_handle) {
                for path in &event.paths {
                    if let Some(file_info) = path_to_file_info(path) {
                        let _ = crate::db::upsert_files(&mut conn, &[file_info]);
                    }
                }
            }

            let paths: Vec<String> = event.paths.iter()
                .map(|p| p.to_string_lossy().to_string())
                .collect();
            app_handle.emit("file-modified", paths).ok();
        }

        EventKind::Remove(_) => {
            // File deleted!
            println!("🗑️  File removed: {:?}", event.paths);

            // TODO in Phase 3:
            // 1. Remove from database
            // 2. Delete cached thumbnail
            // 3. Emit event to frontend

            if let Ok(conn) = crate::db::get_connection(app_handle) {
                for path in &event.paths {
                    let path_str = path.to_string_lossy().to_string();
                    let _ = crate::db::delete_file(&conn, &path_str);
                }
            }

            let paths: Vec<String> = event.paths.iter()
                .map(|p| p.to_string_lossy().to_string())
                .collect();
            app_handle.emit("file-removed", paths).ok();
        }

        _ => {
            // Other events (access, etc.) - we don't care about these for now
        }
    }
}

fn system_time_to_unix(time: std::time::SystemTime) -> i64 {
    time.duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn path_to_file_info(path: &Path) -> Option<FileInfo> {
    if !path.exists() || !path.is_file() {
        return None;
    }

    let metadata = std::fs::metadata(path).ok()?;
    let path_str = path.to_string_lossy().to_string();
    let name = path.file_name()?.to_string_lossy().to_string();
    let file_type = path.extension().map(|e| e.to_string_lossy().to_string()).unwrap_or_default();

    let created_at = metadata.created().ok().map(system_time_to_unix).unwrap_or(0);
    let modified_at = metadata.modified().ok().map(system_time_to_unix).unwrap_or(0);

    Some(FileInfo {
        id: None,
        path: path_str,
        name,
        file_type,
        size: metadata.len(),
        created_at,
        modified_at,
        last_opened_at: None,
        thumbnail_path: None,
        finder_tags: Vec::new(),
        finder_colors: Vec::new(),
    })
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
