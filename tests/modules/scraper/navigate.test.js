/**
 * Unit tests for navigate.js
 * Tests Google Maps navigation functionality
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';

describe('Navigate Module', () => {
    let browser;
    let context;
    let page;

    beforeAll(async () => {
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();
    }, 30000);

    afterAll(async () => {
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    });

    test('should navigate to Google Maps search successfully', async () => {
        const result = await navigateToSearch(page, 'restaurants', 'New York');

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.status).toBe('success');
        expect(result.url).toContain('google.com/maps/search');
        expect(result.url).toContain('restaurants');
        expect(result.url).toContain('New%20York'); // encodeURIComponent uses %20 for spaces
    }, 60000);

    test('should construct proper URL with encoded query', async () => {
        const result = await navigateToSearch(page, 'coffee shops', 'Gurgaon Sector 43');

        expect(result.url).toContain('coffee%20shops'); // encodeURIComponent uses %20 for spaces
        expect(result.url).toContain('Gurgaon%20Sector%2043'); // %20 for spaces
    }, 60000);

    test('should handle special characters in query', async () => {
        const result = await navigateToSearch(page, 'café & bakery', 'San Francisco');

        expect(result.success).toBe(true);
        expect(result.url).toBeDefined();
    }, 60000);
});
