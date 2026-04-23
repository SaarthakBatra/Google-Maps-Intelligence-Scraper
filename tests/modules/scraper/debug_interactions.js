import { launchBrowser, closeBrowser } from '../../../src/modules/scraper/browser.js';
import { navigateToSearch } from '../../../src/modules/scraper/navigate.js';
import { clickListing, waitForDetailsPanel } from '../../../src/modules/scraper/interactions.js';
import SELECTORS from '../../../src/modules/scraper/selectors.js';
import logger from '../../../src/modules/utils/logger.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'tests/output/debug');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function debugInteractions() {
    logger.info('🐞 Starting Interaction Debug Script...');
    let browser, context, page;

    try {
        // 1. Launch Browser
        logger.info('1. Launching browser...');
        ({ browser, context } = await launchBrowser());
        page = await context.newPage();

        // 2. Navigate
        const query = "dentists";
        const location = "Gurgaon Sector 43";
        logger.info(`2. Navigating to "${query} in ${location}"...`);
        await navigateToSearch(page, query, location);

        // 3. Click First Listing
        logger.info('3. Clicking first listing...');
        // Wait for listings to be visible first
        await page.waitForSelector(SELECTORS.LISTING_CARD, { timeout: 10000 });
        const clickResult = await clickListing(page, 0);
        if (!clickResult.success) throw new Error(`Failed to click listing: ${clickResult.message}`);

        logger.info('   Waiting for details panel...');
        await waitForDetailsPanel(page);

        // SNAPSHOT 1: Details Panel (Overview)
        logger.info('📸 SNAPSHOT 1: Details Panel Loaded');
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'step1_details_overview.png') });
        const detailsHtml = await page.content();
        fs.writeFileSync(path.join(OUTPUT_DIR, 'step1_details_overview.html'), detailsHtml);

        // 4. FIND Reviews Tab (Debug Mode)
        logger.info('4. Debugging Reviews Tab detection...');

        // Try multiple strategies to find the tab
        const strategies = [
            { name: 'Selector from config', selector: SELECTORS.REVIEWS_TAB },
            { name: 'Aria Label exact', selector: 'button[aria-label="Reviews"]' },
            { name: 'Result Tab role', selector: 'button[role="tab"]' }, // We'll log all tabs found
            { name: 'Text content', selector: 'button:has-text("Reviews")' }
        ];

        for (const strat of strategies) {
            const els = await page.$$(strat.selector);
            logger.info(`   Strategy [${strat.name}]: Found ${els.length} elements`);
            for (let i = 0; i < els.length; i++) {
                const isVisible = await els[i].isVisible();
                const text = await els[i].textContent();
                const ariaLabel = await els[i].getAttribute('aria-label');
                logger.info(`     - El ${i}: visible=${isVisible}, text="${text?.trim()}", aria-label="${ariaLabel}"`);
            }
        }

        // Attempt to click using the primary selector
        logger.info('   Attempting to click Reviews tab using configured selector...');
        try {
            await page.click(SELECTORS.REVIEWS_TAB, { timeout: 5000 });
            logger.info('   ✅ Click command succeeded');
        } catch (e) {
            logger.error(`   ❌ Click command failed: ${e.message}`);
            // Try fallback: Text match
            logger.info('   ⚠️ Trying fallback click on "Reviews" text...');
            await page.click('button:has-text("Reviews")');
        }

        // Wait a bit for transition
        await page.waitForTimeout(2000);

        // SNAPSHOT 2: Reviews Tab Active
        logger.info('📸 SNAPSHOT 2: Reviews Tab Clicked');
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'step2_reviews_tab.png') });
        const reviewsHtml = await page.content();
        fs.writeFileSync(path.join(OUTPUT_DIR, 'step2_reviews_tab.html'), reviewsHtml);

        // 5. FIND Sort Button
        logger.info('5. Debugging Sort Button...');
        const sortBtn = await page.$(SELECTORS.SORT_BUTTON);
        if (sortBtn) {
            logger.info('   ✅ Sort button found via selector');
            await sortBtn.click();
            logger.info('   Clicked sort button, waiting for menu...');
            await page.waitForTimeout(1000);

            // SNAPSHOT 3: Sort Menu
            logger.info('📸 SNAPSHOT 3: Sort Menu Open');
            await page.screenshot({ path: path.join(OUTPUT_DIR, 'step3_sort_menu.png') });
            const menuHtml = await page.content();
            fs.writeFileSync(path.join(OUTPUT_DIR, 'step3_sort_menu.html'), menuHtml);
        } else {
            logger.error('   ❌ Sort button NOT found');
            // Log all buttons in the reviews container to see what's there
            const buttons = await page.$$('button');
            logger.info(`   Listing all ${buttons.length} buttons on page (first 20):`);
            for (let i = 0; i < Math.min(buttons.length, 20); i++) {
                const text = await buttons[i].textContent();
                const aria = await buttons[i].getAttribute('aria-label');
                if (text?.trim() || aria) {
                    logger.info(`     - Btn: "${text?.trim()}" aria="${aria}"`);
                }
            }
        }

    } catch (error) {
        logger.error('🚨 Debug Script Error:', error);
        if (page) {
            await page.screenshot({ path: path.join(OUTPUT_DIR, 'error_state.png') });
        }
    } finally {
        if (browser) {
            logger.info('Closing browser...');
            await closeBrowser(browser, context);
        }
    }
}

debugInteractions();
