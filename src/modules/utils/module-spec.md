# Utils Module Specification

## Module Overview
**Name**: Utils  
**Responsibility**: Shared utility functions for logging and configuration management across all modules.

## Purpose
The Utils module provides centralized logging and configuration capabilities that will be used by all other modules (Scraper, Parser, Validator, Storage) in the Google Maps scraper application.

## Requirements

### 1. Logger (`logger.js`)
- **Technology**: Pino logger
- **Features**:
  - Structured JSON logging
  - Multiple log levels (debug, info, warn, error)
  - Pretty-print for development
  - File output support for production
  - Consistent log format across all modules

### 2. Config (`config.js`)
- **Technology**: Environment variable loader
- **Features**:
  - Load configuration from `.env` file
  - Provide defaults for missing values
  - Validate required config values
  - Export typed configuration object
  - Support for:
    - Playwright/browser settings
    - Logging settings
    - Scraper settings (timeouts, delays)
    - Storage paths

### 3. Delays (`delays.js`) - Optional Helper
- **Responsibility**: Random wait time generators to mimic human behavior
- **Features**:
  - Random delay within a range
  - Configurable min/max values

## Function Breakdown
Following the **One Function Per File** architecture:

1. **`logger.js`**: 
   - Export configured Pino logger instance
   - Single export: `logger`

2. **`config.js`**: 
   - Load and validate environment configuration
   - Single export: `config` object

3. **`delays.js`**: 
   - Generate random delays for human-like behavior
   - Export: `randomDelay(min, max)`

## API Design

### logger.js
```javascript
import logger from './modules/utils/logger.js';

logger.info('Scraper started');
logger.error({ error: err }, 'Failed to navigate');
```

### config.js
```javascript
import config from './modules/utils/config.js';

console.log(config.browser.headless);
console.log(config.logging.level);
```

### delays.js
```javascript
import { randomDelay } from './modules/utils/delays.js';

await randomDelay(1000, 3000); // Wait 1-3 seconds
```

## Dependencies
- `pino` - Logging library
- `pino-pretty` - Development formatting
- `dotenv` - Environment variable loader

## Testing Requirements
- **`logger.test.js`**: Test logger initialization and log level functionality
- **`config.test.js`**: Test config loading, defaults, and validation
- **`delays.test.js`**: Test delay range and timing

## Integration Points
This module will be used by:
- **Scraper**: For logging browser actions and using config
- **Parser**: For logging extraction steps
- **Validator**: For logging validation results
- **Storage**: For logging save operations and file paths
- **Main**: For initialization and orchestration logging

## Success Criteria
- ✅ Logger produces structured JSON logs
- ✅ Config loads from `.env` with proper defaults
- ✅ All tests passing
- ✅ Module exports clear API
- ✅ No business logic - pure utility functions
