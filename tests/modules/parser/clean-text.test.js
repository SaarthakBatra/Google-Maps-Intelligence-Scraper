import { cleanText } from '../../../src/modules/parser/clean-text.js';

describe('cleanText', () => {
    test('should trim whitespace', () => {
        expect(cleanText('  hello  ')).toBe('hello');
    });

    test('should normalize internal whitespace', () => {
        expect(cleanText('hello   world\n\t!')).toBe('hello world !');
    });

    test('should return null for null/undefined/empty input', () => {
        expect(cleanText(null)).toBeNull();
        expect(cleanText(undefined)).toBeNull();
        expect(cleanText('')).toBeNull();
        expect(cleanText('   ')).toBeNull();
    });

    test('should handle normal strings', () => {
        expect(cleanText('hello world')).toBe('hello world');
    });
});
