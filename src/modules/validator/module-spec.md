# Validator Module Specification

## Overview

The Validator module is responsible for ensuring the quality, integrity, and uniqueness of the data extracted by the Parser module. It performs structural validation, format checks, and data quality assessments before the data is saved or processed further.

## Core Responsibilities

1.  **Schema Validation**: Ensure all required fields are present.
2.  **Format Validation**: Verify that fields like phone numbers, URLs, and ratings match expected formats.
3.  **Data Quality Checks**: logical checks (e.g., rating between 0-5, reviews count >= 0).
4.  **Deduplication Support**: Generate unique fingerprints for listings to detect duplicates.
5.  **Normalization**: Ensure data is consistent (e.g., phone numbers in a standard format).

## Key Design Principles

-   **Statelessness**: Validation functions should be pure and not depend on external state (except for configuration).
-   **Fail-Soft**: Validation failures should describe *what* failed but not necessarily throw exceptions depending on severity.
-   **Composability**: Individual validation rules should be separate and composable.
-   **ESM Modules**: All files use ES Modules (`import`/`export`) instead of CommonJS.

## Dependencies

-   **Internal**:
    -   `utils/logger`: For logging validation warnings/errors.

## Module Functions (One Function Per File)

### 1. `validate-listing.js`
**Purpose**: Main entry point that orchestrates all validation checks.
**Exports**:
-   `validateListing(listing)`: Returns a validation result object.

### 2. `check-required-fields.js`
**Purpose**: Verifies mandatory fields exist and are not empty.
**Exports**:
-   `checkRequiredFields(listing)`: Returns a list of missing required fields.
**Required Fields**:
-   Name
-   Address

### 3. `validate-format.js`
**Purpose**: Validates specific field formats using Regex or logic.
**Exports**:
-   `validateFormat(listing)`: Returns a list of format errors.
**Checks**:
-   **Website**: Must be a valid URL structure (if present).
-   **Phone**: Should contain valid characters (digits, spaces, dashes, brackets).
-   **Rating**: Must be a number (float/int).
-   **Reviews Count**: Must be a number (int).

### 4. `check-quality.js`
**Purpose**: Performs logical checks on the data values.
**Exports**:
-   `checkQuality(listing)`: Returns a list of quality warnings.
**Checks**:
-   **Rating**: Range 0.0 to 5.0.
-   **Reviews Count**: >= 0.
-   **Address**: Minimum length check (e.g., > 10 chars) to avoid bad scrapes.

### 5. `generate-fingerprint.js`
**Purpose**: Generates a unique key for deduplication.
**Exports**:
-   `generateFingerprint(listing)`: Returns a string hash or key (e.g., `normalized_name|normalized_address`).

## Data Structure (Output)

The `validateListing` function will return:

```json
{
  "isValid": true,  // false if critical errors (missing required fields) match
  "isDuplicate": false, // Determined by caller using fingerprint, but validator flags potential issues
  "errors": [],     // Critical issues (e.g., "Missing Name")
  "warnings": [],   // Non-critical issues (e.g., "Invalid URL format") 
  "fingerprint": "business_name|address_string",
  "cleanData": { ... } // Optional: specific cleaning/normalization if needed beyond Parser
}
```

## Error Handling Strategy

1.  **Critical Errors**: Missing Name or Address marks the record as invalid (`isValid: false`). The scraper may choose to discard these.
2.  **Warnings**: Invalid format for optional fields (e.g., malformed website) adds a warning but keeps `isValid: true`. The field might be set to `null` or kept as-is depending on config.
3.  **Deduplication**: This module provides the *mechanism* (fingerprint) to detect duplicates. The unique set of fingerprints must be maintained by the caller (Scraper or Storage module).

## Testing Strategy

-   **Unit Tests**:
    -   Test `checkRequiredFields` with objects missing fields.
    -   Test `validateFormat` with valid/invalid URLs and phones.
    -   Test `checkQuality` with out-of-range ratings.
    -   Test `generateFingerprint` for consistency.
-   **Integration Tests**:
    -   Pass output from `Parser` tests into `Validator` to ensure compatibility.
