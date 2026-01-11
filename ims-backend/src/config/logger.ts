import winston from 'winston';
import path from 'path';
import { config } from './env';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each log level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that we want to color our logs
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define which transports the logger should use
const transports = [
    // Console transport
    new winston.transports.Console(),

    // Error log file
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
    }),

    // Combined log file
    new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: config.nodeEnv === 'development' ? 'debug' : 'http',
    levels,
    format,
    transports,
});

export default logger;
