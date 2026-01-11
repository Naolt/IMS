import { Response } from 'express';
import {
    ApiSuccessResponse,
    ApiErrorResponse,
    PaginatedResponse,
    PaginationMeta,
    ErrorCode,
} from '../types/response.types';

// Helper to generate timestamp
const getTimestamp = (): string => new Date().toISOString();

// Success Response (200 OK)
export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    requestId?: string
): void => {
    const response: ApiSuccessResponse<T> = {
        success: true,
        message,
        data,
        meta: {
            timestamp: getTimestamp(),
            requestId,
        },
    };
    res.status(200).json(response);
};

// Created Response (201 Created)
export const sendCreated = <T>(
    res: Response,
    message: string,
    data?: T,
    requestId?: string
): void => {
    const response: ApiSuccessResponse<T> = {
        success: true,
        message,
        data,
        meta: {
            timestamp: getTimestamp(),
            requestId,
        },
    };
    res.status(201).json(response);
};

// Paginated Response (200 OK)
export const sendPaginated = <T>(
    res: Response,
    message: string,
    data: T[],
    pagination: PaginationMeta,
    requestId?: string
): void => {
    const response: PaginatedResponse<T> = {
        success: true,
        message,
        data,
        pagination,
        meta: {
            timestamp: getTimestamp(),
            requestId,
        },
    };
    res.status(200).json(response);
};

// Error Response
export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    code: ErrorCode,
    details?: any,
    requestId?: string,
    path?: string,
    stack?: string
): void => {
    const response: ApiErrorResponse = {
        success: false,
        message,
        error: {
            code,
            details,
            stack: process.env.NODE_ENV === 'development' ? stack : undefined,
        },
        meta: {
            timestamp: getTimestamp(),
            requestId,
            path,
        },
    };
    res.status(statusCode).json(response);
};

// Bad Request (400)
export const sendBadRequest = (
    res: Response,
    message: string = 'Bad request',
    details?: any,
    requestId?: string
): void => {
    sendError(res, 400, message, ErrorCode.BAD_REQUEST, details, requestId);
};

// Validation Error (400)
export const sendValidationError = (
    res: Response,
    message: string = 'Validation failed',
    details?: any,
    requestId?: string
): void => {
    sendError(res, 400, message, ErrorCode.VALIDATION_ERROR, details, requestId);
};

// Unauthorized (401)
export const sendUnauthorized = (
    res: Response,
    message: string = 'Unauthorized',
    requestId?: string
): void => {
    sendError(res, 401, message, ErrorCode.UNAUTHORIZED, undefined, requestId);
};

// Forbidden (403)
export const sendForbidden = (
    res: Response,
    message: string = 'Forbidden',
    requestId?: string
): void => {
    sendError(res, 403, message, ErrorCode.FORBIDDEN, undefined, requestId);
};

// Not Found (404)
export const sendNotFound = (
    res: Response,
    message: string = 'Resource not found',
    requestId?: string
): void => {
    sendError(res, 404, message, ErrorCode.NOT_FOUND, undefined, requestId);
};

// Conflict (409)
export const sendConflict = (
    res: Response,
    message: string = 'Resource already exists',
    details?: any,
    requestId?: string
): void => {
    sendError(res, 409, message, ErrorCode.CONFLICT, details, requestId);
};

// Internal Server Error (500)
export const sendInternalError = (
    res: Response,
    message: string = 'Internal server error',
    requestId?: string,
    stack?: string
): void => {
    sendError(
        res,
        500,
        message,
        ErrorCode.INTERNAL_SERVER_ERROR,
        undefined,
        requestId,
        undefined,
        stack
    );
};
