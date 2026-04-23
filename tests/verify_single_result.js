
import { orchestrate } from '../src/modules/orchestrator/index.js';
import logger from '../src/modules/utils/logger.js';

async function runTest() {
    console.log('🧪 Starting Single Result Verification Test...');

    // Test parameters
    const query = "dentists";
    const location = "Gurgaon Sector 43"; // Specific location to limit scope
    const options = {
        maxListings: 1,      // Only need 1 result
        extractDetails: true, // Test extraction logic
        skipScroll: true,    // Speed up test by skipping full scroll
        dryRun: true         // Skip saving to file, get data back
    };

    try {
        const result = await orchestrate(query, location, options);

        if (result.success) {
            console.log('\n✅ Orchestration Successful!');
            console.log('Stats:', result.stats);

            if (result.data && result.data.length > 0) {
                console.log('\n📄 Extracted Listing (Console Output):');
                console.log(JSON.stringify(result.data[0], null, 2));
            } else {
                console.warn('\n⚠ No listings returned in data array.');
            }
        } else {
            console.error('\n❌ Orchestration Failed:', result.error);
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Test Script Error:', error);
        process.exit(1);
    }
}

runTest();
