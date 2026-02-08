import { NextRequest, NextResponse } from 'next/server'
import { scrape } from '@/lib/scraper'
import { isValidUrl, normalizeUrl } from '@/lib/utils'
import type { ScrapeOptions } from '@/lib/types'

// Vercel free tier: max 10s execution
export const maxDuration = 10
export const dynamic = 'force-dynamic'

const VALID_MODES = ['text', 'html', 'markdown', 'links', 'images', 'metadata', 'tables', 'structured']

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 15 // 15 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }
}, 60000)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { url, options } = body as { url?: string; options?: ScrapeOptions }

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(url)

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid HTTP or HTTPS URL.' },
        { status: 400 }
      )
    }

    // Block private/internal URLs
    try {
      const parsedUrl = new URL(normalizedUrl)
      const hostname = parsedUrl.hostname.toLowerCase()
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
      const blockedPatterns = ['10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.', '169.254.']

      if (blockedHosts.includes(hostname) || blockedPatterns.some(p => hostname.startsWith(p))) {
        return NextResponse.json(
          { error: 'Cannot scrape internal or private network addresses.' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format.' },
        { status: 400 }
      )
    }

    // Validate options
    const scrapeOptions: ScrapeOptions = {
      mode: 'text',
      ...options,
    }

    if (!VALID_MODES.includes(scrapeOptions.mode)) {
      return NextResponse.json(
        { error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}` },
        { status: 400 }
      )
    }

    // Perform scraping
    const result = await scrape(normalizedUrl, scrapeOptions)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('Scrape error:', error.message)

    const statusCode = error.message?.includes('HTTP ') ? parseInt(error.message.split('HTTP ')[1]) || 500 : 500
    const isTimeout = error.message?.includes('timed out') || error.name === 'AbortError'

    return NextResponse.json(
      {
        error: isTimeout
          ? 'The request timed out. The target website may be slow or blocking automated requests. Try a different URL.'
          : error.message || 'An unexpected error occurred while scraping.',
      },
      { status: isTimeout ? 504 : Math.min(statusCode, 599) }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WebWhisper Scraper API',
    modes: VALID_MODES,
    rateLimit: `${RATE_LIMIT_MAX} requests per minute`,
  })
}
