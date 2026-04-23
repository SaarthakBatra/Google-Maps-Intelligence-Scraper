import { checkRequiredFields } from './check-required-fields.js';
import { validateFormat } from './validate-format.js';
import { checkQuality } from './check-quality.js';
import { generateFingerprint } from './generate-fingerprint.js';

/**
 * Main validator function.
 * 
 * @param {object} listing - The business listing object to validate.
 * @returns {object} - Validation result { isValid, errors, warnings, fingerprint, cleanData }.
 */
export function validateListing(listing) {
    if (!listing || typeof listing !== 'object') {
        return {
            isValid: false,
            errors: ['Invalid input: listing is not an object'],
            warnings: [],
            fingerprint: null
        };
    }

    const result = {
        isValid: true,
        errors: [],
        warnings: [],
        fingerprint: null,
        cleanData: { ...listing } // Copy for potential modification/normalization
    };

    // 1. Check Required Fields (Critical)
    const missingFields = checkRequiredFields(listing);
    if (missingFields.length > 0) {
        result.isValid = false;
        result.errors.push(...missingFields.map(field => `Missing required field: ${field}`));
    }

    // 2. Validate Format (Warnings)
    const formatWarnings = validateFormat(listing);
    result.warnings.push(...formatWarnings);

    // 3. Check Quality (Warnings)
    const qualityWarnings = checkQuality(listing);
    result.warnings.push(...qualityWarnings);

    if (!result.isValid) {
        console.warn(`Validation failed for "${listing.name || 'Unknown'}":`, result.errors);
    }

    // 4. Generate Fingerprint (Always, unless invalid name/address makes it useless)
    if (result.isValid) {
        result.fingerprint = generateFingerprint(listing);
    }

    return result;
}
