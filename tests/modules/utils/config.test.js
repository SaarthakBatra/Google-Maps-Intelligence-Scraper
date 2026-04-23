/**
 * Tests for config utility
 * @module tests/utils/config
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Config Utility', () => {
    // Save original env vars
    const originalEnv = { ...process.env };

    afterEach(() => {
        // Restore original environment
        process.env = { ...originalEnv };
        // Clear module cache to reload config with new env vars
        jest.resetModules();
    });

    test('should export a config object', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
    });

    test('should have browser configuration', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config.browser).toBeDefined();
        expect(config.browser.type).toBeDefined();
        expect(config.browser.headless).toBeDefined();
        expect(typeof config.browser.headless).toBe('boolean');
    });

    test('should have scraping configuration', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config.scraping).toBeDefined();
        expect(config.scraping.rateLimit).toBeDefined();
        expect(config.scraping.timeout).toBeDefined();
        expect(config.scraping.userAgent).toBeDefined();
        expect(typeof config.scraping.rateLimit).toBe('number');
        expect(typeof config.scraping.timeout).toBe('number');
    });

    test('should have logging configuration', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config.logging).toBeDefined();
        expect(config.logging.level).toBeDefined();
        expect(config.logging.file).toBeDefined();
        expect(['debug', 'info', 'warn', 'error']).toContain(config.logging.level);
    });

    test('should use environment variables when provided', async () => {
        process.env.BROWSER_TYPE = 'firefox';
        process.env.HEADLESS = 'false';
        process.env.DEFAULT_RATE_LIMIT = '5';
        process.env.LOG_LEVEL = 'debug';

        // Re-import to get fresh config
        jest.resetModules();
        const config = (await import('../../../src/modules/utils/config.js')).default;

        expect(config.browser.type).toBe('firefox');
        expect(config.browser.headless).toBe(false);
        expect(config.scraping.rateLimit).toBe(5);
        expect(config.logging.level).toBe('debug');
    });

    test('should use defaults when environment variables are missing', async () => {
        // Clear relevant env vars
        delete process.env.BROWSER_TYPE;
        delete process.env.DEFAULT_RATE_LIMIT;
        delete process.env.LOG_LEVEL;

        jest.resetModules();
        const config = (await import('../../../src/modules/utils/config.js')).default;

        expect(config.browser.type).toBe('chromium');
        expect(config.scraping.rateLimit).toBeGreaterThan(0);
        expect(config.logging.level).toBeTruthy();
    });

    test('should validate browser type to be valid option', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(['chromium', 'firefox', 'webkit']).toContain(config.browser.type);
    });

    test('should ensure positive timeout values', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config.scraping.timeout).toBeGreaterThan(0);
    });

    test('should ensure positive rate limit values', async () => {
        const config = (await import('../../../src/modules/utils/config.js')).default;
        expect(config.scraping.rateLimit).toBeGreaterThan(0);
    });
});
