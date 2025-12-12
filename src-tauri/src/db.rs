// ============================================================================
// DATABASE MODULE - SQLite operations for Aurora
// ============================================================================
//
// SQLITE CONCEPTS:
// - SQLite is a file-based database (one .db file contains everything)
// - No server needed - it's embedded in your app
// - Perfect for desktop apps!
// - We'll use it to store:
//   - File metadata
//   - Emotional tags (mood, season, vibe)
//   - Tile positions (for spatial memory)
//   - Usage statistics (last opened, open count)
//
// ============================================================================

use tauri::{AppHandle, Manager};
// AppHandle: A handle to interact with the Tauri app
// Manager: Trait that provides methods to access app resources

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

/// SQL to create our database tables
const INIT_SQL: &str = "
-- Files table: stores all indexed files
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,  -- Full file path (unique identifier)
    name TEXT NOT NULL,          -- File name
    file_type TEXT,              -- Extension (.pdf, .jpg, etc.)
    size INTEGER,                -- File size in bytes
    created_at INTEGER,          -- Unix timestamp
    modified_at INTEGER,         -- Unix timestamp
    last_opened_at INTEGER,      -- Track when user last opened it
    open_count INTEGER DEFAULT 0,  -- How many times opened
    thumbnail_path TEXT,         -- Path to cached thumbnail

    -- For spatial memory: remember where tiles are positioned
    tile_x REAL,                 -- X position on grid
    tile_y REAL,                 -- Y position on grid
    tile_cluster TEXT            -- Which cluster it belongs to
);

-- Finder tags table: stores macOS Finder tags
CREATE TABLE IF NOT EXISTS finder_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color INTEGER DEFAULT 0     -- 0-6 (Finder color codes)
);

-- File-tag associations (many-to-many relationship)
CREATE TABLE IF NOT EXISTS file_tags (
    file_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES finder_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (file_id, tag_id)
);

-- Emotional metadata: your custom ADHD-friendly tags
CREATE TABLE IF NOT EXISTS file_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER UNIQUE,     -- One metadata entry per file
    mood TEXT,                  -- Happy, Focused, Stressed, etc.
    season TEXT,                -- Spring, Summer, Fall, Winter
    vibe_color TEXT,            -- Hex color code
    location TEXT,              -- Home, Coffee Shop, Traveling, etc.
    energy_level TEXT,          -- High, Medium, Low
    notes TEXT,                 -- Free-form notes
    created_at INTEGER,         -- When metadata was added
    updated_at INTEGER,         -- When last updated
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Clusters: visual groupings of files
CREATE TABLE IF NOT EXISTS clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,       -- \"Ideas I Started\", \"In Progress\", etc.
    color TEXT,                      -- Visual color for cluster
    sort_order INTEGER DEFAULT 0     -- Display order
);

-- Full-text search index using FTS5 (super fast text search!)
-- FTS5 = Full-Text Search version 5 (SQLite's text search engine)
CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
    file_id UNINDEXED,   -- Don't index the ID (just store it)
    path,                -- Index file path
    name,                -- Index file name
    content='',          -- We're not storing file contents (would be huge!)
    tokenize='porter'    -- Porter stemming: \"running\" matches \"run\"
);

-- Triggers: automatically keep FTS index in sync with files table
-- TRIGGERS = automatic actions when something happens in database
-- Like event listeners in JavaScript!

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
    UPDATE files_fts SET path = new.path, name = new.name
    WHERE file_id = old.id;
END;

-- Indexes for faster queries
-- INDEXES = like a book's index - makes lookups faster
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_files_modified ON files(modified_at);
CREATE INDEX IF NOT EXISTS idx_files_cluster ON files(tile_cluster);
CREATE INDEX IF NOT EXISTS idx_metadata_file ON file_metadata(file_id);
";

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

