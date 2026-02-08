'use client'

import { Github, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-16 pb-8 text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <a
          href="https://github.com/SparkiePG/WebWhisper"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>
        <span className="text-border">•</span>
        <span className="flex items-center gap-1.5">
          Built with <Heart className="h-3 w-3 text-red-400" /> using Next.js
        </span>
        <span className="text-border">•</span>
        <span>Runs free on Vercel</span>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground/50">
        Please scrape responsibly. Respect robots.txt and website terms of service.
      </p>
    </footer>
  )
}
