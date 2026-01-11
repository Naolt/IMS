import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// Generate JWT access token
export const generateToken = (userId: string, email: string): string => {
    return jwt.sign(
        { userId, email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
    );
};

// Generate JWT refresh token
export const generateRefreshToken = (userId: string, email: string): string => {
    return jwt.sign(
        { userId, email, type: 'refresh' },
        config.jwtSecret,
        { expiresIn: '7d' } // Refresh token valid for 7 days
    );
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string; email: string } => {
    try {
        return jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Generate verification token
export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate reset password token
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};
