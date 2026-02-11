import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

// Initialize Groq (The Open Source "Top Star" runner)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_...', // Fallback or env var
});

export const runtime = 'nodejs'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, prompt, provider, customApiKey, customBaseUrl } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. SCRAPE & CLEAN (The "Eyes")
    // We mimic a real browser to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) throw new Error(`Failed to fetch site: ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove junk to save "Thinking" tokens
    $('script, style, svg, iframe, nav, footer').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000); // 15k char limit

    // 2. THINKING MODE (The "Brain")
    if (prompt && prompt.length > 0) {
      
      let aiResponse = "";
      
      // OPTION A: GROQ (Llama 3 - Fast, Free, Open Source Star)
      if (provider === 'groq') {
        const apiKeyToUse = customApiKey || process.env.GROQ_API_KEY;
        if (!apiKeyToUse) throw new Error("Groq API Key missing. Add it in settings or .env");

        const groqClient = new Groq({ apiKey: apiKeyToUse });
        const completion = await groqClient.chat.completions.create({
          messages: [
            { role: "system", content: "You are a Web Scraper Assistant. Extract data from the text provided based on the user's request. Return strictly JSON." },
            { role: "user", content: `Context: ${textContent}\n\nTask: ${prompt}\n\nReturn JSON only.` }
          ],
          model: "llama3-8b-8192", // The Open Source Star
          response_format: { type: "json_object" },
          temperature: 0.1,
        });
        aiResponse = completion.choices[0]?.message?.content || "{}";
      }

      // OPTION B: CUSTOM / OTHER (OpenAI, DeepSeek, Ollama)
      else if (provider === 'custom') {
        if (!customBaseUrl) throw new Error("Custom Base URL is required for Custom provider.");
        
        // Generic fetch for OpenAI-compatible endpoints
        const aiReq = await fetch(`${customBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customApiKey || 'dummy'}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Usually ignored by local models like Ollama
                messages: [
                    { role: "system", content: "Analyze the text and extract data as JSON." },
                    { role: "user", content: `Context: ${textContent}\n\nTask: ${prompt}` }
                ],
                response_format: { type: "json_object" }
            })
        });
        const aiJson = await aiReq.json();
        aiResponse = aiJson.choices?.[0]?.message?.content || "{}";
      }

      return NextResponse.json({
        data: JSON.parse(aiResponse),
        meta: { title: $('title').text(), provider: provider }
      });
    }

    // Default Fallback: Return raw text if no prompt
    return NextResponse.json({
      data: { content: textContent },
      meta: { title: $('title').text() }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
