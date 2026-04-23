# Orchestrator Module Specification

## Overview

The Orchestrator module functions as the central nervous system of the application. It coordinates the data flow between the Scraper, Parser, Validator, and Storage modules to execute the end-to-end scraping workflow.

## Core Responsibilities

1.  **Workflow Management**: sequentially executing Scrape -> Parse -> Validate -> Save.
2.  **Error Handling**: Managing errors at a high level and deciding whether to proceed or halt.
3.  **Progress Tracking**: Logging progress and statistics (e.g., how many items scraped, valid, saved).
4.  **CLI Interface**: Receiving inputs from the main entry point and passing them to the workflow.

## Dependencies

-   **Internal**:
    -   `modules/scraper`: To fetch raw data/HTML.
    -   `modules/parser`: To extract structured data from HTML.
    -   `modules/validator`: To ensure data quality.
    -   `modules/storage`: To persist the data.
    -   `utils/logger`: For logging workflow progress.
    -   `utils/config`: For global configurations.

## Module Functions

### 1. `index.js`

**Purpose**: The single entry point for the orchestration logic.

**Exports**:

-   `orchestrate(searchQuery, location, options)`: The main function to trigger the workflow.

**Parameters**:

-   `searchQuery` (string): The business type to search for (e.g., "restaurants").
-   `location` (string): The geographic location (e.g., "New York").
-   `options` (object):
    -   `maxListings` (number): Limit on results.
    -   `extractDetails` (boolean): Whether to visit details pages.
    -   `runMode` (string): 'search' (default), 'test', etc.

**Return Value**:

-   A Promise resolving to a summary object:
    ```javascript
    {
      success: true,
      stats: {
        totalScraped: 10,
        totalParsed: 10,
        totalValid: 8,
        totalSaved: 8
      },
      files: {
        json: 'path/to/file.json',
        csv: 'path/to/file.csv'
      }
    }
    ```

## Workflow Steps

1.  **Initialization**: Log start of job.
2.  **Scraping**: Call `scraper.executeScrapeWorkflow`.
    -   *Input*: query, location, options.
    -   *Output*: `{ listingsHTML, detailsHTML }`.
3.  **Parsing**: Loop through HTML results and call `parser.parseListing` or `parser.parseSearchResults`.
    -   *Input*: HTML strings.
    -   *Output*: Array of raw business objects.
4.  **Validation**: Loop through parsed objects and call `validator.validateListing`.
    -   *Input*: Raw business objects.
    -   *Action*: Filter out invalid items, log warnings.
    -   *Output*: Array of valid business objects.
5.  **Storage**: Call `storage.saveResults`.
    -   *Input*: Valid business objects.
    -   *Output*: File paths.
6.  **Completion**: Log summary and return stats.

## Error Handling

-   **Critical Failures** (e.g., Scraper fails completely): Log error and return `success: false`.
-   **Partial Failures** (e.g., one item fails parsing): Log warning, skip item, and continue.

## Testing Strategy

-   **Unit Tests**: Mock Scraper, Parser, Validator, and Storage to verify orchestration logic flows correctly.
-   **Integration Tests**: Run with minimal real data (if possible) or use recorded fixtures.

## Implementation Status

✅ **Complete** (February 2026)

-   All core orchestration logic implemented.
-   Unit tests passing with 100% coverage of main flows.
-   CLI integration via `main.js` verifiable.

### Implementation Notes

-   **ESM Mocking**: Tests use `jest.unstable_mockModule` to correctly mock ES modules.
-   **Parsing Logic**: Currently, the orchestrator primarily relies on `detailHTML` for proper parsing. if `extractDetails` is false, it logs a warning that parsing limited search results is not yet fully implemented.

## Verification

### Automated Tests

Run unit tests:
```bash
npm test tests/modules/orchestrator/orchestrator.test.js
```

### Manual Verification

Run the full scraper:
```bash
node src/main.js "coffee" "New York" --max=2 --details
```
