/**
 * Generates a unique fingerprint for deduplication.
 * Uses Name + Address normalized.
 *
 * @param {object} listing - The business listing object.
 * @returns {string} - The generated fingerprint.
 */
export function generateFingerprint(listing) {
    const name = (listing.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const address = (listing.address || '').toLowerCase().trim().replace(/\s+/g, ' ');

    // Simple concatenation with a separator that is unlikely to be in the text
    return `${name}|${address}`;
}
