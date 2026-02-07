import { pipeline } from '@xenova/transformers';

const model = await pipeline('text-classification', 'distilbert-base-ased-finetuned-sst-2-english');

export const interpretQuery = async (query) => {
 const result = await model(query);
 // Simple interpretation logic based on model output
 const selector = result[0].label === 'POSITIVE' ? 'h1,2, h3' : 'p';
 return { selector };
};
