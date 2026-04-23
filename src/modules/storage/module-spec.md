# Storage Module Specification

## Overview

The Storage module is responsible for persisting the validated extracted data to the file system. It supports multiple formats (JSON, CSV) and handles file organization using timestamped filenames.

## Core Responsibilities

1.  **Data Persistence**: Save data to disk in JSON and CSV formats.
2.  **File Management**: Generate timestamped filenames to prevent overwrites.
3.  **Format Conversion**: Convert JavaScript objects to CSV format.
4.  **Error Handling**: Gracefully handle file permission or write errors without crashing the main process.

## Dependencies

-   **Internal**:
    -   `utils/logger`: For logging success/failure of save operations.
-   **External**:
    -   `fs/promises`: Native Node.js file system usage.
    -   `path`: Native Node.js path manipulation.

## Module Functions (One Function Per File)

### 1. `save-json.js`
**Purpose**: Saves data as a formatted JSON file.
**Exports**:
-   `saveJson(data, filename)`: Writes the data array to `output/<filename>.json`.

### 2. `save-csv.js`
**Purpose**: Converts data to CSV format and saves it.
**Exports**:
-   `saveCsv(data, filename)`: Converts array of objects to CSV string and writes to `output/<filename>.csv`.
**Logic**:
-   Extract headers from the first object (or a predefined list).
-   Handle special characters (commas, newlines) by quoting fields.
-   Flatten or stringify complex nested objects (like arrays or objects).

### 3. `index.js` (Facade)
**Purpose**: Main entry point that orchestrates saving to all configured formats.
**Exports**:
-   `saveResults(data, outputDir)`: Orchestrates saving to JSON and CSV.
-   `saveJson`: Re-exported for direct use.
-   `saveCsv`: Re-exported for direct use.
**Logic**:
    1.  Generates a timestamped base filename: `businesses_YYYY-MM-DD_HHmmss`.
    2.  Calls `saveJson`.
    3.  Calls `saveCsv`.
    4.  Returns a summary of saved files.

## Output Structure

Files are saved in the `output/` directory (created if it doesn't exist).

-   `output/businesses_2023-10-27_143000.json`
-   `output/businesses_2023-10-27_143000.csv`

## Error Handling

-   If the `output` directory cannot be created, log a fatal error.
-   If writing a specific format fails (e.g., CSV conversion error), log an error but continue with other formats.
-   Ensure file operations are asynchronous to avoid blocking the event loop.

## Testing Strategy

-   **Unit Tests**:
    -   Mock `fs.writeFile` to verify calls.
    -   Test `saveCsv` with data containing commas and newlines.
    -   Test empty data arrays.
-   **Integration Tests**:
    -   Real file write test (clean up output afterwards).
