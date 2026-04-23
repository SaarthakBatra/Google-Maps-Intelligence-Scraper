/**
 * Tests for logger utility
 * @module tests/utils/logger
 */

import logger from '../../../src/modules/utils/logger.js';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Logger Utility', () => {
    test('should export a logger instance', () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.debug).toBe('function');
    });

    test('should have correct log level', () => {
        expect(logger.level).toBeDefined();
        // Default should be 'info' or whatever is set in .env
        expect(['debug', 'info', 'warn', 'error']).toContain(logger.level);
    });

    test('should log info messages', () => {
        // This test verifies the logger doesn't throw errors
        expect(() => {
            logger.info('Test info message');
        }).not.toThrow();
    });

    test('should log error messages with error objects', () => {
        const testError = new Error('Test error');
        expect(() => {
            logger.error({ error: testError }, 'Test error message');
        }).not.toThrow();
    });

    test('should log warn messages', () => {
        expect(() => {
            logger.warn('Test warning message');
        }).not.toThrow();
    });

    test('should create logs directory if it does not exist', () => {
        const logsDir = join(process.cwd(), 'logs');
        // The logger creates this directory on initialization
        expect(existsSync(logsDir)).toBe(true);
    });

    test('should support structured logging with objects', () => {
        expect(() => {
            logger.info({ user: 'test', action: 'login' }, 'User logged in');
        }).not.toThrow();
    });
});
