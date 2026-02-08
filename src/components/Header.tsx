'use client'

import { Globe } from 'lucide-react'

export function Header() {
  return (
    <header className="text-center animate-fade-in">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl" />
          <div className="relative rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 p-3">
            <Globe className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="gradient-text">WebWhisper</span>
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Extract any data from any website. Fast, free, and beautifully simple.
      </p>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Free Tier Compatible
        </span>
        <span className="text-border">•</span>
        <span>No API Key Required</span>
        <span className="text-border">•</span>
        <span>8 Extraction Modes</span>
      </div>
    </header>
  )
}
