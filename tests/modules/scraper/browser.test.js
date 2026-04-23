/**
 * Unit tests for browser.js
 * Tests browser lifecycle management
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';

describe('Browser Module', () => {
    let browser;
    let context;

    test('should launch browser successfully', async () => {
        const result = await launchBrowser();

        expect(result).toBeDefined();
        expect(result.browser).toBeDefined();
        expect(result.context).toBeDefined();

        browser = result.browser;
        context = result.context;
    }, 30000);

    test('should have correct viewport configuration', async () => {
        const page = await context.newPage();
        const viewport = page.viewportSize();

        expect(viewport).toBeDefined();
        expect(viewport.width).toBe(1920);
        expect(viewport.height).toBe(1080);

        await page.close();
    });

    test('should have user agent set', async () => {
        const page = await context.newPage();
        const userAgent = await page.evaluate(() => navigator.userAgent);

        expect(userAgent).toBeDefined();
        expect(userAgent).toContain('Mozilla');

        await page.close();
    });

    test('should not expose webdriver property (stealth)', async () => {
        const page = await context.newPage();
        const webdriver = await page.evaluate(() => navigator.webdriver);

        expect(webdriver).toBeUndefined();

        await page.close();
    }, 10000); // Increased timeout for slower page creation

    test('should close browser without errors', async () => {
        await expect(closeBrowser(browser, context)).resolves.not.toThrow();
    });
});
