// RUST LEARNING GUIDE FOR AURORA OS
// This file is the entry point for your Tauri app's Rust backend

// ============================================================================
// RUST BASICS YOU'LL SEE HERE:
// ============================================================================
// 1. "use" = "import" in JavaScript
// 2. "::" = accessing things inside modules (like "." in JS)
// 3. "#[...]" = attributes/decorators (metadata about code)
// 4. "fn" = function keyword
// 5. "->" = return type (fn name() -> ReturnType)
// 6. "!" at end of macro = it's a macro, not a function (code generation)
// ============================================================================

// Prevent console window on Windows (not needed for macOS, but good practice)
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// ============================================================================
// IMPORTS (like "import" in JavaScript)
// ============================================================================

// These are module declarations - we're telling Rust about other files
// "mod" creates a module (like a namespace)
mod commands;  // This will contain our Tauri commands (Rust functions callable from JS)
mod db;        // Database operations
mod file_watcher;  // File system watching

// "use" imports items from modules or crates
// Think of it like: import { something } from 'somewhere'

// ============================================================================
// MAIN FUNCTION - Your App Starts Here!
// ============================================================================

fn main() {
    // In Rust, functions return the last expression (no "return" keyword needed)
    // The ? operator means: "if this fails, return the error, otherwise continue"
    // It's like try/catch but more elegant!

    tauri::Builder::default()
        // ====================================================================
        // TAURI BUILDER PATTERN
        // ====================================================================
        // Rust loves the "builder pattern" - chaining methods to configure something
        // Each method returns "self" so you can keep chaining
        // Just like: fetch(url).then().then().catch() in JavaScript

        // Register Tauri plugins (pre-built functionality)
        .plugin(tauri_plugin_fs::init())      // File system access
        .plugin(tauri_plugin_sql::Builder::default().build())  // SQLite database
        .plugin(tauri_plugin_opener::init())  // Open files in Finder/apps
        .plugin(tauri_plugin_shell::init())   // Run shell commands

        // ====================================================================
        // SETUP HOOK - Runs once when app starts
        // ====================================================================
        // The |app| syntax is a closure (like arrow functions in JS)
        // Think of it as: (app) => { ... }
        .setup(|app| {
            // Get the app handle - this lets us interact with the Tauri app
            // In Rust, we often need to clone() things because of ownership rules
            // Don't worry about this for now - just know clone() creates a copy
            let app_handle = app.handle().clone();

            // Initialize the database when the app starts
            // spawn() runs this on a separate thread so it doesn't block the UI
            // Like Promise.all() or async/await in JavaScript
            tauri::async_runtime::spawn(async move {
                // RUST OWNERSHIP CONCEPT:
                // "move" means: move ownership of app_handle into this closure
                // It's like saying "this closure now owns app_handle"

                match db::init_database(&app_handle).await {
                    // RUST PATTERN MATCHING:
                    // "match" is like switch/case but way more powerful
                    // It checks all possible outcomes of a Result (Ok or Err)

                    Ok(_) => println!("✅ Database initialized successfully"),
                    // println! is a macro (note the !) that prints to console
                    // It's like console.log() in JavaScript

                    Err(e) => eprintln!("❌ Failed to initialize database: {}", e),
                    // eprintln! prints to stderr (error output)
                    // {} is a placeholder (like ${e} in JS template literals)
                }
            });

            // Start watching file system for changes
            tauri::async_runtime::spawn(async move {
                // We'll implement this in the file_watcher module
                file_watcher::start_watching(app_handle).await;
            });

            // RUST RESULT TYPE:
            // Functions often return Result<T, E>
            // T = success type, E = error type
            // We return Ok(()) which means "success with no value"
            // () is Rust's empty type (like void in TypeScript)
            Ok(())
        })

        // ====================================================================
        // INVOKE HANDLERS - Register your Rust functions
        // ====================================================================
        // This is THE KEY to Tauri:
        // Functions listed here can be called from your Next.js frontend
        // They form the API between JavaScript and Rust

        .invoke_handler(tauri::generate_handler![
            // We'll add our commands here as we build them
            // Each function will be callable from JS like:
            // import { invoke } from '@tauri-apps/api/core'
            // invoke('function_name', { args })

            commands::greet,  // Example command we'll create
            commands::scan_directories,
            commands::get_all_files,
            commands::get_finder_tags,
            commands::generate_thumbnail,
            commands::update_file_metadata,
            commands::search_files,
        ])

        // Build and run the app!
        // expect() is like try/catch - if it fails, crash with this message
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            // Event handler - runs for app lifecycle events
            // We can handle things like app closing, file drops, etc.
            // For now, we'll just match on events we care about
            match event {
                tauri::RunEvent::ExitRequested { api, .. } => {
                    // App is about to close
                    // We could save state, clean up, etc.
                    println!("👋 Aurora OS closing...");
                }
                _ => {}  // _ means "match anything else" (like default: in switch)
            }
        });
}

// ============================================================================
// RUST CONCEPTS SUMMARY FOR THIS FILE:
// ============================================================================
//
// 1. MODULES (mod/use): Organize code into separate files
//    - "mod name" declares a module
//    - "use path" imports items
//
// 2. OWNERSHIP & BORROWING:
//    - Rust tracks who "owns" each piece of data
//    - Only one owner at a time (prevents bugs!)
//    - "clone()" creates a copy
//    - "move" transfers ownership
//
// 3. RESULT TYPE:
//    - Result<T, E> represents success (Ok) or failure (Err)
//    - The ? operator propagates errors up
//    - match lets you handle both cases
//
// 4. ASYNC/AWAIT:
//    - Similar to JavaScript!
//    - "async fn" returns a Future
//    - "await" waits for the Future
//    - tauri::async_runtime::spawn() runs tasks concurrently
//
// 5. MACROS:
//    - End with ! (println!, invoke_handler!)
//    - They generate code at compile time
//    - More powerful than functions
//
// 6. ATTRIBUTES (#[...]):
//    - Metadata about code
//    - Like decorators in TypeScript
//    - #[tauri::command] makes a function callable from JS
//
// ============================================================================
//
// Next, we'll create the "commands" module where you'll write functions
// that your Next.js frontend can call!
//
// ============================================================================
