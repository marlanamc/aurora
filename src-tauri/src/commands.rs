// ============================================================================
// TAURI COMMANDS - Rust functions callable from JavaScript!
// ============================================================================
//
// HOW IT WORKS:
// 1. Write a Rust function with #[tauri::command]
// 2. Register it in main.rs with invoke_handler!
// 3. Call it from Next.js using invoke('function_name', { args })
//
// EXAMPLE:
// Rust:  #[tauri::command] fn greet(name: String) -> String { ... }
// JS:    const result = await invoke('greet', { name: 'Aurora' })
//
// ============================================================================

use serde::{Deserialize, Serialize};
// Serde is THE library for JSON in Rust
// Serialize: Rust type -> JSON (for sending to frontend)
// Deserialize: JSON -> Rust type (for receiving from frontend)

use std::path::Path;
// Path is for working with file system paths

use walkdir::WalkDir;
// For recursively walking through directories

// ============================================================================
// DATA STRUCTURES (Types)
// ============================================================================
//
// In Rust, you define types with "struct" (like TypeScript interfaces)
// #[derive(...)] automatically implements common functionality
//

/// Represents a file in Aurora's system
#[derive(Debug, Clone, Serialize, Deserialize)]
// Debug: lets you print it with println!("{:?}", file)
// Clone: lets you create copies
// Serialize/Deserialize: converts to/from JSON for Tauri
pub struct FileInfo {
    // "pub" means public (accessible from other modules)
    // Like "export" in TypeScript

    pub id: Option<i64>,        // Option<T> means "might be None" (like null/undefined)
    pub path: String,            // File path
    pub name: String,            // File name
    pub file_type: String,       // Extension (.pdf, .jpg, etc.)
    pub size: u64,               // File size in bytes (u64 = unsigned 64-bit integer)
    pub created_at: i64,         // Unix timestamp
    pub modified_at: i64,        // Unix timestamp
    pub last_opened_at: Option<i64>,  // Might not have opened it yet
    pub thumbnail_path: Option<String>,  // Might not have generated thumbnail
    pub finder_tags: Vec<String>,  // Vec<T> is like Array<T> in TypeScript
    pub finder_colors: Vec<i32>,   // Finder color codes
}

/// Finder tag with color information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinderTag {
    pub name: String,
    pub color: i32,  // 0-6 (red, orange, yellow, green, blue, purple, grey)
}

/// Metadata for emotional tagging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub file_id: i64,
    pub mood: Option<String>,
    pub season: Option<String>,
    pub vibe_color: Option<String>,
    pub location: Option<String>,
    pub energy_level: Option<String>,
}

/// Read-only event data from Apple Calendar (macOS).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppleCalendarEvent {
    pub calendar: String,
    pub uid: String,
    pub title: String,
    pub start_ms: i64,
    pub end_ms: i64,
    pub all_day: bool,
    pub location: Option<String>,
}

// ============================================================================
// EXAMPLE COMMAND - Simple greeting
// ============================================================================

#[tauri::command]
// This attribute makes the function callable from JavaScript
// Tauri automatically handles:
// - Converting JavaScript args -> Rust types
// - Converting Rust return value -> JavaScript
// - Async/await (if you use async fn)

pub fn greet(name: String) -> String {
    // RUST FUNCTION SYNTAX:
    // pub fn name(parameter: Type) -> ReturnType { body }
    //
    // In Rust, the last expression is automatically returned
    // (no "return" keyword needed, but you can use it)

    format!("Hello, {}! Welcome to Aurora OS 🌟", name)
    // format! is like template literals in JS
    // It creates a String with {} as placeholders
}

// ============================================================================
// APPLE CALENDAR (macOS) - Read-only via AppleScript
// ============================================================================

