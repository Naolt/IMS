import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';
import {
    hashPassword,
    comparePassword,
    generateToken,
    generateRefreshToken,
    generateVerificationToken,
    generateResetToken,
} from '../utils/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';
import logger from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import {
    ValidationError,
    NotFoundError,
    InvalidCredentialsError,
    EmailNotVerifiedError,
    AccountInactiveError,
    DuplicateEntryError,
    InvalidTokenError,
    UnauthorizedError,
} from '../utils/errors';

const userRepository = AppDataSource.getRepository(User);

// Sign up
export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required');
    }

    // Check if user already exists
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

// Sign in
export const signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
        throw new InvalidCredentialsError();
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new InvalidCredentialsError();
    }

    // Check if user is verified
    if (!user.isVerified) {
        throw new EmailNotVerifiedError();
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
        throw new AccountInactiveError();
    }

    // Generate access token and refresh token
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    sendSuccess(
        res,
        'Sign in successful',
        {
            token,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                bio: user.bio,
            },
        },
        req.id
    );
});

// Verify email
export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
        throw new ValidationError('Verification token is required');
    }

    // Find user with this token
    const user = await userRepository.findOne({ where: { verificationToken: token } });
    if (!user) {
        throw new InvalidTokenError('Invalid or expired verification token');
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = null;
    await userRepository.save(user);

    sendSuccess(res, 'Email verified successfully', undefined, req.id);
});

// Forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError('Email is required');
    }

    // Find user
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
        // Don't reveal if user exists - send success anyway for security
        sendSuccess(
            res,
            'If an account with that email exists, we sent a password reset link',
            undefined,
            req.id
        );
        return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await userRepository.save(user);

    // Send reset email
    try {
        await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
    }

    sendSuccess(
        res,
        'If an account with that email exists, we sent a password reset link',
        undefined,
        req.id
    );
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw new ValidationError('Token and new password are required');
    }

    // Find user with this token
    const user = await userRepository.findOne({ where: { resetPasswordToken: token } });

    if (!user || !user.resetPasswordExpires) {
        throw new InvalidTokenError('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date() > user.resetPasswordExpires) {
        throw new InvalidTokenError('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await userRepository.save(user);

    sendSuccess(res, 'Password reset successfully', undefined, req.id);
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new UnauthorizedError();
    }

    const user = await userRepository.findOne({
        where: { id: req.user.userId },
        select: [
            'id',
            'email',
            'name',
            'phone',
            'bio',
            'role',
            'isVerified',
            'status',
            'createdAt',
            'updatedAt',
        ],
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    sendSuccess(res, 'Profile retrieved successfully', user, req.id);
});

// Update profile
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new UnauthorizedError();
    }

    const { name, phone, bio } = req.body;

    const user = await userRepository.findOne({ where: { id: req.user.userId } });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.name = name || user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.bio = bio !== undefined ? bio : user.bio;

    await userRepository.save(user);

    sendSuccess(
        res,
        'Profile updated successfully',
        {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            bio: user.bio,
            role: user.role,
        },
        req.id
    );
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        throw new UnauthorizedError();
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
    }

    // Get user with password
    const user = await userRepository.findOne({ where: { id: req.user.userId } });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
        throw new InvalidCredentialsError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await userRepository.save(user);

    sendSuccess(res, 'Password changed successfully', undefined, req.id);
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new ValidationError('Refresh token is required');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; type?: string };

        // Check if it's a refresh token
        if (decoded.type !== 'refresh') {
            throw new InvalidTokenError('Invalid refresh token');
        }

        // Find user
        const user = await userRepository.findOne({ where: { id: decoded.userId } });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check if account is active
        if (user.status !== UserStatus.ACTIVE) {
            throw new AccountInactiveError();
        }

        // Generate new access token and refresh token
        const newAccessToken = generateToken(user.id, user.email);
        const newRefreshToken = generateRefreshToken(user.id, user.email);

        sendSuccess(
            res,
            'Token refreshed successfully',
            {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            },
            req.id
        );
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new InvalidTokenError('Invalid or expired refresh token');
        }
        throw error;
    }
});
