import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import type {
  ScrapeOptions,
  ScrapeResult,
  PageMetadata,
  LinkData,
  ImageData,
  TableData,
  StructuredData,
} from './types'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function fetchPage(url: string): Promise<{ html: string; statusCode: number }> {
  const controller = new AbortController()
  // Vercel free tier has 10s limit; we use 8s to leave room for processing
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Unsupported content type: ${contentType}. Only HTML pages are supported.`)
    }

    const html = await response.text()
    return { html, statusCode: response.status }
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 8 seconds. The website may be too slow or blocking automated requests.')
    }
    throw error
  }
}

function extractMetadata($: cheerio.CheerioAPI, url: string): PageMetadata {
  const getMeta = (name: string): string => {
    return (
      $(`meta[name="${name}"]`).attr('content') ||
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name.toLowerCase()}"]`).attr('content') ||
      ''
    )
  }

  let favicon = $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    $('link[rel="apple-touch-icon"]').attr('href') || ''

  if (favicon && !favicon.startsWith('http')) {
    try {
      favicon = new URL(favicon, url).href
    } catch { /* ignore */ }
  }

  return {
    title: $('title').text().trim(),
    description: getMeta('description'),
    keywords: getMeta('keywords'),
    author: getMeta('author'),
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    ogUrl: getMeta('og:url'),
    canonical: $('link[rel="canonical"]').attr('href') || '',
    favicon,
    language: $('html').attr('lang') || '',
    charset: $('meta[charset]').attr('charset') || getMeta('charset') || '',
    robots: getMeta('robots'),
    viewport: getMeta('viewport'),
    themeColor: getMeta('theme-color'),
    generator: getMeta('generator'),
  }
}

function extractLinks($: cheerio.CheerioAPI, baseUrl: string): LinkData[] {
  const links: LinkData[] = []
  const seen = new Set<string>()
  const baseHost = new URL(baseUrl).hostname

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim()
    const text = $(el).text().trim()

    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return
    }

    let absoluteHref = href
    try {
      absoluteHref = new URL(href, baseUrl).href
    } catch {
      return
    }

    if (seen.has(absoluteHref)) return
    seen.add(absoluteHref)

    let isExternal = false
    try {
      isExternal = new URL(absoluteHref).hostname !== baseHost
    } catch { /* ignore */ }

    links.push({
      text: text || absoluteHref,
      href: absoluteHref,
      isExternal,
      rel: $(el).attr('rel') || undefined,
    })
  })

  return links
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): ImageData[] {
  const images: ImageData[] = []
  const seen = new Set<string>()

  $('img[src]').each((_, el) => {
    let src = $(el).attr('src')?.trim() || $(el).attr('data-src')?.trim()
    if (!src) return

    try {
      src = new URL(src, baseUrl).href
    } catch {
      return
    }

    if (seen.has(src)) return
    seen.add(src)

    images.push({
      src,
      alt: $(el).attr('alt')?.trim() || '',
      width: $(el).attr('width') || undefined,
      height: $(el).attr('height') || undefined,
    })
  })

  return images
}

function extractTables($: cheerio.CheerioAPI): TableData[] {
  const tables: TableData[] = []

  $('table').each((_, table) => {
    const headers: string[] = []
    const rows: string[][] = []

    $(table).find('thead th, thead td, tr:first-child th').each((_, th) => {
      headers.push($(th).text().trim())
    })

    const dataRows = headers.length > 0
      ? $(table).find('tbody tr, tr:not(:first-child)')
      : $(table).find('tr')

    dataRows.each((_, tr) => {
      const row: string[] = []
      $(tr).find('td, th').each((_, td) => {
        row.push($(td).text().trim())
      })
      if (row.length > 0) {
        rows.push(row)
      }
    })

    if (headers.length > 0 || rows.length > 0) {
      tables.push({ headers, rows })
    }
  })

  return tables
}

function extractStructured($: cheerio.CheerioAPI): StructuredData {
  const headings: { level: number; text: string }[] = []
  const paragraphs: string[] = []
  const lists: { type: 'ul' | 'ol'; items: string[] }[] = []

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName.replace('h', ''))
    const text = $(el).text().trim()
    if (text) {
      headings.push({ level, text })
    }
  })

  $('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text && text.length > 10) {
      paragraphs.push(text)
    }
  })

  $('ul, ol').each((_, el) => {
    const type = el.tagName === 'ol' ? 'ol' : 'ul'
    const items: string[] = []
    $(el).children('li').each((_, li) => {
      const text = $(li).text().trim()
      if (text) items.push(text)
    })
    if (items.length > 0) {
      lists.push({ type: type as 'ul' | 'ol', items })
    }
  })

  return { headings, paragraphs, lists }
}

function extractText($: cheerio.CheerioAPI, selector?: string): string {
  // Remove script, style, and other non-content elements
  $('script, style, noscript, iframe, svg, nav, footer, header').remove()
  $('[style*="display:none"], [style*="display: none"], [hidden], .hidden').remove()

  if (selector) {
    const selected = $(selector)
    if (selected.length === 0) {
      throw new Error(`Selector "${selector}" matched no elements`)
    }
    return selected.text().replace(/\s+/g, ' ').trim()
  }

  // Try to find main content
