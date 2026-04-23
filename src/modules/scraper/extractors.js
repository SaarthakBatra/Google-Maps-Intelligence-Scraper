/**
 * HTML content extraction from page
 * Extracts HTML strings for parser module to process
 * @module scraper/extractors
 */

import logger from '../utils/logger.js';
import config from '../utils/config.js';
import SELECTORS from './selectors.js';

/**
 * Extract HTML of all listing cards from the results panel
 * @param {Object} page - Playwright page instance
 * @returns {Promise<Object>} Extraction result with HTML array
 */
export async function getListingsHTML(page) {
    try {
        const { loadTimeout } = config.scraper;

        logger.debug('Extracting listings HTML...');

        // Wait for results container
        await page.waitForSelector(SELECTORS.RESULTS_CONTAINER, {
            timeout: loadTimeout,
            state: 'visible',
        });

        // Extract outerHTML of each listing
        const listingsHTML = await page.$$eval(SELECTORS.LISTING_CARD, (listings) => {
            return listings.map((listing) => listing.outerHTML);
        });

        logger.info(`Extracted HTML for ${listingsHTML.length} listings`);

        return {
            success: true,
            count: listingsHTML.length,
            html: listingsHTML,
        };
    } catch (error) {
        logger.error('Failed to extract listings HTML:', error);
        return {
            success: false,
            count: 0,
            html: [],
            message: error.message,
        };
    }
}

/**
 * Extract HTML of the currently open details panel
 * @param {Object} page - Playwright page instance
 * @returns {Promise<Object>} Extraction result with HTML string
 */
export async function getDetailsHTML(page) {
    try {
        const { interactionTimeout } = config.scraper;

        logger.debug('Extracting details panel HTML...');

        // Wait for details panel to be visible
        await page.waitForSelector(SELECTORS.DETAILS_PANEL, {
            timeout: interactionTimeout,
            state: 'visible',
        });

        // Extract outerHTML of the details panel
        const detailsHTML = await page.$eval(SELECTORS.DETAILS_PANEL, (panel) => {
            return panel.outerHTML;
        });

        logger.debug('Details panel HTML extracted successfully');
        // logger.debug(detailsHTML);
        return {
            success: true,
            html: detailsHTML,
        };
    } catch (error) {
        logger.error('Failed to extract details HTML:', error);
        return {
            success: false,
            html: '',
            message: error.message,
        };
    }
}

/**
 * Extract raw text content from a specific selector
 * @param {Object} page - Playwright page instance
 * @param {string} selector - CSS selector to extract from
 * @returns {Promise<string|null>} Text content or null if not found
 */
export async function getTextContent(page, selector) {
    try {
        const element = await page.$(selector);

        if (!element) {
            return null;
        }

        const text = await element.textContent();
        return text ? text.trim() : null;
    } catch (error) {
        logger.debug(`Failed to extract text from selector ${selector}:`, error.message);
        return null;
    }
}
