import { ErrorCode } from '../types/response.types';

// Base Application Error
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: ErrorCode;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: number,
        code: ErrorCode,
        details?: any,
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: any) {
        super(message, 400, ErrorCode.BAD_REQUEST, details);
    }
}

// 400 Validation Error
export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 400, ErrorCode.VALIDATION_ERROR, details);
    }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: any) {
        super(message, 401, ErrorCode.UNAUTHORIZED, details);
    }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: any) {
        super(message, 403, ErrorCode.FORBIDDEN, details);
    }
}

// 404 Not Found
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, ErrorCode.NOT_FOUND, details);
    }
}

// 409 Conflict
export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists', details?: any) {
        super(message, 409, ErrorCode.CONFLICT, details);
    }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: any) {
        super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, details, false);
    }
}

// Business Logic Errors
export class InvalidCredentialsError extends AppError {
    constructor(message: string = 'Invalid email or password') {
        super(message, 401, ErrorCode.INVALID_CREDENTIALS);
    }
}

export class EmailNotVerifiedError extends AppError {
    constructor(message: string = 'Please verify your email before signing in') {
        super(message, 403, ErrorCode.EMAIL_NOT_VERIFIED);
    }
}

export class AccountInactiveError extends AppError {
    constructor(message: string = 'Your account is not active') {
        super(message, 403, ErrorCode.ACCOUNT_INACTIVE);
    }
}

export class InvalidTokenError extends AppError {
    constructor(message: string = 'Invalid or expired token') {
        super(message, 401, ErrorCode.INVALID_TOKEN);
    }
}

export class InsufficientStockError extends AppError {
    constructor(message: string = 'Insufficient stock', details?: any) {
        super(message, 400, ErrorCode.INSUFFICIENT_STOCK, details);
    }
}

export class DuplicateEntryError extends AppError {
    constructor(message: string = 'Entry already exists', details?: any) {
        super(message, 409, ErrorCode.DUPLICATE_ENTRY, details);
    }
}
