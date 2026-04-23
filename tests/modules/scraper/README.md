# Running Scraper Module Tests

## Overview

The Scraper module has comprehensive test coverage across 6 test files. Due to the nature of browser automation tests, they should be run **sequentially** to avoid resource conflicts.

## Quick Start

### Run All Tests Sequentially

```bash
npm test -- tests/modules/scraper/*.test.js --runInBand
```

The `--runInBand` flag ensures Jest runs tests sequentially instead of in parallel.

---

## Individual Test Files

For better control and debugging, run each test file individually:

### 1. Browser Tests (Fast - ~8 seconds)
```bash
npm test -- tests/modules/scraper/browser.test.js
```
Tests browser lifecycle, viewport, user agent, and stealth mode.

---

### 2. Navigate Tests (Medium - ~60 seconds)
```bash
npm test -- tests/modules/scraper/navigate.test.js
```
Tests Google Maps navigation and URL construction.

---

### 3. Scroll Tests (Long - ~120 seconds)
```bash
npm test -- tests/modules/scraper/scroll.test.js
```
Tests infinite scroll functionality.

---

### 4. Interactions Tests (Long - ~120 seconds)
```bash
npm test -- tests/modules/scraper/interactions.test.js
```
Tests clicking listings and details panel interactions.

---

### 5. Extractors Tests (Long - ~80 seconds)
```bash
npm test -- tests/modules/scraper/extractors.test.js
```
Tests HTML extraction from listings and details.

---

### 6. Integration Test (Very Long - ~180 seconds)
```bash
npm test -- tests/modules/scraper/scraper-integration.test.js
```
Tests complete end-to-end scraping workflow.

---

## Test Execution Strategies

### Strategy 1: Sequential (Recommended)
Run all tests one after another to avoid conflict:
```bash
npm test -- tests/modules/scraper/*.test.js --runInBand
```

**Pros:**
- No browser instance conflicts
- More reliable results
- Easier debugging

**Cons:**
- Takes longer (total ~8-10 minutes)

---

### Strategy 2: One-by-One (Best for Development)
Run each test file individually as needed:
```bash
# Fast feedback on browser basics
npm test -- tests/modules/scraper/browser.test.js

# Test specific functionality
npm test -- tests/modules/scraper/navigate.test.js
```

**Pros:**
- Fast feedback for specific features
- Easy to debug individual components
- Can run only relevant tests during development

**Cons:**
- Manual process
- More commands to remember

---

### Strategy 3: Parallel (Not Recommended)
Run tests in parallel (Jest default):
```bash
npm test -- tests/modules/scraper/*.test.js
```

**Pros:**
- Faster overall execution

**Cons:**
- ❌ Launches multiple browser instances simultaneously (resource intensive)
- ❌ Can cause timeouts and conflicts
- ❌ Hard to debug when failures occur
- ❌ May cause "worker process force exit" errors

---

## Understanding Test Failures

### Common Issues

#### 1. Timeout Errors
```
Exceeded timeout of 60000 ms for a test
```

**Cause:** Google Maps takes longer to load than expected (network issues, slow connection)

**Fix:** Increase test timeout or ensure stable internet connection

---

#### 2. Navigation Failures
```
ERROR: Navigation failed
```

**Cause:** 
- Google detecting automation
- CAPTCHA triggered
- Network timeout

**Fix:** 
- Run tests with `headless: false` to see what's happening
- Check if CAPTCHA is appearing
- Verify internet connection

---

#### 3. Multiple Browser Windows
**Cause:** Jest running tests in parallel

**Fix:** Use `--runInBand` flag

---

#### 4. Chrome vs Chromium
**Cause:** Playwright using system Chrome instead of bundled Chromium

**Fix:** Now resolved - browser.js explicitly sets `channel: 'chromium'`

---

## Test Configuration

### Environment Variables for Testing

Create a `.env.test` file for test-specific settings:

```bash
# Use non-headless mode to observe tests
SCRAPER_HEADLESS=false

# Enable debug logging
LOG_LEVEL=debug

# Increase timeouts for slow connections
SCRAPER_NAVIGATION_TIMEOUT=90000
SCRAPER_LOAD_TIMEOUT=45000
```

---

## Debugging Tests

### Watch Browser During Tests
Set headless mode to false:
```bash
SCRAPER_HEADLESS=false npm test -- tests/modules/scraper/browser.test.js
```

This lets you see what the browser is doing during tests.

---

### Enable Debug Logs
```bash
LOG_LEVEL=debug npm test -- tests/modules/scraper/*.test.js --runInBand
```

---

### Run with Open Handles Detection
Find resource leaks:
```bash
npm test -- tests/modules/scraper/*.test.js --runInBand --detectOpenHandles
```

---

## Best Practices

1. **Always run with `--runInBand`** when running all tests
2. **Run individual test files** during development
3. **Use headless: false** when debugging
4. **Check logs** for navigation errors and CAPTCHA detection
5. **Ensure stable internet** - tests make real Google Maps requests
6. **Close other browser instances** before running tests

---

## Expected Test Results

All tests should pass if:
- Internet connection is stable
- Google Maps is accessible
- No CAPTCHA is triggered
- Tests run sequentially

**Total Test Count:** 22 tests across 6 files
**Expected Duration (Sequential):** 8-10 minutes
**Expected Duration (Per File):** 8s - 180s depending on the file

---

## Integration with CI/CD

For automated testing in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Scraper Tests
  run: npm test -- tests/modules/scraper/*.test.js --runInBand
  env:
    SCRAPER_HEADLESS: true
    SCRAPER_STEALTH_MODE: true
```

**Note:** May requireCAPTCHA handling or mocking in CI environments.
