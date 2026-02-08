export interface ScrapeOptions {
  mode: 'text' | 'html' | 'markdown' | 'links' | 'images' | 'metadata' | 'tables' | 'structured'
  selector?: string
  waitForSelector?: boolean
  includeHeaders?: boolean
  maxDepth?: number
}

export interface ScrapeResult {
  url: string
  title: string
  mode: string
  content: string
  metadata?: PageMetadata
  links?: LinkData[]
  images?: ImageData[]
  tables?: TableData[]
  structured?: StructuredData
  timestamp: string
  scrapeDuration: number
  contentLength: number
  statusCode: number
}

export interface PageMetadata {
  title: string
  description: string
  keywords: string
  author: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  canonical: string
  favicon: string
  language: string
  charset: string
  robots: string
  viewport: string
  themeColor: string
  generator: string
  [key: string]: string
}

export interface LinkData {
  text: string
  href: string
  isExternal: boolean
  rel?: string
}

export interface ImageData {
  src: string
  alt: string
  width?: string
  height?: string
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface StructuredData {
  headings: { level: number; text: string }[]
  paragraphs: string[]
  lists: { type: 'ul' | 'ol'; items: string[] }[]
}
