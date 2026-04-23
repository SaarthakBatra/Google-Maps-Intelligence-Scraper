/**
 * Scraper Module - Main Entry Point
 * Google Maps browser automation using Playwright
 * @module scraper
 */

// Browser lifecycle
export { launchBrowser, closeBrowser } from './browser.js';

// Navigation
export { navigateToSearch } from './navigate.js';

// Scrolling
export { scrollToLoadAll, scrollToListing } from './scroll.js';

// Interactions
export { clickListing, waitForDetailsPanel, closeDetailsPanel, clickReviewsTab, sortReviews, scrollReviewsPanel } from './interactions.js';

// Extractors
export { getListingsHTML, getDetailsHTML, getTextContent } from './extractors.js';

// Selectors (for advanced usage)
export { default as SELECTORS } from './selectors.js';

/**
 * High-level scraper workflow orchestration
 * @module scraper/workflow
 */
import { launchBrowser, closeBrowser } from './browser.js';
import { navigateToSearch } from './navigate.js';
import { scrollToLoadAll } from './scroll.js';
import { clickListing, waitForDetailsPanel, closeDetailsPanel, clickReviewsTab, sortReviews, scrollReviewsPanel } from './interactions.js';
import { getListingsHTML, getDetailsHTML } from './extractors.js';
import logger from '../utils/logger.js';
import config from '../utils/config.js';

/**
 * Execute a complete scraping workflow
 * @param {string} searchQuery - Business type to search
 * @param {string} location - Location to search in
 * @param {Object} options - Additional options
 * @param {boolean} [options.extractDetails] - Whether to click each listing for details
 * @param {number} [options.maxListings] - Maximum number of listings to process
 * @param {boolean} [options.skipScroll] - Whether to skip infinite scrolling (useful for testing)
 * @param {boolean} [options.skipReview] - Whether to skip review extraction (useful for testing)
 * @returns {Promise<Object>} Scraping results
 */
export async function executeScrapeWorkflow(searchQuery, location, options = {}) {
    const {
        extractDetails = false,
        maxListings = Infinity,
        skipScroll = false,
        skipReview = false,
    } = options;

    let browser = null;
    let context = null;
    let page = null;

    try {
        logger.info('Starting scrape workflow...');

        // 1. Launch browser
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // 2. Navigate to search
        const navResult = await navigateToSearch(page, searchQuery, location);
        if (!navResult.success) {
            throw new Error(`Navigation failed: ${navResult.message}`);
        }

        // 3. Scroll to load all listings
        let scrollCount = 0;
        if (!skipScroll) {
            const scrollResult = await scrollToLoadAll(page);
            if (!scrollResult.success) {
                throw new Error(`Scroll failed: ${scrollResult.message}`);
            }
            scrollCount = scrollResult.count;
            logger.info(`Loaded ${scrollCount} listings`);
        } else {
            logger.info('Skipping scroll (skipScroll=true)');
        }

        // 4. Extract listings HTML
        const listingsResult = await getListingsHTML(page);
        if (!listingsResult.success) {
            throw new Error(`Listings extraction failed: ${listingsResult.message}`);
        }

        const results = {
            query: searchQuery,
            location,
            totalListings: listingsResult.count,
            listingsHTML: listingsResult.html,
            detailsHTML: [],
        };

        // 5. Optionally extract details for each listing
        if (extractDetails) {
            const listingsToProcess = Math.min(maxListings, listingsResult.count);
            logger.info(`Extracting details for ${listingsToProcess} listings...`);

            for (let i = 0; i < listingsToProcess; i++) {
                try {
                    // Click listing
                    const clickResult = await clickListing(page, i);
                    if (!clickResult.success) {
                        logger.warn(`Failed to click listing ${i}, skipping`);
                        results.detailsHTML.push(null);
                        continue;
                    }

                    // Wait for details to load
                    const waitResult = await waitForDetailsPanel(page);
                    if (!waitResult.success) {
                        logger.warn(`Details panel failed to load for listing ${i}`);
                        results.detailsHTML.push(null);
                        await closeDetailsPanel(page);
                        await closeDetailsPanel(page);
                        continue;
                    }

                    // Capture URL immediately after details panel loads
                    const listingUrl = page.url()?.split('?')[0];

                    // Extract Overview HTML immediately (before review interaction changes state)
                    const overviewResult = await getDetailsHTML(page);
                    const overviewHTML = overviewResult.success ? overviewResult.html : null;

                    // --- Review Extraction Start ---
                    let reviewsData = {};
                    if (skipReview) {
                        try {
                            const { reviews } = config.scraper;

                            // Click Reviews Tab
                            const tabResult = await clickReviewsTab(page);
                            if (tabResult.success) {
                                for (const sortType of reviews.sort) {
                                    // Sort
                                    await sortReviews(page, sortType);

                                    // Scroll
                                    await scrollReviewsPanel(page, reviews.maxPerSort);

                                    // Extract HTML (reusing getDetailsHTML as it grabs the whole panel content)
                                    const reviewHtmlResult = await getDetailsHTML(page);
                                    if (reviewHtmlResult.success) {
                                        reviewsData[sortType] = reviewHtmlResult.html;
                                    }
                                }
                            }
                        } catch (reviewError) {
                            logger.warn(`Review extraction failed for listing ${i}:`, reviewError.message);
                        }
                    }
                    // --- Review Extraction End ---

                    // Extract details HTML (Default view)
                    // We might want to switch back to "Overview" tab if we want the standard details, 
                    // but usually the initial load has it. Since we are now in Reviews tab,
                    // we should probably store the initial details BEFORE clicking reviews, or accept that
                    // we are storing the review-tab state.
                    // A better approach: Extract overview HTML *before* interacting with reviews.

                    // Let's refine the flow:
                    // 1. Wait for panel -> Extract Overview HTML
                    // 2. Click Reviews -> Extract Review HTMLs

                    // (NOTE: The current getDetailsHTML is simple outerHTML of the panel. 
                    // If we want separate "Overview" data, we should have extracted it 
                    // right after waitForDetailsPanel and BEFORE clickReviewsTab.
                    // However, to keep this change focused, I will stick to the plan 
                    // but we must acknowledge that "detailsHTML" in the result might 
                    // end up being the LAST state (which is the reviews state).
                    // To fix this, I will fetch detailsHTML *before* review interactions.)

                    // Construct final details using captured overview and reviews
                    const finalDetailsData = {
                        overview: overviewHTML,
                        reviews: reviewsData,
                        url: listingUrl
                    };

                    results.detailsHTML.push(finalDetailsData);

                    // Close details panel
                    await closeDetailsPanel(page);

                    logger.debug(`Processed listing ${i + 1}/${listingsToProcess}`);
                } catch (error) {
                    logger.error(`Error processing listing ${i}:`, error);
                    results.detailsHTML.push(null);
                }
            }
        }

        logger.info('Scrape workflow completed successfully');

        return {
            success: true,
            data: results,
        };
    } catch (error) {
        logger.error('Scrape workflow failed:', error);
        return {
            success: false,
            message: error.message,
        };
    } finally {
        // Cleanup
        if (context) {
            try {
                await context.clearCookies();
                await context.clearPermissions();
                logger.debug('Session data cleared');
            } catch (cleanupError) {
                logger.warn('Failed to clear session data:', cleanupError.message);
            }
        }
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    }
}
