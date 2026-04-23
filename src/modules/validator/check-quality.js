/**
 * Performs logical quality checks on the data.
 *
 * @param {object} listing - The business listing object.
 * @returns {string[]} - Array of quality warning messages.
 */
export function checkQuality(listing) {
    const warnings = [];

    // Rating range
    if (typeof listing.rating === 'number') {
        if (listing.rating < 0 || listing.rating > 5) {
            warnings.push(`Rating out of range (0-5): ${listing.rating}`);
        }
    }

    // Reviews Count sanity
    if (typeof listing.reviewsCount === 'number') {
        if (listing.reviewsCount < 0) {
            warnings.push(`Negative reviews count: ${listing.reviewsCount}`);
        }
    }

    // Address length check (Too short might indicate a bad scrape or partial data)
    if (listing.address && listing.address.length < 5) {
        warnings.push(`Suspiciously short address: ${listing.address}`);
    }

    return warnings;
}
