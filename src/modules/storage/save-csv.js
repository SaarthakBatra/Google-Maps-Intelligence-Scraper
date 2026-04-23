import fs from 'fs/promises';
import logger from '../utils/logger.js';

/**
 * Converts data to CSV format and saves it.
 * @param {Array<Object>} data - The data to save.
 * @param {string} filepath - The full path to the file.
 * @returns {Promise<void>}
 */
export async function saveCsv(data, filepath) {
    if (!data || data.length === 0) {
        logger.warn('No data to save to CSV');
        return;
    }

    try {
        // 1. Extract headers from the first object (or union of all keys if needed, but first object is standard for consistent data)
        // We assume data objects are uniform.
        const headers = Object.keys(data[0]);

        // 2. Create CSV header row
        const csvRows = [headers.join(',')];

        // 3. Create CSV body rows
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header];
                const escaped = ('' + (val ?? '')).replace(/"/g, '""'); // Escape double quotes
                return `"${escaped}"`; // Quote every field
            });
            csvRows.push(values.join(','));
        }

        // 4. Join all rows with newline
        const csvContent = csvRows.join('\n');

        // 5. Write to file
        await fs.writeFile(filepath, csvContent, 'utf-8');
        logger.info({ filepath, count: data.length }, 'Saved CSV file');
    } catch (error) {
        logger.error({ error, filepath }, 'Failed to save CSV file');
        throw error;
    }
}
