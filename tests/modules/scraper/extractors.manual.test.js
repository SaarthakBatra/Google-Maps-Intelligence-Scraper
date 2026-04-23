/**
 * Manual verification test for extractors.js
 * This test waits for user confirmation before closing the browser
 * so you can manually verify that all listings were extracted
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';
import { scrollToLoadAll } from '../../../src/modules/scraper/scroll.js';
import { getListingsHTML } from '../../../src/modules/scraper/extractors.js';
import readline from 'readline';

describe('Extractors Manual Verification', () => {
    let browser;
    let context;
    let page;

    beforeAll(async () => {
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // Navigate and scroll to load all listings
        await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');
        const scrollResult = await scrollToLoadAll(page);

        console.log('\n' + '='.repeat(60));
        console.log('📊 SCROLL RESULTS');
        console.log('='.repeat(60));
        console.log(`  Listings loaded: ${scrollResult.count}`);
        console.log(`  Scroll attempts: ${scrollResult.attempts}`);
        console.log(`  Success: ${scrollResult.success}`);
        console.log('='.repeat(60) + '\n');
    }, 300000); // 5 minutes for setup

    test('should extract all listings - manual verification', async () => {
        const result = await getListingsHTML(page);

        console.log('\n' + '='.repeat(60));
        console.log('📋 EXTRACTION RESULTS');
        console.log('='.repeat(60));
        console.log(`  HTML elements extracted: ${result.count}`);
        console.log(`  Success: ${result.success}`);
        console.log('='.repeat(60));

        // Count visible listings in the browser for manual verification
        const visibleListings = await page.$$eval(
            'div[role="article"]',
            (listings) => listings.length
        );

        console.log('\n' + '='.repeat(60));
        console.log('🔍 MANUAL VERIFICATION');
        console.log('='.repeat(60));
        console.log(`  Visible listings in browser: ${visibleListings}`);
        console.log(`  Extracted listings: ${result.count}`);
        console.log(`  Match: ${visibleListings === result.count ? '✅ YES' : '❌ NO'}`);
        console.log('='.repeat(60));

        // Highlight all listings in the browser for visual verification
        await page.evaluate(() => {
            const listings = document.querySelectorAll('div[role="article"]');
            listings.forEach((listing, index) => {
                // Add a red border to each listing
                listing.style.border = '3px solid red';
                listing.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';

                // Add index number overlay
                const numberDiv = document.createElement('div');
                numberDiv.textContent = index + 1;
                numberDiv.style.cssText = `
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    background: red;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    font-size: 16px;
                    z-index: 10000;
                `;
                listing.style.position = 'relative';
                listing.appendChild(numberDiv);
            });
        });

        console.log('\n' + '⭐'.repeat(30));
        console.log('📌 All listings are now HIGHLIGHTED in RED with numbers');
        console.log('📌 Please verify the count manually in the browser');
        console.log('📌 Scroll through the list to check if all are highlighted');
        console.log('⭐'.repeat(30) + '\n');

        // Wait for user confirmation
        console.log('👉 Press ENTER when you finish verification to close the browser and continue...');

        await new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('', () => {
                rl.close();
                resolve();
            });
        });

        console.log('\n✅ Continuing with test assertions...\n');

        // Standard assertions
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);
        expect(result.count).toBe(visibleListings);
        expect(result.html).toBeDefined();
        expect(Array.isArray(result.html)).toBe(true);
        expect(result.html.length).toBe(result.count);
    }, 600000); // 10 minutes for manual verification

    afterAll(async () => {
        console.log('\n🔒 Closing browser...\n');
        if (page) await page.close();
        if (browser && context) await closeBrowser(browser, context);
    });
});
