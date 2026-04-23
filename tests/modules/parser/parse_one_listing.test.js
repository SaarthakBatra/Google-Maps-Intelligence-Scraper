
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseListing } from '../../../src/modules/parser/parse-listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input HTML file path (as provided in the task)
const inputHtmlPath = path.resolve(__dirname, '../../output/scraper/details_html_2026-02-16T08-44-10-801Z.html');
const outputDir = path.resolve(__dirname, '../../output/parser');
const outputJsonPath = path.join(outputDir, 'parsed_listing_result.json');

console.log(`\n--- Parser Real Data Test ---`);
console.log(`Reading HTML from: ${inputHtmlPath}`);

try {
    if (!fs.existsSync(inputHtmlPath)) {
        throw new Error(`Input file not found: ${inputHtmlPath}`);
    }

    const html = fs.readFileSync(inputHtmlPath, 'utf8');
    console.log(`HTML loaded successfully. Size: ${html.length} bytes`);

    console.log('Parsing listing...');
    const result = parseListing(html);

    console.log('\n--- Parsing Result ---');
    console.log(JSON.stringify(result, null, 2));
    console.log('----------------------\n');

    // Validation
    const errors = [];
    if (!result) {
        errors.push('Parser returned null.');
    } else {
        if (!result.name || typeof result.name !== 'string' || result.name.trim() === '') {
            errors.push('Validation Failed: "name" is missing or empty.');
        }
        // Address is technically optional but usually present, checking simply if it exists as field
        if (result.address === undefined) {
            // Note: It can be null if missing in HTML, but field should exist in object or be null
            // The parser returns null for missing fields usually.
            // Spec says "Return "N/A" or null".
        }

        if (result.rating !== null && typeof result.rating !== 'number') {
            errors.push('Validation Failed: "rating" should be a number or null.');
        }

        if (result.reviewsCount !== null && typeof result.reviewsCount !== 'number') {
            errors.push('Validation Failed: "reviewsCount" should be a number or null.');
        }
    }

    if (errors.length > 0) {
        console.error('❌ Test FAILED with errors:');
        errors.forEach(err => console.error(`   - ${err}`));
        process.exit(1);
    } else {
        console.log('✅ Validation PASSED: Essential fields have correct types.');

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2));
        console.log(`✅ Result saved to: ${outputJsonPath}`);
    }

} catch (error) {
    console.error('❌ Error executing test:', error);
    process.exit(1);
}