#[tauri::command]
pub fn apple_calendar_list_events(start_ms: i64, end_ms: i64) -> Result<Vec<AppleCalendarEvent>, String> {
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (start_ms, end_ms);
        return Err("Apple Calendar is only available on macOS.".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        if end_ms <= start_ms {
            return Err("Invalid range: end_ms must be greater than start_ms.".to_string());
        }

        let start_s = start_ms / 1000;
        let end_s = end_ms / 1000;

        let script = format!(r#"
on replaceText(find, repl, txt)
  set txt to txt as string
  set AppleScript's text item delimiters to find
  set parts to every text item of txt
  set AppleScript's text item delimiters to repl
  set txt to parts as text
  set AppleScript's text item delimiters to ""
  return txt
end replaceText

on escapeField(t)
  set t to t as string
  set t to my replaceText("\\", "\\\\", t)
  set t to my replaceText(tab, "\\t", t)
  set t to my replaceText(linefeed, "\\n", t)
  set t to my replaceText(return, "\\r", t)
  return t
end escapeField

set startS to {start_s} as integer
set endS to {end_s} as integer
set epoch to date "Thursday, January 1, 1970 00:00:00"
set startDate to epoch + startS
set endDate to epoch + endS

tell application "Calendar"
  set outLines to {{}}
  repeat with cal in calendars
    try
      set evs to (every event of cal whose start date >= startDate and start date < endDate)
      repeat with ev in evs
        set calName to my escapeField(name of cal)
        set uidStr to ""
        try
          set uidStr to my escapeField(uid of ev)
        end try
        set titleStr to ""
        try
          set titleStr to my escapeField(summary of ev)
        end try
        set locStr to ""
        try
          set locStr to my escapeField(location of ev)
        end try
        set allDayVal to false
        try
          set allDayVal to allday event of ev
        end try
        set sSec to (start date of ev) - epoch
        set eSec to (end date of ev) - epoch
        set lineText to calName & tab & uidStr & tab & titleStr & tab & (sSec as integer) & tab & (eSec as integer) & tab & (allDayVal as string) & tab & locStr
        set end of outLines to lineText
      end repeat
    end try
  end repeat

  set AppleScript's text item delimiters to linefeed
  return outLines as text
end tell
        "#, start_s = start_s, end_s = end_s);

        let stdout = run_applescript(&script)?;
        let mut events = Vec::new();

        for line in stdout.lines() {
            let line = line.trim_end();
            if line.is_empty() {
                continue;
            }

            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() < 6 {
                continue;
            }

            let calendar = parts[0].to_string();
            let uid = parts[1].to_string();
            let title = parts[2].to_string();

            let start_s: i64 = parts[3].parse().unwrap_or(0);
            let end_s: i64 = parts[4].parse().unwrap_or(0);
            let all_day = matches!(parts[5].trim(), "true" | "True" | "TRUE");

            let location = parts.get(6).map(|s| s.to_string()).filter(|s| !s.is_empty());

            events.push(AppleCalendarEvent {
                calendar,
                uid,
                title,
                start_ms: start_s * 1000,
                end_ms: end_s * 1000,
                all_day,
                location,
            });
        }

        events.sort_by_key(|e| e.start_ms);
        Ok(events)
    }
}

#[cfg(target_os = "macos")]
fn run_applescript(source: &str) -> Result<String, String> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::{NSAutoreleasePool, NSString};
    use objc::{class, msg_send, sel, sel_impl};
    use std::ffi::CStr;

    unsafe {
        let _pool = NSAutoreleasePool::new(nil);
        let ns_source: id = NSString::alloc(nil).init_str(source);

        let script: id = msg_send![class!(NSAppleScript), alloc];
        let script: id = msg_send![script, initWithSource: ns_source];

        let mut error: id = nil;
        let descriptor: id = msg_send![script, executeAndReturnError: &mut error];

        if descriptor == nil {
            if error != nil {
                let key: id = NSString::alloc(nil).init_str("NSAppleScriptErrorMessage");
                let msg: id = msg_send![error, objectForKey: key];
                if msg != nil {
                    let cstr = NSString::UTF8String(msg);
                    if !cstr.is_null() {
                        let s = CStr::from_ptr(cstr).to_string_lossy().to_string();
                        return Err(s);
                    }
                }
            }
            return Err("AppleScript failed".to_string());
        }

        let out: id = msg_send![descriptor, stringValue];
        if out == nil {
            return Ok(String::new());
        }
        let cstr = NSString::UTF8String(out);
        if cstr.is_null() {
            return Ok(String::new());
        }
        Ok(CStr::from_ptr(cstr).to_string_lossy().to_string())
    }
}

// ============================================================================
// FILE SCANNING COMMANDS
// ============================================================================

