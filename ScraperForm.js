import React, { useState } from 'react';

const ScraperForm = ({ onSubmit }) => {
 const [url,Url] = useState('');
 const [query, setQuery] = useState('');

 const handleSubmit = (e) => {
 e.preventDefault();
 onSubmit(url, query);
 };

 return (
 <form onSubmit={handleSubmit} className="p-">
 <input
 type="text"
 value={url}
 onChange={(e) => setUrl(e.target.value)}
 placeholder="Enter URL"
 className="w-full p-2 mb-2 border rounded"
 required
 />
 <textarea
 valuequery}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Enter your query"
 className="w-full p-2 mb-2 border rounded"
 required
 ></textarea>
 <button type="submit" className="bg-blue-500-white p-2 rounded">
 Scrape
 </button>
 </form>
 );
};

export default ScraperForm;
