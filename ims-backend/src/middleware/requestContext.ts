import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include id
declare global {
    namespace Express {
        interface Request {
            id?: string;
        }
    }
}

// Middleware to add request ID to each request
export const requestContext = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Generate unique request ID
    req.id = uuidv4();

    // Add request ID to response headers for debugging
    res.setHeader('X-Request-ID', req.id);

    next();
};
