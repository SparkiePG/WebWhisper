# 🕸️ WebWhisper

A powerful, free web scraper with a beautiful UI. Extract any data from any website. Deployable on Vercel's free tier.

![WebWhisper](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Free%20Tier-black?style=flat-square&logo=vercel)

## ✨ Features

- **8 Extraction Modes**: Text, Markdown, HTML, Links, Images, Metadata, Tables, Structured
- **CSS Selector Support**: Target specific elements for precise extraction
- **Beautiful Dark UI**: Modern, responsive interface with animations
- **One-Click Export**: Copy to clipboard or download as file
- **Free Tier Compatible**: Runs within Vercel's 10s serverless function limit
- **No API Keys**: Works out of the box, no configuration needed
- **Rate Limited**: Built-in protection against abuse
- **SSRF Protected**: Blocks requests to internal/private networks

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SparkiePG/WebWhisper)

### Local Development

```bash
# Clone the repository
git clone https://github.com/SparkiePG/WebWhisper.git
cd WebWhisper

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
