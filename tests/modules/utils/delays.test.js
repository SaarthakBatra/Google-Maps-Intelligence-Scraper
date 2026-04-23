/**
 * Tests for delays utility
 * @module tests/utils/delays
 */

import { randomDelay } from '../../../src/modules/utils/delays.js';
import { describe, test, expect } from '@jest/globals';

describe('Delays Utility', () => {
    test('should export randomDelay function', () => {
        expect(randomDelay).toBeDefined();
        expect(typeof randomDelay).toBe('function');
    });

    test('should return a Promise', () => {
        const result = randomDelay(100, 200);
        expect(result).toBeInstanceOf(Promise);
    });

    test('should resolve after delay within range', async () => {
        const min = 100;
        const max = 150;
        const startTime = Date.now();

        await randomDelay(min, max);

        const elapsed = Date.now() - startTime;

        // Allow 50ms tolerance for timing variations
        expect(elapsed).toBeGreaterThanOrEqual(min - 50);
        expect(elapsed).toBeLessThanOrEqual(max + 50);
    }, 10000); // Increase timeout for this test

    test('should handle min === max (exact delay)', async () => {
        const exactDelay = 100;
        const startTime = Date.now();

        await randomDelay(exactDelay, exactDelay);

        const elapsed = Date.now() - startTime;

        // Should be approximately the exact delay (±50ms tolerance)
        expect(elapsed).toBeGreaterThanOrEqual(exactDelay - 50);
        expect(elapsed).toBeLessThanOrEqual(exactDelay + 50);
    }, 10000);

    test('should handle zero delay', async () => {
        const startTime = Date.now();

        await randomDelay(0, 0);

        const elapsed = Date.now() - startTime;

        // Should be nearly instant (< 50ms)
        expect(elapsed).toBeLessThan(50);
    });

    test('should throw error if min > max', async () => {
        await expect(randomDelay(200, 100)).rejects.toThrow(
            'Minimum delay cannot be greater than maximum delay'
        );
    });

    test('should throw error for negative min value', async () => {
        await expect(randomDelay(-100, 200)).rejects.toThrow(
            'Delay values must be non-negative'
        );
    });

    test('should throw error for negative max value', async () => {
        await expect(randomDelay(100, -200)).rejects.toThrow(
            'Delay values must be non-negative'
        );
    });

    test('should produce different delays on multiple calls', async () => {
        const delays = [];
        const min = 50;
        const max = 150;

        // Run multiple iterations
        for (let i = 0; i < 10; i++) {
            const startTime = Date.now();
            await randomDelay(min, max);
            const elapsed = Date.now() - startTime;
            delays.push(elapsed);
        }

        // Check that we got some variation (not all the same)
        const uniqueDelays = new Set(delays);
        // With random delays, we should have some variety
        // Allow up to 3 duplicates in 10 runs (7 unique minimum)
        expect(uniqueDelays.size).toBeGreaterThanOrEqual(7);
    }, 20000); // Increase timeout for this test
});
