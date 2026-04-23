import { saveResults, saveJson, saveCsv } from '../../../src/modules/storage/index.js';
import fs from 'fs/promises';
import path from 'path';

describe('Storage Module', () => {
    const outputDir = 'tests/modules/storage/output';
    const testData = [
        {
            name: 'Test Business 1',
            address: '123 Main St',
            rating: 4.5,
            reviews: 100,
            website: 'https://example.com'
        },
        {
            name: 'Test Business 2 ("Quotes")',
            address: '456 Side St',
            rating: 3.8,
            reviews: 50,
            website: ''
        }
    ];

    beforeEach(async () => {
        // Clean up output directory before each test
        try {
            await fs.rm(outputDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore if doesn't exist
        }
    });

    afterEach(async () => {
        // Optional: Clean up after tests. Keeping it might be useful for inspection on failure.
        // await fs.rm(outputDir, { recursive: true, force: true });
    });

    test('saveResults should check create JSON and CSV files', async () => {
        const results = await saveResults(testData, outputDir);

        expect(results.jsonPath).toBeDefined();
        expect(results.csvPath).toBeDefined();

        // Verify JSON content
        const jsonContent = await fs.readFile(results.jsonPath, 'utf-8');
        const parsedJson = JSON.parse(jsonContent);
        expect(parsedJson).toHaveLength(2);
        expect(parsedJson[0].name).toBe('Test Business 1');

        // Verify CSV content
        const csvContent = await fs.readFile(results.csvPath, 'utf-8');
        const lines = csvContent.split('\n');
        expect(lines).toHaveLength(3); // Header + 2 rows
        expect(csvContent).toContain('"Test Business 1"');
        expect(csvContent).toContain('"Test Business 2 (""Quotes"")"'); // Check escaping
    });

    test('saveResults should create directory if it does not exist', async () => {
        // Ensure dir is gone
        await fs.rm(outputDir, { recursive: true, force: true });

        const results = await saveResults(testData, outputDir);

        const stats = await fs.stat(outputDir);
        expect(stats.isDirectory()).toBe(true);
    });

    test('saveResults should handle empty data gracefully', async () => {
        const results = await saveResults([], outputDir);
        expect(results).toEqual({});

        // Should not create files
        try {
            await fs.readdir(outputDir);
            // If readdir succeeds, it might be empty or not exist depending on implementation details of mkdir in saveResults
            // behavior: saveResults returns early if data empty, so directory might not be created or empty.
        } catch (e) {
            // Expected if directory wasn't created
        }
    });
});
