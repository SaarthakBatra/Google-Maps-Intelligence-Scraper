const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SELECTORS = {
    DETAILS_PANEL: 'div[role="main"]:not(:has(div[role="feed"]))',
    TAB_LIST: 'div[role="tablist"]',
    REVIEWS_TAB: 'button[role="tab"][aria-label*="Reviews"]',
    REVIEWS_SUMMARY: 'span[aria-label*="Reviews"]', // Fallback
    SORT_BUTTON: 'button[data-value="Sort"], button[aria-label*="Sort reviews"]',
    SORT_MENU_OPTIONS: {
        'newest': 'div[role="menuitemradio"][aria-label*="Newest"]',
    }
};

(async () => {
    console.log('Starting interaction debug...');

    // Launch browser
    const browser = await chromium.launch({ headless: true });
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

        console.log('Waiting for Tab List or Reviews Fallback...');
        let clickedReviews = false;

        // Strategy: Race waiting for Tab List vs just looking for fallback
        try {
            // Try explicit tab list first
            await page.waitForSelector(SELECTORS.TAB_LIST, { timeout: 10000 });
            console.log('Tab List loaded.');
            await page.click(SELECTORS.REVIEWS_TAB, { timeout: 5000 });
            clickedReviews = true;
        } catch (e) {
            console.log('Tab List missing. Trying fallback: Review Summary text...');
            const reviewsSummary = page.locator(SELECTORS.REVIEWS_SUMMARY).first();
            if (await reviewsSummary.isVisible()) {
                await reviewsSummary.click();
                clickedReviews = true;
                console.log('Clicked Reviews Summary text.');
            } else {
                console.error('Neither Tab List nor Reviews Summary found.');
                throw e;
            }
        }

        if (!clickedReviews) throw new Error('Failed to click reviews.');

        // Wait for Sort button
        console.log('Waiting for Sort Button...');
        await page.waitForSelector(SELECTORS.SORT_BUTTON, { state: 'visible', timeout: 30000 });
        console.log('Sort Button found.');

        console.log('Clicking Sort Button...');
        await page.click(SELECTORS.SORT_BUTTON);

        // Wait for menu
        console.log('Waiting for Menu...');
        await page.waitForSelector(SELECTORS.SORT_MENU_OPTIONS.newest, { timeout: 10000 });
        console.log('Sort Menu opened successfully.');

        // Take success screenshot
        const screenshotPath = path.join(__dirname, 'output', 'debug', 'success_interaction_v3.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`Success! Screenshot saved to ${screenshotPath}`);

    } catch (error) {
        console.error('Interaction failed:', error);
        const errorPath = path.join(__dirname, 'output', 'debug', 'error_interaction_v3.png');
        await page.screenshot({ path: errorPath });
        fs.writeFileSync(path.join(__dirname, 'output', 'debug', 'error_dump_v3.html'), await page.content());
    } finally {
        await browser.close();
    }
})();
