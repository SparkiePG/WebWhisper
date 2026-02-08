'use client'

import { useState, useMemo } from 'react'
import {
  Copy,
  Download,
  Check,
  Clock,
  FileText,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Link2,
  Table as TableIcon,
  BarChart3,
} from 'lucide-react'
import { cn, formatBytes, formatDuration, copyToClipboard, downloadFile } from '@/lib/utils'
import { toast } from 'sonner'
import type { ScrapeResult } from '@/lib/types'

interface ResultsPanelProps {
  result: ScrapeResult
}

type Tab = 'content' | 'links' | 'images' | 'tables' | 'metadata' | 'raw'

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['content']))

  const availableTabs = useMemo(() => {
    const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
      { id: 'content', label: 'Content', icon: FileText },
    ]

    if (result.links && result.links.length > 0) {
      tabs.push({ id: 'links', label: 'Links', icon: Link2, count: result.links.length })
    }
    if (result.images && result.images.length > 0) {
      tabs.push({ id: 'images', label: 'Images', icon: ImageIcon, count: result.images.length })
    }
    if (result.tables && result.tables.length > 0) {
      tabs.push({ id: 'tables', label: 'Tables', icon: TableIcon, count: result.tables.length })
    }
    if (result.metadata) {
      tabs.push({ id: 'metadata', label: 'Metadata', icon: BarChart3 })
    }
    tabs.push({ id: 'raw', label: 'Raw JSON', icon: FileText })

    return tabs
  }, [result])

  const handleCopy = async () => {
    try {
      const textToCopy = activeTab === 'raw' ? JSON.stringify(result, null, 2) : result.content
      await copyToClipboard(textToCopy)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const hostname = new URL(result.url).hostname.replace(/\./g, '_')

    let filename: string
    let content: string
    let mimeType: string

    switch (result.mode) {
      case 'html':
        filename = `${hostname}_${timestamp}.html`
        content = result.content
        mimeType = 'text/html'
        break
      case 'markdown':
        filename = `${hostname}_${timestamp}.md`
        content = result.content
        mimeType = 'text/markdown'
        break
      case 'metadata':
      case 'structured':
        filename = `${hostname}_${timestamp}.json`
        content = result.content
        mimeType = 'application/json'
        break
      default:
        if (activeTab === 'raw') {
          filename = `${hostname}_${timestamp}_raw.json`
          content = JSON.stringify(result, null, 2)
          mimeType = 'application/json'
        } else {
          filename = `${hostname}_${timestamp}.txt`
          content = result.content
          mimeType = 'text/plain'
        }
    }

    downloadFile(content, filename, mimeType)
    toast.success(`Downloaded ${filename}`)
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">URL:</span>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate max-w-xs"
          >
            {result.url}
          </a>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(result.scrapeDuration)}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {formatBytes(result.contentLength)}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium',
            result.statusCode === 200
              ? 'bg-green-500/10 text-green-400'
              : 'bg-yellow-500/10 text-yellow-400'
          )}>
            {result.statusCode}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {availableTabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {result.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {result.mode}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-h-[600px] overflow-auto">
          {activeTab === 'content' && (
            <ContentView content={result.content} mode={result.mode} />
          )}

          {activeTab === 'links' && result.links && (
            <LinksView links={result.links} />
          )}

          {activeTab === 'images' && result.images && (
            <ImagesView images={result.images} />
          )}

          {activeTab === 'tables' && result.tables && (
            <TablesView tables={result.tables} />
          )}

          {activeTab === 'metadata' && result.metadata && (
            <MetadataView metadata={result.metadata} />
          )}

          {activeTab === 'raw' && (
            <pre className="p-4 text-xs text-muted-foreground font-mono leading-relaxed">
              {JSON.stringify(result, null
                        {activeTab === 'raw' && (
            <pre className="p-4 text-xs text-muted-foreground font-mono leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Sub-components ---

function ContentView({ content, mode }: { content: string; mode: string }) {
  if (!content || content.trim().length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">No content extracted</p>
        <p className="text-xs mt-1">Try a different mode or CSS selector</p>
      </div>
    )
  }

  if (mode === 'html') {
    return (
      <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-x-auto">
        <code>{content}</code>
      </pre>
    )
  }

  if (mode === 'metadata' || mode === 'structured') {
    return (
      <pre className="p-4 text-xs font-mono leading-relaxed text-muted-foreground overflow-x-auto">
        {content}
      </pre>
    )
  }

  if (mode === 'markdown') {
    return (
      <div className="p-4">
        <pre className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-mono">
          {content}
        </pre>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {content}
      </p>
    </div>
  )
}

function LinksView({ links }: { links: NonNullable<ScrapeResult['links']> }) {
  const [filter, setFilter] = useState<'all' | 'internal' | 'external'>('all')

  const filtered = useMemo(() => {
    if (filter === 'internal') return links.filter((l) => !l.isExternal)
    if (filter === 'external') return links.filter((l) => l.isExternal)
    return links
  }, [links, filter])

  const internalCount = links.filter((l) => !l.isExternal).length
  const externalCount = links.filter((l) => l.isExternal).length

  return (
    <div>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        {(['all', 'internal', 'external'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              filter === f
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f === 'all' && `All (${links.length})`}
            {f === 'internal' && `Internal (${internalCount})`}
            {f === 'external' && `External (${externalCount})`}
          </button>
        ))}
      </div>
      <div className="divide-y divide-border">
        {filtered.map((link, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors">
            <Link2 className={cn('h-3.5 w-3.5 shrink-0', link.isExternal ? 'text-yellow-400' : 'text-primary')} />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate text-foreground">{link.text}</p>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary truncate block"
              >
                {link.href}
              </a>
            </div>
            {link.isExternal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 shrink-0">
                external
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No links found for this filter
          </div>
        )}
      </div>
    </div>
  )
}

function ImagesView({ images }: { images: NonNullable<ScrapeResult['images']> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
      {images.map((img, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted/20 overflow-hidden">
          <div className="aspect-video bg-muted/50 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt || 'Image'}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.innerHTML = '<div class="flex flex-col items-center gap-1 text-muted-foreground"><svg class="h-8 w-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span class="text-xs">Failed to load</span></div>'
              }}
            />
          </div>
          <div className="p-2.5">
            <p className="text-xs text-foreground truncate">{img.alt || '(no alt text)'}</p>
            <a
              href={img.src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-primary truncate block mt-0.5"
            >
              {img.src}
            </a>
            {(img.width || img.height) && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {img.width}×{img.height}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TablesView({ tables }: { tables: NonNullable<ScrapeResult['tables']> }) {
  return (
    <div className="space-y-4 p-4">
      {tables.map((table, i) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden">
          <div className="px-3 py-2 bg-muted/30 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">
              Table {i + 1} — {table.rows.length} rows
              {table.headers.length > 0 && `, ${table.headers.length} columns`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {table.headers.length > 0 && (
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {table.headers.map((h, j) => (
                      <th key={j} className="px-3 py-2 text-left font-medium text-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {table.rows.map((row, j) => (
                  <tr key={j} className="border-b border-border last:border-0 hover:bg-accent/20">
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-muted-foreground whitespace-nowrap max-w-xs truncate">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function MetadataView({ metadata }: { metadata: NonNullable<ScrapeResult['metadata']> }) {
  const entries = Object.entries(metadata).filter(([_, value]) => value && value.trim() !== '')

  return (
    <div className="divide-y divide-border">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start gap-4 px-4 py-3 hover:bg-accent/20 transition-colors">
          <span className="text-xs font-medium text-muted-foreground w-32 shrink-0 pt-0.5">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
          <span className="text-sm text-foreground break-all">
            {key === 'ogImage' || key === 'favicon' ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {value}
              </a>
            ) : (
              value
            )}
          </span>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No metadata found
        </div>
      )}
    </div>
  )
}
