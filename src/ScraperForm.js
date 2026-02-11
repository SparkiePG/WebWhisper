import { useState } from 'react';

export default function ScraperForm({ setResults }) {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // AI Configuration
  const [provider, setProvider] = useState('groq'); // Default to the "Star"
  const [customApiKey, setCustomApiKey] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('https://api.openai.com/v1');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            url, 
            prompt, 
            provider, 
            customApiKey, 
            customBaseUrl 
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* URL INPUT */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Target URL</label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/products"
            className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* AI PROMPT INPUT */}
        <div>
          <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            ✨ AI Command (Thinking Power)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Find the cheapest item and return its name and price as JSON..."
            className="w-full bg-gray-950 text-white border border-indigo-900/50 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* SETTINGS TOGGLE */}
        <div className="pt-2">
            <button 
                type="button" 
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs text-gray-500 hover:text-white underline"
            >
                {showSettings ? 'Hide AI Settings' : 'Configure AI Provider (Llama 3 / Custom)'}
            </button>
        </div>

        {/* AI SETTINGS PANEL */}
        {showSettings && (
            <div className="p-4 bg-gray-800/50 rounded-lg space-y-3 border border-gray-700 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Model Provider</label>
                    <select 
                        value={provider} 
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm"
                    >
                        <option value="groq">Groq (Llama 3 - Free & Fast ⚡)</option>
                        <option value="custom">Custom API (OpenAI / DeepSeek / Ollama)</option>
                    </select>
                </div>

                {provider === 'groq' && (
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Groq API Key (Free at console.groq.com)</label>
                        <input 
                            type="password" 
                            placeholder="gsk_..." 
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm"
                        />
                    </div>
                )}

                {provider === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Base URL</label>
                            <input 
                                type="text" 
                                placeholder="https://api.openai.com/v1" 
                                value={customBaseUrl}
                                onChange={(e) => setCustomBaseUrl(e.target.value)}
                                className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">API Key</label>
                            <input 
                                type="password" 
                                placeholder="sk-..." 
                                value={customApiKey}
                                onChange={(e) => setCustomApiKey(e.target.value)}
                                className="w-full bg-gray-900 text-white border border-gray-600 rounded p-2 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
        >
          {loading ? 'Thinking & Scraping...' : 'Run WebWhisper'}
        </button>
      </form>
    </div>
  );
}
