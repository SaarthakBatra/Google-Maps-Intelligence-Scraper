# Scraper Module

Google Maps browser automation module using Playwright for scraping business listings.

## Overview

The Scraper module handles all browser automation tasks required to scrape business data from Google Maps. It provides a robust, stealth-configured browser environment with comprehensive error handling and anti-detection features.

## Features

- **Browser Management**: Launch and manage Playwright browsers with stealth configuration
- **Navigation**: Navigate to Google Maps search results with automatic consent handling
- **Infinite Scrolling**: Load all available business listings through automated scrolling
- **Listing Interactions**: Click on businesses and extract detailed information
- **HTML Extraction**: Retrieve HTML content for parsing by the Parser module
- **Anti-Detection**: Stealth mode, random delays, and human-like behavior
- **Error Handling**: Retry logic, timeout management, and graceful failures

## Installation

The module is part of the Google Maps Scraper project. Dependencies are managed at the project level.

```bash
npm install
```

## Configuration

Configure the scraper through environment variables or the config module. All settings have sensible defaults.

### Environment Variables

```bash
# Browser Settings
SCRAPER_BROWSER_TYPE=chromium          # chromium | firefox | webkit
SCRAPER_HEADLESS=false                 # true for production
SCRAPER_VIEWPORT_WIDTH=1920
SCRAPER_VIEWPORT_HEIGHT=1080
SCRAPER_USER_AGENT="Mozilla/5.0..."

# Timeouts (milliseconds)
SCRAPER_NAVIGATION_TIMEOUT=60000       # 60 seconds
SCRAPER_LOAD_TIMEOUT=30000             # 30 seconds
SCRAPER_INTERACTION_TIMEOUT=10000      # 10 seconds

# Scroll Behavior
SCRAPER_SCROLL_DELAY_MIN=500          # Min delay between scrolls
SCRAPER_SCROLL_DELAY_MAX=1500         # Max delay between scrolls
SCRAPER_MAX_SCROLL_ATTEMPTS=100       # Prevent infinite loops
SCRAPER_NO_NEW_RESULTS_THRESHOLD=3    # Checks before stopping (default: 3)

# Anti-Detection
SCRAPER_STEALTH_MODE=true             # Enable stealth features
SCRAPER_RANDOM_DELAYS=true            # Randomize action delays

# Error Handling
SCRAPER_MAX_RETRIES=3                 # Retry failed operations
SCRAPER_RETRY_DELAY=2000              # Delay between retries
```

## API Reference

### Browser Lifecycle

#### `launchBrowser()`

Launch a Playwright browser instance with stealth configuration.

```javascript
import { launchBrowser, closeBrowser } from './modules/scraper/scraper.main.js';

const { browser, context } = await launchBrowser();
const page = await context.newPage();

// Use the page...

await closeBrowser(browser, context);
```

#### `closeBrowser(browser, context)`

Safely close browser and cleanup resources.

---

### Navigation

#### `navigateToSearch(page, searchQuery, location)`

Navigate to Google Maps search results.

```javascript
import { navigateToSearch } from './modules/scraper/scraper.main.js';

const result = await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');
// result: { success: true, status: 'success', url: '...' }
```

**Parameters:**
- `page`: Playwright page instance
- `searchQuery`: Business type (e.g., "restaurants", "cafes")
- `location`: Location to search (e.g., "Gurgaon Sector 43")

**Returns:**
```javascript
{
  success: boolean,
  status: 'success' | 'captcha' | 'no_results' | 'error',
  url?: string,
  message?: string
}
```

---

### Scrolling

#### `scrollToLoadAll(page)`

Scroll the results panel to load all available listings using an intelligent scroll-to-last-listing strategy.

**Scroll Strategy:**
- Scrolls the last visible listing into view (not fixed pixel amounts)
- Waits for new listings to appear using event-based detection
- Stops after 3 consecutive attempts with no new results
- Typical performance: ~120 listings in ~24 scroll attempts

```javascript
import { scrollToLoadAll } from './modules/scraper/scraper.main.js';

const result = await scrollToLoadAll(page);
// result: { success: true, count: 120, attempts: 24 }
```

**Returns:**
```javascript
{
  success: boolean,
  count: number,      // Total listings loaded
  attempts: number,   // Number of scroll attempts made
  message?: string    // Error message if failed
}
```

**Performance Characteristics:**
- **Adaptive Speed**: Waits for listings to appear, no wasted time
- **Reliability**: Event-based detection prevents premature exit
- **Efficiency**: Averages 5 listings per scroll attempt
- **Robustness**: Handles Google Maps' async lazy loading

#### `scrollToListing(page, index)`

Scroll to a specific listing by index.

---

### Interactions

#### `clickListing(page, index)`

Click on a business listing.

