import { parse } from 'node-html-parser';
import { cleanText } from './clean-text.js';

/**
 * Parses the search results list HTML.
 * @param {string} html - The HTML of the search results sidebar.
 * @returns {Array<{name: string, rating: number, address: string}>} - Array of partial business objects.
 */
export function parseSearchResults(html) {
    if (!html) return [];

    const root = parse(html);
    // Selector for individual result cards in the list
    const cardSelector = '.Nv2PK';
    const cards = root.querySelectorAll(cardSelector);

    return cards.map((card) => {
        try {
            const name = cleanText(card.querySelector('.qBF1Pd')?.text);
            if (!name) return null;

            const ratingEl = card.querySelector('.MW4etd');
            const rating = ratingEl ? parseFloat(ratingEl.text) : null;

            // Address is tricky in list view, often mixed with other text.
            // We look for the second line of text generally.
            // This is a simplified extraction and might need adjustment based on Google's specific DOM structure for list items.
            const addressEl = card.querySelector('.W4Egvd span:nth-child(2)');
            const address = cleanText(addressEl?.text);

            return {
                name,
                rating,
                address
            };
        } catch (e) {
            return null;
        }
    }).filter(Boolean);
}
