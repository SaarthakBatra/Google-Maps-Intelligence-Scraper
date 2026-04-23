import { validateListing } from '../../../src/modules/validator/validate-listing.js';

describe('Validator Module', () => {

    test('should validate a perfect listing', () => {
        const listing = {
            name: 'Great Business',
            address: '123 Main St',
            phone: '+1 555-0123',
            website: 'https://example.com',
            rating: 4.5,
            reviewsCount: 100
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
        expect(result.fingerprint).toBe('great business|123 main st');
    });

    test('should fail when name is missing', () => {
        const listing = {
            address: '123 Main St'
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: Name');
    });

    test('should fail when address is missing', () => {
        const listing = {
            name: 'Business'
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Missing required field: Address');
    });

    test('should warn on invalid website format', () => {
        const listing = {
            name: 'Business',
            address: '123 Main St',
            website: 'invalid-url'
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(true);
        expect(result.warnings.some(w => w.includes('Invalid Website URL'))).toBe(true);
    });

    test('should warn on rating out of range', () => {
        const listing = {
            name: 'Business',
            address: '123 Main St',
            rating: 6.0
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(true);
        expect(result.warnings.some(w => w.includes('Rating out of range'))).toBe(true);
    });

    test('should warn on short address', () => {
        const listing = {
            name: 'Business',
            address: '123'
        };
        const result = validateListing(listing);
        expect(result.isValid).toBe(true);
        expect(result.warnings.some(w => w.includes('Suspiciously short address'))).toBe(true);
    });

    test('should generate consistent fingerprints', () => {
        const listing1 = { name: '  Foo Bar  ', address: '123   Street' };
        const listing2 = { name: 'Foo Bar', address: '123 Street' };

        // We need to bypass checkRequiredFields for this specific test or just add valid fields
        // validation logic is coupled, so lets just call generateFingerprint directly if exported, 
        // or rely on validateListing.

        // validateListing returns fingerprint only if valid.
        const res1 = validateListing(listing1);
        const res2 = validateListing(listing2);

        expect(res1.fingerprint).toBe(res2.fingerprint);
    });

    test('should handle null/empty input gracefully', () => {
        const result = validateListing(null);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid input: listing is not an object');
    });

});
