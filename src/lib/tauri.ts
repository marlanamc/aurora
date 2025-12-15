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
import { createElement } from 'react'
import { getFileTypeIcon, type IconComponent } from './icons'

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

export interface AppleCalendarEvent {
  calendar: string
  uid: string
  title: string
  start_ms: number
  end_ms: number
  all_day: boolean
  location?: string
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

export async function appleCalendarListEvents(startMs: number, endMs: number): Promise<AppleCalendarEvent[]> {
  try {
    return await invoke<AppleCalendarEvent[]>('apple_calendar_list_events', { startMs, endMs })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const looksLikeNotTauri =
      message.toLowerCase().includes('tauri') ||
      message.toLowerCase().includes('__tauri') ||
      message.toLowerCase().includes('invoke') ||
      message.toLowerCase().includes('not in tauri')

    if (looksLikeNotTauri || !isTauri()) {
      throw new Error('Apple Calendar is only available in the macOS desktop app (run `npm run tauri:dev`).')
    }

    throw new Error(
      `Apple Calendar failed: ${message}\nIf this is a permissions issue, enable Aurora OS in System Settings → Privacy & Security → Automation (Calendar).`
    )
  }
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
// DATABASE COMMANDS (Phase 2)
// ============================================================================

/**
 * Get all files from database
 * (Alternative to getAllFiles - loads from persistent storage)
 */
export async function dbGetAllFiles(): Promise<FileInfo[]> {
  return await invoke<FileInfo[]>('db_get_all_files')
}

/**
 * Search files in database using FTS5
 * @param query - Search query (supports FTS5 syntax)
 */
export async function dbSearchFiles(query: string): Promise<FileInfo[]> {
  return await invoke<FileInfo[]>('db_search_files', { query })
}

/**
 * Get total file count from database
 */
export async function dbGetFileCount(): Promise<number> {
  return await invoke<number>('db_get_file_count')
}

export type ResurfaceReason = 'Forgotten' | 'Seasonal Echo' | 'Random Delight'

export type ResurfacedFile = {
  file: FileInfo
  reason: ResurfaceReason
  explanation: string
}

export async function dbGetResurfacedFiles(count = 3): Promise<ResurfacedFile[]> {
  return await invoke<ResurfacedFile[]>('db_get_resurfaced_files', { count })
}

export async function dbRecordOpen(path: string): Promise<void> {
  await invoke('db_record_open', { path })
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

import { openPath, revealItemInDir } from '@tauri-apps/plugin-opener'

/**
 * Open a file with its default application
 * @param path - File path to open
 */
export async function openFile(path: string): Promise<void> {
  await openPath(path)
  await safeInvoke<void>('db_record_open', { path })
}

/**
 * Open a URL in the default browser.
 * In web mode this will fall back to `window.open`.
 */
export async function openUrl(url: string): Promise<void> {
  try {
    await openPath(url)
  } catch {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Reveal a file in Finder
 * @param path - File path to reveal
 */
export async function revealInFinder(path: string): Promise<void> {
  await revealItemInDir(path)
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
 * Get a file icon React element based on extension.
 * Uses Lucide React icons for a professional, consistent look.
 *
 * Defaults to `size: '1em'` so it scales with `text-*` classes.
 */
export function getFileIcon(
  fileType: string,
  props: Parameters<IconComponent>[0] = {}
) {
  const Icon = getFileTypeIcon(fileType)
  const { size, strokeWidth, ...rest } = props
  return createElement(Icon, {
    size: size ?? '1em',
    strokeWidth: strokeWidth ?? 2,
    ...rest,
  })
}

// ============================================================================
// TAURI-SPECIFIC UTILITIES
// ============================================================================

/**
 * Check if we're running in Tauri (vs browser during dev)
 */
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as Record<string, unknown>
  return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__)
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
// FILE WATCHER (Rust -> JS events + control)
// ============================================================================

export async function watchSetPaths(paths: string[]): Promise<void> {
  await safeInvoke<void>('watch_set_paths', { paths })
}

export async function watchStop(): Promise<void> {
  await safeInvoke<void>('watch_stop')
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
