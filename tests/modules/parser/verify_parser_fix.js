
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseListing } from '../../../src/modules/parser/parse-listing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debugHtmlPath = path.join(__dirname, 'test-data/debug_latest.html');

console.log(`Reading HTML from: ${debugHtmlPath}`);

try {
    const html = fs.readFileSync(debugHtmlPath, 'utf8');
    console.log('HTML read successfully. Size:', html.length);

    console.log('Parsing listing...');
    const result = parseListing(html);

    console.log('\n--- Parsing Result ---');
    console.log(JSON.stringify(result, null, 2));
    console.log('----------------------\n');

    // Basic Validation
    if (result && result.name === 'Cafe AURIKA | Garden cafe' && result.rating === 4.2) {
        console.log('✅ SUCCESS: Parser extracted correct data!');
    } else {
        console.error('❌ FAILURE: Parser extracted incorrect data or null.');
    }

} catch (error) {
    console.error('Error running test:', error);
}
