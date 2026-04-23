# Utils Module

Shared utility functions for the Google Maps Scraper application.

## Overview

The Utils module provides centralized logging, configuration management, and delay utilities that are used across all other modules (Scraper, Parser, Validator, Storage).

## Module Structure

```
src/modules/utils/
├── logger.js      # Pino logger configuration
├── config.js      # Environment configuration loader
└── delays.js      # Random delay utilities
```

## Installation

All dependencies are already installed via the main `package.json`:

- `pino` - Structured logging library
- `pino-pretty` - Pretty-print formatter for development
- `dotenv` - Environment variable loader
- `zod` - Schema validation

## API Documentation

### Logger (`logger.js`)

Provides structured JSON logging using Pino with file and console transports.

**Import:**
```javascript
import logger from './modules/utils/logger.js';
```

**Usage:**
```javascript
// Info level logging
logger.info('Scraper started successfully');

// Error logging with error object
try {
  // Some operation
} catch (error) {
  logger.error({ error }, 'Failed to complete operation');
}

// Warning messages
logger.warn('Rate limit approaching');

// Debug messages (only shown when LOG_LEVEL=debug)
logger.debug({ data: results }, 'Parsing results');

// Structured logging with custom fields
logger.info({ 
  user: 'admin', 
  action: 'search', 
  query: 'restaurants' 
}, 'User performed search');
```

**Features:**
- Structured JSON logs in production
- Pretty-printed console output in development
- File output to `./logs/scraper.log`
- Automatic log directory creation
- ISO timestamp formatting
- Supports log levels: debug, info, warn, error

**Configuration:**
Set via environment variables in `.env`:
```bash
LOG_LEVEL=info          # debug | info | warn | error
LOG_FILE=./logs/scraper.log
```

---

### Config (`config.js`)

Loads and validates environment configuration with sensible defaults.

**Import:**
```javascript
import config from './modules/utils/config.js';
```

**Usage:**
```javascript
// Access browser settings
console.log(config.browser.type);      // 'chromium' | 'firefox' | 'webkit'
console.log(config.browser.headless);  // true | false

// Access scraping settings
console.log(config.scraping.rateLimit);  // Number (default: 2)
console.log(config.scraping.timeout);    // Number in ms (default: 30000)
console.log(config.scraping.userAgent);  // User agent string

// Access logging settings
console.log(config.logging.level);  // 'debug' | 'info' | 'warn' | 'error'
console.log(config.logging.file);   // './logs/scraper.log'
```

**Configuration Structure:**
```javascript
{
  browser: {
    type: 'chromium',      // Browser type for Playwright
    headless: true         // Run browser in headless mode
  },
  scraping: {
    rateLimit: 2,          // Requests per second
    timeout: 30000,        // Timeout in milliseconds
    userAgent: '...'       // Custom user agent string
  },
  logging: {
    level: 'info',         // Log level
    file: './logs/scraper.log'  // Log file path
  }
}
```

**Environment Variables:**
Configure via `.env` file:
```bash
# Browser settings
BROWSER_TYPE=chromium      # chromium | firefox | webkit
HEADLESS=true              # true | false

# Scraping settings
DEFAULT_RATE_LIMIT=2       # Requests per second
DEFAULT_TIMEOUT=30000      # Timeout in milliseconds
USER_AGENT=Mozilla/5.0...  # Custom user agent

# Logging settings
LOG_LEVEL=info             # debug | info | warn | error
LOG_FILE=./logs/scraper.log
```

**Validation:**
The config module uses Zod for schema validation. Invalid configurations will throw an error on module load.

---

### Delays (`delays.js`)

Random delay generator for human-like scraping behavior.

**Import:**
```javascript
import { randomDelay } from './modules/utils/delays.js';
```

**Usage:**
```javascript
// Wait between 1-3 seconds
await randomDelay(1000, 3000);

// Wait exactly 2 seconds
await randomDelay(2000, 2000);

// Short random delay (100-500ms)
await randomDelay(100, 500);

// Use in scraping workflow
async function scrapePage() {
  // Navigate to page
  await page.goto(url);
  
  // Random delay before interacting
  await randomDelay(1000, 2000);
  
  // Perform actions...
}
```

**Parameters:**
- `min` (number): Minimum delay in milliseconds
- `max` (number): Maximum delay in milliseconds

**Returns:**
- `Promise<void>`: Resolves after random delay

