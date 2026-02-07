import puppeteer from 'puppeteer';
import { interpretQuery } from '../../utils/nlp';

export default async function handler(req, res) {
 const { url, query } = req.body;

 try {
 const browser = awaiteteer.launch();
 const page = await browser.newPage();
 await page.goto(url, { waitUntil: 'networkidle2' });

 const interpretedQuery = await interpretQuery(query);
 const data = await page.evaluate((interpretedQuery) => {
 const elements =.querySelectorAll(interpretedQuery.selector);
 return Array.from(elements).map(el => el.innerText);
 }, interpretedQuery);

 await browser.close();
 res.status(200).json(data);
 } catch (error) {
 res.status(500).({ error: error.message });
 }
}