#[tauri::command]
pub async fn scan_directories(app_handle: tauri::AppHandle, directories: Vec<String>) -> Result<Vec<FileInfo>, String> {
    // RUST RESULT TYPE:
    // Result<T, E> represents either:
    // - Ok(T): Success with value of type T
    // - Err(E): Error with value of type E
    //
    // This is Rust's way of handling errors (no exceptions!)
    // It forces you to handle both success and error cases
    //
    // Result<Vec<FileInfo>, String> means:
    // - On success: return a vector of FileInfo
    // - On error: return a String error message

    println!("🔍 Scanning directories: {:?}", directories);
    // {:?} uses Debug formatting (prints the whole vector)

    let mut all_files = Vec::new();
    // "let" declares a variable
    // "mut" makes it mutable (can be changed)
    // In Rust, variables are immutable by default!
    // Vec::new() creates an empty vector (like [] in JS)

    for directory in directories {
        // Loop through each directory path
        // "for item in collection" is like "for (const item of collection)" in JS

        let directory_path = Path::new(&directory);
        if !directory_path.exists() || !directory_path.is_dir() {
            eprintln!("⚠️  Skipping non-directory path: {}", directory);
            continue;
        }

        match scan_directory(&directory).await {
            // "&directory" is a reference (borrow) to directory
            // We're not giving ownership, just letting scan_directory "look at" it
            //
            // match is like switch/case but mandatory to handle all cases

            Ok(files) => {
                // If scan succeeded, add files to our collection
                all_files.extend(files);
                // extend() adds all items from one Vec to another
                // Like array.push(...otherArray) in JS
            }

            Err(e) => {
                eprintln!("❌ Error scanning {}: {}", directory, e);
                // eprintln! prints to stderr
                // We'll continue scanning other directories even if one fails
            }
        }
    }

    println!("✅ Found {} files total", all_files.len());

    // PHASE 2: Save files to database!
    // Get database connection and save all scanned files
    match crate::db::get_connection(&app_handle) {
        Ok(mut conn) => {
            match crate::db::upsert_files(&mut conn, &all_files) {
                Ok(saved_count) => println!("💾 Saved {} files to database", saved_count),
                Err(e) => eprintln!("❌ Failed to save scan results: {}", e),
            }
        }
        Err(e) => {
            eprintln!("❌ Failed to open database: {}", e);
            // Continue anyway - we can still return the files
        }
    }

    Ok(all_files)
    // Ok() wraps the value in a Result::Ok
    // This gets converted to a resolved Promise in JavaScript
}

/// Scan a single directory recursively
async fn scan_directory(directory: &str) -> Result<Vec<FileInfo>, String> {
    // "&str" is a string reference (borrowed string)
    // It's more efficient than String because it doesn't allocate new memory

    let mut files = Vec::new();

    // WalkDir recursively walks through a directory
    // It's like a breadth-first or depth-first search of the file system
    for entry in WalkDir::new(directory)
        .follow_links(false)  // Don't follow symbolic links (prevents infinite loops)
        .max_depth(20)        // Don't go deeper than 20 levels (safety limit)
        .into_iter()          // Convert to iterator
        .filter_map(|e| e.ok())  // Filter out errors, keep only successful entries
    {
        // Check if this entry is a file (not a directory)
        if entry.file_type().is_file() {
            // Try to convert this entry to FileInfo
            match entry_to_file_info(entry) {
                Ok(file_info) => files.push(file_info),
                Err(e) => {
                    // Skip files we can't read (permissions, etc.)
                    eprintln!("⚠️  Skipping file: {}", e);
                }
            }
        }
    }

    Ok(files)
}

/// Convert a directory entry to FileInfo
fn entry_to_file_info(entry: walkdir::DirEntry) -> Result<FileInfo, String> {
    // Get file metadata (size, timestamps, etc.)
    let metadata = entry.metadata()
        .map_err(|e| format!("Failed to read metadata: {}", e))?;
    // map_err() converts the error type
    // ? propagates the error up if it occurs
    // Think of it as: if (error) { return Err(error) }

    let path = entry.path();
    let path_str = path.to_string_lossy().to_string();
    // to_string_lossy() converts Path to String
    // "lossy" means: replace invalid UTF-8 with � character

    // Get file name
    let name = path
        .file_name()  // Get the file name part
        .and_then(|n| n.to_str())  // Convert to &str
        .unwrap_or("Unknown")  // If None, use "Unknown"
        .to_string();

    // Get file extension
    let file_type = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_string();

    // Get timestamps
    // system_time_to_unix() is a helper we'll define below
    let created_at = metadata.created()
        .ok()
        .map(system_time_to_unix)
        .unwrap_or(0);

    let modified_at = metadata.modified()
        .ok()
        .map(system_time_to_unix)
        .unwrap_or(0);

    Ok(FileInfo {
        id: None,  // Will be set by database
        path: path_str,
        name,
        file_type,
        size: metadata.len(),
        created_at,
        modified_at,
        last_opened_at: None,
        thumbnail_path: None,
        finder_tags: Vec::new(),  // Will be populated by get_finder_tags
        finder_colors: Vec::new(),
    })
}

// ============================================================================
// MACOS FINDER TAGS
// ============================================================================

#[tauri::command]
pub fn get_finder_tags(file_path: String) -> Result<Vec<FinderTag>, String> {
    // Read Finder tags from extended attributes
    // Finder stores tags in: com.apple.metadata:_kMDItemUserTags

    use xattr;  // Import xattr crate

    // Extended attribute key for Finder tags
    let tag_key = "com.apple.metadata:_kMDItemUserTags";

    match xattr::get(&file_path, tag_key) {
        Ok(Some(data)) => {
            // We got tag data! It's in plist (property list) format
            // Parse it to extract tag names and colors
            parse_finder_tags(data)
        }
        Ok(None) => {
            // File has no tags
            Ok(Vec::new())
        }
        Err(e) => {
            // Error reading tags
            Err(format!("Failed to read Finder tags: {}", e))
        }
    }
}

