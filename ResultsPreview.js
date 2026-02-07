import React from 'react';

const ResultsPreview = ({ data }) => (
 <div className="p-">
 <h2 className="text-xl font-bold mb-2">Scraped Data</h2>
 <pre>{JSON.stringify(data, null, 2)}</pre>
 </div>
);

export default ResultsPreview;
