/**
 * Google Maps navigation functionality
 * Handles URL construction and page navigation
 * @module scraper/navigate
 */

import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { randomDelay } from '../utils/delays.js';
import SELECTORS from './selectors.js';

/**
 * Navigate to Google Maps search results
 * @param {Object} page - Playwright page instance
 * @param {string} searchQuery - Business type to search for (e.g., "restaurants")
 * @param {string} location - Location to search in (e.g., "Gurgaon Sector 43")
 * @returns {Promise<Object>} Navigation result with status
 */
export async function navigateToSearch(page, searchQuery, location) {
    try {
        const { navigationTimeout, randomDelays } = config.scraper;

        // Construct Google Maps search URL
        const encodedQuery = encodeURIComponent(searchQuery);
        const encodedLocation = encodeURIComponent(location);
        const searchUrl = `https://www.google.com/maps/search/${encodedQuery}+${encodedLocation}`;

        logger.info(`Navigating to: ${searchUrl}`);

        // Navigate to URL - use domcontentloaded instead of networkidle
        // Google Maps has continuous network activity (map tiles) that prevents networkidle
        await page.goto(searchUrl, {
            timeout: navigationTimeout,
            waitUntil: 'domcontentloaded',
        });

        // Add random delay to mimic human behavior
        if (randomDelays) {
            logger.debug('Waiting 1-3 seconds after navigation');
            await randomDelay(1000, 3000);
        }

        // Handle cookie consent if present
        const consentHandled = await handleCookieConsent(page);
        if (consentHandled) {
            logger.info('Cookie consent handled');
            await page.waitForTimeout(500);
        }

        // Check for CAPTCHA
        const captchaDetected = await detectCaptcha(page);
        if (captchaDetected) {
            logger.warn('CAPTCHA detected! Manual intervention may be required.');
            return {
                success: false,
                status: 'captcha',
                message: 'CAPTCHA detected',
            };
        }

        // Wait for results container to be visible
        try {
            await page.waitForSelector(SELECTORS.RESULTS_CONTAINER, {
                timeout: config.scraper.loadTimeout,
                state: 'visible',
            });
        } catch (error) {
            logger.error('Results container not found:', error);
            return {
                success: false,
                status: 'no_results',
                message: 'Search results not loaded',
            };
        }

        logger.info('Navigation successful, results loaded');

        return {
            success: true,
            status: 'success',
            url: searchUrl,
        };
    } catch (error) {
        logger.error('Navigation failed:', error);
        return {
            success: false,
            status: 'error',
            message: error.message,
        };
    }
}

/**
 * Handle cookie consent popup if present
 * @param {Object} page - Playwright page instance
 * @returns {Promise<boolean>} True if consent was handled
 */
async function handleCookieConsent(page) {
    try {
        // Look for consent button
        const consentButton = await page.$(SELECTORS.CONSENT_BUTTON);

        if (consentButton) {
            logger.debug('Found cookie consent dialog, accepting...');
            await consentButton.click();
            await page.waitForTimeout(1000);
            return true;
        }

        return false;
    } catch (error) {
        logger.debug('No cookie consent found or already handled');
        return false;
    }
}

/**
 * Detect if CAPTCHA is present on the page
 * @param {Object} page - Playwright page instance
 * @returns {Promise<boolean>} True if CAPTCHA detected
 */
async function detectCaptcha(page) {
    try {
        const captcha = await page.$(SELECTORS.CAPTCHA_CONTAINER);
        return captcha !== null;
    } catch (error) {
        return false;
    }
}