/// Parse Finder tags from plist data
fn parse_finder_tags(data: Vec<u8>) -> Result<Vec<FinderTag>, String> {
    // Finder tags are stored as a plist (XML or binary format)
    // For MVP, we'll use plist crate to parse it

    use plist::Value;

    match plist::from_bytes::<Value>(&data) {
        Ok(Value::Array(items)) => {
            // Tags are stored as an array of strings with color info
            let tags: Vec<FinderTag> = items
                .iter()
                .filter_map(|item| {
                    if let Value::String(tag_str) = item {
                        // Tag format: "Name\n6" where 6 is the color code
                        let parts: Vec<&str> = tag_str.split('\n').collect();
                        if let Some(name) = parts.first() {
                            let color = parts.get(1)
                                .and_then(|c| c.parse::<i32>().ok())
                                .unwrap_or(0);

                            return Some(FinderTag {
                                name: name.to_string(),
                                color,
                            });
                        }
                    }
                    None
                })
                .collect();

            Ok(tags)
        }
        Ok(_) => Ok(Vec::new()),
        Err(e) => Err(format!("Failed to parse tags: {}", e)),
    }
}

// ============================================================================
// THUMBNAIL GENERATION
// ============================================================================

#[tauri::command]
pub async fn generate_thumbnail(file_path: String, output_dir: String) -> Result<String, String> {
    // Use macOS qlmanage to generate thumbnail
    // qlmanage is macOS's Quick Look thumbnail generator

    // Create output file path
    let file_name = Path::new(&file_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("thumbnail");

    let output_path = format!("{}/{}.png", output_dir, file_name);

    // Run: qlmanage -t "file_path" -o "output_dir" -s 256
    // -t = thumbnail mode
    // -o = output directory
    // -s = size (256x256 pixels)

    // For now, we'll return a placeholder
    // We'll implement this fully when we integrate shell plugin in Phase 5

    Ok(output_path)
}

// ============================================================================
// PLACEHOLDER COMMANDS (we'll implement these in later phases)
// ============================================================================

#[tauri::command]
pub async fn get_all_files(app_handle: tauri::AppHandle) -> Result<Vec<FileInfo>, String> {
    // PHASE 2: Load files from database!
    match crate::db::get_connection(&app_handle) {
        Ok(conn) => {
            match crate::db::get_all_files(&conn) {
                Ok(files) => {
                    println!("📂 Loaded {} files from database", files.len());
                    Ok(files)
                }
                Err(e) => Err(format!("Failed to load files: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to connect to database: {}", e)),
    }
}

#[tauri::command]
pub async fn update_file_metadata(_metadata: FileMetadata) -> Result<(), String> {
    // Will update emotional metadata in database (Phase 7)
    Ok(())
}

#[tauri::command]
pub async fn search_files(app_handle: tauri::AppHandle, query: String) -> Result<Vec<FileInfo>, String> {
    // PHASE 2: Use FTS5 for lightning-fast full-text search!
    match crate::db::get_connection(&app_handle) {
        Ok(conn) => {
            match crate::db::search_files(&conn, &query) {
                Ok(files) => {
                    println!("🔎 Found {} files matching '{}'", files.len(), query);
                    Ok(files)
                }
                Err(e) => Err(format!("Search failed: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to connect to database: {}", e)),
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

fn system_time_to_unix(time: std::time::SystemTime) -> i64 {
    // Convert SystemTime to Unix timestamp (seconds since 1970)
    time.duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

// ============================================================================
// RUST CONCEPTS RECAP:
// ============================================================================
//
// 1. ATTRIBUTES: #[tauri::command] makes functions callable from JS
//
// 2. RESULT TYPE: Result<T, E> for error handling
//    - Ok(value) = success
//    - Err(error) = failure
//    - ? operator propagates errors
//
// 3. OPTION TYPE: Option<T> for nullable values
//    - Some(value) = has a value
//    - None = no value (like null)
//
// 4. OWNERSHIP & BORROWING:
//    - &str vs String: borrowed vs owned
//    - &variable = borrow (don't take ownership)
//    - clone() = create a copy
//
// 5. PATTERN MATCHING: match for handling all cases
//
// 6. ITERATORS: Powerful chainable operations on collections
//    - .filter_map() = filter and transform
//    - .collect() = gather into a collection
//
// 7. MACROS: println!, format!, vec![] = code generation
//
// ============================================================================
