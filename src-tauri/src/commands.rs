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

use std::path::{Path, PathBuf};
// Path and PathBuf are for working with file system paths
// Path = borrowed path (like &str)
// PathBuf = owned path (like String)

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
// FILE SCANNING COMMANDS
// ============================================================================

#[tauri::command]
pub async fn scan_directories(directories: Vec<String>) -> Result<Vec<FileInfo>, String> {
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

    use tauri_plugin_shell::ShellExt;

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
    // We'll implement this fully when we integrate shell plugin

    Ok(output_path)
}

// ============================================================================
// PLACEHOLDER COMMANDS (we'll implement these in later phases)
// ============================================================================

#[tauri::command]
pub async fn get_all_files() -> Result<Vec<FileInfo>, String> {
    // Will query database for all files
    Ok(Vec::new())
}

#[tauri::command]
pub async fn update_file_metadata(metadata: FileMetadata) -> Result<(), String> {
    // Will update emotional metadata in database
    Ok(())
}

#[tauri::command]
pub async fn search_files(query: String) -> Result<Vec<FileInfo>, String> {
    // Will use SQLite FTS5 for full-text search
    Ok(Vec::new())
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
