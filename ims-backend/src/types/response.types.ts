// API Response Types

export enum ErrorCode {
    // Client Errors (4xx)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    BAD_REQUEST = 'BAD_REQUEST',

    // Server Errors (5xx)
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

    // Business Logic Errors
    INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
    DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
    ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
    INVALID_TOKEN = 'INVALID_TOKEN',
    EXPIRED_TOKEN = 'EXPIRED_TOKEN',
}

export interface ApiSuccessResponse<T = any> {
    success: true;
    message: string;
    data?: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    error: {
        code: ErrorCode;
        details?: any;
        stack?: string;
    };
    meta: {
        timestamp: string;
        requestId?: string;
        path?: string;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    success: true;
    message: string;
    data: T[];
    pagination: PaginationMeta;
    meta: {
        timestamp: string;
        requestId?: string;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
