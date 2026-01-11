import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// HTTP request logger middleware
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Log request
    logger.http(`${req.method} ${req.url} - Started`);

    // Capture response finish event
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

        logger.log(logLevel, `${req.method} ${req.url} ${statusCode} - ${duration}ms`);
    });

    next();
};

// Error logger middleware
export const errorLogger = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error(`Error on ${req.method} ${req.url}: ${err.message}`, {
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    next(err);
};
