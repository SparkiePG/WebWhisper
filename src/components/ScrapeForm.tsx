'use client'

import { useState, useCallback } from 'react'
import {
  Search,
  FileText,
  Code,
  FileDown,
  Link2,
  Image,
  Info,
  Table,
  Layers,
  ChevronDown,
  Crosshair,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScrapeOptions } from '@/lib/types'

interface ScrapeFormProps {
  onScrape: (url: string, options: ScrapeOptions) => void
  isLoading: boolean
}

const MODES = [
  { value: 'text', label: 'Text', icon: FileText, description: 'Clean text content' },
  { value: 'markdown', label: 'Markdown', icon: FileDown, description: 'Formatted markdown' },
  { value: 'html', label: 'HTML', icon: Code, description: 'Raw HTML content' },
  { value: 'links', label: 'Links', icon: Link2, description: 'All page links' },
  { value: 'images', label: 'Images', icon: Image, description: 'All image URLs' },
  { value: 'metadata', label: 'Metadata', icon: Info, description: 'Page meta tags' },
  { value: 'tables', label: 'Tables', icon: Table, description: 'Table data' },
  { value: 'structured', label: 'Structured', icon: Layers, description: 'Headings, paragraphs, lists' },
] as const

const EXAMPLE_URLS = [
  'https://example.com',
  'https://news.ycombinator.com',
  'https://en.wikipedia.org/wiki/Web_scraping',
  'https://httpbin.org/html',
]

export function ScrapeForm({ onScrape, isLoading }: ScrapeFormProps) {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ScrapeOptions['mode']>('text')
  const [selector, setSelector] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e
