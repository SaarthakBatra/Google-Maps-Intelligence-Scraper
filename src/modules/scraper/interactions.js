/**
 * Business listing interaction handlers
 * Handles clicking listings and waiting for details panel
 * @module scraper/interactions
 */

import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { randomDelay } from '../utils/delays.js';
import SELECTORS from './selectors.js';
import { scrollToListing } from './scroll.js';

/**
 * Click on a business listing by index
 * @param {Object} page - Playwright page instance
 * @param {number} index - Index of the listing to click (0-based)
 * @returns {Promise<Object>} Click result
 */
export async function clickListing(page, index) {
    try {
        const { interactionTimeout, maxRetries, retryDelay, randomDelays } = config.scraper;

        logger.debug(`Attempting to click listing ${index}`);

        // Get all listings
        const listings = await page.$$(SELECTORS.LISTING_CARD);

        if (index >= listings.length) {
            logger.error(`Listing index ${index} out of range (total: ${listings.length})`);
            return {
                success: false,
                message: `Index ${index} exceeds listing count ${listings.length}`,
            };
        }

        // Scroll to listing first
        await listings[index].scrollIntoViewIfNeeded();

        // Add small delay before clicking
        if (randomDelays) {
            await randomDelay(300, 800);
        }

        // Try to click with retries
        let attempts = 0;
        let clicked = false;

        while (attempts < maxRetries && !clicked) {
            try {
                // Find clickable link within the listing
                const linkHandle = await listings[index].$(SELECTORS.LISTING_LINK);

                if (linkHandle) {
                    await linkHandle.click({ timeout: interactionTimeout });
                    clicked = true;
                    logger.debug(`Successfully clicked listing ${index}`);
                } else {
                    // Fallback: click the listing card itself
                    await listings[index].click({ timeout: interactionTimeout });
                    clicked = true;
                    logger.debug(`Clicked listing card ${index} (fallback method)`);
                }
            } catch (error) {
                attempts++;
                logger.warn(`Click attempt ${attempts} failed:`, error.message);

                if (attempts < maxRetries) {
                    await page.waitForTimeout(retryDelay);
                }
            }
        }

        if (!clicked) {
            return {
                success: false,
                message: `Failed to click listing ${index} after ${maxRetries} attempts`,
            };
        }

        // Add delay after click
        if (randomDelays) {
            await randomDelay(500, 1000);
        }

        return {
            success: true,
            index,
        };
    } catch (error) {
        logger.error(`Error clicking listing ${index}:`, error);
        return {
            success: false,
            message: error.message,
        };
    }
}

/**
 * Wait for the details panel to fully load
 * @param {Object} page - Playwright page instance
 * @returns {Promise<Object>} Wait result
 */
export async function waitForDetailsPanel(page) {
    try {
        const { interactionTimeout } = config.scraper;

        logger.debug('Waiting for details panel to load...');

        // Wait for details panel to be visible (using robust selector)
        await page.waitForSelector(SELECTORS.DETAILS_PANEL, {
            timeout: interactionTimeout,
            state: 'visible',
        });

        // (Removed nested wait as SELECTORS.DETAILS_PANEL now targets the specific role="main")

        // CRITICAL: Wait for Business Name specifically
        // We use a robust multiple-selector strategy here
        let nameFound = false;
        const nameStartTime = Date.now();

        // Loop until timeout or found
        while (Date.now() - nameStartTime < interactionTimeout) {
            for (const nameSelector of SELECTORS.BUSINESS_NAME_SELECTORS) {
                try {
                    const element = await page.$(nameSelector);
                    if (element && await element.isVisible()) {
                        const text = await element.textContent();
                        if (text && text.trim().length > 0) {
                            nameFound = true;
                            // logger.debug(`Found business name with selector: ${nameSelector}`);
                            break;
                        }
                    }
                } catch (e) {
                    // Ignore individual selector errors
                }
            }

            if (nameFound) break;

            // Small wait before next check
            await page.waitForTimeout(100);
        }

        if (!nameFound) {
            logger.warn('Business name element not found after waiting (proceeding anyway to extract available data)');
        }

        // Wait for other optional elements (non-blocking)
        const optionalElements = [
            // Add other critical elements if needed, skipping name as we handled it
        ];

        // Wait for any loading spinners to disappear
        try {
            await page.waitForSelector(SELECTORS.LOADING_SPINNER, {
                timeout: 20000,
                state: 'hidden',
            });
        } catch (error) {
            // Spinner might not be present, that's okay
        }

        logger.debug('Details panel loaded (name check complete)');

        return {
            success: true,
            nameFound
        };
    } catch (error) {
        logger.error('Details panel failed to load:', error);
        return {
            success: false,
            message: error.message,
        };
    }
}


/**
 * Close the details panel and return to listing view
 * @param {Object} page - Playwright page instance
 * @returns {Promise<Object>} Close result
 */
