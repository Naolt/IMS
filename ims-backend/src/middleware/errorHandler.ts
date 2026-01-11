import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError, sendInternalError } from '../utils/response';
import logger from '../config/logger';
import { ErrorCode } from '../types/response.types';

// Global error handler middleware
export const globalErrorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Get request ID if available
    const requestId = (req as any).id;

    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId,
    });

    // Check if it's an operational error (AppError)
    if (err instanceof AppError) {
        sendError(
            res,
            err.statusCode,
            err.message,
            err.code,
            err.details,
            requestId,
            req.path,
            process.env.NODE_ENV === 'development' ? err.stack : undefined
        );
        return;
    }

    // Handle TypeORM/Database errors
    if (err.name === 'QueryFailedError') {
        logger.error('Database query failed:', err);
        sendError(
            res,
            500,
            'Database operation failed',
            ErrorCode.DATABASE_ERROR,
            process.env.NODE_ENV === 'development' ? err.message : undefined,
            requestId,
            req.path
        );
        return;
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
        sendError(
            res,
            400,
            'Invalid JSON payload',
            ErrorCode.BAD_REQUEST,
            undefined,
            requestId,
            req.path
        );
        return;
    }

    // Default to 500 Internal Server Error for unknown errors
    sendInternalError(
        res,
        'An unexpected error occurred',
        requestId,
        process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
};

// 404 Not Found handler
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const requestId = (req as any).id;
    sendError(
        res,
        404,
        `Route ${req.method} ${req.path} not found`,
        ErrorCode.NOT_FOUND,
        undefined,
        requestId,
        req.path
    );
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
