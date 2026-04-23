#!/usr/bin/env node

/**
 * Main Entry Point
 * Used for running the scraper from command line.
 */

import { orchestrate } from './modules/orchestrator/index.js';
import logger from './modules/utils/logger.js';

// CLI argument parsing
const args = process.argv.slice(2);
let searchQuery = '';
let location = '';
const positionalArgs = [];
const options = {
    maxListings: Infinity,
    extractDetails: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--query' || arg === '-q') {
        searchQuery = args[++i];
    } else if (arg.startsWith('--query=')) {
        searchQuery = arg.split('=')[1];
    } else if (arg === '--location' || arg === '-l') {
        location = args[++i];
    } else if (arg.startsWith('--location=')) {
        location = arg.split('=')[1];
    } else if (arg.startsWith('--max=')) {
        options.maxListings = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--details') {
        options.extractDetails = true;
    } else if (arg === '--dryRun') {
        options.dryRun = true;
    } else if (arg === '--reviews') {
        options.skipReview = true;
    } else if (!arg.startsWith('-')) {
        positionalArgs.push(arg);
    }
}

// Fallback to positional arguments if not named
if (!searchQuery && positionalArgs.length > 0) {
    searchQuery = positionalArgs[0];
}
if (!location && positionalArgs.length > 1) {
    location = positionalArgs[1];
}

// Validate required arguments
if (!searchQuery || !location) {
    console.error('Usage: node src/main.js --query="<query>" --location="<location>" [options]');
    console.error('Alt Usage: node src/main.js <query> <location> [options]');
    console.error('Options:');
    console.error('  --query, -q         Search query (e.g. "Dentists")');
    console.error('  --location, -l      Location (e.g. "New York")');
    console.error('  --max=<number>      Max listings to process (default: Infinity)');
    console.error('  --details           Extract details for each listing (default: false)');
    console.error('  --dryRun            Run without scraping (for testing)');
    process.exit(1);
}

logger.info({ searchQuery, location, options }, 'Parsed CLI Arguments');

(async () => {
    try {
        const result = await orchestrate(searchQuery, location, options);

        if (result.success) {
            logger.info('Job completed successfully!');
            console.log(JSON.stringify(result.stats, null, 2));
            process.exit(0);
        } else {
            logger.error(`Job failed: ${result.error}`);
            process.exit(1);
        }
    } catch (error) {
        logger.fatal(error, 'Unhandled exception in main process');
        process.exit(1);
    }
})();
