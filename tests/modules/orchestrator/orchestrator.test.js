import { jest } from '@jest/globals';

// Define mocks before importing module under test
jest.unstable_mockModule('../../../src/modules/scraper/scraper.main.js', () => ({
    executeScrapeWorkflow: jest.fn(),
}));
jest.unstable_mockModule('../../../src/modules/parser/index.js', () => ({
    parseListing: jest.fn(),
    parseSearchResults: jest.fn(),
}));
jest.unstable_mockModule('../../../src/modules/validator/validate-listing.js', () => ({
    validateListing: jest.fn(),
}));
jest.unstable_mockModule('../../../src/modules/storage/index.js', () => ({
    saveResults: jest.fn(),
}));

// Import module under test and dependencies dynamically
const { orchestrate } = await import('../../../src/modules/orchestrator/index.js');
const scraper = await import('../../../src/modules/scraper/scraper.main.js');
const parser = await import('../../../src/modules/parser/index.js');
const validator = await import('../../../src/modules/validator/validate-listing.js');
const storage = await import('../../../src/modules/storage/index.js');

describe('Orchestrator Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should execute full workflow successfully', async () => {
        // Mock Scraper
        scraper.executeScrapeWorkflow.mockResolvedValue({
            success: true,
            data: {
                listingsHTML: ['<html>1</html>'],
                detailsHTML: ['<html>D1</html>']
            }
        });

        // Mock Parser
        parser.parseListing.mockReturnValue({ name: 'Business 1' });

        // Mock Validator
        validator.validateListing.mockReturnValue({
            isValid: true,
            cleanData: { name: 'Business 1 Clean' }
        });

        // Mock Storage
        storage.saveResults.mockResolvedValue({
            jsonPath: 'out.json',
            csvPath: 'out.csv'
        });

        const result = await orchestrate('pizza', 'NYC', { extractDetails: true });

        expect(result.success).toBe(true);
        expect(result.stats.scraped).toBe(1);
        expect(result.stats.parsed).toBe(1);
        expect(result.stats.valid).toBe(1);
        expect(result.stats.saved).toBe(1);

        expect(scraper.executeScrapeWorkflow).toHaveBeenCalledWith('pizza', 'NYC', expect.objectContaining({ extractDetails: true }));
        expect(parser.parseListing).toHaveBeenCalled();
        expect(validator.validateListing).toHaveBeenCalled();
        expect(storage.saveResults).toHaveBeenCalled();
    });

    it('should handle scraper failure', async () => {
        scraper.executeScrapeWorkflow.mockResolvedValue({
            success: false,
            message: 'Network error'
        });

        const result = await orchestrate('pizza', 'NYC');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Scraping failed');
    });

    it('should skipping parsing if no details extracted', async () => {
        // If extractDetails is false, detailsHTML is empty or ignored in current implementation
        scraper.executeScrapeWorkflow.mockResolvedValue({
            success: true,
            data: { listingsHTML: ['L1'], detailsHTML: [] }
        });

        const result = await orchestrate('pizza', 'NYC', { extractDetails: false });

        expect(result.success).toBe(true);
        expect(result.stats.scraped).toBe(1);
        expect(result.stats.parsed).toBe(0); // Assuming no list parsing yet
        expect(storage.saveResults).not.toHaveBeenCalled();
    });
});
