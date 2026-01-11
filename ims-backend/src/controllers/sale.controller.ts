import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Sale } from '../entities/Sale';
import { Variant } from '../entities/Variant';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    InsufficientStockError,
} from '../utils/errors';

const saleRepository = AppDataSource.getRepository(Sale);
const variantRepository = AppDataSource.getRepository(Variant);

// Create sale (record a sale)
export const createSale = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { variantId, quantity, customerName, notes, saleDate, customPrice } = req.body;

    if (!req.user) {
        throw new UnauthorizedError();
    }

    // Validate input
    if (!variantId || !quantity) {
        throw new ValidationError('Variant ID and quantity are required');
    }

    if (quantity <= 0) {
        throw new ValidationError('Quantity must be greater than 0');
    }

    // Get variant
    const variant = await variantRepository.findOne({
        where: { id: variantId },
        relations: ['product'],
    });

    if (!variant) {
        throw new NotFoundError('Variant not found');
    }

    // Check stock availability
    if (variant.stockQuantity < quantity) {
        throw new InsufficientStockError(
            `Insufficient stock. Available: ${variant.stockQuantity}`,
            { available: variant.stockQuantity, requested: quantity }
        );
    }

    // Determine selling price (custom or default)
    const sellingPrice = customPrice && customPrice > 0 ? customPrice : variant.sellingPrice;

    // Validate custom price if provided
    if (customPrice && customPrice < 0) {
        throw new ValidationError('Custom price cannot be negative');
    }

    // Calculate total
    const totalAmount = sellingPrice * quantity;

    // Create sale
    const sale = saleRepository.create({
        variantId,
        userId: req.user.userId,
        quantity,
        sellingPrice,
        totalAmount,
        customerName,
        notes,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
    });

    await saleRepository.save(sale);

    // Update stock
    variant.stockQuantity -= quantity;
    await variantRepository.save(variant);

    // Fetch complete sale data
    const savedSale = await saleRepository.findOne({
        where: { id: sale.id },
        relations: ['variant', 'variant.product', 'user'],
    });

    sendCreated(res, 'Sale recorded successfully', savedSale, req.id);
});

// Get all sales with pagination and filters
export const getSales = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        variantId,
        userId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.variant', 'variant')
        .leftJoinAndSelect('variant.product', 'product')
        .leftJoinAndSelect('sale.user', 'user')
        .take(limitNum)
        .skip(skip)
        .orderBy('sale.saleDate', 'DESC');

    // Apply filters with date validation
    if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
        }

        // Set end date to end of day (23:59:59.999) to include entire day
        end.setHours(23, 59, 59, 999);

        queryBuilder.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
            startDate: start,
            endDate: end,
        });
    } else if (startDate) {
        const start = new Date(startDate as string);

        if (isNaN(start.getTime())) {
            throw new ValidationError('Invalid start date format. Use YYYY-MM-DD');
        }

        queryBuilder.andWhere('sale.saleDate >= :startDate', {
            startDate: start,
        });
    } else if (endDate) {
        const end = new Date(endDate as string);

        if (isNaN(end.getTime())) {
            throw new ValidationError('Invalid end date format. Use YYYY-MM-DD');
        }

        // Set to end of day
        end.setHours(23, 59, 59, 999);

        queryBuilder.andWhere('sale.saleDate <= :endDate', {
            endDate: end,
        });
    }

    if (variantId) {
        queryBuilder.andWhere('sale.variantId = :variantId', { variantId });
    }

    if (userId) {
        queryBuilder.andWhere('sale.userId = :userId', { userId });
    }

    const [sales, total] = await queryBuilder.getManyAndCount();

    sendPaginated(
        res,
        'Sales retrieved successfully',
        sales,
        {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
        req.id
    );
});

// Get single sale by ID
export const getSaleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const sale = await saleRepository.findOne({
        where: { id },
        relations: ['variant', 'variant.product', 'user'],
    });

    if (!sale) {
        throw new NotFoundError('Sale not found');
    }

    sendSuccess(res, 'Sale retrieved successfully', sale, req.id);
});

