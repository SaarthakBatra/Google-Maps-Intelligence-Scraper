import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

/**
 * Saves data to a JSON file.
 * @param {Array<Object>} data - The data to save.
 * @param {string} filepath - The full path to the file.
 * @returns {Promise<void>}
 */
export async function saveJson(data, filepath) {
    try {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
        logger.info({ filepath, count: data.length }, 'Saved JSON file');
    } catch (error) {
        logger.error({ error, filepath }, 'Failed to save JSON file');
        throw error; // Re-throw to let caller handle or catch
    }
}
