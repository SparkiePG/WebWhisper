import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

// Initialize OpenAI (You need an API key for "Thinking Power")
// If no key is found, it will fallback to standard scraping
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export const runtime = 'nodejs'; // Use nodejs runtime for Cheerio compatibility

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, mode, prompt } = body; // 'prompt' is the user's specific question

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. FETCH THE HTML (Mimicking a real browser header to avoid blocks)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch site: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. CLEANUP (Remove junk to save AI tokens and processing time)
    $('script').remove();
    $('style').remove();
    $('svg').remove();
    $('iframe').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit text for AI context window

    // 3. LOGIC SWITCH: STANDARD SCRAPING VS. THINKING MODE
    
    // CASE A: THINKING MODE (AI)
    if (mode === 'ai' || (prompt && prompt.length > 0)) {
      if (!openai) {
        return NextResponse.json({ 
          error: "To use Thinking Power, you must add OPENAI_API_KEY to your .env file." 
        }, { status: 500 });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast and cheap for this use case
        messages: [
          {
            role: "system",
            content: "You are a Web Whisperer. You extract specific data from raw website text based on user intent. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: `I have scraped a website. Here is the text content: "${textContent}"\n\nUser Request: "${prompt}"\n\nAnalyze the text and return the answer as a JSON object.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
      
      return NextResponse.json({
        data: aiResponse,
        meta: {
          title: $('title').text(),
          mode: 'ai_analysis'
        }
      });
    }

    // CASE B: STANDARD MODES (Legacy support)
    let resultData: any = textContent; // Default to text

    if (mode === 'html') resultData = html;
    if (mode === 'links') {
      resultData = [];
      $('a').each((_, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href) resultData.push({ text, href });
      });
    }
    if (mode === 'images') {
      resultData = [];
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src) resultData.push(src);
      });
    }

    return NextResponse.json({
      data: resultData,
      meta: {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content') || '',
        mode: mode || 'text'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
