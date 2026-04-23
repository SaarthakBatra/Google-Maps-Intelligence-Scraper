import { parse } from 'node-html-parser';
import { cleanText } from './clean-text.js';
import { extractReviews } from './extract-reviews.js';
import SELECTORS from '../scraper/selectors.js';
import logger from '../utils/logger.js';

/**
 * Parses the detailed business listing HTML.
 * @param {string} html - The HTML content of the business detail panel.
 * @param {object} [reviewsData={}] - Optional map of sortOption -> html for reviews.
 * @param {string|null} [url=null] - Optional URL of the listing.
 * @returns {object|null} - Structured business data or null if invalid.
 */
export function parseListing(html, reviewsData = {}, url = null) {
    logger.debug('Parsing listing HTML...');
    if (!html) return null;

    const root = parse(html);

    try {
        let name = null;
        if (SELECTORS.BUSINESS_NAME_SELECTORS && Array.isArray(SELECTORS.BUSINESS_NAME_SELECTORS)) {
            for (const selector of SELECTORS.BUSINESS_NAME_SELECTORS) {
                const el = root.querySelector(selector);
                if (el) {
                    name = cleanText(el.text);
                    if (name) break;
                }
            }
        }

        // Fallback to primary selector if loop didn't find it
        if (!name) {
            name = cleanText(root.querySelector(SELECTORS.BUSINESS_NAME)?.text);
        }

        if (!name) {
            console.warn(`Parser: All name selectors failed to find element or text.`);
            return null;
        }

        // Address and Phone are inside specific buttons with class .Io6YTe
        const address = cleanText(root.querySelector(`${SELECTORS.BUSINESS_ADDRESS} .Io6YTe`)?.text);
        const phone = cleanText(root.querySelector(`${SELECTORS.BUSINESS_PHONE} .Io6YTe`)?.text);
        const website = root.querySelector(SELECTORS.BUSINESS_WEBSITE)?.getAttribute('href');

        // Rating and Reviews Count
        const ratingEl = root.querySelector(SELECTORS.BUSINESS_RATING);
        const rating = ratingEl ? parseFloat(ratingEl.text) : null;

        // Reviews count is usually the span after the rating stars/score
        // This might need adjustment if the DOM structure is very different, 
        // but often it's in the same container.
        // For now, let's look for the element with parens or specifically the reviews count selector
        const reviewsCountEl = root.querySelector(SELECTORS.BUSINESS_REVIEWS_COUNT) ||
            root.querySelector('.F7nice span:last-child'); // Fallback

        let reviewsCount = 0;
        if (reviewsCountEl) {
            const reviewsCountText = reviewsCountEl.text.replace(/\(|\)/g, '').replace(/,/g, '');
            reviewsCount = parseInt(reviewsCountText, 10) || 0;
        }

        // Category
        const category = cleanText(root.querySelector(SELECTORS.BUSINESS_TYPE)?.text);

        // Hours (This is often complex, keeping simplified extraction for now)
        const hours = cleanText(root.querySelector('.t39EBf')?.text);

        // Reviews Extraction & Merging
        let allReviews = extractReviews(html);

        if (reviewsData && typeof reviewsData === 'object') {
            for (const [sortOption, reviewHtml] of Object.entries(reviewsData)) {
                if (reviewHtml) {
                    const extracted = extractReviews(reviewHtml);
                    allReviews = allReviews.concat(extracted);
                }
            }
        }

        // Deduplicate reviews based on a unique key (author + text + rating)
        const uniqueReviewsMap = new Map();
        allReviews.forEach(review => {
            // Create a composite key. Use a fallback for missing fields if necessary, 
            // but extractReviews filters out reviews without author/rating.
            // Using text as part of key helps differentiate multiple reviews by same person (rare but possible)
            // or just ensures uniqueness.
            // Normalize key parts to avoid subtle diffs.
            const key = `${review.author}||${review.rating}||${(review.text || '').substring(0, 50)}`;

            // If we have a more complete review (e.g. detailed text) we might want to keep that, 
            // but usually they are similar. The 'newest' or specific sort might have better data?
            // For now, first come first serve or just overwrite.
            // Let's overwrite so that if we process 'newest' last (or however the order is), we get that?
            // Actually, 'html' (overview) usually has the "Most relevant".
            // If we just want unique set, simpler is better.
            if (!uniqueReviewsMap.has(key)) {
                uniqueReviewsMap.set(key, review);
            }
        });

        const reviews = Array.from(uniqueReviewsMap.values());

        // Sponsored Status
        // Check if the sponsored label exists in the DOM
        const isSponsored = !!root.querySelector(SELECTORS.SPONSORED_LABEL);

        return {
            name,
            address,
            phone,
            website: website || null,
            rating,
            reviewsCount,
            category,
            hours,
            reviews,
            isSponsored,
            url,
        };
    } catch (error) {
        console.error('Error parsing listing:', error);
        return null;
    }
}
