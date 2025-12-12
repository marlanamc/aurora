import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurora OS',
  description: 'A visual, ADHD-friendly file management layer for macOS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-macos-gray-50 text-macos-gray-900">
        {children}
      </body>
    </html>
  )
}
