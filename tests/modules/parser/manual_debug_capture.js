
import {
    launchBrowser,
    navigateToSearch,
    clickListing,
    waitForDetailsPanel,
    getDetailsHTML,
    closeBrowser
} from '../../../src/modules/scraper/scraper.main.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, 'test-data', 'debug_latest.html');

async function main() {
    console.log('🚀 Starting manual debug capture...');

    let browser, context, page;

    try {
        console.log('🌐 Launching browser...');
        // Launch browser in headful mode
        ({ browser, context } = await launchBrowser({ headless: false }));
        page = await context.newPage();

        console.log('📍 Navigating to search...');
        const navResult = await navigateToSearch(page, "Restaurants", "Gurgaon sector 43");

        if (!navResult.success) {
            throw new Error(`Navigation failed: ${navResult.message}`);
        }
        console.log('✅ Navigation successful');

        // Wait a bit for results to settle
        await page.waitForTimeout(2000);

        console.log('🖱️  Clicking first listing...');
        const clickResult = await clickListing(page, 0); // Click first listing
        if (!clickResult.success) {
            throw new Error(`Failed to click listing 0: ${clickResult.message}`);
        }

        console.log('⏳ Waiting for details panel (h1.DUwDvf)...');
        // Wait specifically for the business title, which only appears in details view
        await page.waitForSelector('h1.DUwDvf', { timeout: 10000, state: 'visible' });

        // Also wait for the generic details panel to be safe
        const waitResult = await waitForDetailsPanel(page);
        if (!waitResult.success) {
            console.warn(`Warning: waitForDetailsPanel failed: ${waitResult.message}`);
        }

        console.log('📥 Extracting HTML...');
        // Add a small delay to ensure dynamic content loads
        await page.waitForTimeout(2000);

        const detailsResult = await getDetailsHTML(page);
        if (!detailsResult.success) {
            throw new Error(`Failed to extract HTML: ${detailsResult.message}`);
        }

        // Save HTML
        console.log(`💾 Saving HTML to to ${OUTPUT_FILE}...`);
        fs.writeFileSync(OUTPUT_FILE, detailsResult.html);
        console.log('✅ HTML saved successfully!');

        // Wait for user confirmation
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise(resolve => {
            rl.question('\n🛑 Browser is open. Press ENTER to close and finish...', () => {
                rl.close();
                resolve();
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (browser) {
            console.log('🔒 Closing browser...');
            await closeBrowser(browser, context);
        }
    }
}

main();
