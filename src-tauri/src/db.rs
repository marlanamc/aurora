// ============================================================================
// DATABASE MODULE - SQLite operations for Aurora
// ============================================================================
//
// SQLITE + TAURI INTEGRATION:
// Tauri 2.x uses tauri-plugin-sql which provides a simple SQL interface
// We'll use SQLite to store:
// - File metadata (path, name, size, dates)
// - Finder tags and colors
// - Custom metadata (mood, season, vibe, location)
// - Tile positions for spatial memory
// - Full-text search index (FTS5)
//
// ============================================================================

use rusqlite::params;
use serde::Serialize;
use tauri::{AppHandle, Manager};
use chrono::{DateTime, Datelike, Utc};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

// Re-export our FileInfo type so other modules can use it
pub use crate::commands::FileInfo;

#[derive(Debug, Clone, Serialize)]
pub struct ResurfacedFile {
    pub file: FileInfo,
    pub reason: String,
    pub explanation: String,
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

pub async fn init_database(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    println!("📊 Initializing Aurora SQLite database...");

    // Get the app's data directory where we'll store the database
    // This is typically: ~/Library/Application Support/com.aurora.os/
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&app_dir)?;

    // Database file path
    let db_path = app_dir.join("aurora.db");
    let _db_url = format!("sqlite:{}", db_path.display());

    println!("📁 Database location: {}", db_path.display());

    // Create the database connection using rusqlite directly
    // (simpler than dealing with tauri-plugin-sql for now)
    let conn = rusqlite::Connection::open(&db_path)?;

    // Execute schema creation
    create_schema(&conn)?;

    // Insert default data
    insert_defaults(&conn)?;

    println!("✅ Database initialized successfully!");

    Ok(())
}

// ============================================================================
// SCHEMA CREATION
// ============================================================================

fn create_schema(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
    // LEARNING NOTE:
    // execute_batch() runs multiple SQL statements at once
    // It's perfect for schema creation

    conn.execute_batch(
        "
        -- Files table: stores all indexed files
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            file_type TEXT,
            size INTEGER,
            created_at INTEGER,
            modified_at INTEGER,
            last_opened_at INTEGER,
            open_count INTEGER DEFAULT 0,
            thumbnail_path TEXT,

            -- Spatial memory: tile positions
            tile_x REAL,
            tile_y REAL,
            tile_cluster TEXT,

            -- Timestamps
            indexed_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        -- Finder tags table
        CREATE TABLE IF NOT EXISTS finder_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color INTEGER DEFAULT 0
        );

        -- File-tag associations (many-to-many)
        CREATE TABLE IF NOT EXISTS file_tags (
            file_id INTEGER,
            tag_id INTEGER,
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES finder_tags(id) ON DELETE CASCADE,
            PRIMARY KEY (file_id, tag_id)
        );

        -- Emotional metadata
        CREATE TABLE IF NOT EXISTS file_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER UNIQUE,
            mood TEXT,
            season TEXT,
            vibe_color TEXT,
            location TEXT,
            energy_level TEXT,
            notes TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now')),
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        );

        -- Clusters for visual grouping
        CREATE TABLE IF NOT EXISTS clusters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT,
            sort_order INTEGER DEFAULT 0
        );

        -- Full-text search index (FTS5)
        -- This makes search SUPER fast!
        CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
            file_id UNINDEXED,
            path,
            name,
            content=''
        );

        -- Indexes for faster queries
        CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
        CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified_at DESC);
        CREATE INDEX IF NOT EXISTS idx_files_cluster ON files(tile_cluster);
        CREATE INDEX IF NOT EXISTS idx_metadata_file ON file_metadata(file_id);

        -- Triggers to keep FTS5 in sync
        -- These automatically update the search index when files change

        CREATE TRIGGER IF NOT EXISTS files_ai AFTER INSERT ON files
        BEGIN
            INSERT INTO files_fts(file_id, path, name)
            VALUES (new.id, new.path, new.name);
        END;

        CREATE TRIGGER IF NOT EXISTS files_ad AFTER DELETE ON files
        BEGIN
            DELETE FROM files_fts WHERE file_id = old.id;
        END;

        CREATE TRIGGER IF NOT EXISTS files_au AFTER UPDATE ON files
        BEGIN
            UPDATE files_fts
            SET path = new.path, name = new.name
            WHERE file_id = old.id;
        END;
        ",
    )?;

    println!("✅ Database schema created");
    Ok(())
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

