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
