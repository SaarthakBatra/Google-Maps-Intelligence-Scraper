import { parse } from 'node-html-parser';
import { cleanText } from './clean-text.js';

/**
 * Extracts reviews from the reviews container HTML.
 * @param {string} html - The HTML of the reviews section.
 * @returns {Array<{author: string, rating: number, text: string, time: string}>} - Array of review objects.
 */
export function extractReviews(html) {
    if (!html) return [];

    const root = parse(html);
    const reviewElements = root.querySelectorAll('.jftiEf'); // Standard Google Maps review class

    return reviewElements.map((el) => {
        const author = cleanText(el.querySelector('.d4r55')?.text);
        const ratingEl = el.querySelector('.kvMYJc');
        const rating = ratingEl ? parseFloat(ratingEl.getAttribute('aria-label') || '0') : 0;
        const text = cleanText(el.querySelector('.wiI7pd')?.text);
        const time = cleanText(el.querySelector('.rsqaWe')?.text);

        return {
            author,
            rating,
            text,
            time,
        };
    }).filter(review => review.author && review.rating); // Filter out empty/invalid reviews
}