fn insert_defaults(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
    // Insert default clusters
    conn.execute_batch(
        "
        INSERT OR IGNORE INTO clusters (name, color, sort_order) VALUES
            ('Ideas I Started', '#FF9500', 1),
            ('In Progress', '#34C759', 2),
            ('Unfinished Projects', '#FF3B30', 3),
            ('Seasonal Files', '#007AFF', 4),
            ('High Energy', '#FFCC00', 5),
            ('Low Energy', '#AF52DE', 6);
        ",
    )?;

    println!("✅ Default clusters created");
    Ok(())
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/// Get database connection
/// This is a helper to get a connection from the app handle
pub fn get_connection(app_handle: &AppHandle) -> Result<rusqlite::Connection, Box<dyn std::error::Error>> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    let db_path = app_dir.join("aurora.db");
    let conn = rusqlite::Connection::open(&db_path)?;

    Ok(conn)
}

/// Insert or update a file in the database
/// "Upsert" = update if exists, insert if not
#[allow(dead_code)]
pub fn upsert_file(
    conn: &rusqlite::Connection,
    file: &FileInfo,
) -> Result<i64, Box<dyn std::error::Error>> {
    // LEARNING NOTE:
    // INSERT OR REPLACE updates the row if path already exists
    // COALESCE keeps the existing open_count value if updating

    conn.execute(
        "INSERT INTO files (path, name, file_type, size, created_at, modified_at, open_count)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)
         ON CONFLICT(path) DO UPDATE SET
            name = excluded.name,
            file_type = excluded.file_type,
            size = excluded.size,
            modified_at = excluded.modified_at",
        params![
            &file.path,
            &file.name,
            &file.file_type,
            file.size as i64,
            file.created_at,
            file.modified_at,
        ],
    )?;

    // On conflict updates, last_insert_rowid() is not reliable. Select by unique path.
    let file_id: i64 = conn.query_row(
        "SELECT id FROM files WHERE path = ?1",
        params![&file.path],
        |row| row.get(0),
    )?;

    Ok(file_id)
}

/// Upsert many files efficiently in a single transaction.
pub fn upsert_files(
    conn: &mut rusqlite::Connection,
    files: &[FileInfo],
) -> Result<usize, Box<dyn std::error::Error>> {
    if files.is_empty() {
        return Ok(0);
    }

    let mut saved_count = 0usize;
    let tx = conn.transaction()?;
    {
        let mut stmt = tx.prepare(
            "INSERT INTO files (path, name, file_type, size, created_at, modified_at, open_count)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 0)
             ON CONFLICT(path) DO UPDATE SET
                name = excluded.name,
                file_type = excluded.file_type,
                size = excluded.size,
                modified_at = excluded.modified_at",
        )?;

        for file in files {
            match stmt.execute(params![
                &file.path,
                &file.name,
                &file.file_type,
                file.size as i64,
                file.created_at,
                file.modified_at,
            ]) {
                Ok(_) => saved_count += 1,
                Err(e) => eprintln!("⚠️  Failed to upsert {}: {}", file.path, e),
            }
        }
    }

    tx.commit()?;
    Ok(saved_count)
}

