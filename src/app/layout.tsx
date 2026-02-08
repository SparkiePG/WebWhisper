import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WebWhisper - Intelligent Web Scraper',
  description: 'A powerful, free web scraper with a beautiful UI. Extract any data from any website.',
  keywords: ['web scraper', 'data extraction', 'free scraper', 'web crawler'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(224 71% 4%)',
              border: '1px solid hsl(215 20% 20%)',
              color: 'hsl(213 31% 91%)',
            },
          }}
        />
      </body>
    </html>
  )
}
