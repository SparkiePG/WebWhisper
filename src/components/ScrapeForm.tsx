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
            e.preventDefault()
      if (!url.trim() || isLoading) return

      const options: ScrapeOptions = {
        mode,
        selector: selector.trim() || undefined,
      }

      onScrape(url.trim(), options)
    },
    [url, mode, selector, isLoading, onScrape]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
      {/* URL Input */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <div className="pl-4 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scrape (e.g., https://example.com)"
            className="flex-1 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className={cn(
              'mr-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
      </div>

      {/* Example URLs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {EXAMPLE_URLS.map((exampleUrl) => (
          <button
            key={exampleUrl}
            type="button"
            onClick={() => setUrl(exampleUrl)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {new URL(exampleUrl).hostname}
          </button>
        ))}
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Extraction Mode</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as ScrapeOptions['mode'])}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all',
                'hover:bg-accent/50 disabled:opacity-50',
                mode === value
                  ? 'border-primary/50 bg-primary/5 text-foreground ring-1 ring-primary/20'
                  : 'border-border bg-card text-muted-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', mode === value ? 'text-primary' : '')} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{label}</div>
                <div className="text-[10px] text-muted-foreground truncate hidden sm:block">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')}
          />
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <Crosshair className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <label htmlFor="selector" className="text-sm font-medium">
                  CSS Selector
                </label>
                <p className="text-[10px] text-muted-foreground">
                  Target specific elements (e.g., &quot;.article-body&quot;, &quot;#content&quot;, &quot;main p&quot;)
                </p>
              </div>
              <input
                id="selector"
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder=".content"
                disabled={isLoading}
                className="w-40 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
