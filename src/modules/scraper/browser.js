/**
 * Browser instance lifecycle management
 * Handles Playwright browser initialization and cleanup
 * @module scraper/browser
 */

import { chromium, firefox, webkit } from 'playwright';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

/**
 * Launch a Playwright browser instance with stealth configuration
 * @returns {Promise<Object>} Browser instance
 * @throws {Error} If browser fails to launch
 */
export async function launchBrowser() {
    try {
        const { browserType, headless, viewport, userAgent, stealthMode } = config.scraper;

        logger.info(`Launching ${browserType} browser (headless: ${headless})`);

        // Select browser type
        let browserEngine;
        switch (browserType) {
            case 'firefox':
                browserEngine = firefox;
                break;
            case 'webkit':
                browserEngine = webkit;
                break;
            default:
                browserEngine = chromium;
        }

        // Configure launch args for stealth and compatibility
        const launchArgs = [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ];

        // Launch browser with configuration
        const browser = await browserEngine.launch({
            headless,
            args: launchArgs,
            ignoreDefaultArgs: ['--enable-automation'],
        });

        // Create browser context with viewport and user agent
        const context = await browser.newContext({
            viewport,
            userAgent,
            locale: 'en-US',
            timezoneId: 'America/New_York',
            permissions: ['geolocation'],
            geolocation: { latitude: 28.4595, longitude: 77.0266 }, // Gurgaon, India
        });

        // Add stealth scripts if enabled
        if (stealthMode) {
            await context.addInitScript(() => {
                // Override navigator.webdriver
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });

                // Override chrome property
                window.chrome = {
                    runtime: {},
                };

                // Override permissions
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            });
        }

        logger.info('Browser launched successfully');

        return { browser, context };
    } catch (error) {
        logger.error('Failed to launch browser:', error);
        throw new Error(`Browser launch failed: ${error.message}`);
    }
}

/**
 * Close browser and cleanup resources
 * @param {Object} browser - Browser instance from launchBrowser
 * @param {Object} context - Browser context from launchBrowser
 * @returns {Promise<void>}
 */
export async function closeBrowser(browser, context) {
    try {
        logger.info('Closing browser...');

        if (context) {
            await context.close();
        }

        if (browser) {
            await browser.close();
        }

        logger.info('Browser closed successfully');
    } catch (error) {
        logger.error('Error closing browser:', error);
        throw new Error(`Browser cleanup failed: ${error.message}`);
    }
}
