# Storage Module

## Overview

The Storage module handles the persistence of extracted data. It supports saving data to JSON and CSV formats with automatic timestamping to prevent overwrites.

## Features

-   **Multi-format Support**: Save to both JSON and CSV.
-   **Timestamped Filenames**: Automatically generates filenames like `businesses_2023-10-27_143000.json`.
-   **Automatic Directory Creation**: Creates `output/` directory if it doesn't exist.
-   **CSV Escaping**: Properly handles special characters in CSV fields.

## Usage

```javascript
import { saveResults, saveJson, saveCsv } from './modules/storage/index.js';

const data = [
  { name: 'Business A', rating: 5.0 },
  { name: 'Business B', rating: 4.2 }
];

// Saves to output/businesses_YYYY-MM-DD_HHmmss.json and .csv
await saveResults(data);

// Or use specific savers directly
await saveJson(data, 'specific-file.json');
```

## Functions

### `saveResults(data, outputDir = 'output')`

Main entry point. Orchestrates saving to all configured formats.

-   `data`: Array of objects to save.
-   `outputDir`: Directory to save files (default: 'output').
-   Returns: Object containing paths to saved files (`{ jsonPath, csvPath }`).

### `saveJson(data, filepath)`

Saves data as a formatted JSON file.

### `saveCsv(data, filepath)`

Converts data to CSV and saves it. Handles header generation and field escaping.
