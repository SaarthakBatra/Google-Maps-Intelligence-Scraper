# Orchestrator Module

The Orchestrator module is the central controller for the Google Maps Scraper application. It manages the end-to-end workflow by coordinating the Scraper, Parser, Validator, and Storage modules.

## Features

-   **Workflow Management**: Sequentially executes Scraping, Parsing, Validation, and Storage.
-   **Error Handling**: Catches and logs errors at each stage, preventing total application failure where possible.
-   **Statistics**: Tracks and reports the number of items scraped, parsed, validated, and saved.
-   **Configuration**: Accepts runtime options for search queries, locations, and processing limits.

## Usage

The module exports a single `orchestrate` function:

```javascript
import { orchestrate } from './index.js';

const result = await orchestrate('restaurants', 'New York', {
    maxListings: 10,
    extractDetails: true
});

if (result.success) {
    console.log('Success:', result.stats);
} else {
    console.error('Failed:', result.error);
}
```

## Workflow

1.  **Scrape**: Fetches HTML content from Google Maps using Playwright.
2.  **Parse**: Extracts structured data from the HTML using `node-html-parser`.
3.  **Validate**: Checks the data for required fields and quality using the Validator module.
4.  **Save**: Persists valid data to JSON and CSV files using the Storage module.
