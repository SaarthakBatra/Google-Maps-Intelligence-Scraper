# Scraper Module Specification

## Overview

The Scraper module is responsible for all browser automation tasks in the Google Maps scraping project. It uses Playwright to handle browser initialization, navigation, infinite scrolling, and interaction with business listings to extract detailed information.

## Core Responsibilities

1. **Browser Management**: Initialize and manage Playwright browser instances with proper configuration
2. **Navigation**: Handle navigation to Google Maps search URLs
3. **Infinite Scrolling**: Implement robust scrolling logic to load all available business listings
4. **Business Interactions**: Click on individual businesses to reveal detailed information
5. **HTML Extraction**: Retrieve the HTML content from the page for parsing

## Key Design Principles

- **Robustness over Speed**: Prioritize data accuracy and seamless operation
- **Anti-Detection**: Implement best practices to avoid detection/blocking
- **Error Recovery**: Graceful handling of network issues, timeouts, and page changes
- **Resource Management**: Proper cleanup of browser instances and contexts

## Dependencies

- **External**: `playwright` (browser automation)
- **Internal**: 
  - `utils/logger` (logging operations)
  - `utils/config` (configuration settings)
  - `utils/delays` (random wait times for human-like behavior)

## Module Functions (One Function Per File)

### 1. `browser.js`
**Purpose**: Manage browser instance lifecycle  
**Exports**: 
- `launchBrowser()`: Initialize Playwright browser with configuration
- `closeBrowser()`: Properly close browser and cleanup resources

**Key Features**:
- Stealth mode configuration
- User agent rotation
- Viewport configuration
- Browser context management

### 2. `navigate.js`
**Purpose**: Handle navigation to Google Maps  
**Exports**: 
- `navigateToSearch(page, searchQuery, location)`: Navigate to Google Maps search results

**Key Features**:
- URL construction for Google Maps searches
- Wait for page load and network idle
- Handle geolocation prompts
- Detect and handle CAPTCHAs (log and pause)

### 3. `scroll.js`
**Purpose**: Implement infinite scroll logic  
**Exports**: 
- `scrollToLoadAll(page)`: Scroll the results panel until all businesses are loaded

**Key Features**:
- Scroll-to-last-listing strategy (not fixed pixels)
    -   **Dynamic Class Handling**: Avoid relying on obfuscated classes (e.g., `.bJzME`). Use persistent attributes like `role="main"` combined with structure (e.g., `:not(:has(div[role="feed"]))`) to distinguish components.
    -   **Fallback Mechanisms**: For critical elements like Business Name, use an array of selectors (primary, partial match, structural).
- Event-based detection using `waitForFunction` for DOM changes
- Detect when no more results are loading (3 consecutive attempts)
- Comprehensive error handling with try-catch around entire loop
- Track scroll position and prevent infinite loops
- Returns structured object with `{ success, count, attempts, message }`

**Implementation Notes**:
- Fixed bug: `previousCount` initialized to 0 (not current count) to detect initial listings
- Performance: ~120 listings in ~24 attempts (650% improvement over initial implementation)
- Error recovery: Catches all errors (scrollIntoView, waitForFunction, page closed) and continues or stops gracefully


### 4. `interactions.js`
**Purpose**: Handle clicks and interactions with business listings  
**Exports**: 
- `clickListing(page, listingElement)`: Click on a business listing
- `waitForDetailsPanel(page)`: Wait for the details panel to load
- `closeDetailsPanel(page)`: Close the details panel and return to listing view

**Key Features**:
- Safe clicking with retry logic
- Wait for animations and transitions
- Detect and handle popups/modals
- Keyboard shortcuts for closing panels

### 5. `extractors.js`
**Purpose**: Extract HTML content from the page  
**Exports**: 
- `getListingsHTML(page)`: Extract HTML of all listing cards
- `getDetailsHTML(page)`: Extract HTML of the currently open details panel

**Key Features**:
- Selector-based extraction
- Wait for elements to be present
- Return clean HTML strings for parser module

### 6. `scraper.main.js`
**Purpose**: Module entry point and orchestration  
**Exports**: Main scraper API combining all functions

