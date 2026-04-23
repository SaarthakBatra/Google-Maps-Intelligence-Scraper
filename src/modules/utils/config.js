/**
 * Configuration loader using dotenv
 * Loads environment variables and provides structured config object
 * @module utils/config
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');
dotenv.config({ path: join(projectRoot, '.env') });

/**
 * Configuration schema for validation
 */
const configSchema = z.object({
    browser: z.object({
        type: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
        headless: z.boolean().default(true),
    }),
    scraping: z.object({
        rateLimit: z.number().int().positive().default(2),
        timeout: z.number().int().positive().default(30000),
        userAgent: z.string().default('Mozilla/5.0 (compatible; ScraperBot/1.0)'),
    }),
    logging: z.object({
        level: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
        file: z.string().default('./logs/scraper.log'),
    }),
    scraper: z.object({
        browserType: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
        headless: z.boolean().default(false),
        viewport: z.object({
            width: z.number().int().positive().default(1920),
            height: z.number().int().positive().default(1080),
        }).default({ width: 1920, height: 1080 }),
        userAgent: z.string().default('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'),
        navigationTimeout: z.number().int().positive().default(60000),
        loadTimeout: z.number().int().positive().default(30000),
        interactionTimeout: z.number().int().positive().default(10000),
        scrollDelay: z.object({
            min: z.number().int().positive().default(500),
            max: z.number().int().positive().default(1500),
        }).default({ min: 500, max: 1500 }),
        scrollStep: z.number().int().positive().default(300),
        maxScrollAttempts: z.number().int().positive().default(100),
        noNewResultsThreshold: z.number().int().positive().default(5),
        stealthMode: z.boolean().default(false),
        randomDelays: z.boolean().default(true),
        maxRetries: z.number().int().positive().default(3),
        retryDelay: z.number().int().positive().default(2000),
        reviews: z.object({
            sort: z.array(z.enum(['highest', 'lowest', 'newest'])).default(['highest', 'lowest']),
            maxPerSort: z.number().int().positive().default(10),
        }).default({ sort: ['highest', 'lowest'], maxPerSort: 10 }),
    }),
});

/**
 * Load and parse configuration from environment variables
 * @returns {Object} Validated configuration object
 */
function loadConfig() {
    const rawConfig = {
        browser: {
            type: process.env.BROWSER_TYPE || 'chromium',
            headless: process.env.HEADLESS === 'true',
        },
        scraping: {
            rateLimit: parseInt(process.env.DEFAULT_RATE_LIMIT || '2', 10),
            timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
            userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (compatible; ScraperBot/1.0)',
        },
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            file: process.env.LOG_FILE || './logs/scraper.log',
        },
        scraper: {
            browserType: process.env.SCRAPER_BROWSER_TYPE || 'chromium',
            headless: process.env.SCRAPER_HEADLESS === 'true',
            viewport: {
                width: parseInt(process.env.SCRAPER_VIEWPORT_WIDTH || '1920', 10),
                height: parseInt(process.env.SCRAPER_VIEWPORT_HEIGHT || '1080', 10),
            },
            userAgent: process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            navigationTimeout: parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT || '60000', 10),
            loadTimeout: parseInt(process.env.SCRAPER_LOAD_TIMEOUT || '30000', 10),
            interactionTimeout: parseInt(process.env.SCRAPER_INTERACTION_TIMEOUT || '10000', 10),
            scrollDelay: {
                min: parseInt(process.env.SCRAPER_SCROLL_DELAY_MIN || '500', 10),
                max: parseInt(process.env.SCRAPER_SCROLL_DELAY_MAX || '1500', 10),
            },
            scrollStep: parseInt(process.env.SCRAPER_SCROLL_STEP || '300', 10),
            maxScrollAttempts: parseInt(process.env.SCRAPER_MAX_SCROLL_ATTEMPTS || '100', 10),
            noNewResultsThreshold: parseInt(process.env.SCRAPER_NO_NEW_RESULTS_THRESHOLD || '3', 10),
            stealthMode: process.env.SCRAPER_STEALTH_MODE !== 'false',
            randomDelays: process.env.SCRAPER_RANDOM_DELAYS !== 'false',
            maxRetries: parseInt(process.env.SCRAPER_MAX_RETRIES || '3', 10),
            retryDelay: parseInt(process.env.SCRAPER_RETRY_DELAY || '2000', 10),
            reviews: {
                sort: (process.env.SCRAPER_REVIEWS_SORT || 'highest,lowest').split(','),
                maxPerSort: parseInt(process.env.SCRAPER_REVIEWS_MAX_PER_SORT || '10', 10),
            },
        },
    };

    // Validate configuration
    try {
        return configSchema.parse(rawConfig);
    } catch (error) {
        console.error('Configuration validation failed:', error.errors);
        throw new Error('Invalid configuration');
    }
}

/**
 * Exported configuration object
 */
const config = loadConfig();

export default config;
