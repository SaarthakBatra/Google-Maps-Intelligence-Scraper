/**
 * Delay utilities for human-like behavior
 * Provides random delay generation to mimic human interaction patterns
 * @module utils/delays
 */

/**
 * Generates a random delay within the specified range
 * @param {number} min - Minimum delay in milliseconds
 * @param {number} max - Maximum delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the random delay
 * @throws {Error} If min is greater than max or if values are negative
 * 
 * @example
 * // Wait between 1-3 seconds
 * await randomDelay(1000, 3000);
 * 
 * @example
 * // Wait exactly 2 seconds (when min === max)
 * await randomDelay(2000, 2000);
 */
export async function randomDelay(min, max) {
    // Validate inputs
    if (min < 0 || max < 0) {
        throw new Error('Delay values must be non-negative');
    }

    if (min > max) {
        throw new Error('Minimum delay cannot be greater than maximum delay');
    }

    // Calculate random delay
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    // Return promise that resolves after delay
    return new Promise((resolve) => setTimeout(resolve, delay));
}