/// Get all files from the database
pub fn get_all_files(conn: &rusqlite::Connection) -> Result<Vec<FileInfo>, Box<dyn std::error::Error>> {
    let mut stmt = conn.prepare(
        "SELECT id, path, name, file_type, size, created_at, modified_at, last_opened_at, thumbnail_path
         FROM files
         ORDER BY modified_at DESC
         LIMIT 1000"
    )?;

    let files = stmt.query_map([], |row| {
        Ok(FileInfo {
            id: row.get(0)?,
            path: row.get(1)?,
            name: row.get(2)?,
            file_type: row.get(3)?,
            size: row.get::<_, i64>(4)? as u64,
            created_at: row.get(5)?,
            modified_at: row.get(6)?,
            last_opened_at: row.get(7)?,
            thumbnail_path: row.get(8)?,
            finder_tags: Vec::new(),  // TODO: Join with tags table
            finder_colors: Vec::new(),
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(files)
}

/// Search files using FTS5
pub fn search_files(
    conn: &rusqlite::Connection,
    query: &str,
) -> Result<Vec<FileInfo>, Box<dyn std::error::Error>> {
    let mut stmt = conn.prepare(
        "SELECT f.id, f.path, f.name, f.file_type, f.size,
                f.created_at, f.modified_at, f.last_opened_at, f.thumbnail_path
         FROM files f
         JOIN files_fts fts ON f.id = fts.file_id
         WHERE files_fts MATCH ?1
         ORDER BY rank
         LIMIT 50"
    )?;

    let files = stmt.query_map([query], |row| {
        Ok(FileInfo {
            id: row.get(0)?,
            path: row.get(1)?,
            name: row.get(2)?,
            file_type: row.get(3)?,
            size: row.get::<_, i64>(4)? as u64,
            created_at: row.get(5)?,
            modified_at: row.get(6)?,
            last_opened_at: row.get(7)?,
            thumbnail_path: row.get(8)?,
            finder_tags: Vec::new(),
            finder_colors: Vec::new(),
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(files)
}

/// Delete a file from the database
pub fn delete_file(conn: &rusqlite::Connection, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    conn.execute("DELETE FROM files WHERE path = ?1", [path])?;
    Ok(())
}

pub fn record_open(conn: &rusqlite::Connection, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    conn.execute(
        "UPDATE files
         SET last_opened_at = strftime('%s','now'),
             open_count = COALESCE(open_count, 0) + 1
         WHERE path = ?1",
        params![path],
    )?;
    Ok(())
}

fn activity_timestamp(file: &FileInfo) -> i64 {
    file.last_opened_at.unwrap_or(file.modified_at)
}

fn wraparound_day_diff(a: u32, b: u32, year_days: u32) -> u32 {
    let diff = if a > b { a - b } else { b - a };
    diff.min(year_days.saturating_sub(diff))
}

fn stable_pick_index(seed: &str, len: usize) -> Option<usize> {
    if len == 0 {
        return None;
    }
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    Some((hasher.finish() as usize) % len)
}

pub fn get_resurfaced_files(
    conn: &rusqlite::Connection,
    count: usize,
) -> Result<Vec<ResurfacedFile>, Box<dyn std::error::Error>> {
    let count = count.clamp(1, 12);

    let mut stmt = conn.prepare(
        "SELECT id, path, name, file_type, size, created_at, modified_at, last_opened_at, thumbnail_path
         FROM files
         ORDER BY COALESCE(last_opened_at, modified_at) ASC
         LIMIT 5000",
    )?;

    let mut files: Vec<FileInfo> = stmt
        .query_map([], |row| {
            Ok(FileInfo {
                id: row.get(0)?,
                path: row.get(1)?,
                name: row.get(2)?,
                file_type: row.get(3)?,
                size: row.get::<_, i64>(4)? as u64,
                created_at: row.get(5)?,
                modified_at: row.get(6)?,
                last_opened_at: row.get(7)?,
                thumbnail_path: row.get(8)?,
                finder_tags: Vec::new(),
                finder_colors: Vec::new(),
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    if files.is_empty() {
        return Ok(Vec::new());
    }

    let now = Utc::now();
    let now_ts = now.timestamp();
    let today_ordinal = now.ordinal();
    let year_days = if now.year().rem_euclid(4) == 0 { 366 } else { 365 };

    let mut resurfaced: Vec<ResurfacedFile> = Vec::new();
    let mut used_paths = std::collections::HashSet::<String>::new();

    // 1) Forgotten: oldest activity older than 14 days
    let forgotten_threshold = 14 * 24 * 60 * 60;
    files.sort_by_key(activity_timestamp);
    if let Some(file) = files
        .iter()
        .find(|f| now_ts.saturating_sub(activity_timestamp(f)) > forgotten_threshold)
        .cloned()
    {
        let asleep_days = now_ts.saturating_sub(activity_timestamp(&file)) / (24 * 60 * 60);
        resurfaced.push(ResurfacedFile {
            file: file.clone(),
            reason: "Forgotten".to_string(),
            explanation: format!("Asleep for ~{} days", asleep_days),
        });
        used_paths.insert(file.path);
    }

    // 2) Seasonal Echo: closest day-of-year match (prefer older content)
    let seasonal_candidates: Vec<(u32, FileInfo)> = files
        .iter()
        .filter(|f| !used_paths.contains(&f.path))
        .filter_map(|f| {
            let dt: DateTime<Utc> = DateTime::from_timestamp(f.modified_at, 0)?;
            let ordinal = dt.ordinal();
            let diff = wraparound_day_diff(today_ordinal, ordinal, year_days);
            Some((diff, f.clone()))
        })
        .filter(|(diff, f)| {
            let age_days = now_ts.saturating_sub(f.modified_at) / (24 * 60 * 60);
            *diff <= 10 && age_days >= 60
        })
        .collect();

    if let Some((diff, file)) = seasonal_candidates
        .into_iter()
        .min_by_key(|(diff, f)| (*diff, activity_timestamp(f)))
    {
        resurfaced.push(ResurfacedFile {
            file: file.clone(),
            reason: "Seasonal Echo".to_string(),
            explanation: format!("A similar season (±{} days)", diff),
        });
        used_paths.insert(file.path);
    }

    // 3) Random Delight: stable daily pick from remaining older content
    let random_pool: Vec<FileInfo> = files
        .iter()
        .filter(|f| !used_paths.contains(&f.path))
        .filter(|f| now_ts.saturating_sub(activity_timestamp(f)) > 7 * 24 * 60 * 60)
        .cloned()
        .collect();

    if let Some(idx) = stable_pick_index(
        &format!("{}:{}", now.date_naive(), "random_delight"),
        random_pool.len(),
    ) {
        let file = random_pool[idx].clone();
        resurfaced.push(ResurfacedFile {
            file: file.clone(),
            reason: "Random Delight".to_string(),
            explanation: "A surprise to spark momentum".to_string(),
        });
        used_paths.insert(file.path);
    }

    // Fill remaining slots with oldest activity that isn't used yet.
    if resurfaced.len() < count {
        let mut remaining: Vec<FileInfo> = files
            .into_iter()
            .filter(|f| !used_paths.contains(&f.path))
            .collect();
        remaining.sort_by_key(activity_timestamp);
        for file in remaining.into_iter().take(count - resurfaced.len()) {
            let asleep_days = now_ts.saturating_sub(activity_timestamp(&file)) / (24 * 60 * 60);
            resurfaced.push(ResurfacedFile {
                file,
                reason: "Forgotten".to_string(),
                explanation: format!("Asleep for ~{} days", asleep_days),
            });
        }
    }

    resurfaced.truncate(count);
    Ok(resurfaced)
}

/// Get file count
pub fn get_file_count(conn: &rusqlite::Connection) -> Result<usize, Box<dyn std::error::Error>> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM files", [], |row| row.get(0))?;
    Ok(count as usize)
}

// ============================================================================
// TAURI COMMANDS (callable from JavaScript)
// ============================================================================

#[tauri::command]
pub async fn db_get_all_files(app_handle: AppHandle) -> Result<Vec<FileInfo>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    get_all_files(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_search_files(app_handle: AppHandle, query: String) -> Result<Vec<FileInfo>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    search_files(&conn, &query).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_file_count(app_handle: AppHandle) -> Result<usize, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    get_file_count(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_record_open(app_handle: AppHandle, path: String) -> Result<(), String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    record_open(&conn, &path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn db_get_resurfaced_files(
    app_handle: AppHandle,
    count: Option<usize>,
) -> Result<Vec<ResurfacedFile>, String> {
    let conn = get_connection(&app_handle).map_err(|e| e.to_string())?;
    get_resurfaced_files(&conn, count.unwrap_or(3)).map_err(|e| e.to_string())
}

// ============================================================================
// RUST LEARNING NOTES:
// ============================================================================
//
// 1. RUSQLITE: Direct SQLite access (simpler than plugin for now)
//    - Connection::open() creates/opens database
//    - execute() runs SQL without returning rows
//    - query_map() runs SQL and maps rows to Rust types
//
// 2. TRANSACTIONS: For batch operations
//    let tx = conn.transaction()?;
//    tx.execute(...)?;
//    tx.commit()?;
//
// 3. PREPARED STATEMENTS: Prevent SQL injection
//    ?1, ?2 = positional parameters
//    :name = named parameters
//
// 4. FTS5: Full-Text Search
//    - Virtual table that indexes text
//    - MATCH operator for searches
//    - rank column shows relevance
//
// ============================================================================
