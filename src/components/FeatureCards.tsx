'use client'

import {
  Zap,
  Shield,
  FileJson,
  Layers,
  Globe,
  Clock,
  Code,
  Download,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with lightweight HTML parsing. No heavy browser automation.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Shield,
    title: 'Free & Private',
    description: 'Runs on Vercel free tier. No data stored, no tracking, no API keys needed.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Layers,
    title: '8 Extraction Modes',
    description: 'Text, Markdown, HTML, Links, Images, Metadata, Tables, and Structured data.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Code,
    title: 'CSS Selectors',
    description: 'Target specific elements with CSS selectors for precise data extraction.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: FileJson,
    title: 'Multiple Formats',
    description: 'Export as JSON, Markdown, HTML, or plain text. Copy or download instantly.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Globe,
    title: 'Any Website',
    description: 'Scrape any publicly accessible website. Smart content detection built-in.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: Clock,
    title: 'Rate Limited',
    description: 'Built-in rate limiting protects both you and target websites from abuse.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description: 'Download results or copy to clipboard with a single click.',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
  },
]

export function FeatureCards() {
  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
        Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:bg-accent/30 transition-all duration-300"
          >
            <div className={`inline-flex rounded-lg ${feature.bg} p-2.5 mb-3`}>
              <feature.icon className={`h-5 w-5 ${feature.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
                  ))}
      </div>
    </div>
  )
}
