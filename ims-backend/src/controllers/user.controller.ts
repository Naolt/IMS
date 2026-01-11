import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';
import { hashPassword } from '../utils/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { ValidationError, NotFoundError, DuplicateEntryError, BadRequestError } from '../utils/errors';

const userRepository = AppDataSource.getRepository(User);

// Get all users (Admin only)
export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, search, role, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = userRepository
        .createQueryBuilder('user')
        .select([
            'user.id',
            'user.email',
            'user.name',
            'user.phone',
            'user.role',
            'user.isVerified',
            'user.status',
            'user.createdAt',
            'user.updatedAt',
        ])
        .take(limitNum)
        .skip(skip)
        .orderBy('user.createdAt', 'DESC');

    // Apply filters
    if (search) {
        queryBuilder.andWhere(
            '(user.name ILIKE :search OR user.email ILIKE :search)',
            { search: `%${search}%` }
        );
    }

    if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
        queryBuilder.andWhere('user.status = :status', { status });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    sendPaginated(
        res,
        'Users retrieved successfully',
        users,
        {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
        req.id
    );
});

// Get user by ID (Admin only)
export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await userRepository.findOne({
        where: { id },
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

    sendSuccess(res, 'User retrieved successfully', user, req.id);
});

// Create user (Admin only)
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, name, phone, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
        throw new ValidationError('Email, password, name, and role are required');
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
        throw new ValidationError('Invalid role');
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        throw new DuplicateEntryError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        isVerified: true, // Admin-created users are automatically verified
    });

    await userRepository.save(user);

    sendCreated(
        res,
        'User created successfully',
        {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            status: user.status,
            createdAt: user.createdAt,
        },
        req.id
    );
});

// Update user (Admin only)
export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, phone, bio, role, status } = req.body;

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
        throw new ValidationError('Invalid role');
    }

    // Validate status if provided
    if (status && !Object.values(UserStatus).includes(status)) {
        throw new ValidationError('Invalid status');
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (role) user.role = role;
    if (status) user.status = status;

    await userRepository.save(user);

    sendSuccess(
        res,
        'User updated successfully',
        {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            bio: user.bio,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified,
        },
        req.id
    );
});

// Delete user (Admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user && req.user.userId === id) {
        throw new BadRequestError('You cannot delete your own account');
    }

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    await userRepository.remove(user);

    sendSuccess(res, 'User deleted successfully', undefined, req.id);
});

// Reset user password (Admin only)
export const resetUserPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new ValidationError('New password is required');
    }

    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await userRepository.save(user);

    sendSuccess(res, 'Password reset successfully', undefined, req.id);
});

// Get user statistics (Admin only)
export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const totalUsers = await userRepository.count();
    const activeUsers = await userRepository.count({
        where: { status: UserStatus.ACTIVE },
    });
    const verifiedUsers = await userRepository.count({
        where: { isVerified: true },
    });
    const adminUsers = await userRepository.count({
        where: { role: UserRole.ADMIN },
    });
    const staffUsers = await userRepository.count({
        where: { role: UserRole.STAFF },
    });

    sendSuccess(
        res,
        'User statistics retrieved successfully',
        {
            totalUsers,
            activeUsers,
            verifiedUsers,
            adminUsers,
            staffUsers,
        },
        req.id
    );
});