```javascript
import { clickListing, waitForDetailsPanel, closeDetailsPanel } from './modules/scraper/scraper.main.js';

await clickListing(page, 0);  // Click first listing
await waitForDetailsPanel(page);
// Extract details...
await closeDetailsPanel(page);
```

#### `waitForDetailsPanel(page)`

Wait for the details panel to fully load.

#### `closeDetailsPanel(page)`

Close the details panel and return to listing view.

---

### Extractors

#### `getListingsHTML(page)`

Extract HTML of all listing cards.

```javascript
import { getListingsHTML } from './modules/scraper/scraper.main.js';

const result = await getListingsHTML(page);
// result: { success: true, count: 150, html: ['<div...>', '<div...>', ...] }
```

#### `getDetailsHTML(page)`

Extract HTML of the currently open details panel.

```javascript
import { getDetailsHTML } from './modules/scraper/scraper.main.js';

const result = await getDetailsHTML(page);
// result: { success: true, html: '<div class="details">...</div>' }
```

---

### High-Level Workflow

#### `executeScrapeWorkflow(searchQuery, location, options)`

Execute a complete scraping workflow end-to-end.

```javascript
import { executeScrapeWorkflow } from './modules/scraper/scraper.main.js';

const result = await executeScrapeWorkflow(
  'restaurants',
  'Gurgaon Sector 43',
  {
    extractDetails: true,
    maxListings: 10
  }
);

console.log(`Scraped ${result.data.totalListings} listings`);
```

**Options:**
- `extractDetails` (boolean): Whether to click each listing for details
- `maxListings` (number): Maximum number of listings to process

**Returns:**
```javascript
{
  success: boolean,
  data: {
    query: string,
    location: string,
    totalListings: number,
    listingsHTML: string[],
    detailsHTML: (string | null)[]
  },
  message?: string
}
```

## Usage Examples

### Basic Scraping (Listings Only)

```javascript
import { launchBrowser, closeBrowser } from './modules/scraper/scraper.main.js';
import { navigateToSearch } from './modules/scraper/scraper.main.js';
import { scrollToLoadAll } from './modules/scraper/scraper.main.js';
import { getListingsHTML } from './modules/scraper/scraper.main.js';

const { browser, context } = await launchBrowser();
const page = await context.newPage();

// Navigate to search
await navigateToSearch(page, 'restaurants', 'Gurgaon Sector 43');

// Load all listings using intelligent scroll-to-last-listing strategy
const scrollResult = await scrollToLoadAll(page);
console.log(`Loaded ${scrollResult.count} listings in ${scrollResult.attempts} scroll attempts`);
// Example output: "Loaded 120 listings in 24 scroll attempts"

// Extract HTML for all listings
const listingsResult = await getListingsHTML(page);
console.log(`Extracted ${listingsResult.count} HTML elements`);

// Pass to parser module for data extraction...

await closeBrowser(browser, context);
```

### Advanced Scraping (with Details)

```javascript
import { executeScrapeWorkflow } from './modules/scraper/scraper.main.js';

const result = await executeScrapeWorkflow(
  'coffee shops',
  'Gurgaon Sector 29',
  { extractDetails: true, maxListings: 50 }
);

if (result.success) {
  console.log(`Total listings: ${result.data.totalListings}`);
  console.log(`Details extracted: ${result.data.detailsHTML.length}`);
  
  // Pass to parser module for data extraction
}
```

## Error Handling

The module implements comprehensive error handling:

```javascript
const result = await navigateToSearch(page, 'query', 'location');

if (!result.success) {
  if (result.status === 'captcha') {
    console.error('CAPTCHA detected, manual intervention needed');
  } else if (result.status === 'no_results') {
    console.error('No search results found');
  } else {
    console.error('Navigation error:', result.message);
  }
}
```

## Best Practices

1. **Use Headless Mode in Production**: Set `SCRAPER_HEADLESS=true` for production
2. **Respect Rate Limits**: Use random delays and avoid overwhelming Google's servers
3. **Handle CAPTCHAs**: Implement CAPTCHA detection and pause/notify when detected
4. **Monitor Resources**: Close browsers properly to prevent memory leaks
5. **Test Selectors**: Google may change their UI; monitor selector validity
-   **Selector Failures**: If the scraper grabs the wrong content (e.g., search results instead of details), check specific attributes. We use `div[role="main"]:not(:has(div[role="feed"]))` to differentiate the details panel from the results list.
-   **Timeout Errors**: Increase `interactionTimeout` in `.env` if your network is slow.
6. **Error Recovery**: Implement retry logic for transient failures

## Testing

Run unit tests:

```bash
npm test -- tests/modules/scraper/*.test.js
```

Run integration test:

```bash
npm test -- tests/modules/scraper/scraper-integration.test.js
```

## Limitations

- **Google's Terms of Service**: Scraping Google Maps may violate their ToS
- **Selector Stability**: Google may change their UI structure
- **CAPTCHA**: May be triggered by automated browsing
- **Rate Limiting**: Excessive requests may result in temporary blocks

