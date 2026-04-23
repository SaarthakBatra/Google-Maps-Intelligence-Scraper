# Parser Module

The Parser module is responsible for extracting structured data from raw HTML strings retrieved by the Scraper.

## Usage

```javascript
import { parseListing, parseSearchResults } from './src/modules/parser/index.js';

// Parse a single business listing
const business = parseListing(listingHtml);
console.log(business.name, business.rating);

// Parse search results list
const results = parseSearchResults(searchResultsHtml);
results.forEach(item => console.log(item.name));
```

## Functions

-   `parseListing(html)`: Extracts detailed info (Name, Address, Phone, Website, Rating, Reviews, Hours, Category).
-   `parseSearchResults(html)`: Extracts basic info from the results sidebar list.
-   `extractReviews(html)`: Helper to extract reviews from the review section.
-   `cleanText(text)`: Helper to normalize text.

## Testing

Run unit tests:
```bash
npm test tests/modules/parser
```
