import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';
import { saveJson } from './save-json.js';
import { saveCsv } from './save-csv.js';

export { saveJson, saveCsv };

/**
 * Orchestrates saving data to multiple formats.
 * @param {Array<Object>} data - The data to save.
 * @param {string} [outputDir='output'] - The directory to save files to.
 * @returns {Promise<{ jsonPath: string, csvPath: string }>} - Paths to the saved files.
 */
export async function saveResults(data, outputDir = 'output') {
    if (!data || data.length === 0) {
        logger.warn('No data to save.');
        return {};
    }

    // Ensure output directory exists
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
        logger.error({ error, outputDir }, 'Failed to create output directory');
        throw error;
    }

    // Generate timestamped filename base
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
    const filenameBase = `businesses_${timestamp}`;

    const jsonPath = path.join(outputDir, `${filenameBase}.json`);
    const csvPath = path.join(outputDir, `${filenameBase}.csv`);

    const results = {};

    // Save JSON
    try {
        await saveJson(data, jsonPath);
        results.jsonPath = jsonPath;
    } catch (error) {
        logger.error({ error }, 'Failed to save JSON in saveResults');
    }

    // Save CSV
    try {
        await saveCsv(data, csvPath);
        results.csvPath = csvPath;
    } catch (error) {
        logger.error({ error }, 'Failed to save CSV in saveResults');
    }


    return results;
}
