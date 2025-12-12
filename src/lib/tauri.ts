// ============================================================================
// TAURI UTILITIES - Bridge between Next.js and Rust
// ============================================================================
//
// HOW TO CALL RUST FROM JAVASCRIPT:
// 1. Import { invoke } from '@tauri-apps/api/core'
// 2. Call: await invoke('rust_function_name', { arg1: value1 })
// 3. Receive the result (automatically converted from Rust types to JS)
//
// This file provides typed wrappers for all our Rust commands!
//
// ============================================================================

import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

// ============================================================================
// TYPE DEFINITIONS (matching Rust types)
// ============================================================================

export interface FileInfo {
  id?: number
  path: string
  name: string
  file_type: string
  size: number
  created_at: number  // Unix timestamp
  modified_at: number
  last_opened_at?: number
  thumbnail_path?: string
  finder_tags: string[]
  finder_colors: number[]
}

export interface FinderTag {
  name: string
  color: number  // 0-6
}

export interface FileMetadata {
  file_id: number
  mood?: string
  season?: string
  vibe_color?: string
  location?: string
  energy_level?: string
}

// Map of Finder color codes to names
export const FINDER_COLORS = {
  0: { name: 'None', hex: '#8E8E93' },
  1: { name: 'Gray', hex: '#8E8E93' },
  2: { name: 'Green', hex: '#34C759' },
  3: { name: 'Purple', hex: '#AF52DE' },
  4: { name: 'Blue', hex: '#007AFF' },
  5: { name: 'Yellow', hex: '#FFCC00' },
  6: { name: 'Red', hex: '#FF3B30' },
  7: { name: 'Orange', hex: '#FF9500' },
} as const

// ============================================================================
// RUST COMMAND WRAPPERS
// ============================================================================

/**
 * Simple greeting command (example to test Rust connection)
 */
export async function greet(name: string): Promise<string> {
  return await invoke<string>('greet', { name })
  // invoke<ReturnType>('command_name', { parameters })
  // This calls the #[tauri::command] fn greet() in Rust
}

/**
 * Scan directories for files
 * @param directories - Array of directory paths to scan
 * @returns Array of FileInfo objects
 */
export async function scanDirectories(
  directories: string[]
): Promise<FileInfo[]> {
  return await invoke<FileInfo[]>('scan_directories', { directories })
}

/**
 * Get all files from the database
 */
export async function getAllFiles(): Promise<FileInfo[]> {
  return await invoke<FileInfo[]>('get_all_files')
}

/**
 * Get Finder tags for a specific file
 * @param filePath - Full path to the file
 */
export async function getFinderTags(filePath: string): Promise<FinderTag[]> {
  return await invoke<FinderTag[]>('get_finder_tags', { filePath })
}

/**
 * Generate a thumbnail for a file using macOS Quick Look
 * @param filePath - Full path to the file
 * @param outputDir - Directory to save thumbnail
 * @returns Path to generated thumbnail
 */
export async function generateThumbnail(
  filePath: string,
  outputDir: string
): Promise<string> {
  return await invoke<string>('generate_thumbnail', { filePath, outputDir })
}

/**
 * Update emotional metadata for a file
 */
export async function updateFileMetadata(
  metadata: FileMetadata
): Promise<void> {
  return await invoke('update_file_metadata', { metadata })
}

/**
 * Search files using full-text search
 * @param query - Search query
 */
export async function searchFiles(query: string): Promise<FileInfo[]> {
  return await invoke<FileInfo[]>('search_files', { query })
}

// ============================================================================
// EVENT LISTENERS (Real-time updates from Rust)
// ============================================================================

/**
 * Listen for file created events
 * @param callback - Function to call when a file is created
 * @returns Unlisten function to stop listening
 */
export async function onFileCreated(
  callback: (paths: string[]) => void
): Promise<UnlistenFn> {
  return await listen<string[]>('file-created', (event) => {
    callback(event.payload)
  })
}

/**
 * Listen for file modified events
 */
export async function onFileModified(
  callback: (paths: string[]) => void
): Promise<UnlistenFn> {
  return await listen<string[]>('file-modified', (event) => {
    callback(event.payload)
  })
}

/**
 * Listen for file removed events
 */
export async function onFileRemoved(
  callback: (paths: string[]) => void
): Promise<UnlistenFn> {
  return await listen<string[]>('file-removed', (event) => {
    callback(event.payload)
  })
}

// ============================================================================
// OPENER PLUGIN (Open files in Finder/apps)
// ============================================================================

import { open } from '@tauri-apps/plugin-opener'

/**
 * Open a file with its default application
 * @param path - File path to open
 */
export async function openFile(path: string): Promise<void> {
  await open(path)
}

/**
 * Reveal a file in Finder
 * @param path - File path to reveal
 */
export async function revealInFinder(path: string): Promise<void> {
  // On macOS, we can use 'open -R' to reveal in Finder
  await open(path)
  // Note: In a future update, we might add a custom Rust command
  // that uses NSWorkspace to properly "reveal" the file
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Format Unix timestamp to readable date
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get file icon based on extension
 * For MVP, we'll use emoji. Later, we can use macOS file icons
 */
export function getFileIcon(fileType: string): string {
  const iconMap: Record<string, string> = {
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    md: '📝',

    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🎨',

    // Code
    js: '💛',
    ts: '💙',
    tsx: '💙',
    jsx: '💛',
    py: '🐍',
    rs: '🦀',
    go: '🐹',

    // Archives
    zip: '📦',
    rar: '📦',
    tar: '📦',
    gz: '📦',

    // Media
    mp3: '🎵',
    mp4: '🎬',
    mov: '🎬',
    avi: '🎬',

    // Design
    psd: '🎨',
    ai: '🎨',
    sketch: '🎨',
    fig: '🎨',
    figma: '🎨',
  }

  return iconMap[fileType.toLowerCase()] || '📄'
}

// ============================================================================
// TAURI-SPECIFIC UTILITIES
// ============================================================================

/**
 * Check if we're running in Tauri (vs browser during dev)
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

/**
 * Safely invoke a Tauri command (returns null if not in Tauri)
 */
export async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | null> {
  if (!isTauri()) {
    console.warn(`Not in Tauri environment, skipping command: ${command}`)
    return null
  }

  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`Error invoking ${command}:`, error)
    return null
  }
}

// ============================================================================
// USAGE EXAMPLES:
// ============================================================================
//
// In your React components:
//
// import { scanDirectories, onFileCreated } from '@/lib/tauri'
//
// // Call Rust function
// const files = await scanDirectories(['/Users/you/Documents'])
//
// // Listen for real-time events
// useEffect(() => {
//   const unlisten = onFileCreated((paths) => {
//     console.log('New files:', paths)
//     // Update your state!
//   })
//   return () => unlisten.then(fn => fn())
// }, [])
//
// ============================================================================