## Future Enhancements

- Proxy rotation support
- CAPTCHA solving integration
- Parallel scraping with multiple browser contexts
- Screenshot capture for debugging
- Session recording for analysis

## License

Part of the Google Maps Scraper project. For educational purposes only.

---

## Testing

### Running Tests

**IMPORTANT**: Tests must be run sequentially to avoid browser conflicts:

```bash
# Run all scraper tests (REQUIRED: use --runInBand)
npm test -- tests/modules/scraper/ --runInBand

# Run specific test suite
npm test -- tests/modules/scraper/scroll.test.js --runInBand
npm test -- tests/modules/scraper/extractors.test.js --runInBand
```

**Why `--runInBand`?** The tests manage browser instances and running them in parallel causes conflicts ("Target page, context or browser has been closed" errors). Sequential execution ensures reliable results.

### Manual Verification Test

For visual confirmation that all listings are being extracted:

```bash
npm test -- tests/modules/scraper/extractors.manual.test.js --runInBand
```

**What it does**:
1. Launches visible browser
2. Navigates and scrolls to load all listings
3. **Highlights all listings in RED with numbers**
4. **Waits for you to press ENTER** (inspect before closing)
5. Runs assertions after confirmation

Perfect for debugging or verifying extraction visually.

### Test Coverage

```
✅ 22 tests across 6 test suites
- Browser: 5 tests (launch, viewport, user agent, stealth, close)
- Navigate: 3 tests (navigation, URL encoding, special chars)
- Scroll: 3 tests (load all, count, scroll to specific)
- Extractors: 4 tests (HTML extraction, details, text content)
- Interactions: 4 tests (click, wait, close, invalid index)
- Integration: 3 tests (full workflow, with details, multiple queries)
```

---

## Performance

### Scroll Performance

| Metric | Typical Value |
|--------|---------------|
| Listings Extracted | 100-120 |
| Scroll Attempts | 20-25 |
| Listings per Attempt | ~5 |
| Time per Scroll | ~2-3 seconds |
| Total Scroll Time | 40-60 seconds |

**Note**: Actual listings depend on Google Maps results for the search query. Some queries may have fewer results (e.g., "gyms in small town" → 20 listings).

### Historical Performance

After bug fixes (February 2026):
- **Before**: 16 listings in 6 attempts (premature exit)
- **After**: 120 listings in 24 attempts (complete extraction)
- **Improvement**: 650%

---

## Error Handling

All functions return structured objects:

```javascript
{
  success: boolean,    // Operation succeeded?
  status?: string,     // Specific status (e.g., 'captcha', 'no_results')
  count?: number,      // Listings/items count
  attempts?: number,   // Number of attempts made
  message?: string,    // Error/info message
  // ... other function-specific fields
}
```

**Always check `success` before using results**:

```javascript
const result = await scrollToLoadAll(page);

if (!result.success) {
    console.error(`Scroll failed: ${result.message}`);
    // Handle error appropriately
    return;
}

console.log(`Loaded ${result.count} listings`);
```

---

## Known Considerations

### Google Maps Selectors

Selectors are based on Google Maps UI as of February 2026. If Google changes their structure, selectors may need updates. The centralized `selectors.js` file makes this easy to maintain.

### CAPTCHA Handling

The module detects CAPTCHAs but requires manual intervention to solve them. The navigation function returns `status: 'captcha'` when detected.

### Rate Limiting

Google Maps may rate-limit excessive requests. Use appropriate delays between searches:
- Recommended: 5-10 seconds between different searches
- Enable random delays (`SCRAPER_RANDOM_DELAYS=true`)
- Consider headless mode for production

---

## Troubleshooting

### "Browser has been closed" Errors

**Cause**: Tests running in parallel  
**Fix**: Add `--runInBand` flag to test command

### Scroll Stops Early (< 30 listings)

**Causes**:
1. Query has limited results (check Google Maps manually)
2. Network latency (increase `SCRAPER_SCROLL_DELAY_MIN`)
3. Google Maps UI changed (update selectors)

**Debug**: Run manual verification test to see highlighted listings

### Navigation Timeout

**Causes**:
1. Slow network
2. CAPTCHA appeared
3. Consent dialog blocking

**Fix**:
- Increase `SCRAPER_NAVIGATION_TIMEOUT`
- Check result.status for 'captcha'
- Run with headless=false to diagnose

---

## Architecture

```
scraper/
├── browser.js          # Browser lifecycle
├── navigate.js         # Navigation & consent
├── scroll.js           # Infinite scroll logic
├── interactions.js     # Click & interact
├── extractors.js       # HTML extraction
├── selectors.js        # CSS selectors
└── scraper.main.js     # Unified exports
```

Each file contains one primary function following the architecture guidelines.

---

## License

Part of the Google Maps Scraper project - see main project README for license information.
