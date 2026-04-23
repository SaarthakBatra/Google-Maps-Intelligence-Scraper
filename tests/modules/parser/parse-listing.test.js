import { parseListing } from '../../../src/modules/parser/parse-listing.js';

// Mock HTML for a business listing
const mockHtml = `
<div class="m6QErb">
    <h1 class="DUwDvf fontHeadlineLarge">Test Business</h1>
    <button data-item-id="address" class="CsEnBe" aria-label="Address: 123 Test St">
        <div class="Io6YTe fontBodyMedium">123 Test St, City, Country</div>
    </button>
    <button data-item-id="phone:1234567890" class="CsEnBe" aria-label="Phone: 1234567890">
        <div class="Io6YTe fontBodyMedium">+1 234 567 890</div>
    </button>
    <a data-item-id="authority" href="https://example.com" class="CsEnBe">Website</a>
    <div class="F7nice">
        <span aria-hidden="true">4.5</span>
        <span>(120)</span>
    </div>
    <button class="DkEaL">Restaurant</button>
    <div class="t39EBf">Open now</div>
</div>
`;

describe('parseListing', () => {
    test('should extract all fields correctly', () => {
        const result = parseListing(mockHtml);
        expect(result).not.toBeNull();
        expect(result.name).toBe('Test Business');
        expect(result.address).toBe('123 Test St, City, Country');
        expect(result.phone).toBe('+1 234 567 890');
        expect(result.website).toBe('https://example.com');
        expect(result.rating).toBe(4.5);
        expect(result.reviewsCount).toBe(120);
        expect(result.category).toBe('Restaurant');
        expect(result.hours).toBe('Open now');
    });

    test('should return null for empty HTML', () => {
        expect(parseListing('')).toBeNull();
        expect(parseListing(null)).toBeNull();
    });

    test('should handle missing fields gracefully', () => {
        const minimalHtml = '<h1 class="DUwDvf fontHeadlineLarge">Minimal Business</h1>';
        const result = parseListing(minimalHtml);
        expect(result.name).toBe('Minimal Business');
        expect(result.address).toBeNull();
        expect(result.rating).toBeNull();
    });
});
