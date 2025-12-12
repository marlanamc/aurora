'use client'

import { useEffect, useState } from 'react'
import { greet, scanDirectories, type FileInfo } from '@/lib/tauri'
import { FileGrid } from '@/components/FileGrid'
import { ResurfaceCarousel } from '@/components/ResurfaceCarousel'
import { RecentsPanel } from '@/components/RecentsPanel'

export default function HomePage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState('')

  // Test the Rust connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const message = await greet('Aurora User')
        setGreeting(message)
        console.log('✅ Rust connection working:', message)
      } catch (error) {
        console.error('❌ Failed to connect to Rust:', error)
      }
    }

    testConnection()
  }, [])

  // Load files on mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    try {
      // Scan your specified directories
      const scannedFiles = await scanDirectories([
        '/Users/marlanacreed/Downloads/Projects',
        '/Users/marlanacreed/Documents/My Folders',
      ])

      console.log(`📁 Loaded ${scannedFiles.length} files`)
      setFiles(scannedFiles)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-macos-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 glass border-b border-macos-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-macos-gray-900">
              Aurora OS 🌟
            </h1>
            <p className="text-sm text-macos-gray-600 mt-1">
              Your files, alive and memorable
            </p>
          </div>

          <button
            onClick={loadFiles}
            disabled={loading}
            className="macos-button"
          >
            {loading ? 'Scanning...' : 'Refresh Files'}
          </button>
        </header>

        {/* Resurfacing Carousel - "Remember This?" */}
        <div className="px-8 py-4">
          <ResurfaceCarousel files={files} />
        </div>

        {/* File Grid - The main tile view */}
        <div className="flex-1 overflow-auto px-8 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-macos-gray-600">
                  Scanning your files...
                </p>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-macos-gray-600">
                  No files found yet
                </p>
                <button
                  onClick={loadFiles}
                  className="macos-button mt-4"
                >
                  Scan Directories
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-macos-gray-900 mb-2">
                  All Files
                </h2>
                <p className="text-sm text-macos-gray-600">
                  {files.length} files indexed
                </p>
              </div>
              <FileGrid files={files} />
            </>
          )}
        </div>
      </main>

      {/* Right Sidebar - Recents Feed */}
      <aside className="w-80 glass border-l border-macos-gray-200 overflow-auto">
        <RecentsPanel files={files} />
      </aside>

      {/* Debug: Show greeting from Rust */}
      {greeting && (
        <div className="fixed bottom-4 left-4 text-xs text-macos-gray-500">
          {greeting}
        </div>
      )}
    </div>
  )
}
