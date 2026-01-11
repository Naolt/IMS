import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

// Authentication middleware
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        // Get user from database
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.userId },
            select: ['id', 'email', 'role', 'status']
        });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (user.status !== UserStatus.ACTIVE) {
            res.status(403).json({ message: 'Account is not active' });
            return;
        }

        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        next();
    };
};
