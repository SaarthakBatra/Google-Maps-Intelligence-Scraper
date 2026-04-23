/**
 * Unit tests for interactions.js
 * Tests listing click and details panel interactions
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';
import { scrollToLoadAll } from '../../../src/modules/scraper/scroll.js';
import { clickListing, waitForDetailsPanel, closeDetailsPanel } from '../../../src/modules/scraper/interactions.js';

describe('Interactions Module', () => {
    let browser;
    let context;
    let page;

    beforeAll(async () => {
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // Navigate and load listings
        await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');
        await scrollToLoadAll(page);
    }, 120000);

    afterAll(async () => {
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    });

    test('should click on first listing', async () => {
        const result = await clickListing(page, 0);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.index).toBe(0);
    }, 30000);

    test('should wait for details panel to load', async () => {
        const result = await waitForDetailsPanel(page);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
    }, 30000);

    test('should close details panel', async () => {
        const result = await closeDetailsPanel(page);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
    }, 10000);

    test('should handle invalid listing index', async () => {
        const result = await clickListing(page, 9999);

        expect(result.success).toBe(false);
    }, 10000);
});
