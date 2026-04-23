import { executeScrapeWorkflow } from '../scraper/scraper.main.js';
import { parseListing } from '../parser/index.js';
import { validateListing } from '../validator/validate-listing.js';
import { saveResults } from '../storage/index.js';
import logger from '../utils/logger.js';

/**
 * Orchestrates the full scraping workflow: Scrape -> Parse -> Validate -> Save.
 *
 * @param {string} searchQuery - The business type to search for (e.g., "restaurants").
 * @param {string} location - The location to search in (e.g., "New York").
 * @param {object} options - Configuration options.
 * @param {number} [options.maxListings=Infinity] - Maximum number of listings to process.
 * @param {boolean} [options.extractDetails=false] - Whether to extract details for each listing.
 * @returns {Promise<object>} - Summary of the execution.
 */
export async function orchestrate(searchQuery, location, options = {}) {
    const { maxListings = Infinity, extractDetails = false, skipScroll = false, skipReview = false } = options;

    logger.info({ searchQuery, location, maxListings, extractDetails, skipScroll, skipReview }, 'Starting orchestration workflow');

    const stats = {
        scraped: 0,
        parsed: 0,
        valid: 0,
        saved: 0,
        errors: 0
    };

    try {
        // 1. Scrape
        logger.info('Step 1: Scraping...');
        const scrapeResult = await executeScrapeWorkflow(searchQuery, location, { maxListings, extractDetails, skipScroll, skipReview });

        if (!scrapeResult.success) {
            throw new Error(`Scraping failed: ${scrapeResult.message}`);
        }

        const { listingsHTML, detailsHTML } = scrapeResult.data;
        stats.scraped = listingsHTML.length;
        logger.info(`Scraping completed. Found ${stats.scraped} listings.`);

        // 2. Parse & Validate
        logger.info('Step 2 & 3: Parsing and Validating...');
        const validListings = [];

        // Determine which HTML to parse (details or falling back to potentially limited data if structure allows, 
        // but current parser is built for detail pages mainly. 
        // NOTE: The parser's parseListing is designed for DETAIL page HTML. 
        // If detailsHTML has nulls (failed clicks) or we didn't extract details, 
        // we might not get full data.
        // For this version, we will process whatever detailsHTML we have.

        // If extractDetails is false, we might only have search results HTML.
        // The parser module also has parseSearchResults which takes the full list HTML.
        // Let's refine this:
        // Case A: specific details extracted -> use parseListing on each detail HTML
        // Case B: no details -> use parseSearchResults on the search results HTML

        let parsedItems = [];

        if (extractDetails && detailsHTML.length > 0) {
            // Process individual detail pages
            detailsHTML.forEach((detailsData, index) => {
                if (!detailsData) {
                    logger.warn(`Skipping parsing for listing ${index} due to missing data`);
                    return;
                }

                try {
                    // Extract overview HTML and reviews object from the data
                    // detailsData might be a string (legacy/fallback) or object { overview, reviews, url }
                    let overviewHTML = detailsData;
                    let reviewsData = null;
                    let url = null; // Initialize url

                    if (typeof detailsData === 'object' && detailsData.overview) {
                        overviewHTML = detailsData.overview;
                        reviewsData = detailsData.reviews;
                        url = detailsData.url; // Extract url if available
                    }

                    const item = parseListing(overviewHTML, reviewsData, url);
                    if (item) {
                        parsedItems.push(item);
                        stats.parsed++;
                    } else {
                        logger.warn(`Parsing failed for listing ${index}: parseListing returned null (likely missing Name or selector mismatch)`);
                    }
                } catch (e) {
                    logger.error({ error: e.message, index }, 'Error parsing listing HTML');
                    stats.errors++;
                }
            });
        } else {
            // Process the search results list
            // Note: The scraper returns all listings HTML as an array of strings in `listingsHTML`
            // But `parseSearchResults` usually expects the full container HTML or operates on list items?
            // Checking parser spec: "extract list of basic business info from search results sidebar"
            // We need to confirm if `parseSearchResults` takes the full page HTML or individual cards.
            // Assuming for now we iterate provided HTML strings. 
            // If `listingsHTML` contains individual card HTMLs:
            /* 
                Checking `scraper/extractors.js` would confirm this. 
                Assuming `getListingsHTML` returns array of outerHTML of cards.
                The parser's `parseSearchResults` likely iterates a root, so we might need to 
                adapt or just pass individual snippets if it supports that.
                
                Let's assume we map over `listingsHTML` and use a parser function designed for a single card 
                IF `parseSearchResults` isn't suitable.
                Actually looking at `parser/module-spec.md`:
                "parseSearchResults(html): Returns an array of partial business objects."
                This implies it takes the full list HTML.
                
                BUT `scraper` returns `listingsHTML` as an array of strings (likely individual cards).
                So we should probably just loop and extract from each card if possible, 
                OR join them back? 
                
                Let's tentatively assume `listingsHTML` are individual cards that `parseListing` MIGHT handle 
                roughly if we are lucky, OR we need a `parseListingCard` function.
                
                WAIT: `parser/module-spec.md` says `parseListing` is for "detail view".
                `parseSearchResults` is for "search results sidebar".
                
                If we have the array of card HTMLs, we might need to construct a dummy root or 
                use a different parser method.
                
                Let's stick to the plan: if `extractDetails` is true, use `detailsHTML`.
                If false, we currently won't yield much data unless we add a `parseListingCard`.
                However, let's proceed with `detailsHTML` logic as primary for now 
                and maybe log a warning if `extractDetails` is false that data will be minimal/empty
                until we verify `parseSearchResults` usage.
            */

            if (!extractDetails) {
                logger.warn('extractDetails=false: Parsing search results list is not fully implemented in this flow yet. Expect empty results.');
                // Placeholder for basic list parsing
            }
        }

        // Deduplicate & Validate
        const seenFingerprints = new Set();
        let duplicatesCount = 0;

        for (const item of parsedItems) {
            const validationResult = validateListing(item);

            if (validationResult.isValid) {
                const fingerprint = validationResult.fingerprint;

                // Deduplication check
                if (fingerprint && seenFingerprints.has(fingerprint)) {
                    logger.debug(`Duplicate found: ${item.name} (${fingerprint}). Skipping.`);
                    duplicatesCount++;
                    continue;
                }

                if (fingerprint) {
                    seenFingerprints.add(fingerprint);
                }

                // Add valid, unique item
                validListings.push(validationResult.cleanData || item);
                stats.valid++;
            } else {
                logger.debug({ errors: validationResult.errors }, 'Listing validation failed');
                stats.errors++;
            }
        }

        if (duplicatesCount > 0) {
            logger.info(`Deduplication: Skipped ${duplicatesCount} duplicate listings.`);
        }

        // 3. Storage (or Dry Run)
        const { dryRun = false } = options;

        if (dryRun) {
            logger.info(`Dry Run enabled: Skipping storage for ${validListings.length} valid listings.`);
            return {
                success: true,
                stats,
                data: validListings // Return data directly for verification
            };
        }

        logger.info(`Step 4: Saving ${validListings.length} valid listings...`);
        if (validListings.length > 0) {
            const saveResult = await saveResults(validListings, 'output');
            logger.info({ files: saveResult }, 'Data saved successfully');
            stats.saved = validListings.length;

            return {
                success: true,
                stats,
                files: saveResult
            };
        } else {
            logger.warn('No valid listings to save.');
            return {
                success: true,
                stats,
                files: {}
            };
        }

    } catch (error) {
        logger.error(error, 'Orchestration failed');
        return {
            success: false,
            stats,
            error: error.message
        };
    }
}
