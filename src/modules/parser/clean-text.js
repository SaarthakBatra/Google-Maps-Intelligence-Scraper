/**
 * Cleans and normalizes text extracted from HTML.
 * @param {string|null|undefined} text - The text to clean.
 * @returns {string|null} - The cleaned text or null if input is invalid/empty.
 */
export function cleanText(text) {
    if (!text) return null;

    // Replace multiple spaces/newlines with single space and trim
    const cleaned = text
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned || null;
}