// Get sales analytics
export const getSalesAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
        }

        // Set end date to end of day (23:59:59.999) to include entire day
        end.setHours(23, 59, 59, 999);

        dateFilter = {
            saleDate: Between(start, end),
        };
    } else if (startDate) {
        const start = new Date(startDate as string);

        if (isNaN(start.getTime())) {
            throw new ValidationError('Invalid start date format. Use YYYY-MM-DD');
        }

        dateFilter = {
            saleDate: MoreThanOrEqual(start),
        };
    } else if (endDate) {
        const end = new Date(endDate as string);

        if (isNaN(end.getTime())) {
            throw new ValidationError('Invalid end date format. Use YYYY-MM-DD');
        }

        // Set to end of day
        end.setHours(23, 59, 59, 999);

        dateFilter = {
            saleDate: LessThanOrEqual(end),
        };
    }

    // Total sales
    const totalSales = await saleRepository.count({ where: dateFilter });

    // Total revenue and profit calculation
    const salesWithVariants = await saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.variant', 'variant')
        .where(dateFilter)
        .getMany();

    let totalRevenue = 0;
    let totalProfit = 0;

    salesWithVariants.forEach(sale => {
        totalRevenue += parseFloat(sale.totalAmount.toString());
        if (sale.variant) {
            const profit = (parseFloat(sale.sellingPrice.toString()) - parseFloat(sale.variant.buyingPrice.toString())) * sale.quantity;
            totalProfit += profit;
        }
    });

    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Top selling products
    const topProducts = await saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.variant', 'variant')
        .leftJoinAndSelect('variant.product', 'product')
        .select('product.id', 'productId')
        .addSelect('product.name', 'productName')
        .addSelect('product.code', 'productCode')
        .addSelect('variant.id', 'variantId')
        .addSelect('variant.size', 'size')
        .addSelect('variant.color', 'color')
        .addSelect('SUM(sale.quantity)', 'totalQuantity')
        .addSelect('SUM(sale.totalAmount)', 'totalRevenue')
        .where(dateFilter)
        .groupBy('product.id')
        .addGroupBy('product.name')
        .addGroupBy('product.code')
        .addGroupBy('variant.id')
        .addGroupBy('variant.size')
        .addGroupBy('variant.color')
        .orderBy('SUM(sale.quantity)', 'DESC')
        .limit(10)
        .getRawMany();

    // Sales by date (for chart)
    const salesByDate = await saleRepository
        .createQueryBuilder('sale')
        .leftJoinAndSelect('sale.variant', 'variant')
        .select('DATE(sale.saleDate)', 'date')
        .addSelect('COUNT(sale.id)', 'count')
        .addSelect('SUM(sale.totalAmount)', 'revenue')
        .addSelect('SUM((sale.sellingPrice - variant.buyingPrice) * sale.quantity)', 'profit')
        .where(dateFilter)
        .groupBy('DATE(sale.saleDate)')
        .orderBy('DATE(sale.saleDate)', 'ASC')
        .getRawMany();

    sendSuccess(
        res,
        'Sales analytics retrieved successfully',
        {
            totalSales,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalProfit: parseFloat(totalProfit.toFixed(2)),
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
            topSellingProducts: topProducts.map(p => ({
                productName: p.productName,
                productCode: p.productCode,
                variantId: p.variantId,
                size: p.size,
                color: p.color,
                totalQuantity: parseInt(p.totalQuantity),
                totalRevenue: parseFloat(p.totalRevenue),
            })),
            salesByDate: salesByDate.map(d => ({
                date: d.date,
                count: parseInt(d.count),
                revenue: parseFloat(d.revenue || 0),
                profit: parseFloat(d.profit || 0),
            })),
        },
        req.id
    );
});

// Delete sale (Admin only - for corrections)
export const deleteSale = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const sale = await saleRepository.findOne({
        where: { id },
        relations: ['variant'],
    });

    if (!sale) {
        throw new NotFoundError('Sale not found');
    }

    // Restore stock
    const variant = await variantRepository.findOne({
        where: { id: sale.variantId },
    });

    if (variant) {
        variant.stockQuantity += sale.quantity;
        await variantRepository.save(variant);
    }

    await saleRepository.remove(sale);

    sendSuccess(res, 'Sale deleted successfully', undefined, req.id);
});
