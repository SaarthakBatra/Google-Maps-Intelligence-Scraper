/**
 * Integration test for Scraper module
 * Tests the complete scraping workflow end-to-end
 */

import { describe, test, expect } from '@jest/globals';
import { executeScrapeWorkflow } from '../../../src/modules/scraper/scraper.main.js';

describe('Scraper Integration Test', () => {
    test('should execute complete scrape workflow without details', async () => {
        const result = await executeScrapeWorkflow(
            'restaurants',
            'Gurgaon Sector 43',
            { extractDetails: false }
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.totalListings).toBeGreaterThan(0);
        expect(result.data.listingsHTML).toBeDefined();
        expect(result.data.listingsHTML.length).toBeGreaterThan(0);
    }, 180000); // 3 minutes timeout

    test('should execute scrape workflow with details extraction', async () => {
        const result = await executeScrapeWorkflow(
            'coffee shops',
            'Gurgaon Sector 43',
            { extractDetails: true, maxListings: 3 }
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.totalListings).toBeGreaterThan(0);
        expect(result.data.detailsHTML).toBeDefined();
        expect(result.data.detailsHTML.length).toBeGreaterThanOrEqual(3);
    }, 300000); // 5 minutes timeout

    test('should handle different search queries', async () => {
        const queries = [
            { query: 'cafes', location: 'Gurgaon Sector 29' },
            { query: 'gyms', location: 'Gurgaon Sector 43' },
        ];

        for (const { query, location } of queries) {
            const result = await executeScrapeWorkflow(query, location, { extractDetails: false });

            expect(result.success).toBe(true);
            expect(result.data.query).toBe(query);
            expect(result.data.location).toBe(location);
        }
    }, 300000);
});
