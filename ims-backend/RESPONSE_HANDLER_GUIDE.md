# Response Handler Implementation Guide

This guide shows how to migrate controllers to use the new standardized response handler system.

## Overview

The new response handler system provides:
- ✅ Consistent response structure across all endpoints
- ✅ Type-safe responses with TypeScript
- ✅ Automatic error handling and logging
- ✅ Request tracking with unique IDs
- ✅ Cleaner controller code

## Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-25T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-12-25T10:00:00Z",
    "requestId": "uuid",
    "path": "/api/endpoint"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "meta": {
    "timestamp": "2025-12-25T10:00:00Z",
    "requestId": "uuid"
  }
}
```

## Migration Examples

### Before (Old Way)
```typescript
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({ message: 'Email, password, and name are required' });
            return;
        }

        // Check if user exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // Create user
        const user = await userRepository.save({ email, password, name });

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        logger.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
```

### After (New Way)
```typescript
import { asyncHandler } from '../middleware/errorHandler';
import { sendCreated } from '../utils/response';
import { ValidationError, DuplicateEntryError } from '../utils/errors';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    // Validate input - throw error instead of manual response
    if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required');
    }

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new DuplicateEntryError('User with this email already exists');
    }

    // Create user
    const user = await userRepository.save({ email, password, name });

    // Send standardized success response
    sendCreated(
        res,
        'User created successfully',
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        req.id // Request ID for tracking
    );
});
```

## Available Response Functions

### Success Responses
```typescript
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

// 200 OK - Standard success
sendSuccess(res, 'Profile updated successfully', userData, req.id);

// 201 Created - Resource created
sendCreated(res, 'Product created successfully', productData, req.id);

// 200 OK - Paginated data
sendPaginated(res, 'Products retrieved', products, paginationMeta, req.id);
```

### Error Responses (Manual)
```typescript
import {
    sendBadRequest,
    sendValidationError,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendConflict
} from '../utils/response';

// 400 Bad Request
sendBadRequest(res, 'Invalid request', { field: 'value' }, req.id);

// 400 Validation Error
sendValidationError(res, 'Validation failed', { email: 'Invalid format' }, req.id);

// 401 Unauthorized
sendUnauthorized(res, 'Invalid credentials', req.id);

// 403 Forbidden
sendForbidden(res, 'Insufficient permissions', req.id);

// 404 Not Found
sendNotFound(res, 'User not found', req.id);

// 409 Conflict
sendConflict(res, 'Email already exists', undefined, req.id);
```

## Available Error Classes

Throw these errors instead of manually sending responses:

```typescript
import {
    ValidationError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError,
    // Business logic errors
    InvalidCredentialsError,
    EmailNotVerifiedError,
    AccountInactiveError,
    InvalidTokenError,
    InsufficientStockError,
    DuplicateEntryError,
} from '../utils/errors';

// Examples:
throw new ValidationError('Email is required');
throw new NotFoundError('Product not found');
throw new InvalidCredentialsError(); // Uses default message
throw new InsufficientStockError('Only 5 items available', { available: 5 });
```

## Migration Checklist

For each controller function:

1. ✅ Wrap function with `asyncHandler()` to catch errors automatically
2. ✅ Replace validation `if` statements that return responses with `throw new ValidationError()`
3. ✅ Replace not found checks with `throw new NotFoundError()`
4. ✅ Replace duplicate/conflict checks with `throw new DuplicateEntryError()`
5. ✅ Replace auth checks with `throw new UnauthorizedError()` or `throw new ForbiddenError()`
6. ✅ Replace `res.status().json()` success responses with `sendSuccess()`, `sendCreated()`, or `sendPaginated()`
7. ✅ Remove try-catch blocks (asyncHandler handles them)
8. ✅ Pass `req.id` as the last parameter to response functions for request tracking

## Benefits

### Before
- Inconsistent response structures
- Repetitive error handling
- Manual logging in every catch block
- Hard to track requests
- Mix of response formats

### After
- ✅ Consistent API responses
- ✅ Automatic error handling
- ✅ Centralized error logging
- ✅ Request ID tracking
- ✅ Type-safe responses
- ✅ Cleaner, more readable code
- ✅ Easier to maintain and test

## Complete Example: Auth Controller Signup Function

```typescript
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { hashPassword, generateVerificationToken } from '../utils/auth';
import { sendVerificationEmail } from '../services/email';
import logger from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { sendCreated } from '../utils/response';
import { ValidationError, DuplicateEntryError } from '../utils/errors';

const userRepository = AppDataSource.getRepository(User);

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required');
    }

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new DuplicateEntryError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        verificationToken,
    });

    await userRepository.save(user);

    // Send verification email (don't fail if email fails)
    try {
        await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
    }

    // Send success response
    sendCreated(
        res,
        'User created successfully. Please check your email to verify your account.',
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        },
        req.id
    );
});
```

## Next Steps

1. Review this guide
2. Start migrating controllers one at a time
3. Test each endpoint after migration
4. Update frontend to handle new response structure
5. Update API documentation

## Notes

- The `asyncHandler` wrapper automatically catches errors and passes them to the global error handler
- Request IDs are automatically added to all requests via the `requestContext` middleware
- All errors are automatically logged with context
- The global error handler formats all errors consistently
