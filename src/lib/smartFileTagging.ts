import { type ValueIconId } from '@/lib/value-icons'

export interface SmartTagSuggestion {
  focusAreaId: string
  confidence: number // 0-1, how confident we are in this suggestion
  reason: string // Why we suggested this tag
}

export interface FileAnalysis {
  name: string
  path: string
  extension?: string
  size: number
  modifiedAt: number
}

/**
 * Analyze a file and suggest which focus areas it might belong to
 */
export function analyzeFileForTags(
  file: FileAnalysis,
  availableFocusAreas: Array<{ id: string; name: string; iconId: ValueIconId }>
): SmartTagSuggestion[] {
  const suggestions: SmartTagSuggestion[] = []
  const fileName = file.name.toLowerCase()
  const filePath = file.path.toLowerCase()

  // Define tagging patterns for different focus areas
  const patterns = {
    work: {
      keywords: [
        'project', 'meeting', 'proposal', 'deck', 'presentation', 'report',
        'spec', 'requirements', 'documentation', 'code', 'development',
        'ticket', 'jira', 'github', 'pull', 'commit', 'branch'
      ],
      paths: ['work', 'projects', 'client', 'business', 'office'],
      extensions: ['.docx', '.xlsx', '.pptx', '.pdf', '.md', '.txt']
    },
    health: {
      keywords: [
        'workout', 'exercise', 'run', 'yoga', 'stretch', 'gym', 'fitness',
        'health', 'doctor', 'appointment', 'therapy', 'pt', 'physical',
        'meal', 'nutrition', 'diet', 'sleep', 'rest', 'recovery'
      ],
      paths: ['health', 'fitness', 'medical', 'wellness', 'exercise'],
      extensions: ['.jpg', '.png', '.mov', '.mp4'] // Often photos/videos of workouts
    },
    relationships: {
      keywords: [
        'friend', 'family', 'partner', 'date', 'birthday', 'party', 'event',
        'photo', 'picture', 'memory', 'vacation', 'trip', 'gift', 'card',
        'message', 'chat', 'social', 'connect', 'relationship'
      ],
      paths: ['photos', 'pictures', 'memories', 'social', 'friends', 'family'],
      extensions: ['.jpg', '.png', '.mov', '.mp4', '.heic']
    },
    home: {
      keywords: [
        'rent', 'lease', 'utilities', 'bill', 'receipt', 'warranty', 'manual',
        'maintenance', 'clean', 'laundry', 'grocery', 'shopping', 'list',
        'home', 'apartment', 'house', 'repair', 'fix', 'insurance'
      ],
      paths: ['home', 'house', 'apartment', 'utilities', 'bills', 'documents'],
      extensions: ['.pdf', '.docx', '.jpg', '.png']
    },
    money: {
      keywords: [
        'invoice', 'receipt', 'budget', 'statement', 'bank', 'account',
        'salary', 'payroll', 'tax', 'expense', 'income', 'credit', 'debit',
        'payment', 'finance', 'financial', 'money', 'cash', 'check'
      ],
      paths: ['finance', 'money', 'banking', 'taxes', 'receipts', 'bills'],
      extensions: ['.pdf', '.xlsx', '.csv', '.docx']
    },
    learning: {
      keywords: [
        'study', 'course', 'tutorial', 'book', 'article', 'research',
        'learn', 'education', 'training', 'skill', 'knowledge', 'note',
        'summary', 'outline', 'lecture', 'class', 'school', 'university'
      ],
      paths: ['learning', 'education', 'study', 'courses', 'books', 'notes'],
      extensions: ['.pdf', '.epub', '.md', '.txt', '.docx']
    },
    support: {
      keywords: [
        'therapy', 'counseling', 'mental', 'health', 'support', 'journal',
        'reflection', 'mood', 'emotion', 'feeling', 'gratitude', 'meditation',
        'mindfulness', 'breathing', 'relaxation', 'self-care'
      ],
      paths: ['therapy', 'journal', 'reflection', 'mental-health', 'support'],
      extensions: ['.md', '.txt', '.pdf', '.docx']
    }
  }

  // Check each focus area for matches
  for (const [focusAreaId, pattern] of Object.entries(patterns)) {
    let confidence = 0
    let reasons: string[] = []

    // Check if this focus area exists in available areas
    const focusArea = availableFocusAreas.find(area => area.id === focusAreaId)
    if (!focusArea) continue

    // Keyword matching in filename
    const filenameMatches = pattern.keywords.filter(keyword =>
      fileName.includes(keyword)
    )
    if (filenameMatches.length > 0) {
      confidence += Math.min(filenameMatches.length * 0.2, 0.4)
      reasons.push(`Filename contains: ${filenameMatches.slice(0, 2).join(', ')}`)
    }

    // Path matching
    const pathMatches = pattern.paths.filter(pathKeyword =>
      filePath.includes(pathKeyword)
    )
    if (pathMatches.length > 0) {
      confidence += Math.min(pathMatches.length * 0.15, 0.3)
      reasons.push(`Path contains: ${pathMatches.join(', ')}`)
    }

    // Extension matching
    if (file.extension && pattern.extensions.includes(file.extension)) {
      confidence += 0.2
      reasons.push(`File type: ${file.extension}`)
    }

    // Size-based hints (large files might be important documents)
    if (file.size > 1024 * 1024) { // > 1MB
      confidence += 0.1
      reasons.push('Large file (potentially important)')
    }

    // Recent files get slight boost
    const daysSinceModified = (Date.now() - file.modifiedAt) / (1000 * 60 * 60 * 24)
    if (daysSinceModified < 7) {
      confidence += 0.1
      reasons.push('Recently modified')
    }

    // Only suggest if confidence is reasonable
    if (confidence >= 0.2) {
      suggestions.push({
        focusAreaId,
        confidence: Math.min(confidence, 1.0),
        reason: reasons.join(', ')
      })
    }
  }

  // Sort by confidence, highest first
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Get the best automatic tag suggestion for a file
 */
export function getBestTagSuggestion(
  file: FileAnalysis,
  availableFocusAreas: Array<{ id: string; name: string; iconId: ValueIconId }>
): SmartTagSuggestion | null {
  const suggestions = analyzeFileForTags(file, availableFocusAreas)
  return suggestions.length > 0 ? suggestions[0] : null
}

/**
 * Get all reasonable tag suggestions for a file
 */
export function getAllTagSuggestions(
  file: FileAnalysis,
  availableFocusAreas: Array<{ id: string; name: string; iconId: ValueIconId }>,
  minConfidence = 0.3
): SmartTagSuggestion[] {
  return analyzeFileForTags(file, availableFocusAreas)
    .filter(suggestion => suggestion.confidence >= minConfidence)
}