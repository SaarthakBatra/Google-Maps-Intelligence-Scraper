/**
 * Validates formats for specific fields (Phone, Website, etc.).
 *
 * @param {object} listing - The business listing object.
 * @returns {string[]} - Array of format warning messages.
 */
export function validateFormat(listing) {
    const warnings = [];

    // Website validation
    if (listing.website && listing.website !== 'N/A') {
        try {
            new URL(listing.website);
        } catch (e) {
            warnings.push(`Invalid Website URL: ${listing.website}`);
        }
    }

    // Phone validation (Loose check: must have at least 5 digits)
    if (listing.phone && listing.phone !== 'N/A') {
        const digits = listing.phone.replace(/\D/g, '');
        if (digits.length < 5) {
            warnings.push(`Invalid Phone Format: ${listing.phone}`);
        }
    }

    // Rating validation (Must be a number if present)
    if (listing.rating !== undefined && listing.rating !== null && listing.rating !== 'N/A') {
        if (typeof listing.rating !== 'number') {
            warnings.push(`Invalid Rating Type: ${typeof listing.rating}`);
        }
    }

    // Reviews Count validation (Must be a number if present)
    if (listing.reviewsCount !== undefined && listing.reviewsCount !== null && listing.reviewsCount !== 'N/A') {
        if (typeof listing.reviewsCount !== 'number') {
            warnings.push(`Invalid ReviewsCount Type: ${typeof listing.reviewsCount}`);
        }
    }

    return warnings;
}
