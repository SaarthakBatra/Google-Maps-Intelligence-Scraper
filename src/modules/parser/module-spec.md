# Parser Module Specification

## Overview

The Parser module is responsible for extracting structured data from raw HTML strings retrieved by the Scraper module. It uses `node-html-parser` to traverse the DOM and extract business details, handling missing fields gracefully and normalizing text output.

## Core Responsibilities

1.  **HTML Parsing**: Parse raw HTML strings into DOM objects.
2.  **Data Extraction**: Extract specific fields (Name, Address, Phone, Website, etc.) from business listings.
3.  **Data Cleaning**: Normalize text, remove extra whitespace, and handle encoding issues.
4.  **Error Handling**: Return "N/A" or `null` for missing fields without crashing.

## Key Design Principles

-   **Resilience**: HTML structure may change or fields may be missing. The parser must not throw errors for missing elements.
-   **Accuracy**: Extract exact text without surrounding garbage (e.g., "4.5 stars" -> 4.5).
-   **Performance**: Efficiently parse large HTML strings.
-   **Statelessness**: Pure functions that take HTML and return data.

## Dependencies

-   **External**: `node-html-parser`
-   **Internal**:
    -   `utils/logger`: For logging parsing errors or warnings.
    -   `utils/config`: For any parsing-related configurations (if any).

## Module Functions (One Function Per File)

### 1. `parse-listing.js`
**Purpose**: Extract details from a single business listing's HTML (detail view).
**Exports**:
-   `parseListing(html, reviewsData, url)`: Returns a structured JSON object with business details.

**Fields to Extract**:
-   Name
-   Address
-   Phone
-   Website
-   Rating
-   Reviews Count
-   Hours (Operating hours)
-   Category
-   Recent Reviews (Array of `{ text, author, rating }`)
-   Is Sponsored (boolean)
-   URL (string)

**Key Features**:
-   Selectors for each field.
-   Try/catch blocks for individual fields to ensure partial success.

### 2. `parse-search-results.js`
**Purpose**: Extract a list of basic business info from the search results sidebar.
**Exports**:
-   `parseSearchResults(html)`: Returns an array of partial business objects.

**Key Features**:
-   Iterate over result cards.
-   Extract basic info available in the list view (Name, Rating, basic Address).

### 3. `clean-text.js`
**Purpose**: Helper for text normalization.
**Exports**:
-   `cleanText(text)`: Trims whitespace, removes newlines, handles nulls.

### 4. `extract-reviews.js`
**Purpose**: Specialized extractor for reviews.
**Exports**:
-   `extractReviews(reviewsContainerHtml)`: Returns an array of review objects.

## Data Structure (Output)

```json
{
  "name": "Business Name",
  "address": "123 Main St, City, Country",
  "phone": "+1 234 567 890",
  "website": "https://example.com",
  "rating": 4.5,
  "reviewsCount": 120,
  "category": "Restaurant",
  "hours": "Mon-Fri: 9am-5pm...",
  "recentReviews": [
    {
      "author": "John Doe",
      "rating": 5,
      "text": "Great place!"
    }
  ],
  "isSponsored": false,
  "url": "https://google.com/maps/place/..."
}
```

## Error Handling Strategy

1.  **Missing Elements**: Log warning (debug level) and return `null` or "N/A".
2.  **Malformed HTML**: Log error and return empty object.
3.  ** Parsing Errors**: Catch errors and log them, ensuring the main process doesn't stop.

## Testing Strategy

-   **Unit Tests**: `parse-listing.test.js` using mock HTML snippets.
-   **Integration Tests**: Test with full HTML files saved from the scraper.
-   **HTML Samples**: Maintain a set of `test-data/` HTML files for regression testing.
