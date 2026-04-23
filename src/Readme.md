# Node Scraper CLI Documentation

This document explains how to use the `main.js` script to run the Google Maps Scraper.

## Overview

The `src/main.js` script is the entry point for the scraper. It orchestrates the entire workflow:
1.  **Scraping**: Launches a browser to capture listings from Google Maps.
2.  **Parsing**: Extracts data from the captured HTML.
3.  **Validation**: Ensures the data meets quality standards.
4.  **Storage**: Saves the results to JSON and CSV files.

## Usage

Run the script using Node.js from the project root:

```bash
node src/main.js [arguments] [options]
```

### Arguments

You can provide arguments using named flags (recommended) or positional values (legacy support).

| Argument | Flag | Short Flag | Description | Required | Default |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Query** | `--query` | `-q` | The search term (e.g., "Coffee Shops") | Yes | - |
| **Location** | `--location` | `-l` | The target location (e.g., "Seattle, WA") | Yes | - |

### Options

| Option | Flag | Description | Default |
| :--- | :--- | :--- | :--- |
| **Max Listings** | `--max=<number>` | Maximum number of listings to process. Useful for testing or limited runs. | `Infinity` (All found) |
| **Extract Details** | `--details` | Visits each listing page to extract detailed info (website, phone, etc.). **Slower** but more complete data. | `false` |
| **Dry Run** | `--dryRun` | Runs the orchestrator without launching the browser or scraping. | `false` |

## Examples

### 1. Basic Usage (Named Arguments)
The recommended way to run the scraper.
```bash
node src/main.js --query "Dentists" --location "New York, NY"
```

### 2. Using Short Flags
A quicker way to specify arguments.
```bash
node src/main.js -q "Pizza" -l "Chicago"
```

### 3. Limiting Results
Scrape only the first 10 results.
```bash
node src/main.js -q "Gyms" -l "Austin" --max=10
```

### 4. Extracting Full Details
Get detailed information for each business (will visit each page individually).
```bash
node src/main.js -q "Lawyers" -l "Miami" --details --max=5
```

### 5. Testing (Dry Run)
Verify arguments without starting the browser.
```bash
node src/main.js -q "Test" -l "Test" --dryRun
```

### 6. Legacy Positional Arguments
Older format is still supported but discouraged.
```bash
# node src/main.js <query> <location> [options]
node src/main.js "Burgers" "San Francisco" --max=20
```

## Logging

The script uses `pino` for logging. Logs are output to the console and saved to the `logs/` directory.

-   **Info**: General progress updates.
-   **Error**: Issues encountered during execution.
-   **Fatal**: Critical failures that stop the process.