**Error Handling:**
```javascript
// Throws error if min > max
await randomDelay(3000, 1000);  // ❌ Error

// Throws error for negative values
await randomDelay(-100, 500);   // ❌ Error
```

## Usage Examples

### Example 1: Using Logger in a Module

```javascript
import logger from '../utils/logger.js';

export async function scrapeListing(url) {
  logger.info({ url }, 'Starting to scrape listing');
  
  try {
    // Scraping logic here
    const data = await performScraping(url);
    
    logger.info({ url, itemsFound: data.length }, 'Scraping completed');
    return data;
  } catch (error) {
    logger.error({ error, url }, 'Scraping failed');
    throw error;
  }
}
```

### Example 2: Using Config in Main Script

```javascript
import config from './modules/utils/config.js';
import { chromium } from 'playwright';

async function initializeBrowser() {
  const browser = await chromium.launch({
    headless: config.browser.headless,
    timeout: config.scraping.timeout
  });
  
  const context = await browser.newContext({
    userAgent: config.scraping.userAgent
  });
  
  return { browser, context };
}
```

### Example 3: Using Delays for Human-Like Behavior

```javascript
import { randomDelay } from './modules/utils/delays.js';
import logger from './modules/utils/logger.js';

async function scrollAndWait(page) {
  logger.info('Starting scroll sequence');
  
  for (let i = 0; i < 5; i++) {
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Random delay between scrolls (1-2 seconds)
    await randomDelay(1000, 2000);
    
    logger.debug(`Scroll iteration ${i + 1} complete`);
  }
  
  logger.info('Scroll sequence complete');
}
```

### Example 4: Complete Integration

```javascript
import logger from './modules/utils/logger.js';
import config from './modules/utils/config.js';
import { randomDelay } from './modules/utils/delays.js';
import { chromium } from 'playwright';

async function main() {
  logger.info('Application starting', { config: config.browser });
  
  const browser = await chromium.launch({
    headless: config.browser.headless
  });
  
  try {
    const page = await browser.newPage();
    
    logger.info('Navigating to Google Maps');
    await page.goto('https://www.google.com/maps');
    
    // Human-like delay
    await randomDelay(2000, 4000);
    
    logger.info('Search complete');
  } catch (error) {
    logger.error({ error }, 'Application error');
  } finally {
    await browser.close();
    logger.info('Application stopped');
  }
}

main();
```

## Testing

Run all Utils module tests:
```bash
npm test -- tests/modules/utils/
```

Run individual test files:
```bash
npm test -- tests/modules/utils/logger.test.js
npm test -- tests/modules/utils/config.test.js
npm test -- tests/modules/utils/delays.test.js
```

## Integration with Other Modules

The Utils module is designed to be used by all other modules:

- **Scraper Module**: Uses logger for browser actions, config for Playwright settings, delays for human-like behavior
- **Parser Module**: Uses logger for extraction steps
- **Validator Module**: Uses logger for validation results, config for validation rules
- **Storage Module**: Uses logger for save operations, config for file paths
- **Main Script**: Uses all utilities for orchestration and initialization

## Best Practices

1. **Always use the logger instead of console.log**:
   ```javascript
   // ❌ Bad
   console.log('Processing item', item);
   
   // ✅ Good
   logger.info({ item }, 'Processing item');
   ```

2. **Import config once at module level**:
   ```javascript
   // ✅ Good - import at top
   import config from '../utils/config.js';
   
   function myFunction() {
     const timeout = config.scraping.timeout;
   }
   ```

3. **Use structured logging with context**:
   ```javascript
   // ✅ Good - provides context
   logger.error({ 
     error, 
     url, 
     attempt: retryCount 
   }, 'Failed to fetch page');
   ```

4. **Add delays between requests**:
   ```javascript
   // ✅ Good - varies timing
   for (const item of items) {
     await processItem(item);
     await randomDelay(1000, 3000);
   }
   ```

## Dependencies

This module has NO dependencies on other business modules. It only depends on npm packages:

- `pino` - Logging
- `pino-pretty` - Log formatting
- `dotenv` - Environment variables
- `zod` - Validation

## Module Boundaries

**This module provides**: Shared utilities  
**This module does NOT**: Contain any business logic, browser automation, or data processing

Following the **One Agent Per Module** architecture, modifications to this module should only be made by the Utils Agent.
