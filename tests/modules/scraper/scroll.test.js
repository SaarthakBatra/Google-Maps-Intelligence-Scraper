/**
 * Unit tests for scroll.js
 * Tests infinite scroll functionality
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';
import { scrollToLoadAll, scrollToListing } from '../../../src/modules/scraper/scroll.js';

describe('Scroll Module', () => {
    let browser;
    let context;
    let page;

    beforeAll(async () => {
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // Navigate to a search with results
        await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');
    }, 60000);

    afterAll(async () => {
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    });

    test('should scroll and load listings', async () => {
        const result = await scrollToLoadAll(page);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);
        expect(result.attempts).toBeGreaterThan(0);
    }, 120000);

    test('should return listing count', async () => {
        const result = await scrollToLoadAll(page);

        expect(result.count).toBeGreaterThan(0);
        expect(typeof result.count).toBe('number');
    }, 120000);

    test('should scroll to specific listing', async () => {
        const result = await scrollToListing(page, 0);

        expect(result).toBe(true);
    }, 10000);
});
