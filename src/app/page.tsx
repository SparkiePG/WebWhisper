'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { ScrapeForm } from '@/components/ScrapeForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { FeatureCards } from '@/components/FeatureCards'
import { Footer } from '@/components/Footer'
import type { ScrapeResult, ScrapeOptions } from '@/lib/types'

export default function Home() {
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async (url: string, options: ScrapeOptions) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to scrape`)
      }

      setResult(data)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The website may be too slow or blocking requests.')
      } else {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-teal-500/3 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Header />

        <div className="mt-12 space-y-8">
          <ScrapeForm onScrape={handleScrape} isLoading={isLoading} />

          {error && (
            <div className="animate-fade-in rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-destructive mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-destructive">Scraping Failed</p>
                  <p className="mt-1 text-sm
                                    <p className="mt-1 text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Scraping in progress...</p>
                </div>
                <div className="space-y-3">
                  <div className="shimmer h-4 w-3/4 rounded" />
                  <div className="shimmer h-4 w-1/2 rounded" />
                  <div className="shimmer h-4 w-5/6 rounded" />
                  <div className="shimmer h-4 w-2/3 rounded" />
                </div>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <ResultsPanel result={result} />
          )}

          {!result && !isLoading && !error && (
            <FeatureCards />
          )}
        </div>

        <Footer />
      </div>
    </main>
  )
}