export async function closeDetailsPanel(page) {
    try {
        const { interactionTimeout, randomDelays } = config.scraper;

        logger.debug('Closing details panel...');

        // Try pressing Escape key first (fastest method)
        await page.keyboard.press('Escape');

        // Add small delay
        if (randomDelays) {
            await randomDelay(300, 600);
        } else {
            await page.waitForTimeout(300);
        }

        // Verify details panel is closed by checking if results container is prominent
        try {
            await page.waitForSelector(SELECTORS.RESULTS_CONTAINER, {
                timeout: interactionTimeout,
                state: 'visible',
            });

            logger.debug('Details panel closed successfully');
            return { success: true };
        } catch (error) {
            // Escape didn't work, try clicking back button
            logger.debug('Escape key failed, trying back button...');

            const backButton = await page.$(SELECTORS.BACK_BUTTON);
            if (backButton) {
                await backButton.click();
                await page.waitForTimeout(500);

                logger.debug('Details panel closed via back button');
                return { success: true };
            }

            throw new Error('Could not close details panel');
        }
    } catch (error) {
        logger.error('Failed to close details panel:', error);
        return {
            success: false,
            message: error.message,
        };
    }
}


/**
 * Click on the "Reviews" tab in the details panel
 * @param {Object} page - Playwright page instance
 * @returns {Promise<Object>} Result
 */
export async function clickReviewsTab(page) {
    try {
        const { interactionTimeout, randomDelays } = config.scraper;
        logger.debug('Clicking Reviews tab...');

        const reviewsTab = await page.waitForSelector(SELECTORS.REVIEWS_TAB, {
            timeout: interactionTimeout,
            state: 'visible'
        });

        if (!reviewsTab) {
            throw new Error('Reviews tab not found');
        }

        await reviewsTab.click();

        if (randomDelays) {
            await randomDelay(500, 1000);
        }

        return { success: true };
    } catch (error) {
        logger.error('Failed to click Reviews tab:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Sort reviews by specific criterion
 * @param {Object} page - Playwright page instance
 * @param {string} sortBy - 'highest' | 'lowest' | 'newest'
 * @returns {Promise<Object>} Result
 */
export async function sortReviews(page, sortBy) {
    try {
        const { interactionTimeout, randomDelays } = config.scraper;
        const sortSelector = SELECTORS.SORT_MENU_OPTIONS[sortBy];

        if (!sortSelector) {
            return { success: false, message: `Invalid sort option: ${sortBy}` };
        }

        logger.debug(`Sorting reviews by: ${sortBy}`);

        // Click sort button
        const sortBtn = await page.$(SELECTORS.SORT_BUTTON);
        if (!sortBtn) {
            throw new Error('Sort button not found');
        }
        await sortBtn.click();

        if (randomDelays) await randomDelay(300, 600);

        // Click specific sort option
        const option = await page.waitForSelector(sortSelector, {
            timeout: interactionTimeout,
            state: 'visible'
        });
        await option.click();

        if (randomDelays) await randomDelay(1000, 2000); // Wait for reviews to reload

        return { success: true };
    } catch (error) {
        logger.error(`Failed to sort reviews by ${sortBy}:`, error);
        return { success: false, message: error.message };
    }
}

/**
 * Scroll the reviews panel to load target number of reviews
 * @param {Object} page - Playwright page instance
 * @param {number} targetCount - Number of reviews to load
 * @returns {Promise<Object>} Result
 */
export async function scrollReviewsPanel(page, targetCount) {
    try {
        const { maxScrollAttempts, scrollDelay, noNewResultsThreshold } = config.scraper;
        let attempts = 0;
        let noNewReviewsCount = 0;
        let previousReviewCount = 0;

        logger.debug(`Scrolling reviews panel to load ~${targetCount} reviews...`);

        // Locate the scrollable container for reviews (often the 2nd div.m6QErb.DxyBCb)
        // We need to be careful to target the correct container.
        // Usually, when reviews tab is active, the main role="main" container is the one.
        const scrollableSelector = SELECTORS.DETAILS_PANEL; // Using the main panel selector as scrolling context

        while (attempts < maxScrollAttempts) {
            // Count current reviews
            const reviews = await page.$$(SELECTORS.REVIEW_ITEM);
            const currentCount = reviews.length;

            if (currentCount >= targetCount) {
                logger.debug(`Reached target review count: ${currentCount}`);
                break;
            }

            if (currentCount === previousReviewCount) {
                noNewReviewsCount++;
            } else {
                noNewReviewsCount = 0;
            }

            if (noNewReviewsCount >= noNewResultsThreshold) {
                logger.debug(`No new reviews after ${noNewResultsThreshold} attempts. Stopping.`);
                break;
            }

            previousReviewCount = currentCount;

            // Scroll action: target the last review item to ensure we trigger loading
            if (reviews.length > 0) {
                await reviews[reviews.length - 1].scrollIntoViewIfNeeded();
            } else {
                // If no reviews found yet (rare), just wait
                await page.waitForTimeout(1000);
            }

            // Random delay
            await randomDelay(scrollDelay.min, scrollDelay.max);

            attempts++;
        }

        return {
            success: true,
            count: previousReviewCount
        };

    } catch (error) {
        logger.error('Failed to scroll reviews panel:', error);
        return { success: false, message: error.message };
    }
}
