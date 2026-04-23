# Validator Module

## Overview
The Validator module ensures the integrity and quality of scraped business data. It provides functions to validate required fields, check data formats, and generate deduplication fingerprints.

## Key Features
- **Schema Validation**: Ensures `Name` and `Address` are present.
- **Format Checking**: Validates URLs, Phone numbers, and numeric types.
- **Data Quality**: Checks for reasonable values (e.g., Rating 0-5).
- **Deduplication**: Generates unique fingerprints based on normalized Name and Address.

## Usage

This module is **ESM-only**. Use `import` to use it.

```javascript
import { validateListing } from './path/to/modules/validator/validate-listing.js';

const listing = {
  name: "Examples Inc.",
  address: "123 Market St",
  phone: "+1 555 0000",
  website: "https://example.com",
  rating: 4.5
};

const result = validateListing(listing);

if (!result.isValid) {
  console.error("Validation Failed:", result.errors);
} else {
  console.log("Valid Listing!");
  console.log("Fingerprint:", result.fingerprint);
  if (result.warnings.length > 0) {
    console.warn("Quality Warnings:", result.warnings);
  }
}
```

## API

### `validateListing(listing)`
Main entry point. Runs all checks.
- **Returns**: 
  ```json
  {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "fingerprint": "examples inc.|123 market st",
    "cleanData": { ... }
  }
  ```

### `generateFingerprint(listing)`
Helper to generate a unique key for deduplication.
- **Returns**: `string` (e.g., "name|address")

## Testing
Run unit tests with:
```bash
npm test tests/modules/validator
```
