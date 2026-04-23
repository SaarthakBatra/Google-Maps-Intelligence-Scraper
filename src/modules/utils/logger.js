/**
 * Logger utility using Pino
 * Provides structured logging with file and console transports
 * @module utils/logger
 */

import pino from 'pino';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Get the logs directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');
const logsDir = join(projectRoot, 'logs');

// Ensure logs directory exists
if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
}

// Get log level and file from environment (defaults provided)
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE = process.env.LOG_FILE || './logs/scraper.log';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Pino logger configuration
 * - Development: Pretty-printed console output
 * - Production: JSON logs to file
 */
const logger = pino({
    level: LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : {
            targets: [
                {
                    target: 'pino/file',
                    options: { destination: LOG_FILE },
                },
                {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                    },
                },
            ],
        },
});

export default logger;
