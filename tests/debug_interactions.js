const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Verify we can import selectors (if using CommonJS)
// Since project is ES Module, we might need dynamic import or just hardcode for this test to be safe vs module errors.
// Hardcoding the updated selectors to ensure we test the LOGIC.
const SELECTORS = {
    DETAILS_PANEL: 'div[role="main"]:not(:has(div[role="feed"]))',
    TAB_LIST: 'div[role="tablist"]',
    REVIEWS_TAB: 'button[role="tab"][aria-label*="Reviews"]',
    SORT_BUTTON: 'button[data-value="Sort"], button[aria-label*="Sort reviews"]',
    SORT_MENU_OPTIONS: {
        'newest': 'div[role="menuitemradio"][aria-label*="Newest"]',
    }
};

(async () => {
    console.log('Starting interaction debug...');

    // Launch browser
    const browser = await chromium.launch({ headless: true }); // Headless for speed, screenshots will confirm
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        const url = 'https://www.google.com/maps/place/Symmetry+Dental+%26+Cosmetic+Clinic+Best+Dental+Clinic+in+Gurgaon+%7CDental+Implant%7C+Aligner+%7CBraces+%7C+RCT+%7C+Dentist+Near+me+%7C/@26.8852108,75.7905578,9z/data=!4m10!1m2!2m1!1sdentists+Gurgaon+Sector+43!3m6!1s0x390d1804c5fb0001:0x3be6ca9aeb9346f2!8m2!3d28.4601449!4d77.0883207!15sChpkZW50aXN0cyBHdXJnYW9uIFNlY3RvciA0MZIBCmRlbnRhbF9jbGluaWPgAQA!16s%2Fg%2F11dy_h9zgr?entry=ttu';

        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Waiting for Details Panel...');
        await page.waitForSelector(SELECTORS.DETAILS_PANEL, { timeout: 30000 });

        console.log('Waiting for Tab List (Robustness check)...');
        // This is the CRITICAL new step: wait for tabs to load
        try {
            await page.waitForSelector(SELECTORS.TAB_LIST, { timeout: 10000 });
            console.log('Tab List loaded.');
        } catch (e) {
            console.warn('Tab List not found within 10s. Continuing to see if Reviews tab exists directly...');
        }

        console.log('Clicking Reviews Tab...');
        await page.click(SELECTORS.REVIEWS_TAB);
        console.log('Clicked Reviews Tab.');

        // Wait for Sort button to appear (indicates reviews loaded)
        console.log('Waiting for Sort Button...');
        await page.waitForSelector(SELECTORS.SORT_BUTTON, { timeout: 15000 });
        console.log('Sort Button found.');

        console.log('Clicking Sort Button...');
        await page.click(SELECTORS.SORT_BUTTON);

        console.log('Waiting for Menu...');
        await page.waitForSelector(SELECTORS.SORT_MENU_OPTIONS.newest, { timeout: 5000 });
        console.log('Sort Menu opened successfully.');

        // Take success screenshot
        const screenshotPath = path.join(__dirname, 'output', 'debug', 'success_interaction.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`Success! Screenshot saved to ${screenshotPath}`);

    } catch (error) {
        console.error('Interaction failed:', error);
        // Take error screenshot
        const errorPath = path.join(__dirname, 'output', 'debug', 'error_interaction.png');
        await page.screenshot({ path: errorPath });
        console.log(`Error screenshot saved to ${errorPath}`);

        // Dump HTML for debugging
        fs.writeFileSync(path.join(__dirname, 'output', 'debug', 'error_dump.html'), await page.content());
    } finally {
        await browser.close();
    }
})();
