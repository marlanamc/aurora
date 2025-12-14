'use client'

import type { FileInfo } from '@/lib/tauri'
import { useMemo } from 'react'
import { Rainbow } from '@/lib/icons'
import { ClusterTile } from './ClusterTile'
import { UnifiedCard, UnifiedCardHeader } from './UnifiedCard'

interface ActiveClustersSectionProps {
  files: FileInfo[]
}

interface Cluster {
  name: string
  files: FileInfo[]
}

function getParentFolder(path: string) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length < 2) return null
  return parts[parts.length - 2] ?? null
}

function getClusterName(file: FileInfo) {
  const tag = file.finder_tags?.find((t) => typeof t === 'string' && t.trim().length > 0) ?? null
  if (tag) return tag.startsWith('#') ? tag : `#${tag}`

  const folder = getParentFolder(file.path)
  if (folder) return folder

  const type = typeof file.file_type === 'string' && file.file_type.trim().length > 0 ? file.file_type.trim() : ''
  return type ? `.${type}` : 'Unsorted'
}

export function ActiveClustersSection({ files }: ActiveClustersSectionProps) {
  const displayClusters = useMemo(() => {
    if (files.length === 0) return [] as Cluster[]

    const groups = new Map<string, FileInfo[]>()
    for (const file of files) {
      const key = getClusterName(file)
      const list = groups.get(key)
      if (list) list.push(file)
      else groups.set(key, [file])
    }

    const clusters = Array.from(groups.entries()).map(([name, clusterFiles]) => ({
      name,
      files: [...clusterFiles].sort((a, b) => (b.last_opened_at ?? b.modified_at) - (a.last_opened_at ?? a.modified_at)),
    }))

    clusters.sort((a, b) => b.files.length - a.files.length || a.name.localeCompare(b.name))
    return clusters.slice(0, 8)
  }, [files])

  return (
    <UnifiedCard>
      {/* Section Header */}
      <UnifiedCardHeader
        icon={Rainbow}
        title="Emotional Worlds"
        subtitle="Visual zones of related ideas, not file folders"
      />

      {/* Clusters Grid */}
      {displayClusters.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--aurora-text-secondary)' }}>
          No clusters yet. Add folders in Settings to index, then optionally tag files in Finder to create “worlds”.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayClusters.map((cluster) => (
            <ClusterTile key={cluster.name} clusterName={cluster.name} files={cluster.files} />
          ))}
        </div>
      )}
    </UnifiedCard>
  )
}
