/**
 * Unit tests for extractors.js
 * Tests HTML extraction functionality
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';
import { scrollToLoadAll } from '../../../src/modules/scraper/scroll.js';
import { clickListing, waitForDetailsPanel } from '../../../src/modules/scraper/interactions.js';
import { getListingsHTML, getDetailsHTML, getTextContent } from '../../../src/modules/scraper/extractors.js';

describe('Extractors Module', () => {
    let browser;
    let context;
    let page;

    beforeAll(async () => {
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // Navigate and load listings
        await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');
        const scrollResult = await scrollToLoadAll(page);

        console.log(`\n📊 Scroll Results:`);
        console.log(`  - Listings loaded: ${scrollResult.count}`);
        console.log(`  - Scroll attempts: ${scrollResult.attempts}`);
        console.log(`  - Success: ${scrollResult.success}\n`);
    }, 120000);

    afterAll(async () => {
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    });

    test('should extract listings HTML', async () => {
        const result = await getListingsHTML(page);

        console.log(`\n📋 Extraction Results:`);
        console.log(`  - HTML elements extracted: ${result.count}`);
        console.log(`  - Success: ${result.success}\n`);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);
        expect(result.count).toBeGreaterThanOrEqual(30); // Should get at least 30
        expect(Array.isArray(result.html)).toBe(true);
        expect(result.html.length).toBe(result.count);
    }, 30000);

    test('should extract valid HTML strings', async () => {
        const result = await getListingsHTML(page);

        expect(result.html[0]).toBeTruthy();
        expect(typeof result.html[0]).toBe('string');
        expect(result.html[0]).toContain('<div');
    }, 30000);

    test('should extract details HTML', async () => {
        // Click a listing first
        await clickListing(page, 0);
        await waitForDetailsPanel(page);

        const result = await getDetailsHTML(page);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.html).toBeTruthy();
        expect(typeof result.html).toBe('string');
    }, 60000);

    test('should extract text content from selector', async () => {
        const text = await getTextContent(page, 'h1');

        expect(text).toBeTruthy();
        expect(typeof text).toBe('string');
    }, 10000);
});