## Configuration Requirements

The following configuration settings will be added to `config.js`:

```javascript
scraper: {
  // Browser settings
  browserType: 'chromium',           // chromium | firefox | webkit
  headless: false,                   // false for development, true for production
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  
  // Performance settings
  navigationTimeout: 60000,          // 60 seconds
  loadTimeout: 30000,                // 30 seconds
  interactionTimeout: 10000,         // 10 seconds
  
  // Scrolling behavior
  scrollDelay: { min: 500, max: 1500 },  // Random delay between scrolls
  maxScrollAttempts: 100,            // Prevent infinite loops
  noNewResultsThreshold: 3,          // Consecutive attempts before stopping
  
  // Anti-detection
  stealthMode: true,                 // Enable stealth plugins
  randomDelays: true,                // Add random delays to actions
  mouseMovement: false,              // Simulate mouse movement (future)
  
  // Error handling
  maxRetries: 3,                     // Retry failed operations
  retryDelay: 2000,                  // Delay between retries
}
```

## Integration with Other Modules

- **Utils**: Uses logger for all operations, config for settings, delays for timing
- **Parser**: Provides HTML content that Parser module will extract data from
- **Main**: Called by main.js orchestration layer

## Error Handling Strategy

1. **Network Errors**: Retry with exponential backoff
2. **Timeout Errors**: Log and proceed or fail based on criticality
3. **Selector Not Found**: Wait longer or fail gracefully
4. **CAPTCHA Detected**: Log warning, pause execution, notify user
5. **Page Crashes**: Close and restart browser instance

## Testing Strategy

Each function has corresponding unit tests:
- `browser.test.js`: Test browser initialization and cleanup
- `navigate.test.js`: Test navigation and URL construction
- `scroll.test.js`: Test scroll logic with real Google Maps
- `interactions.test.js`: Test clicking and waiting logic
- `extractors.test.js`: Test HTML extraction

Integration test:
- `scraper-integration.test.js`: Test full workflow on real Google Maps search

Manual verification:
- `extractors.manual.test.js`: Visual verification with highlighted listings

**Critical**: Tests must run sequentially (`--runInBand` flag) to avoid browser conflicts.

**Test Results**: 22/22 tests passing (6 test suites)


## Performance Considerations

- Use browser contexts instead of multiple browsers
- Implement page pooling for parallel scraping (future)
- Cache browser instance for multiple searches
- Monitor memory usage and restart browser periodically

## Implementation Status

✅ **Complete and Production Ready** (February 2026)

- All functions implemented according to spec
- 22 comprehensive tests (all passing)
- Complete documentation (README, inline comments)
- Performance optimized (650% improvement through bug fixes)

### Bug Fixes During Development

Three critical scroll bugs were discovered and fixed:

1. **Initialization Bug**: `previousCount` started at current count instead of 0, causing first scroll to be marked as "no change"
2. **Scroll Strategy**: Fixed pixels (300px) didn't reach bottom; changed to scroll-to-last-listing
3. **Detection Method**: Fixed timeouts were unreliable; changed to event-based `waitForFunction`
4. **Error Handling**: Added comprehensive try-catch around entire scroll loop to handle all edge cases
5. **Test Execution**: Discovered tests need `--runInBand` flag to avoid browser conflicts

### Deviations from Original Spec

- **Scroll implementation**: Uses `scrollIntoViewIfNeeded()` on last listing instead of `scrollStep` pixels
- **Testing**: Real Google Maps tests (not mocked) with sequential execution requirement
- **Error responses**: All functions return structured `{ success, count, message }` objects
- **Manual test**: Added visual verification test for debugging

## Security & Ethics

- Respect robots.txt (note: Google Maps doesn't allow scraping - for educational purposes)
- Implement rate limiting
- Don't overwhelm Google servers
- User consent for data collection

## Future Enhancements

- [ ] Proxy rotation support
- [ ] CAPTCHA solving integration
- [ ] Parallel scraping with multiple contexts
- [ ] Screenshot capture for debugging
- [ ] Video recording of scraping sessions
