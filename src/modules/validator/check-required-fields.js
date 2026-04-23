/**
 * Checks for mandatory fields in a business listing.
 *
 * @param {object} listing - The business listing object.
 * @returns {string[]} - Array of missing field names.
 */
export function checkRequiredFields(listing) {
    const missing = [];

    if (!listing.name || listing.name.trim() === '') {
        missing.push('Name');
    }

    // Address is critical for location-based scraping
    if (!listing.address || listing.address.trim() === '') {
        missing.push('Address');
    }

    return missing;
}