pub async fn init_database(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // RUST ERROR HANDLING:
    // Box<dyn std::error::Error> is a "trait object"
    // It means: "any type that implements the Error trait"
    // "Box" puts it on the heap (dynamic memory allocation)
    // "dyn" means dynamic dispatch (runtime polymorphism)
    //
    // Think of it like: Promise<void> but with error info

    // Get the SQL plugin instance
    // This is provided by tauri-plugin-sql
    let sql = app_handle.state::<tauri_plugin_sql::Sql>();

    // Get a connection to our SQLite database
    // The database file is: aurora.db (configured in tauri.conf.json)
    let db = sql.get_connection("sqlite:aurora.db").await?;
    // The ? operator means: if this fails, return the error

    println!("📊 Initializing Aurora database...");

    // Execute our schema creation SQL
    // This will create all tables if they don't exist
    db.execute(INIT_SQL, &[]).await?;
    // &[] means: no parameters for this query

    println!("✅ Database initialized successfully!");

    // Insert default clusters
    db.execute(
        "INSERT OR IGNORE INTO clusters (name, color, sort_order) VALUES
            ('Ideas I Started', '#FF9500', 1),
            ('In Progress', '#34C759', 2),
            ('Unfinished Projects', '#FF3B30', 3),
            ('Seasonal Files', '#007AFF', 4),
            ('High Energy', '#FFCC00', 5),
            ('Low Energy', '#AF52DE', 6)",
        &[],
    ).await?;

    Ok(())
}

// ============================================================================
// DATABASE HELPER FUNCTIONS
// ============================================================================

/// Insert or update a file in the database
pub async fn upsert_file(
    app_handle: &AppHandle,
    file: &crate::commands::FileInfo,
) -> Result<i64, Box<dyn std::error::Error>> {
    // "upsert" = update if exists, insert if not
    // It's a common database pattern

    let sql = app_handle.state::<tauri_plugin_sql::Sql>();
    let db = sql.get_connection("sqlite:aurora.db").await?;

    // Use INSERT OR REPLACE to upsert
    let result = db.execute(
        "INSERT OR REPLACE INTO files
        (path, name, file_type, size, created_at, modified_at, open_count)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE((SELECT open_count FROM files WHERE path = ?1), 0))",
        // ?1, ?2, etc. are parameter placeholders (prevents SQL injection!)
        // COALESCE = use first non-null value (keeps existing open_count or defaults to 0)
        &[
            &file.path,
            &file.name,
            &file.file_type,
            &file.size.to_string(),
            &file.created_at.to_string(),
            &file.modified_at.to_string(),
        ],
    ).await?;

    // Get the ID of the inserted/updated row
    let file_id: i64 = result.last_insert_id();

    Ok(file_id)
}

/// Search files using FTS5
pub async fn search_files_fts(
    app_handle: &AppHandle,
    query: &str,
) -> Result<Vec<crate::commands::FileInfo>, Box<dyn std::error::Error>> {
    let sql = app_handle.state::<tauri_plugin_sql::Sql>();
    let db = sql.get_connection("sqlite:aurora.db").await?;

    // FTS5 query syntax:
    // - Use MATCH for full-text search
    // - rank is the relevance score (lower = more relevant)
    let rows = db.query(
        "SELECT files.* FROM files
         JOIN files_fts ON files.id = files_fts.file_id
         WHERE files_fts MATCH ?1
         ORDER BY rank
         LIMIT 50",
        &[query],
    ).await?;

    // Convert rows to FileInfo structs
    // (we'll implement this conversion in a real app)

    Ok(Vec::new())  // Placeholder for now
}

// ============================================================================
// RUST DATABASE PATTERNS:
// ============================================================================
//
// 1. PREPARED STATEMENTS: Use ?1, ?2 placeholders (prevents SQL injection)
//
// 2. ASYNC/AWAIT: Database operations are async (don't block UI)
//
// 3. ERROR PROPAGATION: Use ? to bubble errors up
//
// 4. TRANSACTIONS: For atomic operations (all-or-nothing)
//    Example:
//    let tx = db.transaction().await?;
//    tx.execute("...", &[]).await?;
//    tx.commit().await?;
//
// 5. FTS5: Built-in full-text search
//    - MATCH operator for queries
//    - Automatic indexing with triggers
//    - Porter stemming for better matches
//
// ============================================================================
